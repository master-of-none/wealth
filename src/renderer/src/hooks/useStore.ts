import { useState, useEffect, useCallback } from 'react'
import { FixedDeposit, MutualFund, Stock } from '../types'

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
}

export function useStore() {
  const [fds, setFDs] = useState<FixedDeposit[]>([])
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([])
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load<StoreData>({ fds: [], mutualFunds: [], stocks: [] }).then((data) => {
      setFDs(data.fds || [])
      setMutualFunds(data.mutualFunds || [])
      setStocks(data.stocks || [])
      setLoading(false)
    })
  }, [])

  const updateFDs = useCallback(
    (data: FixedDeposit[]) => {
      setFDs(data)
      save<StoreData>({ fds: data, mutualFunds, stocks })
    },
    [mutualFunds, stocks]
  )

  const updateMutualFunds = useCallback(
    (data: MutualFund[]) => {
      setMutualFunds(data)
      save<StoreData>({ fds, mutualFunds: data, stocks })
    },
    [fds, stocks]
  )

  const updateStocks = useCallback(
    (data: Stock[]) => {
      setStocks(data)
      save<StoreData>({ fds, mutualFunds, stocks: data })
    },
    [fds, mutualFunds]
  )

  return { fds, mutualFunds, stocks, loading, updateFDs, updateMutualFunds, updateStocks }
}
