import React, { useState } from 'react'
import { InsuranceLIC } from '../../types'

interface InsuranceLICFormProps {
  initial?: InsuranceLIC
  onSave: (ins: Omit<InsuranceLIC, 'id'>) => void
  onCancel: () => void
}

export default function InsuranceLICForm({ initial, onSave, onCancel }: InsuranceLICFormProps) {
  const [holderName, setHolderName] = useState(initial?.holderName || '')
  const [policyNo, setPolicyNo] = useState(initial?.policyNo || '')
  const [openingDate, setOpeningDate] = useState(initial?.openingDate || '')
  const [closingDate, setClosingDate] = useState(initial?.closingDate || '')
  const [premium, setPremium] = useState(initial?.premium?.toString() || '')
  const [fundValue, setFundValue] = useState(initial?.fundValue?.toString() || '')
  const [fundValueDate, setFundValueDate] = useState(initial?.fundValueDate || '')
  const [accountNo, setAccountNo] = useState(initial?.accountNo || '')
  const [premiumsPaidUpto, setPremiumsPaidUpto] = useState(initial?.premiumsPaidUpto || '')
  const [nominee, setNominee] = useState(initial?.nominee || '')
  const [notes, setNotes] = useState(initial?.notes || '')

  function handleSubmit() {
    if (!holderName || !policyNo || !premium) return
    onSave({
      holderName,
      policyNo,
      openingDate,
      closingDate,
      premium: Number(premium),
      fundValue: fundValue ? Number(fundValue) : undefined,
      fundValueDate: fundValueDate || undefined,
      accountNo: accountNo || undefined,
      premiumsPaidUpto: premiumsPaidUpto || undefined,
      nominee: nominee || undefined,
      notes: notes || undefined,
    })
  }

  const inputClass = "px-3.5 py-2.5 rounded-lg border border-[rgba(212,175,55,0.2)] bg-white/[0.04] text-[#e8e6e1] text-[13px] outline-none w-full focus:border-[#d4af37]"
  const labelClass = "text-xs font-medium text-[#8a9bb5] mb-1"

  return (
    <>
      <div className="grid grid-cols-2 gap-3.5">
        <div className="flex flex-col">
          <label className={labelClass}>Holder Name</label>
          <input
            className={inputClass}
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            placeholder="Policy holder name"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Policy No</label>
          <input
            className={inputClass}
            value={policyNo}
            onChange={(e) => setPolicyNo(e.target.value)}
            placeholder="Policy number"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Opening Date</label>
          <input
            className={inputClass}
            type="date"
            value={openingDate}
            onChange={(e) => setOpeningDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Closing Date</label>
          <input
            className={inputClass}
            type="date"
            value={closingDate}
            onChange={(e) => setClosingDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Annual Premium (₹)</label>
          <input
            className={inputClass}
            type="number"
            value={premium}
            onChange={(e) => setPremium(e.target.value)}
            placeholder="25000"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Fund Value (₹)</label>
          <input
            className={inputClass}
            type="number"
            value={fundValue}
            onChange={(e) => setFundValue(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Fund Value Date</label>
          <input
            className={inputClass}
            type="date"
            value={fundValueDate}
            onChange={(e) => setFundValueDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Account No</label>
          <input
            className={inputClass}
            value={accountNo}
            onChange={(e) => setAccountNo(e.target.value)}
            placeholder="Account number"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Premiums Paid Upto</label>
          <input
            className={inputClass}
            type="date"
            value={premiumsPaidUpto}
            onChange={(e) => setPremiumsPaidUpto(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Nominee</label>
          <input
            className={inputClass}
            value={nominee}
            onChange={(e) => setNominee(e.target.value)}
            placeholder="Nominee name"
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
