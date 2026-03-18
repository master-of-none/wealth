import React, { useState } from 'react'
import { InsuranceLIC as InsuranceLICType } from '../../types'
import { fmt, fmtDate } from '../../hooks/useAlerts'
import Modal from '../Modal/Modal'
import InsuranceLICForm from './InsuranceLICForm'

interface InsuranceLICProps {
  insuranceLIC: InsuranceLICType[]
  onUpdate: (insuranceLIC: InsuranceLICType[]) => void
}

function daysUntil(dateStr: string | undefined): number {
  if (!dateStr) return Infinity
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const t = new Date(dateStr)
  t.setHours(0, 0, 0, 0)
  return Math.ceil((t.getTime() - now.getTime()) / 864e5)
}

function nextAnniversary(openingDate: string): string {
  const open = new Date(openingDate)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  let next = new Date(now.getFullYear(), open.getMonth(), open.getDate())
  if (next <= now) next = new Date(now.getFullYear() + 1, open.getMonth(), open.getDate())
  return next.toISOString().split('T')[0]
}

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
const cellInputClass = "w-full bg-transparent border-b border-[rgba(212,175,55,0.3)] text-[#e8e6e1] text-[13px] outline-none px-0 py-0.5 focus:border-[#d4af37]"

export default function InsuranceLIC({ insuranceLIC, onUpdate }: InsuranceLICProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<InsuranceLICType | undefined>(undefined)
  const [editMode, setEditMode] = useState(false)
  const [editedRows, setEditedRows] = useState<InsuranceLICType[]>([])

  function openAdd() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function openEdit(ins: InsuranceLICType) {
    setEditing(ins)
    setModalOpen(true)
  }

  function handleSave(data: Omit<InsuranceLICType, 'id'>) {
    if (editing) {
      onUpdate(insuranceLIC.map((i) => (i.id === editing.id ? { ...editing, ...data } : i)))
    } else {
      onUpdate([...insuranceLIC, { ...data, id: genId() }])
    }
    setModalOpen(false)
  }

  function handleDelete(id: string) {
    if (confirm('Delete this LIC policy?')) {
      onUpdate(insuranceLIC.filter((i) => i.id !== id))
    }
  }

  function startEditMode() {
    setEditedRows(insuranceLIC.map((i) => ({ ...i })))
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

  function updateCell(id: string, field: keyof InsuranceLICType, value: string) {
    const numFields = ['premium', 'fundValue']
    setEditedRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: numFields.includes(field) ? Number(value) : value } : r))
    )
  }

  const thClass = "px-3.5 py-2.5 text-[11px] font-semibold text-[#6b7a91] uppercase tracking-[0.8px] text-left border-b border-white/5"
  const tdClass = "px-3.5 py-3 text-[13px] bg-white/[0.02] border-t border-white/[0.03]"

  const rows = editMode ? editedRows : insuranceLIC

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="mb-5">
          <h2 className="text-xl font-serif text-[#d4af37]">Insurance — LIC</h2>
          <p className="text-xs text-[#6b7a91] mt-1">Track LIC policies, premiums, and fund values</p>
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
                + Add Policy
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
          <div className="text-4xl mb-3 opacity-30">🛡️</div>
          <div className="font-semibold">No LIC policies yet</div>
          <div className="text-[11px] mt-1">Add your first LIC policy to start tracking</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ borderSpacing: '0 6px', borderCollapse: 'separate' }}>
            <thead>
              <tr>
                <th className={thClass}>#</th>
                <th className={thClass}>Holder Name</th>
                <th className={thClass}>Policy No</th>
                <th className={thClass}>Opening Date</th>
                <th className={thClass}>Closing Date</th>
                <th className={thClass}>Premium/yr</th>
                <th className={thClass}>Fund Value As On</th>
                <th className={thClass}>Last Premium Due</th>
                <th className={thClass}>Nominee</th>
                <th className={thClass}>Next Premium</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((ins, idx) => {
                const d = daysUntil(ins.closingDate)
                const status = d <= 0 ? 'Matured' : 'Active'
                const badgeClass = d <= 0
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                  : 'bg-green-500/10 text-green-500 border border-green-500/20'
                const nextPremium = ins.openingDate ? nextAnniversary(ins.openingDate) : undefined
                const premiumDays = nextPremium ? daysUntil(nextPremium) : null
                const premiumBadgeClass = premiumDays !== null && premiumDays <= 7
                  ? 'text-red-400'
                  : premiumDays !== null && premiumDays <= 30
                  ? 'text-amber-400'
                  : 'text-[#e8e6e1]'
                return (
                  <tr key={ins.id}>
                    <td className={`${tdClass} text-[#6b7a91]`}>{idx + 1}</td>
                    <td className={`${tdClass} font-semibold`}>
                      {editMode ? (
                        <input className={cellInputClass} value={ins.holderName} onChange={(e) => updateCell(ins.id, 'holderName', e.target.value)} />
                      ) : ins.holderName}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <input className={cellInputClass} value={ins.policyNo} onChange={(e) => updateCell(ins.id, 'policyNo', e.target.value)} />
                      ) : ins.policyNo}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <input className={cellInputClass} type="date" value={ins.openingDate} onChange={(e) => updateCell(ins.id, 'openingDate', e.target.value)} />
                      ) : fmtDate(ins.openingDate)}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <input className={cellInputClass} type="date" value={ins.closingDate} onChange={(e) => updateCell(ins.id, 'closingDate', e.target.value)} />
                      ) : fmtDate(ins.closingDate)}
                    </td>
                    <td className={`${tdClass} font-semibold`}>
                      {editMode ? (
                        <input className={cellInputClass} type="number" value={ins.premium} onChange={(e) => updateCell(ins.id, 'premium', e.target.value)} />
                      ) : fmt(ins.premium)}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <>
                          <input className={cellInputClass} type="number" value={ins.fundValue?.toString() || ''} onChange={(e) => updateCell(ins.id, 'fundValue', e.target.value)} placeholder="Fund value" />
                          <input className={`${cellInputClass} mt-1`} type="date" value={ins.fundValueDate || ''} onChange={(e) => updateCell(ins.id, 'fundValueDate', e.target.value)} />
                        </>
                      ) : (
                        <>
                          <div>{ins.fundValue ? fmt(ins.fundValue) : '—'}</div>
                          {ins.fundValueDate && <div className="text-[11px] text-[#8a9bb5] mt-0.5">{fmtDate(ins.fundValueDate)}</div>}
                        </>
                      )}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <input className={cellInputClass} type="date" value={ins.lastPremiumDue || (ins as any).premiumsPaidUpto || ''} onChange={(e) => updateCell(ins.id, 'lastPremiumDue', e.target.value)} />
                      ) : fmtDate(ins.lastPremiumDue || (ins as any).premiumsPaidUpto)}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <input className={cellInputClass} value={ins.nominee || ''} onChange={(e) => updateCell(ins.id, 'nominee', e.target.value)} />
                      ) : ins.nominee || '—'}
                    </td>
                    <td className={tdClass}>
                      {nextPremium ? (
                        <span className={`text-[13px] font-semibold ${premiumBadgeClass}`}>
                          {fmtDate(nextPremium)}
                          {premiumDays !== null ? ` (${premiumDays}d)` : ''}
                        </span>
                      ) : '—'}
                    </td>
                    <td className={tdClass}>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badgeClass}`}>
                        {status}
                      </span>
                    </td>
                    <td className={tdClass}>
                      {!editMode && (
                        <div className="flex gap-1.5">
                          <button
                            className="px-2.5 py-1.5 text-xs rounded-lg border border-[rgba(212,175,55,0.3)] text-[#d4af37] bg-transparent hover:bg-[rgba(212,175,55,0.08)] cursor-pointer font-semibold inline-flex items-center gap-1.5 transition-all duration-200"
                            onClick={() => openEdit(ins)}
                          >
                            ✎
                          </button>
                          <button
                            className="px-2.5 py-1.5 text-xs rounded-lg cursor-pointer font-semibold text-red-500 bg-red-500/10 inline-flex items-center gap-1.5 transition-all duration-200"
                            onClick={() => handleDelete(ins.id)}
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
        title={editing ? 'Edit LIC Policy' : 'Add LIC Policy'}
      >
        <InsuranceLICForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </>
  )
}
