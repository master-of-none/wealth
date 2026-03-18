import React, { useState } from 'react'
import { MutualFund } from '../../types'
import { fmt, fmtDate } from '../../hooks/useAlerts'
import Modal from '../Modal/Modal'
import MFForm from './MFForm'

interface MutualFundsProps {
  mutualFunds: MutualFund[]
  onUpdate: (mfs: MutualFund[]) => void
}

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
const PERIODIC_OPTIONS = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly']
const cellInputClass = "w-full bg-transparent border-b border-[rgba(212,175,55,0.3)] text-[#e8e6e1] text-[13px] outline-none px-0 py-0.5 focus:border-[#d4af37]"
const cellSelectClass = "w-full bg-[#0f1521] border-b border-[rgba(212,175,55,0.3)] text-[#e8e6e1] text-[13px] outline-none px-0 py-0.5 focus:border-[#d4af37]"

export default function MutualFunds({ mutualFunds, onUpdate }: MutualFundsProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MutualFund | undefined>(undefined)
  const [editMode, setEditMode] = useState(false)
  const [editedRows, setEditedRows] = useState<MutualFund[]>([])

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

  function startEditMode() {
    setEditedRows(mutualFunds.map((m) => ({ ...m })))
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

  function updateCell(id: string, field: keyof MutualFund, value: string) {
    const numFields = ['sipAmount', 'totalInvested', 'nav', 'units']
    setEditedRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: numFields.includes(field) ? Number(value) : value } : r))
    )
  }

  const thClass = "px-3.5 py-2.5 text-[11px] font-semibold text-[#6b7a91] uppercase tracking-[0.8px] text-left border-b border-white/5"
  const tdClass = "px-3.5 py-3 text-[13px] bg-white/[0.02] border-t border-white/[0.03]"

  const rows = editMode ? editedRows : mutualFunds

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="mb-5">
          <h2 className="text-xl font-serif text-[#d4af37]">Mutual Funds</h2>
          <p className="text-xs text-[#6b7a91] mt-1">Track SIPs, returns, and fund performance</p>
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
                + Add Fund
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
                <th className={thClass}>SIP</th>
                <th className={thClass}>Periodic</th>
                <th className={thClass}>Invested</th>
                <th className={thClass}>Units</th>
                <th className={thClass}>NAV as on</th>
                <th className={thClass}>Fund Value</th>
                <th className={thClass}>Returns</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((mf) => {
                const inv = Number(mf.totalInvested) || 0
                const nav = Number(mf.nav) || 0
                const units = Number(mf.units) || 0
                const fundValue = units > 0 ? nav * units : nav
                const ret = inv > 0 ? ((fundValue - inv) / inv) * 100 : 0
                return (
                  <tr key={mf.id}>
                    <td className={tdClass}>
                      {editMode ? (
                        <input className={cellInputClass} value={mf.fundName} onChange={(e) => updateCell(mf.id, 'fundName', e.target.value)} />
                      ) : (
                        <>
                          <div className="font-semibold">{mf.fundName}</div>
                          {mf.folioNumber && <div className="text-[11px] text-[#8a9bb5] mt-0.5">Folio: {mf.folioNumber}</div>}
                          {mf.initialInvestmentDate && <div className="text-[11px] text-[#6b7a91] mt-0.5">Since: {fmtDate(mf.initialInvestmentDate)}</div>}
                        </>
                      )}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <input className={cellInputClass} type="number" value={mf.sipAmount} onChange={(e) => updateCell(mf.id, 'sipAmount', e.target.value)} />
                      ) : fmt(mf.sipAmount)}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <select className={cellSelectClass} value={mf.periodic || 'Monthly'} onChange={(e) => updateCell(mf.id, 'periodic', e.target.value)}>
                          {PERIODIC_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      ) : mf.periodic || '—'}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <input className={cellInputClass} type="number" value={mf.totalInvested} onChange={(e) => updateCell(mf.id, 'totalInvested', e.target.value)} />
                      ) : fmt(inv)}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <input className={cellInputClass} type="number" step="0.001" value={mf.units?.toString() || ''} onChange={(e) => updateCell(mf.id, 'units', e.target.value)} />
                      ) : units > 0 ? units : '—'}
                    </td>
                    <td className={tdClass}>
                      {editMode ? (
                        <>
                          <input className={cellInputClass} type="number" step="0.01" value={mf.nav} onChange={(e) => updateCell(mf.id, 'nav', e.target.value)} placeholder="NAV" />
                          <input className={`${cellInputClass} mt-1`} type="date" value={mf.navDate || ''} onChange={(e) => updateCell(mf.id, 'navDate', e.target.value)} />
                        </>
                      ) : (
                        <>
                          <div className="font-semibold">{nav > 0 ? fmt(nav) : '—'}</div>
                          {mf.navDate && <div className="text-[11px] text-[#8a9bb5] mt-0.5">{fmtDate(mf.navDate)}</div>}
                        </>
                      )}
                    </td>
                    <td className={`${tdClass} font-semibold`}>{fundValue > 0 ? fmt(fundValue) : '—'}</td>
                    <td className={`${tdClass} font-semibold ${ret >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {ret >= 0 ? '+' : ''}
                      {ret.toFixed(1)}%
                    </td>
                    <td className={tdClass}>
                      {!editMode && (
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
