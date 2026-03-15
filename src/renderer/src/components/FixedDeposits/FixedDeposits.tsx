import React, { useState } from 'react'
import { FixedDeposit } from '../../types'
import { fmt, fmtDate } from '../../hooks/useAlerts'
import Modal from '../Modal/Modal'
import FDForm from './FDForm'

interface FixedDepositsProps {
  fds: FixedDeposit[]
  onUpdate: (fds: FixedDeposit[]) => void
}

function daysUntil(dateStr: string | undefined): number {
  if (!dateStr) return Infinity
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const t = new Date(dateStr)
  t.setHours(0, 0, 0, 0)
  return Math.ceil((t.getTime() - now.getTime()) / 864e5)
}

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

export default function FixedDeposits({ fds, onUpdate }: FixedDepositsProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FixedDeposit | undefined>(undefined)

  function openAdd() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function openEdit(fd: FixedDeposit) {
    setEditing(fd)
    setModalOpen(true)
  }

  function handleSave(data: Omit<FixedDeposit, 'id'>) {
    if (editing) {
      onUpdate(fds.map((f) => (f.id === editing.id ? { ...editing, ...data } : f)))
    } else {
      onUpdate([...fds, { ...data, id: genId() }])
    }
    setModalOpen(false)
  }

  function handleDelete(id: string) {
    if (confirm('Delete this FD?')) {
      onUpdate(fds.filter((f) => f.id !== id))
    }
  }

  const thClass = "px-3.5 py-2.5 text-[11px] font-semibold text-[#6b7a91] uppercase tracking-[0.8px] text-left border-b border-white/5"
  const tdClass = "px-3.5 py-3 text-[13px] bg-white/[0.02] border-t border-white/[0.03]"

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="mb-5">
          <h2 className="text-xl font-serif text-[#d4af37]">Fixed Deposits</h2>
          <p className="text-xs text-[#6b7a91] mt-1">Track deposits, interest rates, and maturity dates</p>
        </div>
        <button
          className="px-5 py-2.5 rounded-lg border-none cursor-pointer text-[13px] font-semibold text-[#0a0e17] bg-gradient-to-br from-[#d4af37] to-[#c5a028] hover:brightness-110 inline-flex items-center gap-1.5 transition-all duration-200"
          onClick={openAdd}
        >
          + Add FD
        </button>
      </div>

      {fds.length === 0 ? (
        <div className="text-center py-12 px-5 text-[#6b7a91]">
          <div className="text-4xl mb-3 opacity-30">🏦</div>
          <div className="font-semibold">No Fixed Deposits yet</div>
          <div className="text-[11px] mt-1">Add your first FD to start tracking</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ borderSpacing: '0 6px', borderCollapse: 'separate' }}>
            <thead>
              <tr>
                <th className={thClass}>Bank</th>
                <th className={thClass}>Holder</th>
                <th className={thClass}>A/C No</th>
                <th className={thClass}>Nominee</th>
                <th className={thClass}>Amount</th>
                <th className={thClass}>Rate</th>
                <th className={thClass}>Start</th>
                <th className={thClass}>Maturity</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fds.map((fd) => {
                const d = daysUntil(fd.maturityDate)
                const status = d <= 0 ? 'Matured' : d <= 30 ? 'Maturing Soon' : 'Active'
                const badgeClass = d <= 0
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                  : d <= 30
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-green-500/10 text-green-500 border border-green-500/20'
                return (
                  <tr key={fd.id}>
                    <td className={tdClass}>
                      <div className="font-semibold">{fd.bankName}</div>
                      {fd.autoRenew && (
                        <div className="text-[11px] text-[#d4af37] mt-0.5">↻ Auto-renewal</div>
                      )}
                    </td>
                    <td className={tdClass}>{fd.holderName || '—'}</td>
                    <td className={tdClass}>{fd.accountNo || '—'}</td>
                    <td className={tdClass}>{fd.nominee || '—'}</td>
                    <td className={`${tdClass} font-semibold`}>{fmt(fd.amount)}</td>
                    <td className={tdClass}>{fd.interestRate}%</td>
                    <td className={tdClass}>{fmtDate(fd.startDate)}</td>
                    <td className={tdClass}>{fmtDate(fd.maturityDate)}</td>
                    <td className={tdClass}>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badgeClass}`}>
                        {status}
                        {d > 0 ? ` (${d}d)` : ''}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <div className="flex gap-1.5">
                        <button
                          className="px-2.5 py-1.5 text-xs rounded-lg border border-[rgba(212,175,55,0.3)] text-[#d4af37] bg-transparent hover:bg-[rgba(212,175,55,0.08)] cursor-pointer font-semibold inline-flex items-center gap-1.5 transition-all duration-200"
                          onClick={() => openEdit(fd)}
                        >
                          ✎
                        </button>
                        <button
                          className="px-2.5 py-1.5 text-xs rounded-lg cursor-pointer font-semibold text-red-500 bg-red-500/10 inline-flex items-center gap-1.5 transition-all duration-200"
                          onClick={() => handleDelete(fd.id)}
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
        title={editing ? 'Edit Fixed Deposit' : 'Add Fixed Deposit'}
      >
        <FDForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </>
  )
}
