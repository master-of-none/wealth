import React, { useState } from 'react'
import { FixedDeposit } from '../../types'

interface FDFormProps {
  initial?: FixedDeposit
  onSave: (fd: Omit<FixedDeposit, 'id'>) => void
  onCancel: () => void
}

export default function FDForm({ initial, onSave, onCancel }: FDFormProps) {
  const [bankName, setBankName] = useState(initial?.bankName || '')
  const [amount, setAmount] = useState(initial?.amount?.toString() || '')
  const [interestRate, setInterestRate] = useState(initial?.interestRate?.toString() || '')
  const [startDate, setStartDate] = useState(initial?.startDate || '')
  const [maturityDate, setMaturityDate] = useState(initial?.maturityDate || '')
  const [autoRenew, setAutoRenew] = useState(initial?.autoRenew || false)
  const [notes, setNotes] = useState(initial?.notes || '')

  function handleSubmit() {
    if (!bankName || !amount) return
    onSave({
      bankName,
      amount: Number(amount),
      interestRate: Number(interestRate),
      startDate,
      maturityDate,
      autoRenew,
      notes,
    })
  }

  const inputClass = "px-3.5 py-2.5 rounded-lg border border-[rgba(212,175,55,0.2)] bg-white/[0.04] text-[#e8e6e1] text-[13px] outline-none w-full focus:border-[#d4af37]"
  const labelClass = "text-xs font-medium text-[#8a9bb5] mb-1"

  return (
    <>
      <div className="grid grid-cols-2 gap-3.5">
        <div className="flex flex-col">
          <label className={labelClass}>Bank Name</label>
          <input
            className={inputClass}
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. SBI, HDFC"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Amount (₹)</label>
          <input
            className={inputClass}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100000"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Interest Rate (%)</label>
          <input
            className={inputClass}
            type="number"
            step="0.01"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="7.5"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Start Date</label>
          <input
            className={inputClass}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Maturity Date</label>
          <input
            className={inputClass}
            type="date"
            value={maturityDate}
            onChange={(e) => setMaturityDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Auto-Renewal</label>
          <div className="flex items-center gap-2 py-2.5">
            <input
              type="checkbox"
              className="accent-gold w-4 h-4"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
            />
            <span className="text-[13px]">Enable auto-renewal</span>
          </div>
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
