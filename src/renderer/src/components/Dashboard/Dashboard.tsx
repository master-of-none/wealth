import React from 'react'
import { FixedDeposit, MutualFund, Stock, AlertItem } from '../../types'
import PieChart from './PieChart'
import { fmt, fmtDate } from '../../hooks/useAlerts'

interface DashboardProps {
  fds: FixedDeposit[]
  mutualFunds: MutualFund[]
  stocks: Stock[]
  alerts: AlertItem[]
}


export default function Dashboard({ fds, mutualFunds, stocks, alerts }: DashboardProps) {
  const totalFD = fds.reduce((s, f) => s + (Number(f.amount) || 0), 0)
  const mfInv = mutualFunds.reduce((s, m) => s + (Number(m.totalInvested) || 0), 0)
  const mfCur = mutualFunds.reduce((s, m) => {
    const nav = Number(m.nav) || 0
    const units = Number(m.units) || 0
    return s + (units > 0 ? nav * units : nav)
  }, 0)
  const stInv = stocks.reduce((s, st) => s + (Number(st.quantity) || 0) * (Number(st.buyPrice) || 0), 0)
  const stCur = stocks.reduce(
    (s, st) => s + (Number(st.quantity) || 0) * (Number(st.currentPrice) || Number(st.buyPrice) || 0),
    0
  )
  const total = totalFD + mfCur + stCur
  const mfRet = mfInv > 0 ? ((mfCur - mfInv) / mfInv * 100).toFixed(1) : '0.0'
  const stPnl = stCur - stInv

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px] mb-5">
        <div className="rounded-xl p-[18px] bg-gradient-to-br from-[rgba(212,175,55,0.08)] to-[rgba(212,175,55,0.03)] border border-[rgba(212,175,55,0.2)]">
          <div className="text-[11px] font-medium text-[#8a9bb5] uppercase tracking-[1px] mb-1.5">Total Portfolio</div>
          <div className="text-[22px] font-bold text-[#d4af37]">{fmt(total)}</div>
        </div>
        <div className="rounded-xl p-[18px] bg-gradient-to-br from-[rgba(59,130,246,0.08)] to-[rgba(59,130,246,0.03)] border border-[rgba(59,130,246,0.2)]">
          <div className="text-[11px] font-medium text-[#8a9bb5] uppercase tracking-[1px] mb-1.5">Fixed Deposits</div>
          <div className="text-[22px] font-bold text-blue-500">{fmt(totalFD)}</div>
          <div className="text-[11px] text-[#6b7a91] mt-1">
            {fds.length} deposit{fds.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="rounded-xl p-[18px] bg-gradient-to-br from-[rgba(34,197,94,0.08)] to-[rgba(34,197,94,0.03)] border border-[rgba(34,197,94,0.2)]">
          <div className="text-[11px] font-medium text-[#8a9bb5] uppercase tracking-[1px] mb-1.5">Mutual Funds</div>
          <div className="text-[22px] font-bold text-green-500">{fmt(mfCur)}</div>
          <div className={`text-[11px] mt-1 ${Number(mfRet) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {mfRet}% returns
          </div>
        </div>
        <div className="rounded-xl p-[18px] bg-gradient-to-br from-[rgba(245,158,11,0.08)] to-[rgba(245,158,11,0.03)] border border-[rgba(245,158,11,0.2)]">
          <div className="text-[11px] font-medium text-[#8a9bb5] uppercase tracking-[1px] mb-1.5">Stocks</div>
          <div className="text-[22px] font-bold text-amber-500">{fmt(stCur)}</div>
          <div className={`text-[11px] mt-1 ${stPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            P&amp;L: {fmt(stPnl)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#141c2e] to-[#111827] border border-[rgba(212,175,55,0.15)] rounded-2xl p-[22px] mb-4">
          <div className="text-base font-semibold text-[#d4af37] font-serif tracking-wide">Asset Allocation</div>
          <PieChart
            data={[
              { label: 'Fixed Deposits', value: totalFD, color: '#d4af37' },
              { label: 'Mutual Funds', value: mfCur, color: '#22c55e' },
              { label: 'Stocks', value: stCur, color: '#3b82f6' },
            ]}
          />
        </div>
        <div className="bg-gradient-to-br from-[#141c2e] to-[#111827] border border-[rgba(212,175,55,0.15)] rounded-2xl p-[22px] mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-base font-semibold text-[#d4af37] font-serif tracking-wide">Upcoming Alerts</div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${alerts.length ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
              {alerts.length ? `${alerts.length} active` : 'All clear'}
            </span>
          </div>
          {alerts.length === 0 ? (
            <div className="text-center py-6 px-5 text-[#6b7a91]">
              No upcoming alerts
            </div>
          ) : (
            alerts.slice(0, 5).map((a) => (
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
      </div>

      {mutualFunds.filter((m) => m.periodic).length > 0 && (
        <div className="bg-gradient-to-br from-[#141c2e] to-[#111827] border border-[rgba(212,175,55,0.15)] rounded-2xl p-[22px] mb-4">
          <div className="text-base font-semibold text-[#d4af37] font-serif tracking-wide">SIP Schedule</div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5 mt-3.5">
            {mutualFunds
              .filter((m) => m.periodic)
              .map((mf) => {
                return (
                  <div key={mf.id} className="flex items-center gap-3 p-3 rounded-[10px] bg-white/[0.03] border border-white/5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}
                    >
                      📅
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                        {mf.fundName}
                      </div>
                      <div className="text-[11px] text-[#6b7a91]">
                        {fmt(mf.sipAmount)} — {mf.periodic}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </>
  )
}
