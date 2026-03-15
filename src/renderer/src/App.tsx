import React, { useState, useEffect, useCallback } from 'react'
import { UpdateStatus } from './types'
import { useStore } from './hooks/useStore'
import { useAlerts } from './hooks/useAlerts'
import Header from './components/Header/Header'
import UpdateBanner from './components/UpdateBanner/UpdateBanner'
import Notifications from './components/Notifications/Notifications'
import Dashboard from './components/Dashboard/Dashboard'
import FixedDeposits from './components/FixedDeposits/FixedDeposits'
import MutualFunds from './components/MutualFunds/MutualFunds'
import Stocks from './components/Stocks/Stocks'

type ElectronAPI = {
  getVersion: () => Promise<string>
  installUpdate: () => void
  onUpdateStatus: (cb: (data: { status: string; message: string; percent?: number }) => void) => () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>(null)
  const [updateMessage, setUpdateMessage] = useState('')
  const [updatePercent, setUpdatePercent] = useState<number | undefined>(undefined)
  const [updateDismissed, setUpdateDismissed] = useState(false)
  const [version, setVersion] = useState('')

  const { fds, mutualFunds, stocks, loading, updateFDs, updateMutualFunds, updateStocks } = useStore()
  const alerts = useAlerts(fds, mutualFunds)

  useEffect(() => {
    if (window.electronAPI?.getVersion) {
      window.electronAPI.getVersion().then((v) => setVersion(v))
    }

    if (window.electronAPI?.onUpdateStatus) {
      const cleanup = window.electronAPI.onUpdateStatus((data) => {
        const status = data.status as UpdateStatus
        if (updateDismissed && status !== 'ready') return
        setUpdateStatus(status)
        setUpdateMessage(data.message)
        if (data.percent !== undefined) setUpdatePercent(data.percent)

        // Auto-hide checking/up-to-date banners
        if (status === 'checking' || status === 'up-to-date') {
          setTimeout(() => {
            setUpdateStatus((current) => (current === status ? null : current))
          }, status === 'up-to-date' ? 2000 : 3000)
        }
        if (status === 'error') {
          setTimeout(() => {
            setUpdateStatus((current) => (current === 'error' ? null : current))
          }, 5000)
        }
      })
      return cleanup
    }
  }, [updateDismissed])

  const handleDismissUpdate = useCallback(() => {
    setUpdateStatus(null)
    setUpdateDismissed(true)
  }, [])

  const handleInstallUpdate = useCallback(() => {
    window.electronAPI?.installUpdate()
  }, [])

  const handleTabChange = useCallback((tab: number) => {
    setActiveTab(tab)
    setNotifOpen(false)
  }, [])

  const handleBellClick = useCallback(() => {
    setNotifOpen((open) => !open)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-[#6b7a91]">
        Loading…
      </div>
    )
  }

  return (
    <>
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        alertCount={alerts.length}
        onBellClick={handleBellClick}
        version={version}
      />

      {updateStatus && (
        <UpdateBanner
          status={updateStatus}
          message={updateMessage}
          percent={updatePercent}
          onInstall={handleInstallUpdate}
          onDismiss={handleDismissUpdate}
        />
      )}

      {notifOpen && (
        <Notifications alerts={alerts} onClose={() => setNotifOpen(false)} />
      )}

      <main className="flex-1 p-6 overflow-y-auto scrollbar-gold" onClick={() => setNotifOpen(false)}>
        {activeTab === 0 && (
          <Dashboard fds={fds} mutualFunds={mutualFunds} stocks={stocks} alerts={alerts} />
        )}
        {activeTab === 1 && <FixedDeposits fds={fds} onUpdate={updateFDs} />}
        {activeTab === 2 && <MutualFunds mutualFunds={mutualFunds} onUpdate={updateMutualFunds} />}
        {activeTab === 3 && <Stocks stocks={stocks} onUpdate={updateStocks} />}
      </main>
    </>
  )
}
