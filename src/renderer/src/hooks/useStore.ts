import { useState, useEffect, useCallback, useRef } from 'react'
import { FixedDeposit, MutualFund, Stock, PostalAccount, InsurancePrivate, InsuranceLIC } from '../types'

// Table name constants — must match what db.ts expects
const T_FD   = 'fixed_deposits'
const T_MF   = 'mutual_funds'
const T_ST   = 'stocks'
const T_PA   = 'postal_accounts'
const T_INS  = 'insurance_private'
const T_LIC  = 'insurance_lic'

type ElectronAPI = {
  dbGetAll: (table: string) => Promise<Record<string, unknown>[]>
  dbReplaceAll: (table: string, rows: unknown[]) => Promise<void>
  dbGetSetting: (key: string) => Promise<string | null>
  dbSetSetting: (key: string, value: string) => Promise<void>
}

function api(): ElectronAPI {
  return (window as Window & { electronAPI: ElectronAPI }).electronAPI
}

const isElectron = typeof window !== 'undefined' && 'electronAPI' in window

// Fallback: localStorage (for dev without Electron)
function lsGet<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function lsSet(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* noop */ }
}

async function getTable<T>(table: string, lsKey: string): Promise<T[]> {
  if (isElectron) return api().dbGetAll(table) as Promise<T[]>
  return lsGet<T[]>(lsKey, [])
}

async function replaceTable<T>(table: string, lsKey: string, rows: T[]): Promise<void> {
  if (isElectron) { await api().dbReplaceAll(table, rows as unknown[]); return }
  lsSet(lsKey, rows)
}

async function getSetting(key: string): Promise<string | null> {
  if (isElectron) return api().dbGetSetting(key)
  return lsGet<string | null>(key, null)
}

async function setSetting(key: string, value: string): Promise<void> {
  if (isElectron) { await api().dbSetSetting(key, value); return }
  lsSet(key, value)
}

// ---------------------------------------------------------------------------

interface AppState {
  fds: FixedDeposit[]
  mutualFunds: MutualFund[]
  stocks: Stock[]
  postalAccounts: PostalAccount[]
  insurancePrivate: InsurancePrivate[]
  insuranceLIC: InsuranceLIC[]
  dismissedAlerts: string[]
  permanentlyClearedAlerts: string[]
}

const EMPTY: AppState = {
  fds: [], mutualFunds: [], stocks: [], postalAccounts: [],
  insurancePrivate: [], insuranceLIC: [],
  dismissedAlerts: [], permanentlyClearedAlerts: [],
}

export function useStore() {
  const [state, setState] = useState<AppState>(EMPTY)
  const [loading, setLoading] = useState(true)
  const stateRef = useRef<AppState>(EMPTY)
  stateRef.current = state

  useEffect(() => {
    async function loadAll() {
      const [fds, mutualFunds, stocks, postalAccounts, insurancePrivate, insuranceLIC,
             dismissedRaw, permanentRaw] = await Promise.all([
        getTable<FixedDeposit>(T_FD,  'fds'),
        getTable<MutualFund>  (T_MF,  'mutualFunds'),
        getTable<Stock>       (T_ST,  'stocks'),
        getTable<PostalAccount>(T_PA, 'postalAccounts'),
        getTable<InsurancePrivate>(T_INS, 'insurancePrivate'),
        getTable<InsuranceLIC>(T_LIC, 'insuranceLIC'),
        getSetting('dismissedAlerts'),
        getSetting('permanentlyClearedAlerts'),
      ])

      const validIds = new Set([
        ...fds.map((r) => r.id), ...mutualFunds.map((r) => r.id),
        ...postalAccounts.map((r) => r.id), ...insurancePrivate.map((r) => r.id),
        ...insuranceLIC.map((r) => r.id),
      ])
      const stillValid = (alertId: string) => validIds.has(alertId.slice(alertId.lastIndexOf('-') + 1))

      const dismissed   = (JSON.parse(dismissedRaw  || '[]') as string[]).filter(stillValid)
      const permanent   = (JSON.parse(permanentRaw  || '[]') as string[]).filter(stillValid)

      const loaded: AppState = { fds, mutualFunds, stocks, postalAccounts, insurancePrivate, insuranceLIC,
        dismissedAlerts: dismissed, permanentlyClearedAlerts: permanent }
      setState(loaded)
      setLoading(false)
    }
    loadAll()
  }, [])

  // ---------------------------------------------------------------------------
  // Update helpers — each saves only the relevant table
  // ---------------------------------------------------------------------------

  const updateFDs = useCallback(async (data: FixedDeposit[]) => {
    setState((s) => ({ ...s, fds: data }))
    await replaceTable(T_FD, 'fds', data)
  }, [])

  const updateMutualFunds = useCallback(async (data: MutualFund[]) => {
    setState((s) => ({ ...s, mutualFunds: data }))
    await replaceTable(T_MF, 'mutualFunds', data)
  }, [])

  const updateStocks = useCallback(async (data: Stock[]) => {
    setState((s) => ({ ...s, stocks: data }))
    await replaceTable(T_ST, 'stocks', data)
  }, [])

  const updatePostalAccounts = useCallback(async (data: PostalAccount[]) => {
    setState((s) => ({ ...s, postalAccounts: data }))
    await replaceTable(T_PA, 'postalAccounts', data)
  }, [])

  const updateInsurancePrivate = useCallback(async (data: InsurancePrivate[]) => {
    setState((s) => ({ ...s, insurancePrivate: data }))
    await replaceTable(T_INS, 'insurancePrivate', data)
  }, [])

  const updateInsuranceLIC = useCallback(async (data: InsuranceLIC[]) => {
    setState((s) => ({ ...s, insuranceLIC: data }))
    await replaceTable(T_LIC, 'insuranceLIC', data)
  }, [])

  const dismissAlert = useCallback(async (id: string) => {
    const next = [...stateRef.current.dismissedAlerts, id]
    setState((s) => ({ ...s, dismissedAlerts: next }))
    await setSetting('dismissedAlerts', JSON.stringify(next))
  }, [])

  const clearAllDismissed = useCallback(async () => {
    const permanent = [...new Set([...stateRef.current.permanentlyClearedAlerts, ...stateRef.current.dismissedAlerts])]
    setState((s) => ({ ...s, dismissedAlerts: [], permanentlyClearedAlerts: permanent }))
    await setSetting('dismissedAlerts', '[]')
    await setSetting('permanentlyClearedAlerts', JSON.stringify(permanent))
  }, [])

  return {
    fds: state.fds, mutualFunds: state.mutualFunds, stocks: state.stocks,
    postalAccounts: state.postalAccounts, insurancePrivate: state.insurancePrivate,
    insuranceLIC: state.insuranceLIC,
    dismissedAlerts: state.dismissedAlerts,
    permanentlyClearedAlerts: state.permanentlyClearedAlerts,
    dismissAlert, clearAllDismissed, loading,
    updateFDs, updateMutualFunds, updateStocks,
    updatePostalAccounts, updateInsurancePrivate, updateInsuranceLIC,
  }
}
