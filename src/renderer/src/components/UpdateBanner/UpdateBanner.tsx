import React from 'react'
import { UpdateStatus } from '../../types'

interface UpdateBannerProps {
  status: UpdateStatus
  message: string
  percent?: number
  onInstall: () => void
  onDismiss: () => void
}

export default function UpdateBanner({ status, message, percent, onInstall, onDismiss }: UpdateBannerProps) {
  if (!status) return null

  let variantClass = ''
  if (status === 'checking' || status === 'up-to-date') {
    variantClass = 'bg-blue-500/10 text-blue-400 border-b border-blue-500/15'
  } else if (status === 'available' || status === 'downloading') {
    variantClass = 'bg-amber-500/10 text-amber-400 border-b border-amber-500/15'
  } else if (status === 'ready') {
    variantClass = 'bg-green-500/[0.12] text-green-400 border-b border-green-500/20'
  } else if (status === 'error') {
    variantClass = 'bg-red-500/[0.08] text-red-400 border-b border-red-500/15'
  }

  return (
    <div className={`flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium flex-shrink-0 transition-all duration-300 ${variantClass}`}>
      <span className="flex-1">{message}</span>
      {status === 'downloading' && percent !== undefined && (
        <div className="w-[120px] h-1 rounded-sm bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-sm bg-amber-500 transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
      {status === 'ready' && (
        <button
          className="px-3.5 py-1 rounded-md border-none cursor-pointer text-xs font-semibold bg-green-500 text-[#0a0e17]"
          onClick={onInstall}
        >
          Restart &amp; Update
        </button>
      )}
      <button
        className="p-1 bg-none border-none cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
        onClick={onDismiss}
      >
        ✕
      </button>
    </div>
  )
}
