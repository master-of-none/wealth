import React from 'react'

interface HeaderProps {
  activeTab: number
  onTabChange: (tab: number) => void
  alertCount: number
  onBellClick: () => void
  version: string
}

const TABS = ['Dashboard', 'Fixed Deposits', 'Mutual Funds', 'Stocks', 'Postal', 'Ins. Private', 'LIC']

const TAB_ICONS = [
  <svg key="dashboard" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>,
  <svg key="fds" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /><circle cx="12" cy="16" r="2" />
  </svg>,
  <svg key="mfs" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 20l4-8 4 4 4-10 6 14" />
  </svg>,
  <svg key="stocks" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" />
  </svg>,
  <svg key="postal" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 8l9 6 9-6" /><rect x="2" y="6" width="20" height="14" rx="2" />
  </svg>,
  <svg key="ins-private" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2l7 4v6c0 4.5-3 8-7 10C5 20 2 16.5 2 12V6l10-4z" />
  </svg>,
  <svg key="lic" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2l7 4v6c0 4.5-3 8-7 10C5 20 2 16.5 2 12V6l10-4z" /><path d="M9 12l2 2 4-4" />
  </svg>,
]

export default function Header({ activeTab, onTabChange, alertCount, onBellClick, version }: HeaderProps) {
  return (
    <header className="bg-gradient-to-br from-[#0f1521] to-[#141c2e] border-b border-[rgba(212,175,55,0.15)] px-6 flex items-center justify-between h-[60px] flex-shrink-0 app-drag">
      <div className="flex items-center gap-[10px] font-serif text-xl font-bold text-[#d4af37] tracking-wide">
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M7 4h10M7 8h10M7 4c0 4 3 8 10 8M7 8c0 6 4 8 7 12" />
        </svg>
        MyWealth
        <span className="text-[11px] text-[#6b7a91] opacity-70 px-2 py-0.5 border border-white/[0.08] rounded ml-1">
          {version ? `v${version}` : ''}
        </span>
      </div>
      <nav className="flex gap-0.5 bg-white/[0.03] rounded-[10px] p-[3px] app-no-drag">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={
              activeTab === i
                ? 'px-[14px] py-2 rounded-lg border-none cursor-pointer text-[12px] font-semibold text-[#0a0e17] bg-gradient-to-br from-[#d4af37] to-[#c5a028] transition-all duration-200 flex items-center gap-1.5 app-no-drag'
                : 'px-[14px] py-2 rounded-lg border-none cursor-pointer text-[12px] font-normal text-[#8a9bb5] bg-transparent transition-all duration-200 flex items-center gap-1.5 app-no-drag hover:text-[#e8e6e1] hover:bg-white/5'
            }
            onClick={() => onTabChange(i)}
          >
            {TAB_ICONS[i]}
            {t}
          </button>
        ))}
      </nav>
      <div className="flex gap-2 items-center app-no-drag">
        <button
          className="relative px-2.5 py-1.5 text-xs rounded-lg border border-[rgba(212,175,55,0.3)] text-[#d4af37] bg-transparent hover:bg-[rgba(212,175,55,0.08)] cursor-pointer inline-flex items-center gap-1.5 transition-all duration-200 font-semibold"
          onClick={onBellClick}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
