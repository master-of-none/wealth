import React, { useState } from 'react'
import { MutualFund } from '../../types'

interface MFFormProps {
  initial?: MutualFund
  onSave: (mf: Omit<MutualFund, 'id'>) => void
  onCancel: () => void
}

const CATEGORIES = ['Equity', 'Debt', 'Hybrid', 'Index', 'ELSS', 'Liquid']

export default function MFForm({ initial, onSave, onCancel }: MFFormProps) {
  const [fundName, setFundName] = useState(initial?.fundName || '')
  const [folioNumber, setFolioNumber] = useState(initial?.folioNumber || '')
  const [category, setCategory] = useState(initial?.category || 'Equity')
  const [sipAmount, setSipAmount] = useState(initial?.sipAmount?.toString() || '')
  const [sipDay, setSipDay] = useState(initial?.sipDay?.toString() || '')
  const [totalInvested, setTotalInvested] = useState(initial?.totalInvested?.toString() || '')
  const [currentValue, setCurrentValue] = useState(initial?.currentValue?.toString() || '')
  const [units, setUnits] = useState(initial?.units?.toString() || '')
  const [notes, setNotes] = useState(initial?.notes || '')

  function handleSubmit() {
    if (!fundName || !sipAmount) return
    onSave({
      fundName,
      folioNumber,
      category,
      sipAmount: Number(sipAmount),
      sipDay: sipDay ? Number(sipDay) : undefined,
      totalInvested: Number(totalInvested),
      currentValue: Number(currentValue),
      units: units ? Number(units) : undefined,
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
          <label className={labelClass}>Category</label>
          <select
            className={selectClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>SIP Amount (₹)</label>
          <input
            className={inputClass}
            type="number"
            value={sipAmount}
            onChange={(e) => setSipAmount(e.target.value)}
            placeholder="5000"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>SIP Day (1-28)</label>
          <input
            className={inputClass}
            type="number"
            min="1"
            max="28"
            value={sipDay}
            onChange={(e) => setSipDay(e.target.value)}
            placeholder="5"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Total Invested (₹)</label>
          <input
            className={inputClass}
            type="number"
            value={totalInvested}
            onChange={(e) => setTotalInvested(e.target.value)}
            placeholder="60000"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Current Value (₹)</label>
          <input
            className={inputClass}
            type="number"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder="65000"
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
            placeholder="150.25"
          />
        </div>
        <div className="flex flex-col">
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
