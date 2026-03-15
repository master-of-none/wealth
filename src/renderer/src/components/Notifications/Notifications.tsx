import React from 'react'
import { AlertItem } from '../../types'

interface NotificationsProps {
  alerts: AlertItem[]
  onClose: () => void
}

export default function Notifications({ alerts, onClose }: NotificationsProps) {
  return (
    <div className="fixed top-[60px] right-4 w-[380px] bg-gradient-to-br from-[#141c2e] to-[#0f1521] border border-[rgba(212,175,55,0.2)] rounded-2xl p-[18px] z-[999] shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-[60vh] overflow-y-auto scrollbar-gold">
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
      {alerts.length === 0 ? (
        <div className="text-center py-5 text-[#6b7a91] text-[13px]">
          You're all caught up!
        </div>
      ) : (
        alerts.map((a) => (
          <div
            key={a.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-[10px] mb-2 ${
              a.urgency === 'critical'
                ? 'bg-red-500/[0.06] border border-red-500/[0.15]'
                : a.urgency === 'warning'
                ? 'bg-amber-500/[0.06] border border-amber-500/[0.15]'
                : 'bg-green-500/[0.06] border border-green-500/[0.15]'
            }`}
          >
            <div className={a.urgency === 'critical' ? 'text-red-500' : 'text-amber-500'}>⚠</div>
            <div>
              <div className="text-[13px] font-semibold">{a.title}</div>
              <div className="text-[11px] text-[#8a9bb5] mt-0.5">{a.detail}</div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
