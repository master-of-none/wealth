/**
 * Seed script — populates mywealth.db with large realistic test data.
 * Run with:  node scripts/seed.mjs
 *
 * macOS DB path: ~/Library/Application Support/Wealth/mywealth.db
 * Windows path:  %APPDATA%\Wealth\mywealth.db
 */

import Database from 'better-sqlite3'
import { homedir } from 'os'
import { join } from 'path'
import { mkdirSync } from 'fs'

// ── DB path ───────────────────────────────────────────────────────────────────
const platform = process.platform
let dbDir
if (platform === 'win32') {
  dbDir = join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'Wealth')
} else if (platform === 'darwin') {
  dbDir = join(homedir(), 'Library', 'Application Support', 'Wealth')
} else {
  dbDir = join(homedir(), '.config', 'Wealth')
}
mkdirSync(dbDir, { recursive: true })
const dbPath = join(dbDir, 'mywealth.db')
console.log('📂 DB path:', dbPath)

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS fixed_deposits (
    id TEXT PRIMARY KEY, bankName TEXT, holderName TEXT,
    amount REAL, interestRate REAL, startDate TEXT, maturityDate TEXT,
    accountNo TEXT, nominee TEXT, autoRenew INTEGER DEFAULT 0, notes TEXT
  );
  CREATE TABLE IF NOT EXISTS mutual_funds (
    id TEXT PRIMARY KEY, fundName TEXT, folioNumber TEXT, category TEXT,
    sipAmount REAL, periodic TEXT, initialInvestmentDate TEXT,
    totalInvested REAL, nav REAL, navDate TEXT, units REAL, notes TEXT
  );
  CREATE TABLE IF NOT EXISTS stocks (
    id TEXT PRIMARY KEY, symbol TEXT, companyName TEXT,
    quantity REAL, buyPrice REAL, currentPrice REAL,
    priceAsOnDate TEXT, initialDate TEXT, sector TEXT, notes TEXT
  );
  CREATE TABLE IF NOT EXISTS postal_accounts (
    id TEXT PRIMARY KEY, name TEXT, accountType TEXT,
    openingDate TEXT, closingDate TEXT,
    principalAmount REAL, maturityAmount REAL,
    accountNo TEXT, interestRate REAL, nominee TEXT
  );
  CREATE TABLE IF NOT EXISTS insurance_private (
    id TEXT PRIMARY KEY, companyName TEXT, holderName TEXT,
    policyNo TEXT, policyName TEXT, openingDate TEXT, closingDate TEXT,
    premium REAL, fundValue REAL, fundValueDate TEXT,
    accountNo TEXT, lastPremiumDue TEXT, nominee TEXT, notes TEXT
  );
  CREATE TABLE IF NOT EXISTS insurance_lic (
    id TEXT PRIMARY KEY, holderName TEXT, policyNo TEXT,
    openingDate TEXT, closingDate TEXT, premium REAL,
    fundValue REAL, fundValueDate TEXT, lastPremiumDue TEXT,
    nominee TEXT, notes TEXT
  );
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY, value TEXT
  );
