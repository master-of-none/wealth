import { useState, useEffect, useCallback } from 'react'
import { FixedDeposit, MutualFund, Stock, PostalAccount, InsurancePrivate, InsuranceLIC } from '../types'

const STORAGE_KEY = 'finance-data'

const isElectron = typeof window !== 'undefined' && 'electronAPI' in window

async function load<T>(fallback: T): Promise<T> {
  if (isElectron) {
    const val = await (window as Window & { electronAPI: { storeGet: (key: string) => Promise<T> } }).electronAPI.storeGet(STORAGE_KEY)
    return val ?? fallback
  }
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : fallback
}

async function save<T>(value: T): Promise<void> {
  if (isElectron) {
    await (window as Window & { electronAPI: { storeSet: (key: string, value: T) => Promise<void> } }).electronAPI.storeSet(STORAGE_KEY, value)
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  }
}

interface StoreData {
  fds: FixedDeposit[]
  mutualFunds: MutualFund[]
  stocks: Stock[]
  postalAccounts: PostalAccount[]
  insurancePrivate: InsurancePrivate[]
  insuranceLIC: InsuranceLIC[]
  dismissedAlerts: string[]
  permanentlyClearedAlerts: string[]
}

export function useStore() {
  const [fds, setFDs] = useState<FixedDeposit[]>([])
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([])
  const [stocks, setStocks] = useState<Stock[]>([])
  const [postalAccounts, setPostalAccounts] = useState<PostalAccount[]>([])
  const [insurancePrivate, setInsurancePrivate] = useState<InsurancePrivate[]>([])
  const [insuranceLIC, setInsuranceLIC] = useState<InsuranceLIC[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])
  const [permanentlyClearedAlerts, setPermanentlyClearedAlerts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load<StoreData>({ fds: [], mutualFunds: [], stocks: [], postalAccounts: [], insurancePrivate: [], insuranceLIC: [], dismissedAlerts: [], permanentlyClearedAlerts: [] }).then((data) => {
      const fdsData = data.fds || []
      const mfsData = data.mutualFunds || []
      const postalData = data.postalAccounts || []
      const insPrivData = data.insurancePrivate || []
      const insLICData = data.insuranceLIC || []

      // Build the set of all record IDs that could ever produce an alert ID
      const validIds = new Set([
        ...fdsData.map((r) => r.id),
        ...mfsData.map((r) => r.id),
        ...postalData.map((r) => r.id),
        ...insPrivData.map((r) => r.id),
        ...insLICData.map((r) => r.id),
      ])

      // Alert IDs are suffixed with the record id after the last '-'
      const stillValid = (alertId: string) => {
        const recordId = alertId.slice(alertId.lastIndexOf('-') + 1)
        return validIds.has(recordId)
      }

      const prunedDismissed = (data.dismissedAlerts || []).filter(stillValid)
      const prunedPermanent = (data.permanentlyClearedAlerts || []).filter(stillValid)

      setFDs(fdsData)
      setMutualFunds(mfsData)
      setStocks(data.stocks || [])
      setPostalAccounts(postalData)
      setInsurancePrivate(insPrivData)
      setInsuranceLIC(insLICData)
      setDismissedAlerts(prunedDismissed)
      setPermanentlyClearedAlerts(prunedPermanent)

      // Persist pruned lists back if anything was removed
      if (prunedDismissed.length !== (data.dismissedAlerts || []).length ||
          prunedPermanent.length !== (data.permanentlyClearedAlerts || []).length) {
        save<StoreData>({ ...data, dismissedAlerts: prunedDismissed, permanentlyClearedAlerts: prunedPermanent })
      }

      setLoading(false)
    })
  }, [])

  const updateFDs = useCallback(
    (data: FixedDeposit[]) => {
      setFDs(data)
      save<StoreData>({ fds: data, mutualFunds, stocks, postalAccounts, insurancePrivate, insuranceLIC, dismissedAlerts, permanentlyClearedAlerts })
    },
    [mutualFunds, stocks, postalAccounts, insurancePrivate, insuranceLIC]
  )

  const updateMutualFunds = useCallback(
    (data: MutualFund[]) => {
      setMutualFunds(data)
      save<StoreData>({ fds, mutualFunds: data, stocks, postalAccounts, insurancePrivate, insuranceLIC, dismissedAlerts, permanentlyClearedAlerts })
    },
    [fds, stocks, postalAccounts, insurancePrivate, insuranceLIC]
  )

  const updateStocks = useCallback(
    (data: Stock[]) => {
      setStocks(data)
      save<StoreData>({ fds, mutualFunds, stocks: data, postalAccounts, insurancePrivate, insuranceLIC, dismissedAlerts, permanentlyClearedAlerts })
    },
    [fds, mutualFunds, postalAccounts, insurancePrivate, insuranceLIC]
  )

  const updatePostalAccounts = useCallback(
    (data: PostalAccount[]) => {
      setPostalAccounts(data)
      save<StoreData>({ fds, mutualFunds, stocks, postalAccounts: data, insurancePrivate, insuranceLIC, dismissedAlerts, permanentlyClearedAlerts })
    },
    [fds, mutualFunds, stocks, insurancePrivate, insuranceLIC]
  )

  const updateInsurancePrivate = useCallback(
    (data: InsurancePrivate[]) => {
      setInsurancePrivate(data)
      save<StoreData>({ fds, mutualFunds, stocks, postalAccounts, insurancePrivate: data, insuranceLIC, dismissedAlerts, permanentlyClearedAlerts })
    },
    [fds, mutualFunds, stocks, postalAccounts, insuranceLIC]
  )

  const updateInsuranceLIC = useCallback(
    (data: InsuranceLIC[]) => {
      setInsuranceLIC(data)
      save<StoreData>({ fds, mutualFunds, stocks, postalAccounts, insurancePrivate, insuranceLIC: data, dismissedAlerts, permanentlyClearedAlerts })
    },
    [fds, mutualFunds, stocks, postalAccounts, insurancePrivate]
  )

  const dismissAlert = useCallback(
    (id: string) => {
      const next = [...dismissedAlerts, id]
      setDismissedAlerts(next)
      save<StoreData>({ fds, mutualFunds, stocks, postalAccounts, insurancePrivate, insuranceLIC, dismissedAlerts: next, permanentlyClearedAlerts })
    },
    [fds, mutualFunds, stocks, postalAccounts, insurancePrivate, insuranceLIC, dismissedAlerts]
  )

  const clearAllDismissed = useCallback(() => {
    const next = [...new Set([...permanentlyClearedAlerts, ...dismissedAlerts])]
    setDismissedAlerts([])
    setPermanentlyClearedAlerts(next)
    save<StoreData>({ fds, mutualFunds, stocks, postalAccounts, insurancePrivate, insuranceLIC, dismissedAlerts: [], permanentlyClearedAlerts: next })
  }, [fds, mutualFunds, stocks, postalAccounts, insurancePrivate, insuranceLIC, dismissedAlerts, permanentlyClearedAlerts])

  return {
    fds, mutualFunds, stocks, postalAccounts, insurancePrivate, insuranceLIC,
    dismissedAlerts, permanentlyClearedAlerts, dismissAlert, clearAllDismissed,
    loading,
    updateFDs, updateMutualFunds, updateStocks, updatePostalAccounts, updateInsurancePrivate, updateInsuranceLIC,
  }
}
