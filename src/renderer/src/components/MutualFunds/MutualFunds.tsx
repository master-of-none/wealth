import React, { useState } from 'react'
import { MutualFund } from '../../types'
import { fmt } from '../../hooks/useAlerts'
import Modal from '../Modal/Modal'
import MFForm from './MFForm'

interface MutualFundsProps {
  mutualFunds: MutualFund[]
  onUpdate: (mfs: MutualFund[]) => void
}

function daysToSIP(day: number): number {
  const now = new Date()
  let n = new Date(now.getFullYear(), now.getMonth(), day)
  if (n <= now) n = new Date(now.getFullYear(), now.getMonth() + 1, day)
  const t = new Date(n)
  t.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((t.getTime() - today.getTime()) / 864e5)
}

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

export default function MutualFunds({ mutualFunds, onUpdate }: MutualFundsProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MutualFund | undefined>(undefined)

  function openAdd() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function openEdit(mf: MutualFund) {
    setEditing(mf)
    setModalOpen(true)
  }

  function handleSave(data: Omit<MutualFund, 'id'>) {
    if (editing) {
      onUpdate(mutualFunds.map((m) => (m.id === editing.id ? { ...editing, ...data } : m)))
    } else {
      onUpdate([...mutualFunds, { ...data, id: genId() }])
    }
    setModalOpen(false)
  }

  function handleDelete(id: string) {
    if (confirm('Delete this fund?')) {
      onUpdate(mutualFunds.filter((m) => m.id !== id))
    }
  }

  const thClass = "px-3.5 py-2.5 text-[11px] font-semibold text-[#6b7a91] uppercase tracking-[0.8px] text-left border-b border-white/5"
  const tdClass = "px-3.5 py-3 text-[13px] bg-white/[0.02] border-t border-white/[0.03]"

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="mb-5">
          <h2 className="text-xl font-serif text-[#d4af37]">Mutual Funds</h2>
          <p className="text-xs text-[#6b7a91] mt-1">Track SIPs, returns, and fund performance</p>
        </div>
        <button
          className="px-5 py-2.5 rounded-lg border-none cursor-pointer text-[13px] font-semibold text-[#0a0e17] bg-gradient-to-br from-[#d4af37] to-[#c5a028] hover:brightness-110 inline-flex items-center gap-1.5 transition-all duration-200"
          onClick={openAdd}
        >
          + Add Fund
        </button>
      </div>

      {mutualFunds.length === 0 ? (
        <div className="text-center py-12 px-5 text-[#6b7a91]">
          <div className="text-4xl mb-3 opacity-30">📈</div>
          <div className="font-semibold">No Mutual Funds yet</div>
          <div className="text-[11px] mt-1">Add your first fund to start tracking</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderSpacing: '0 6px', borderCollapse: 'separate' }}>
            <thead>
              <tr>
                <th className={thClass}>Fund</th>
                <th className={thClass}>Category</th>
                <th className={thClass}>SIP</th>
                <th className={thClass}>Next SIP</th>
                <th className={thClass}>Invested</th>
                <th className={thClass}>Current</th>
                <th className={thClass}>Returns</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mutualFunds.map((mf) => {
                const inv = Number(mf.totalInvested) || 0
                const cur = Number(mf.currentValue) || 0
                const ret = inv > 0 ? ((cur - inv) / inv) * 100 : 0
                const sd = mf.sipDay ? daysToSIP(Number(mf.sipDay)) : null
                return (
                  <tr key={mf.id}>
                    <td className={tdClass}>
                      <div className="font-semibold">{mf.fundName}</div>
                      {mf.folioNumber && (
                        <div className="text-[11px] text-[#8a9bb5] mt-0.5">Folio: {mf.folioNumber}</div>
                      )}
                    </td>
                    <td className={tdClass}>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                        {mf.category || 'Equity'}
                      </span>
                    </td>
                    <td className={tdClass}>{fmt(mf.sipAmount)}</td>
                    <td className={tdClass}>
                      {sd !== null ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${sd <= 3 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                          📅 {sd === 0 ? 'Today' : `${sd}d`}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className={tdClass}>{fmt(inv)}</td>
                    <td className={`${tdClass} font-semibold`}>{fmt(cur)}</td>
                    <td className={`${tdClass} font-semibold ${ret >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {ret >= 0 ? '+' : ''}
                      {ret.toFixed(1)}%
                    </td>
                    <td className={tdClass}>
                      <div className="flex gap-1.5">
                        <button
                          className="px-2.5 py-1.5 text-xs rounded-lg border border-[rgba(212,175,55,0.3)] text-[#d4af37] bg-transparent hover:bg-[rgba(212,175,55,0.08)] cursor-pointer font-semibold inline-flex items-center gap-1.5 transition-all duration-200"
                          onClick={() => openEdit(mf)}
                        >
                          ✎
                        </button>
                        <button
                          className="px-2.5 py-1.5 text-xs rounded-lg cursor-pointer font-semibold text-red-500 bg-red-500/10 inline-flex items-center gap-1.5 transition-all duration-200"
                          onClick={() => handleDelete(mf.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Mutual Fund' : 'Add Mutual Fund'}
      >
        <MFForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </>
  )
}