`)

// ── Helpers ───────────────────────────────────────────────────────────────────
let _seq = 1
const id = () => `seed${String(_seq++).padStart(4, '0')}`

function upsert(table, row) {
  const keys = Object.keys(row)
  const cols = keys.join(', ')
  const ph   = keys.map(k => `@${k}`).join(', ')
  const upd  = keys.filter(k => k !== 'id').map(k => `${k} = @${k}`).join(', ')
  db.prepare(`INSERT INTO ${table} (${cols}) VALUES (${ph})
              ON CONFLICT(id) DO UPDATE SET ${upd}`).run(row)
}

function clearAll() {
  for (const t of ['fixed_deposits','mutual_funds','stocks','postal_accounts','insurance_private','insurance_lic'])
    db.prepare(`DELETE FROM ${t}`).run()
  console.log('🗑️  Cleared existing data')
}

// ── Fixed Deposits (25 entries) ───────────────────────────────────────────────
const FDs = [
  { bank: 'SBI',            holder: 'V P Hegde',       amount: 500000,  rate: 7.10, start: '2022-04-01', maturity: '2025-04-01', auto: 1, nominee: 'S V Hegde' },
  { bank: 'HDFC Bank',      holder: 'S V Hegde',        amount: 300000,  rate: 7.25, start: '2023-01-15', maturity: '2026-01-15', auto: 0, nominee: 'V P Hegde' },
  { bank: 'ICICI Bank',     holder: 'V P Hegde',       amount: 750000,  rate: 7.40, start: '2022-07-01', maturity: '2025-07-01', auto: 1, nominee: 'S V Hegde' },
  { bank: 'Axis Bank',      holder: 'S V Hegde',        amount: 200000,  rate: 7.00, start: '2023-03-10', maturity: '2025-09-10', auto: 0, nominee: 'V P Hegde' },
  { bank: 'Kotak Bank',     holder: 'V P Hegde',       amount: 400000,  rate: 7.60, start: '2023-06-01', maturity: '2026-06-01', auto: 1, nominee: 'S V Hegde' },
  { bank: 'Bank of Baroda', holder: 'Joint',            amount: 1000000, rate: 7.15, start: '2022-10-01', maturity: '2025-10-01', auto: 1, nominee: 'S V Hegde' },
  { bank: 'Punjab National',holder: 'V P Hegde',       amount: 250000,  rate: 6.90, start: '2023-02-01', maturity: '2025-08-01', auto: 0, nominee: 'S V Hegde' },
  { bank: 'Canara Bank',    holder: 'S V Hegde',        amount: 600000,  rate: 7.20, start: '2022-12-01', maturity: '2025-12-01', auto: 1, nominee: 'V P Hegde' },
  { bank: 'Indian Bank',    holder: 'V P Hegde',       amount: 150000,  rate: 6.80, start: '2023-05-01', maturity: '2025-11-01', auto: 0, nominee: 'S V Hegde' },
  { bank: 'Union Bank',     holder: 'Joint',            amount: 800000,  rate: 7.05, start: '2023-08-01', maturity: '2026-08-01', auto: 1, nominee: 'S V Hegde' },
  { bank: 'IDFC First',     holder: 'S V Hegde',        amount: 350000,  rate: 7.75, start: '2023-09-01', maturity: '2025-09-01', auto: 0, nominee: 'V P Hegde' },
  { bank: 'Yes Bank',       holder: 'V P Hegde',       amount: 500000,  rate: 7.50, start: '2023-10-15', maturity: '2026-10-15', auto: 1, nominee: 'S V Hegde' },
  { bank: 'Federal Bank',   holder: 'S V Hegde',        amount: 225000,  rate: 7.30, start: '2022-11-01', maturity: '2025-11-01', auto: 0, nominee: 'V P Hegde' },
  { bank: 'IndusInd Bank',  holder: 'Joint',            amount: 900000,  rate: 7.65, start: '2023-04-01', maturity: '2026-04-01', auto: 1, nominee: 'S V Hegde' },
  { bank: 'RBL Bank',       holder: 'V P Hegde',       amount: 175000,  rate: 7.80, start: '2023-07-01', maturity: '2025-07-01', auto: 0, nominee: 'S V Hegde' },
  { bank: 'SBI',            holder: 'S V Hegde',        amount: 1200000, rate: 7.10, start: '2021-06-01', maturity: '2026-06-01', auto: 1, nominee: 'V P Hegde' },
  { bank: 'HDFC Bank',      holder: 'V P Hegde',       amount: 450000,  rate: 7.25, start: '2024-01-01', maturity: '2027-01-01', auto: 0, nominee: 'S V Hegde' },
  { bank: 'ICICI Bank',     holder: 'Joint',            amount: 650000,  rate: 7.40, start: '2023-11-01', maturity: '2026-11-01', auto: 1, nominee: 'S V Hegde' },
  { bank: 'Axis Bank',      holder: 'V P Hegde',       amount: 280000,  rate: 7.00, start: '2024-02-01', maturity: '2026-08-01', auto: 0, nominee: 'S V Hegde' },
  { bank: 'Kotak Bank',     holder: 'S V Hegde',        amount: 720000,  rate: 7.60, start: '2022-09-01', maturity: '2025-09-01', auto: 1, nominee: 'V P Hegde' },
  { bank: 'Post Office',    holder: 'V P Hegde',       amount: 500000,  rate: 7.50, start: '2023-03-01', maturity: '2026-03-01', auto: 0, nominee: 'S V Hegde' },
  { bank: 'Bajaj Finance',  holder: 'Joint',            amount: 1000000, rate: 8.10, start: '2023-12-01', maturity: '2026-12-01', auto: 0, nominee: 'S V Hegde' },
  { bank: 'Shriram Finance',holder: 'V P Hegde',       amount: 300000,  rate: 8.50, start: '2024-03-01', maturity: '2027-03-01', auto: 0, nominee: 'S V Hegde' },
  { bank: 'NABARD',         holder: 'S V Hegde',        amount: 200000,  rate: 7.75, start: '2023-06-01', maturity: '2026-06-01', auto: 0, nominee: 'V P Hegde' },
  { bank: 'SBI',            holder: 'V P Hegde',       amount: 550000,  rate: 7.10, start: '2024-04-01', maturity: '2029-04-01', auto: 1, nominee: 'S V Hegde' },
]

// ── Mutual Funds (20 entries) ─────────────────────────────────────────────────
const MFs = [
  { name: 'SBI Bluechip Fund',               folio: '1234567890', sip: 10000, periodic: 'Monthly',   initDate: '2019-04-01', invested: 720000,  nav: 78.52,  navDate: '2026-03-15', units: 11875.50 },
  { name: 'HDFC Mid-Cap Opportunities',      folio: '2345678901', sip: 5000,  periodic: 'Monthly',   initDate: '2020-01-10', invested: 375000,  nav: 124.36, navDate: '2026-03-15', units: 4280.75  },
  { name: 'Axis Long Term Equity (ELSS)',     folio: '3456789012', sip: 12500, periodic: 'Quarterly', initDate: '2018-04-01', invested: 1200000, nav: 92.18,  navDate: '2026-03-15', units: 16840.20 },
  { name: 'Mirae Asset Large Cap Fund',      folio: '4567890123', sip: 7500,  periodic: 'Monthly',   initDate: '2021-06-01', invested: 337500,  nav: 105.44, navDate: '2026-03-15', units: 4512.30  },
  { name: 'Parag Parikh Flexi Cap Fund',     folio: '5678901234', sip: 15000, periodic: 'Monthly',   initDate: '2020-07-01', invested: 1035000, nav: 71.28,  navDate: '2026-03-15', units: 19200.60 },
  { name: 'Nippon India Small Cap Fund',     folio: '6789012345', sip: 5000,  periodic: 'Monthly',   initDate: '2021-01-01', invested: 315000,  nav: 148.92, navDate: '2026-03-15', units: 3100.45  },
  { name: 'Kotak Emerging Equity Fund',      folio: '7890123456', sip: 8000,  periodic: 'Monthly',   initDate: '2019-10-01', invested: 624000,  nav: 89.64,  navDate: '2026-03-15', units: 9850.80  },
  { name: 'ICICI Pru Value Discovery',       folio: '8901234567', sip: 10000, periodic: 'Monthly',   initDate: '2018-08-01', invested: 930000,  nav: 411.20, navDate: '2026-03-15', units: 3240.15  },
  { name: 'DSP Tax Saver Fund (ELSS)',       folio: '9012345678', sip: 5000,  periodic: 'Quarterly', initDate: '2020-04-01', invested: 300000,  nav: 102.35, navDate: '2026-03-15', units: 4180.90  },
  { name: 'Franklin India Prima Fund',       folio: '0123456789', sip: 6000,  periodic: 'Monthly',   initDate: '2022-01-01', invested: 306000,  nav: 197.48, navDate: '2026-03-15', units: 2340.55  },
  { name: 'Canara Rob Flexi Cap Fund',       folio: '1122334455', sip: 4000,  periodic: 'Monthly',   initDate: '2021-03-01', invested: 240000,  nav: 60.12,  navDate: '2026-03-15', units: 5480.25  },
  { name: 'UTI Nifty 50 Index Fund',         folio: '2233445566', sip: 20000, periodic: 'Monthly',   initDate: '2019-01-01', invested: 1740000, nav: 142.80, navDate: '2026-03-15', units: 16200.40 },
  { name: 'Motilal Oswal Nasdaq 100 FoF',    folio: '3344556677', sip: 5000,  periodic: 'Monthly',   initDate: '2021-09-01', invested: 270000,  nav: 47.62,  navDate: '2026-03-15', units: 8750.30  },
  { name: 'Quant Active Fund',               folio: '4455667788', sip: 7500,  periodic: 'Monthly',   initDate: '2022-04-01', invested: 360000,  nav: 583.40, navDate: '2026-03-15', units: 850.20   },
  { name: 'Tata Digital India Fund',         folio: '5566778899', sip: 5000,  periodic: 'Monthly',   initDate: '2020-10-01', invested: 330000,  nav: 40.28,  navDate: '2026-03-15', units: 11400.65 },
  { name: 'Invesco India Mid Cap Fund',      folio: '6677889900', sip: 3000,  periodic: 'Monthly',   initDate: '2023-01-01', invested: 111000,  nav: 122.56, navDate: '2026-03-15', units: 1280.40  },
  { name: 'Edelweiss Balanced Advantage',    folio: '7788990011', sip: 8000,  periodic: 'Monthly',   initDate: '2021-07-01', invested: 456000,  nav: 44.18,  navDate: '2026-03-15', units: 13820.75 },
  { name: 'PGIM India Midcap Opp Fund',      folio: '8899001122', sip: 5000,  periodic: 'Monthly',   initDate: '2022-07-01', invested: 225000,  nav: 52.80,  navDate: '2026-03-15', units: 5640.20  },
  { name: 'Bandhan ELSS Tax Saver',          folio: '9900112233', sip: 6250,  periodic: 'Quarterly', initDate: '2019-04-01', invested: 450000,  nav: 128.40, navDate: '2026-03-15', units: 5120.35  },
  { name: 'Sundaram Mid Cap Fund',           folio: '0011223344', sip: 4000,  periodic: 'Monthly',   initDate: '2023-06-01', invested: 132000,  nav: 873.20, navDate: '2026-03-15', units: 218.60   },
]

// ── Stocks (30 entries) ───────────────────────────────────────────────────────
const Stocks = [
  { sym: 'RELIANCE',    name: 'Reliance Industries Ltd',   qty: 150, buy: 2250, cur: 2980, date: '2020-06-15', priceDate: '2026-03-17' },
  { sym: 'TCS',         name: 'Tata Consultancy Services', qty: 80,  buy: 3100, cur: 4210, date: '2019-09-10', priceDate: '2026-03-17' },
  { sym: 'HDFCBANK',    name: 'HDFC Bank Ltd',             qty: 200, buy: 1450, cur: 1820, date: '2021-01-20', priceDate: '2026-03-17' },
  { sym: 'INFY',        name: 'Infosys Ltd',               qty: 120, buy: 1380, cur: 1920, date: '2020-03-25', priceDate: '2026-03-17' },
  { sym: 'ICICIBANK',   name: 'ICICI Bank Ltd',            qty: 300, buy: 680,  cur: 1280, date: '2020-04-01', priceDate: '2026-03-17' },
  { sym: 'HINDUNILVR',  name: 'Hindustan Unilever Ltd',    qty: 100, buy: 2200, cur: 2650, date: '2021-07-12', priceDate: '2026-03-17' },
  { sym: 'ITC',         name: 'ITC Ltd',                   qty: 500, buy: 210,  cur: 490,  date: '2020-01-08', priceDate: '2026-03-17' },
  { sym: 'KOTAKBANK',   name: 'Kotak Mahindra Bank',       qty: 90,  buy: 1680, cur: 2040, date: '2021-03-18', priceDate: '2026-03-17' },
  { sym: 'BAJFINANCE',  name: 'Bajaj Finance Ltd',         qty: 50,  buy: 5200, cur: 8900, date: '2019-11-22', priceDate: '2026-03-17' },
  { sym: 'ASIANPAINT',  name: 'Asian Paints Ltd',          qty: 80,  buy: 2100, cur: 2890, date: '2021-05-10', priceDate: '2026-03-17' },
  { sym: 'MARUTI',      name: 'Maruti Suzuki India Ltd',   qty: 30,  buy: 7200, cur: 12500,date: '2020-08-14', priceDate: '2026-03-17' },
  { sym: 'WIPRO',       name: 'Wipro Ltd',                 qty: 200, buy: 380,  cur: 580,  date: '2020-05-20', priceDate: '2026-03-17' },
  { sym: 'SBIN',        name: 'State Bank of India',       qty: 400, buy: 280,  cur: 820,  date: '2021-02-11', priceDate: '2026-03-17' },
  { sym: 'TATASTEEL',   name: 'Tata Steel Ltd',            qty: 300, buy: 480,  cur: 1420, date: '2020-09-05', priceDate: '2026-03-17' },
  { sym: 'SUNPHARMA',   name: 'Sun Pharmaceutical',        qty: 150, buy: 620,  cur: 1820, date: '2021-04-22', priceDate: '2026-03-17' },
  { sym: 'ONGC',        name: 'Oil & Natural Gas Corp',    qty: 500, buy: 110,  cur: 285,  date: '2020-07-30', priceDate: '2026-03-17' },
  { sym: 'POWERGRID',   name: 'Power Grid Corp of India',  qty: 400, buy: 185,  cur: 340,  date: '2021-08-16', priceDate: '2026-03-17' },
  { sym: 'NTPC',        name: 'NTPC Ltd',                  qty: 350, buy: 110,  cur: 390,  date: '2020-10-12', priceDate: '2026-03-17' },
  { sym: 'AXISBANK',    name: 'Axis Bank Ltd',             qty: 180, buy: 680,  cur: 1240, date: '2021-06-28', priceDate: '2026-03-17' },
  { sym: 'LT',          name: 'Larsen & Toubro Ltd',       qty: 60,  buy: 1420, cur: 3680, date: '2019-12-10', priceDate: '2026-03-17' },
  { sym: 'TITAN',       name: 'Titan Company Ltd',         qty: 70,  buy: 1100, cur: 3560, date: '2020-02-18', priceDate: '2026-03-17' },
  { sym: 'BHARTIARTL',  name: 'Bharti Airtel Ltd',         qty: 200, buy: 480,  cur: 1780, date: '2020-06-22', priceDate: '2026-03-17' },
  { sym: 'ADANIENT',    name: 'Adani Enterprises Ltd',     qty: 40,  buy: 1200, cur: 2980, date: '2021-10-05', priceDate: '2026-03-17' },
  { sym: 'TECHM',       name: 'Tech Mahindra Ltd',         qty: 120, buy: 980,  cur: 1680, date: '2020-11-14', priceDate: '2026-03-17' },
  { sym: 'DRREDDY',     name: 'Dr. Reddy\'s Laboratories', qty: 40,  buy: 4200, cur: 6800, date: '2021-09-08', priceDate: '2026-03-17' },
  { sym: 'BAJAJFINSV',  name: 'Bajaj Finserv Ltd',         qty: 60,  buy: 1050, cur: 1920, date: '2020-04-28', priceDate: '2026-03-17' },
  { sym: 'ULTRACEMCO',  name: 'UltraTech Cement Ltd',      qty: 25,  buy: 4800, cur: 11200,date: '2019-08-19', priceDate: '2026-03-17' },
  { sym: 'NESTLEIND',   name: 'Nestle India Ltd',          qty: 30,  buy: 15000,cur: 22500,date: '2020-12-07', priceDate: '2026-03-17' },
  { sym: 'DIVISLAB',    name: 'Divi\'s Laboratories Ltd',  qty: 50,  buy: 2800, cur: 5800, date: '2021-11-15', priceDate: '2026-03-17' },
  { sym: 'HCLTECH',     name: 'HCL Technologies Ltd',      qty: 160, buy: 850,  cur: 1980, date: '2020-03-10', priceDate: '2026-03-17' },
]

// ── Postal Accounts (10 entries) ──────────────────────────────────────────────
const Postal = [
  { name: 'V P Hegde',  type: 'PPF',   open: '2015-04-01', close: '2030-04-01', principal: 1500000, maturity: 2850000, acct: 'PPF/SB/123456', rate: 7.10, nominee: 'S V Hegde' },
  { name: 'S V Hegde',  type: 'PPF',   open: '2018-04-01', close: '2033-04-01', principal: 600000,  maturity: 1050000, acct: 'PPF/SB/234567', rate: 7.10, nominee: 'V P Hegde' },
  { name: 'V P Hegde',  type: 'NSC',   open: '2021-06-01', close: '2026-06-01', principal: 300000,  maturity: 431010,  acct: 'NSC/345678',    rate: 7.70, nominee: 'S V Hegde' },
  { name: 'S V Hegde',  type: 'NSC',   open: '2022-03-01', close: '2027-03-01', principal: 200000,  maturity: 287340,  acct: 'NSC/456789',    rate: 7.70, nominee: 'V P Hegde' },
  { name: 'V P Hegde',  type: 'KVP',   open: '2020-08-01', close: '2030-02-01', principal: 500000,  maturity: 1000000, acct: 'KVP/567890',    rate: 7.50, nominee: 'S V Hegde' },
  { name: 'Joint',      type: 'MIS',   open: '2023-01-01', close: '2028-01-01', principal: 900000,  maturity: 900000,  acct: 'MIS/678901',    rate: 7.40, nominee: 'S V Hegde' },
  { name: 'S V Hegde',  type: 'MIS',   open: '2022-07-01', close: '2027-07-01', principal: 450000,  maturity: 450000,  acct: 'MIS/789012',    rate: 7.40, nominee: 'V P Hegde' },
  { name: 'V P Hegde',  type: 'SB',    open: '2010-01-01', close: '2099-12-31', principal: 85000,   maturity: 85000,   acct: 'SB/890123',     rate: 4.00, nominee: 'S V Hegde' },
  { name: 'V P Hegde',  type: 'NSC',   open: '2023-09-01', close: '2028-09-01', principal: 250000,  maturity: 359175,  acct: 'NSC/901234',    rate: 7.70, nominee: 'S V Hegde' },
  { name: 'Joint',      type: 'KVP',   open: '2019-04-01', close: '2028-10-01', principal: 750000,  maturity: 1500000, acct: 'KVP/012345',    rate: 7.50, nominee: 'S V Hegde' },
]

// ── Insurance — Private (8 entries) ──────────────────────────────────────────
const InsPrivate = [
  { co: 'HDFC Life',         holder: 'V P Hegde',  pno: 'HDFC-LF-001', pname: 'Click 2 Protect Life', open: '2018-06-15', close: '2038-06-15', premium: 28500,  fv: 845000,  fvDate: '2026-01-01', lpd: '2025-06-15', nominee: 'S V Hegde' },
  { co: 'ICICI Pru Life',    holder: 'S V Hegde',  pno: 'ICICI-LF-002',pname: 'iProtect Smart',       open: '2019-08-01', close: '2044-08-01', premium: 18200,  fv: 320000,  fvDate: '2026-01-01', lpd: '2025-08-01', nominee: 'V P Hegde' },
  { co: 'SBI Life',          holder: 'V P Hegde',  pno: 'SBI-LF-003',  pname: 'Smart Shield',         open: '2020-04-01', close: '2050-04-01', premium: 22000,  fv: 0,       fvDate: '',           lpd: '2025-04-01', nominee: 'S V Hegde' },
  { co: 'Max Life',          holder: 'S V Hegde',  pno: 'MAX-LF-004',  pname: 'Smart Secure Plus',    open: '2021-01-10', close: '2051-01-10', premium: 15600,  fv: 0,       fvDate: '',           lpd: '2025-01-10', nominee: 'V P Hegde' },
  { co: 'Bajaj Allianz',     holder: 'V P Hegde',  pno: 'BAJ-LF-005',  pname: 'Future Gain ULIP',     open: '2015-03-20', close: '2035-03-20', premium: 50000,  fv: 1250000, fvDate: '2026-02-01', lpd: '2025-03-20', nominee: 'S V Hegde' },
  { co: 'Tata AIA',          holder: 'S V Hegde',  pno: 'TATA-LF-006', pname: 'Fortune Pro',          open: '2016-07-01', close: '2036-07-01', premium: 36000,  fv: 980000,  fvDate: '2026-01-15', lpd: '2025-07-01', nominee: 'V P Hegde' },
  { co: 'Kotak Life',        holder: 'V P Hegde',  pno: 'KOT-LF-007',  pname: 'e-Term Plan',          open: '2022-09-01', close: '2052-09-01', premium: 12800,  fv: 0,       fvDate: '',           lpd: '2025-09-01', nominee: 'S V Hegde' },
  { co: 'Aditya Birla Life', holder: 'Joint',      pno: 'ABL-LF-008',  pname: 'Wealth Assure Plus',   open: '2017-11-15', close: '2037-11-15', premium: 60000,  fv: 1680000, fvDate: '2026-02-15', lpd: '2025-11-15', nominee: 'S V Hegde' },
]

// ── Insurance — LIC (10 entries) ──────────────────────────────────────────────
const InsLIC = [
  { holder: 'V P Hegde',  pno: 'LIC-111-222333', open: '2005-04-01', close: '2025-04-01', premium: 24000,  fv: 520000,  fvDate: '2026-01-01', lpd: '2025-04-01', nominee: 'S V Hegde' },
  { holder: 'S V Hegde',  pno: 'LIC-222-333444', open: '2008-07-01', close: '2028-07-01', premium: 18000,  fv: 380000,  fvDate: '2026-01-01', lpd: '2025-07-01', nominee: 'V P Hegde' },
  { holder: 'V P Hegde',  pno: 'LIC-333-444555', open: '2010-01-01', close: '2030-01-01', premium: 30000,  fv: 620000,  fvDate: '2026-01-01', lpd: '2025-01-01', nominee: 'S V Hegde' },
  { holder: 'S V Hegde',  pno: 'LIC-444-555666', open: '2012-04-01', close: '2032-04-01', premium: 22500,  fv: 410000,  fvDate: '2026-01-01', lpd: '2025-04-01', nominee: 'V P Hegde' },
  { holder: 'V P Hegde',  pno: 'LIC-555-666777', open: '2015-10-15', close: '2035-10-15', premium: 48000,  fv: 780000,  fvDate: '2026-02-01', lpd: '2025-10-15', nominee: 'S V Hegde' },
  { holder: 'S V Hegde',  pno: 'LIC-666-777888', open: '2018-03-01', close: '2038-03-01', premium: 36000,  fv: 520000,  fvDate: '2026-02-01', lpd: '2025-03-01', nominee: 'V P Hegde' },
  { holder: 'V P Hegde',  pno: 'LIC-777-888999', open: '2000-06-01', close: '2025-06-01', premium: 12000,  fv: 485000,  fvDate: '2026-01-15', lpd: '2025-06-01', nominee: 'S V Hegde' },
  { holder: 'S V Hegde',  pno: 'LIC-888-999000', open: '2003-09-01', close: '2028-09-01', premium: 15600,  fv: 390000,  fvDate: '2026-01-15', lpd: '2025-09-01', nominee: 'V P Hegde' },
  { holder: 'V P Hegde',  pno: 'LIC-999-000111', open: '2020-08-01', close: '2040-08-01', premium: 54000,  fv: 280000,  fvDate: '2026-02-01', lpd: '2025-08-01', nominee: 'S V Hegde' },
  { holder: 'Joint',      pno: 'LIC-000-111222', open: '2016-12-01', close: '2036-12-01', premium: 72000,  fv: 950000,  fvDate: '2026-02-15', lpd: '2025-12-01', nominee: 'S V Hegde' },
]

// ── Insert ────────────────────────────────────────────────────────────────────
clearAll()

const ins = db.transaction(() => {
  FDs.forEach(f => upsert('fixed_deposits', {
    id: id(), bankName: f.bank, holderName: f.holder, amount: f.amount,
    interestRate: f.rate, startDate: f.start, maturityDate: f.maturity,
    accountNo: `ACCT${Math.floor(Math.random()*90000+10000)}`, nominee: f.nominee,
    autoRenew: f.auto, notes: null
  }))

  MFs.forEach(m => upsert('mutual_funds', {
    id: id(), fundName: m.name, folioNumber: m.folio, category: null,
    sipAmount: m.sip, periodic: m.periodic, initialInvestmentDate: m.initDate,
    totalInvested: m.invested, nav: m.nav, navDate: m.navDate, units: m.units, notes: null
  }))

  Stocks.forEach(s => upsert('stocks', {
    id: id(), symbol: s.sym, companyName: s.name,
    quantity: s.qty, buyPrice: s.buy, currentPrice: s.cur,
    priceAsOnDate: s.priceDate, initialDate: s.date, sector: null, notes: null
  }))

  Postal.forEach(p => upsert('postal_accounts', {
    id: id(), name: p.name, accountType: p.type,
    openingDate: p.open, closingDate: p.close,
    principalAmount: p.principal, maturityAmount: p.maturity,
    accountNo: p.acct, interestRate: p.rate, nominee: p.nominee
  }))

  InsPrivate.forEach(i => upsert('insurance_private', {
    id: id(), companyName: i.co, holderName: i.holder,
    policyNo: i.pno, policyName: i.pname,
    openingDate: i.open, closingDate: i.close,
    premium: i.premium, fundValue: i.fv || null, fundValueDate: i.fvDate || null,
    accountNo: null, lastPremiumDue: i.lpd, nominee: i.nominee, notes: null
  }))

  InsLIC.forEach(i => upsert('insurance_lic', {
    id: id(), holderName: i.holder, policyNo: i.pno,
    openingDate: i.open, closingDate: i.close,
    premium: i.premium, fundValue: i.fv || null, fundValueDate: i.fvDate || null,
    lastPremiumDue: i.lpd, nominee: i.nominee, notes: null
  }))
})

ins()

// ── Summary ───────────────────────────────────────────────────────────────────
const counts = {
  'Fixed Deposits':      db.prepare('SELECT COUNT(*) as c FROM fixed_deposits').get().c,
  'Mutual Funds':        db.prepare('SELECT COUNT(*) as c FROM mutual_funds').get().c,
  'Stocks':              db.prepare('SELECT COUNT(*) as c FROM stocks').get().c,
  'Postal Accounts':     db.prepare('SELECT COUNT(*) as c FROM postal_accounts').get().c,
  'Insurance Private':   db.prepare('SELECT COUNT(*) as c FROM insurance_private').get().c,
  'Insurance LIC':       db.prepare('SELECT COUNT(*) as c FROM insurance_lic').get().c,
}

const fdTotal   = db.prepare('SELECT SUM(amount) as t FROM fixed_deposits').get().t
const mfValue   = db.prepare('SELECT SUM(nav * units) as t FROM mutual_funds').get().t
const stValue   = db.prepare('SELECT SUM(quantity * currentPrice) as t FROM stocks').get().t

const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

console.log('\n✅ Seed complete!\n')
console.log('Records inserted:')
Object.entries(counts).forEach(([k, v]) => console.log(`  ${k.padEnd(22)} ${v} records`))
console.log('\nPortfolio snapshot:')
console.log(`  FD Total Value      ${fmt(fdTotal)}`)
console.log(`  MF Total Value      ${fmt(mfValue)}`)
console.log(`  Stock Total Value   ${fmt(stValue)}`)
console.log(`  Grand Total         ${fmt(fdTotal + mfValue + stValue)}`)
console.log(`\n📂 DB: ${dbPath}\n`)

db.close()
