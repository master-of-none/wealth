import React, { useState } from 'react'
import { AlertItem } from '../../types'

interface NotificationsProps {
  alerts: AlertItem[]
  dismissedAlerts: AlertItem[]
  onClose: () => void
  onDismiss: (id: string) => void
  onClearAllDismissed: () => void
}

export default function Notifications({ alerts, dismissedAlerts, onClose, onDismiss, onClearAllDismissed }: NotificationsProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [showDismissed, setShowDismissed] = useState(false)
  const [confirmClearAll, setConfirmClearAll] = useState(false)

  function handleClearClick(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setConfirmingId(id)
  }

  function handleConfirm(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    onDismiss(id)
    setConfirmingId(null)
  }

  function handleCancel(e: React.MouseEvent) {
    e.stopPropagation()
    setConfirmingId(null)
  }

  function handleClearAll(e: React.MouseEvent) {
    e.stopPropagation()
    setConfirmClearAll(true)
  }

  function handleConfirmClearAll(e: React.MouseEvent) {
    e.stopPropagation()
    onClearAllDismissed()
    setConfirmClearAll(false)
    setShowDismissed(false)
  }

  function handleCancelClearAll(e: React.MouseEvent) {
    e.stopPropagation()
    setConfirmClearAll(false)
  }

  return (
    <div className="fixed top-[60px] right-4 w-[400px] bg-gradient-to-br from-[#141c2e] to-[#0f1521] border border-[rgba(212,175,55,0.2)] rounded-2xl p-[18px] z-[999] shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-[70vh] overflow-y-auto scrollbar-gold">
      {/* Header */}
      <div className="flex justify-between items-center mb-[14px]">
        <div className="text-[15px] font-semibold text-[#d4af37] font-serif tracking-wide">
          Notifications
        </div>
        <button
          className="p-1.5 bg-none border-none cursor-pointer text-[#8a9bb5] hover:text-[#d4af37] transition-colors"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {/* Active alerts */}
      {alerts.length === 0 ? (
        <div className="text-center py-5 text-[#6b7a91] text-[13px]">
          You're all caught up!
        </div>
      ) : (
        alerts.map((a) => (
          <div
            key={a.id}
            className={`px-4 py-3 rounded-[10px] mb-2 ${
              a.urgency === 'critical'
                ? 'bg-red-500/[0.06] border border-red-500/[0.15]'
                : a.urgency === 'warning'
                ? 'bg-amber-500/[0.06] border border-amber-500/[0.15]'
                : 'bg-green-500/[0.06] border border-green-500/[0.15]'
            }`}
          >
            {confirmingId === a.id ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] text-[#8a9bb5]">Clear this notification?</span>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => handleConfirm(a.id, e)}
                    className="px-3 py-1 rounded-md text-[11px] font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                  >
                    Yes, clear
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1 rounded-md text-[11px] font-semibold bg-white/5 text-[#8a9bb5] hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className={a.urgency === 'critical' ? 'text-red-500' : 'text-amber-500'}>⚠</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold">{a.title}</div>
                  <div className="text-[11px] text-[#8a9bb5] mt-0.5">{a.detail}</div>
                </div>
                <button
                  onClick={(e) => handleClearClick(a.id, e)}
                  title="Clear notification"
                  className="flex-shrink-0 p-1 text-[#6b7a91] hover:text-red-400 transition-colors text-[13px]"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {/* Dismissed section */}
      {dismissedAlerts.length > 0 && (
        <div className="mt-3 border-t border-white/[0.06] pt-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={(e) => { e.stopPropagation(); setShowDismissed((v) => !v) }}
              className="text-[12px] text-[#8a9bb5] hover:text-[#d4af37] transition-colors flex items-center gap-1"
            >
              <span>{showDismissed ? '▾' : '▸'}</span>
              Dismissed ({dismissedAlerts.length})
            </button>

            {showDismissed && (
              confirmClearAll ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8a9bb5]">Delete all?</span>
                  <button
                    onClick={handleConfirmClearAll}
                    className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={handleCancelClearAll}
                    className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-white/5 text-[#8a9bb5] hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] text-red-400/70 hover:text-red-400 transition-colors"
                >
                  Delete all
                </button>
              )
            )}
          </div>

          {showDismissed && (
            <div>
              {dismissedAlerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-[10px] mb-2 bg-white/[0.02] border border-white/[0.05] opacity-50"
                >
                  <div className="text-[#6b7a91]">⚠</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#6b7a91] line-through">{a.title}</div>
                    <div className="text-[11px] text-[#6b7a91] mt-0.5">{a.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
