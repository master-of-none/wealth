import type BetterSqlite3 from 'better-sqlite3'
import { app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

type DB = BetterSqlite3.Database
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SqliteConstructor = new (path: string, options?: any) => DB

let _db: DB | null = null

function loadSqlite(): SqliteConstructor {
  // Lazy require — keeps native module out of top-level bundle init so that
  // a load failure doesn't corrupt Electron's ipcMain/app module state.
  return require('better-sqlite3') as SqliteConstructor
}

export function getDb(): DB {
  if (_db) return _db
  const Sqlite = loadSqlite()
  const dbPath = path.join(app.getPath('userData'), 'mywealth.db')
  _db = openOrMigrate(dbPath, Sqlite)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  createSchema(_db)
  return _db
}

// ---------------------------------------------------------------------------
// Open — migrate from the old JSON file if needed
// ---------------------------------------------------------------------------

function openOrMigrate(dbPath: string, Sqlite: SqliteConstructor): DB {
  if (fs.existsSync(dbPath)) {
    const header = Buffer.alloc(16)
    const fd = fs.openSync(dbPath, 'r')
    fs.readSync(fd, header, 0, 16, 0)
    fs.closeSync(fd)
    const isJson = header[0] === 0x7b // starts with '{'
    if (isJson) {
      console.log('[DB] Detected old JSON db — migrating to SQLite...')
      const raw = fs.readFileSync(dbPath, 'utf-8')
      const backupPath = dbPath.replace('.db', '_json_backup.json')
      fs.renameSync(dbPath, backupPath)
      const db = new Sqlite(dbPath)
      return importJsonData(db, raw)
    }
  }
  return new Sqlite(dbPath)
}

function importJsonData(db: DB, raw: string): DB {
  try {
    const json = JSON.parse(raw)
    const data = json['finance-data'] || json // handle both wrappers
    createSchema(db)
    const run = db.transaction(() => {
      ;(data.fds || []).forEach((r: Record<string, unknown>) => upsertRow(db, 'fixed_deposits', fdToRow(r)))
      ;(data.mutualFunds || []).forEach((r: Record<string, unknown>) => upsertRow(db, 'mutual_funds', mfToRow(r)))
      ;(data.stocks || []).forEach((r: Record<string, unknown>) => upsertRow(db, 'stocks', stockToRow(r)))
      ;(data.postalAccounts || []).forEach((r: Record<string, unknown>) => upsertRow(db, 'postal_accounts', postalToRow(r)))
      ;(data.insurancePrivate || []).forEach((r: Record<string, unknown>) => upsertRow(db, 'insurance_private', insPrivToRow(r)))
      ;(data.insuranceLIC || []).forEach((r: Record<string, unknown>) => upsertRow(db, 'insurance_lic', insLicToRow(r)))
      if (data.dismissedAlerts?.length) {
        setSetting(db, 'dismissedAlerts', JSON.stringify(data.dismissedAlerts))
      }
      if (data.permanentlyClearedAlerts?.length) {
        setSetting(db, 'permanentlyClearedAlerts', JSON.stringify(data.permanentlyClearedAlerts))
      }
    })
    run()
    console.log('[DB] Migration complete.')
  } catch (e) {
    console.error('[DB] Migration failed:', e)
  }
  return db
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

function createSchema(db: DB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS fixed_deposits (
      id              TEXT PRIMARY KEY,
      bankName        TEXT NOT NULL DEFAULT '',
      holderName      TEXT,
      amount          REAL NOT NULL DEFAULT 0,
      interestRate    REAL NOT NULL DEFAULT 0,
      startDate       TEXT DEFAULT '',
      maturityDate    TEXT DEFAULT '',
      accountNo       TEXT,
      nominee         TEXT,
      autoRenew       INTEGER NOT NULL DEFAULT 0,
      notes           TEXT
    );

    CREATE TABLE IF NOT EXISTS mutual_funds (
      id                    TEXT PRIMARY KEY,
      fundName              TEXT NOT NULL DEFAULT '',
      folioNumber           TEXT,
      category              TEXT,
      sipAmount             REAL NOT NULL DEFAULT 0,
      periodic              TEXT,
      initialInvestmentDate TEXT,
      totalInvested         REAL NOT NULL DEFAULT 0,
      nav                   REAL NOT NULL DEFAULT 0,
      navDate               TEXT,
      units                 REAL,
      notes                 TEXT
    );

    CREATE TABLE IF NOT EXISTS stocks (
      id              TEXT PRIMARY KEY,
      symbol          TEXT NOT NULL DEFAULT '',
      companyName     TEXT,
      quantity        REAL NOT NULL DEFAULT 0,
      buyPrice        REAL NOT NULL DEFAULT 0,
      currentPrice    REAL NOT NULL DEFAULT 0,
      priceAsOnDate   TEXT,
      initialDate     TEXT,
      sector          TEXT,
      notes           TEXT
    );

    CREATE TABLE IF NOT EXISTS postal_accounts (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL DEFAULT '',
      accountType     TEXT,
      openingDate     TEXT,
      closingDate     TEXT,
      principalAmount REAL NOT NULL DEFAULT 0,
      maturityAmount  REAL NOT NULL DEFAULT 0,
      accountNo       TEXT,
      interestRate    REAL NOT NULL DEFAULT 0,
      nominee         TEXT
    );

    CREATE TABLE IF NOT EXISTS insurance_private (
      id              TEXT PRIMARY KEY,
      companyName     TEXT NOT NULL DEFAULT '',
      holderName      TEXT,
      policyNo        TEXT,
      policyName      TEXT,
      openingDate     TEXT,
      closingDate     TEXT,
      premium         REAL NOT NULL DEFAULT 0,
      fundValue       REAL,
      fundValueDate   TEXT,
      accountNo       TEXT,
      lastPremiumDue  TEXT,
      nominee         TEXT,
      notes           TEXT
    );

    CREATE TABLE IF NOT EXISTS insurance_lic (
      id              TEXT PRIMARY KEY,
      holderName      TEXT NOT NULL DEFAULT '',
      policyNo        TEXT,
      openingDate     TEXT,
      closingDate     TEXT,
      premium         REAL NOT NULL DEFAULT 0,
      fundValue       REAL,
      fundValueDate   TEXT,
      lastPremiumDue  TEXT,
      nominee         TEXT,
      notes           TEXT
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
  `)
}

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>

function upsertRow(db: DB, table: string, row: Row): void {
  const keys = Object.keys(row)
  const cols = keys.join(', ')
  const placeholders = keys.map((k) => `@${k}`).join(', ')
  const updates = keys.filter((k) => k !== 'id').map((k) => `${k} = @${k}`).join(', ')
  db.prepare(
    `INSERT INTO ${table} (${cols}) VALUES (${placeholders})
     ON CONFLICT(id) DO UPDATE SET ${updates}`
  ).run(row)
}

function getAllRows(db: DB, table: string): Row[] {
  return db.prepare(`SELECT * FROM ${table}`).all() as Row[]
}

function replaceAll(db: DB, table: string, rows: Row[]): void {
  const run = db.transaction(() => {
    db.prepare(`DELETE FROM ${table}`).run()
    for (const row of rows) upsertRow(db, table, row)
  })
  run()
}

function getSetting(db: DB, key: string): string | null {
  const row = db.prepare(`SELECT value FROM app_settings WHERE key = ?`).get(key) as { value: string } | undefined
  return row?.value ?? null
}

function setSetting(db: DB, key: string, value: string): void {
  db.prepare(
    `INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(key, value)
}

// ---------------------------------------------------------------------------
// Row converters (camelCase JS → camelCase SQLite columns)
// SQLite column names already match TS field names, so these are mostly passthroughs
// ---------------------------------------------------------------------------

function fdToRow(r: Row): Row {
  return { ...r, autoRenew: r.autoRenew ? 1 : 0 }
}

function mfToRow(r: Row): Row { return { ...r } }
function stockToRow(r: Row): Row { return { ...r } }
function postalToRow(r: Row): Row { return { ...r } }
function insPrivToRow(r: Row): Row {
  // handle old field name
  const row = { ...r }
  if (!row.lastPremiumDue && row.premiumsPaidUpto) {
    row.lastPremiumDue = row.premiumsPaidUpto
    delete row.premiumsPaidUpto
  }
  return row
}
function insLicToRow(r: Row): Row {
  const row = { ...r }
  if (!row.lastPremiumDue && row.premiumsPaidUpto) {
    row.lastPremiumDue = row.premiumsPaidUpto
    delete row.premiumsPaidUpto
  }
  return row
}

// Convert a raw SQLite row back to the TS shape (booleans, nulls etc.)
function rowToFd(r: Row): Row {
  return { ...r, autoRenew: Boolean(r.autoRenew) }
}

// ---------------------------------------------------------------------------
// Public API (called from ipc.ts)
// ---------------------------------------------------------------------------

export function dbGetAll(table: string): Row[] {
  const db = getDb()
  const rows = getAllRows(db, table)
  if (table === 'fixed_deposits') return rows.map(rowToFd)
  return rows
}

export function dbReplaceAll(table: string, rows: Row[]): void {
  const db = getDb()
  const converted = rows.map((r) => {
    if (table === 'fixed_deposits') return fdToRow(r)
    if (table === 'insurance_private') return insPrivToRow(r)
    if (table === 'insurance_lic') return insLicToRow(r)
    return r
  })
  replaceAll(db, table, converted)
}

export function dbGetSetting(key: string): string | null {
  return getSetting(getDb(), key)
}

export function dbSetSetting(key: string, value: string): void {
  setSetting(getDb(), key, value)
}

export function getDbPath(): string {
  return path.join(app.getPath('userData'), 'mywealth.db')
}
