import React, { useState } from 'react'
import { MutualFund } from '../../types'

interface MFFormProps {
  initial?: MutualFund
  onSave: (mf: Omit<MutualFund, 'id'>) => void
  onCancel: () => void
}

const PERIODIC_OPTIONS = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly']

export default function MFForm({ initial, onSave, onCancel }: MFFormProps) {
  const [fundName, setFundName] = useState(initial?.fundName || '')
  const [folioNumber, setFolioNumber] = useState(initial?.folioNumber || '')
  const [sipAmount, setSipAmount] = useState(initial?.sipAmount?.toString() || '')
  const [periodic, setPeriodic] = useState(initial?.periodic || 'Monthly')
  const [initialInvestmentDate, setInitialInvestmentDate] = useState(initial?.initialInvestmentDate || '')
  const [totalInvested, setTotalInvested] = useState(initial?.totalInvested?.toString() || '')
  const [nav, setNav] = useState(initial?.nav?.toString() || '')
  const [navDate, setNavDate] = useState(initial?.navDate || '')
  const [units, setUnits] = useState(initial?.units?.toString() || '')
  const [notes, setNotes] = useState(initial?.notes || '')

  function handleSubmit() {
    if (!fundName || !sipAmount) return
    const navNum = Number(nav)
    const unitsNum = units ? Number(units) : undefined
    onSave({
      fundName,
      folioNumber,
      sipAmount: Number(sipAmount),
      periodic,
      initialInvestmentDate: initialInvestmentDate || undefined,
      totalInvested: Number(totalInvested),
      nav: navNum,
      navDate: navDate || undefined,
      units: unitsNum,
      notes,
    })
  }

  const inputClass = "px-3.5 py-2.5 rounded-lg border border-[rgba(212,175,55,0.2)] bg-white/[0.04] text-[#e8e6e1] text-[13px] outline-none w-full focus:border-[#d4af37]"
  const selectClass = "px-3.5 py-2.5 rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#0f1521] text-[#e8e6e1] text-[13px] outline-none w-full focus:border-[#d4af37]"
  const labelClass = "text-xs font-medium text-[#8a9bb5] mb-1"

  return (
    <>
      <div className="grid grid-cols-2 gap-3.5">
        <div className="flex flex-col col-span-2">
          <label className={labelClass}>Fund Name</label>
          <input
            className={inputClass}
            value={fundName}
            onChange={(e) => setFundName(e.target.value)}
            placeholder="e.g. Axis Bluechip Fund"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Folio Number</label>
          <input
            className={inputClass}
            value={folioNumber}
            onChange={(e) => setFolioNumber(e.target.value)}
            placeholder="1234567890"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Date of Initial Investment</label>
          <input
            className={inputClass}
            type="date"
            value={initialInvestmentDate}
            onChange={(e) => setInitialInvestmentDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>SIP Amount (₹)</label>
          <input
            className={inputClass}
            type="number"
            value={sipAmount}
            onChange={(e) => setSipAmount(e.target.value)}
            placeholder="0000"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Periodic</label>
          <select
            className={selectClass}
            value={periodic}
            onChange={(e) => setPeriodic(e.target.value)}
          >
            {PERIODIC_OPTIONS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Total Invested (₹)</label>
          <input
            className={inputClass}
            type="number"
            value={totalInvested}
            onChange={(e) => setTotalInvested(e.target.value)}
            placeholder="0000"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Units Held</label>
          <input
            className={inputClass}
            type="number"
            step="0.001"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            placeholder="0000"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>NAV (₹)</label>
          <input
            className={inputClass}
            type="number"
            step="0.01"
            value={nav}
            onChange={(e) => setNav(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>NAV As On</label>
          <input
            className={inputClass}
            type="date"
            value={navDate}
            onChange={(e) => setNavDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col col-span-2">
          <label className={labelClass}>Notes</label>
          <input
            className={inputClass}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional..."
          />
        </div>
      </div>
      <div className="flex gap-2.5 mt-5 justify-end">
        <button
          className="px-5 py-2.5 rounded-lg border border-[rgba(212,175,55,0.3)] text-[#d4af37] bg-transparent hover:bg-[rgba(212,175,55,0.08)] cursor-pointer text-[13px] font-semibold inline-flex items-center gap-1.5 transition-all duration-200"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="px-5 py-2.5 rounded-lg border-none cursor-pointer text-[13px] font-semibold text-[#0a0e17] bg-gradient-to-br from-[#d4af37] to-[#c5a028] hover:brightness-110 inline-flex items-center gap-1.5 transition-all duration-200"
          onClick={handleSubmit}
        >
          ✓ Save
        </button>
      </div>
    </>
  )
}
