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

const cellInputClass = "w-full bg-transparent border-b border-[rgba(212,175,55,0.3)] text-[#e8e6e1] text-[13px] outline-none px-0 py-0.5 focus:border-[#d4af37]"

export default function FixedDeposits({ fds, onUpdate }: FixedDepositsProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FixedDeposit | undefined>(undefined)
  const [editMode, setEditMode] = useState(false)
  const [editedRows, setEditedRows] = useState<FixedDeposit[]>([])

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

  function startEditMode() {
    setEditedRows(fds.map((f) => ({ ...f })))
    setEditMode(true)
  }

  function cancelEditMode() {
    setEditMode(false)
    setEditedRows([])
  }

  function saveEditMode() {
    onUpdate(editedRows)
    setEditMode(false)
    setEditedRows([])
  }

  function updateCell(id: string, field: keyof FixedDeposit, value: string) {
    setEditedRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: field === 'amount' || field === 'interestRate' ? Number(value) : value } : r))
    )
  }

  const thClass = "px-3.5 py-2.5 text-[11px] font-semibold text-[#6b7a91] uppercase tracking-[0.8px] text-left border-b border-white/5"
  const tdClass = "px-3.5 py-3 text-[13px] bg-white/[0.02] border-t border-white/[0.03]"

  const rows = editMode ? editedRows : fds

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="mb-5">
          <h2 className="text-xl font-serif text-[#d4af37]">Fixed Deposits</h2>
          <p className="text-xs text-[#6b7a91] mt-1">Track deposits, interest rates, and maturity dates</p>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button
                className="px-5 py-2.5 rounded-lg border border-[rgba(212,175,55,0.3)] text-[#d4af37] bg-transparent hover:bg-[rgba(212,175,55,0.08)] cursor-pointer text-[13px] font-semibold transition-all duration-200"
                onClick={cancelEditMode}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 rounded-lg border-none cursor-pointer text-[13px] font-semibold text-[#0a0e17] bg-gradient-to-br from-[#d4af37] to-[#c5a028] hover:brightness-110 transition-all duration-200"
                onClick={saveEditMode}
              >
                ✓ Save All
              </button>
            </>
          ) : (
            <>
              <button
                className="px-5 py-2.5 rounded-lg border border-[rgba(212,175,55,0.3)] text-[#d4af37] bg-transparent hover:bg-[rgba(212,175,55,0.08)] cursor-pointer text-[13px] font-semibold transition-all duration-200"
                onClick={startEditMode}
              >
                EDIT
              </button>
              <button
                className="px-5 py-2.5 rounded-lg border-none cursor-pointer text-[13px] font-semibold text-[#0a0e17] bg-gradient-to-br from-[#d4af37] to-[#c5a028] hover:brightness-110 inline-flex items-center gap-1.5 transition-all duration-200"
                onClick={openAdd}
              >
                + Add FD
              </button>
            </>
          )}
        </div>
      </div>

      {editMode && (
        <div className="mb-3 px-4 py-2.5 rounded-lg bg-[rgba(212,175,55,0.06)] border border-[rgba(212,175,55,0.2)] text-[12px] text-[#8a9bb5]">
          Click any cell to edit. You can paste data directly from Excel. Press Save All when done.
        </div>
      )}

      {rows.length === 0 ? (
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
              {rows.map((fd) => {
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
                      {editMode ? (
                        <input className={cellInputClass} value={fd.bankName} onChange={(e) => updateCell(fd.id, 'bankName', e.target.value)} />
                      ) : (
                        <>
                          <div className="font-semibold">{fd.bankName}</div>
                          {fd.autoRenew && <div className="text-[11px] text-[#d4af37] mt-0.5">↻ Auto-renewal</div>}
                        </>
                      )}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <input className={cellInputClass} value={fd.holderName || ''} onChange={(e) => updateCell(fd.id, 'holderName', e.target.value)} />
                      ) : fd.holderName || '—'}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <input className={cellInputClass} value={fd.accountNo || ''} onChange={(e) => updateCell(fd.id, 'accountNo', e.target.value)} />
                      ) : fd.accountNo || '—'}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <input className={cellInputClass} value={fd.nominee || ''} onChange={(e) => updateCell(fd.id, 'nominee', e.target.value)} />
                      ) : fd.nominee || '—'}
                    </td>
                    <td className={`${tdClass} font-semibold`}>
                      {editMode ? (
                        <input className={cellInputClass} type="number" value={fd.amount} onChange={(e) => updateCell(fd.id, 'amount', e.target.value)} />
                      ) : fmt(fd.amount)}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <input className={cellInputClass} type="number" step="0.01" value={fd.interestRate} onChange={(e) => updateCell(fd.id, 'interestRate', e.target.value)} />
                      ) : `${fd.interestRate}%`}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <input className={cellInputClass} type="date" value={fd.startDate} onChange={(e) => updateCell(fd.id, 'startDate', e.target.value)} />
                      ) : fmtDate(fd.startDate)}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <input className={cellInputClass} type="date" value={fd.maturityDate} onChange={(e) => updateCell(fd.id, 'maturityDate', e.target.value)} />
                      ) : fmtDate(fd.maturityDate)}
                    </td>
                    <td className={tdClass}>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badgeClass}`}>
                        {status}
                        {d > 0 ? ` (${d}d)` : ''}
                      </span>
                    </td>
                    <td className={tdClass}>
                      {!editMode && (
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
                      )}
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
