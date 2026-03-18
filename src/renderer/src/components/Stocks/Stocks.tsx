import React, { useState } from 'react'
import { Stock } from '../../types'
import { fmt, fmtDate } from '../../hooks/useAlerts'
import Modal from '../Modal/Modal'
import StockForm from './StockForm'

interface StocksProps {
  stocks: Stock[]
  onUpdate: (stocks: Stock[]) => void
}

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
const cellInputClass = "w-full bg-transparent border-b border-[rgba(212,175,55,0.3)] text-[#e8e6e1] text-[13px] outline-none px-0 py-0.5 focus:border-[#d4af37]"

export default function Stocks({ stocks, onUpdate }: StocksProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Stock | undefined>(undefined)
  const [editMode, setEditMode] = useState(false)
  const [editedRows, setEditedRows] = useState<Stock[]>([])

  function openAdd() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function openEdit(stock: Stock) {
    setEditing(stock)
    setModalOpen(true)
  }

  function handleSave(data: Omit<Stock, 'id'>) {
    if (editing) {
      onUpdate(stocks.map((s) => (s.id === editing.id ? { ...editing, ...data } : s)))
    } else {
      onUpdate([...stocks, { ...data, id: genId() }])
    }
    setModalOpen(false)
  }

  function handleDelete(id: string) {
    if (confirm('Delete this stock?')) {
      onUpdate(stocks.filter((s) => s.id !== id))
    }
  }

  function startEditMode() {
    setEditedRows(stocks.map((s) => ({ ...s })))
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

  function updateCell(id: string, field: keyof Stock, value: string) {
    const numFields = ['quantity', 'buyPrice', 'currentPrice']
    setEditedRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: numFields.includes(field) ? Number(value) : value } : r))
    )
  }

  const stInv = stocks.reduce((s, st) => s + (Number(st.quantity) || 0) * (Number(st.buyPrice) || 0), 0)
  const stCur = stocks.reduce(
    (s, st) => s + (Number(st.quantity) || 0) * (Number(st.currentPrice) || Number(st.buyPrice) || 0),
    0
  )

  const thClass = "px-3.5 py-2.5 text-[11px] font-semibold text-[#6b7a91] uppercase tracking-[0.8px] text-left border-b border-white/5"
  const tdClass = "px-3.5 py-3 text-[13px] bg-white/[0.02] border-t border-white/[0.03]"

  const rows = editMode ? editedRows : stocks

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="mb-5">
          <h2 className="text-xl font-serif text-[#d4af37]">Stocks</h2>
          <p className="text-xs text-[#6b7a91] mt-1">Track holdings, prices, and profit/loss</p>
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
                + Add Stock
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
          <div className="text-4xl mb-3 opacity-30">📊</div>
          <div className="font-semibold">No Stocks yet</div>
          <div className="text-[11px] mt-1">Add your first holding to start tracking</div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderSpacing: '0 6px', borderCollapse: 'separate' }}>
              <thead>
                <tr>
                  <th className={thClass}>Stock</th>
                  <th className={thClass}>Qty</th>
                  <th className={thClass}>Buy Price</th>
                  <th className={thClass}>Price as on</th>
                  <th className={thClass}>Invested</th>
                  <th className={thClass}>Value</th>
                  <th className={thClass}>P&amp;L</th>
                  <th className={thClass}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((st) => {
                  const q = Number(st.quantity) || 0
                  const bp = Number(st.buyPrice) || 0
                  const cp = Number(st.currentPrice) || bp
                  const inv = q * bp
                  const val = q * cp
                  const pnl = val - inv
                  const pct = inv > 0 ? (pnl / inv) * 100 : 0
                  return (
                    <tr key={st.id}>
                      <td className={tdClass}>
                        {editMode ? (
                          <>
                            <input className={`${cellInputClass} uppercase font-semibold text-[#d4af37]`} value={st.symbol} onChange={(e) => updateCell(st.id, 'symbol', e.target.value)} placeholder="ABC" />
                            <input className={`${cellInputClass} mt-1 text-[11px]`} value={st.companyName} onChange={(e) => updateCell(st.id, 'companyName', e.target.value)} placeholder="Company name" />
                          </>
                        ) : (
                          <>
                            <div className="font-semibold text-[#d4af37]">{st.symbol}</div>
                            <div className="text-[11px] text-[#8a9bb5]">{st.companyName}</div>
                          </>
                        )}
                      </td>
                      <td className={tdClass}>
                        {editMode ? (
                          <input className={cellInputClass} type="number" value={st.quantity} onChange={(e) => updateCell(st.id, 'quantity', e.target.value)} />
                        ) : q}
                      </td>
                      <td className={tdClass}>
                        {editMode ? (
                          <input className={cellInputClass} type="number" step="0.01" value={st.buyPrice} onChange={(e) => updateCell(st.id, 'buyPrice', e.target.value)} />
                        ) : fmt(bp)}
                      </td>
                      <td className={`${tdClass} font-semibold`}>
                        {editMode ? (
                          <>
                            <input className={cellInputClass} type="number" step="0.01" value={st.currentPrice} onChange={(e) => updateCell(st.id, 'currentPrice', e.target.value)} />
                            <input className={`${cellInputClass} mt-1`} type="date" value={st.priceAsOnDate || ''} onChange={(e) => updateCell(st.id, 'priceAsOnDate', e.target.value)} />
                          </>
                        ) : (
                          <>
                            <div>{fmt(cp)}</div>
                            {st.priceAsOnDate && <div className="text-[11px] text-[#8a9bb5] mt-0.5">{fmtDate(st.priceAsOnDate)}</div>}
                          </>
                        )}
                      </td>
                      <td className={tdClass}>{fmt(inv)}</td>
                      <td className={`${tdClass} font-semibold`}>{fmt(val)}</td>
                      <td className={tdClass}>
                        <div className={`font-semibold ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {pnl >= 0 ? '+' : ''}
                          {fmt(pnl)}
                        </div>
                        <div className={`text-[11px] ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {pct >= 0 ? '+' : ''}
                          {pct.toFixed(1)}%
                        </div>
                      </td>
                      <td className={tdClass}>
                        {!editMode && (
                          <div className="flex gap-1.5">
                            <button
                              className="px-2.5 py-1.5 text-xs rounded-lg border border-[rgba(212,175,55,0.3)] text-[#d4af37] bg-transparent hover:bg-[rgba(212,175,55,0.08)] cursor-pointer font-semibold inline-flex items-center gap-1.5 transition-all duration-200"
                              onClick={() => openEdit(st)}
                            >
                              ✎
                            </button>
                            <button
                              className="px-2.5 py-1.5 text-xs rounded-lg cursor-pointer font-semibold text-red-500 bg-red-500/10 inline-flex items-center gap-1.5 transition-all duration-200"
                              onClick={() => handleDelete(st.id)}
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
          <div className="flex gap-5 px-4 py-3.5 mt-2 bg-white/[0.03] rounded-[10px] text-[13px]">
            <span className="text-[#6b7a91]">
              Total Invested: <strong className="text-[#e8e6e1]">{fmt(stInv)}</strong>
            </span>
            <span className="text-[#6b7a91]">
              Current Value: <strong className="text-[#e8e6e1]">{fmt(stCur)}</strong>
            </span>
            <span className="text-[#6b7a91]">
              Total P&amp;L:{' '}
              <strong className={stCur >= stInv ? 'text-green-500' : 'text-red-500'}>
                {stCur >= stInv ? '+' : ''}
                {fmt(stCur - stInv)}
              </strong>
            </span>
          </div>
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Stock' : 'Add Stock'}
      >
        <StockForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </>
  )
}
