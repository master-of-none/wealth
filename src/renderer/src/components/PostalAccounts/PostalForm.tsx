import React, { useState } from 'react'
import { PostalAccount } from '../../types'

interface PostalFormProps {
  initial?: PostalAccount
  onSave: (pa: Omit<PostalAccount, 'id'>) => void
  onCancel: () => void
}

export default function PostalForm({ initial, onSave, onCancel }: PostalFormProps) {
  const [name, setName] = useState(initial?.name || '')
  const [accountType, setAccountType] = useState<PostalAccount['accountType']>(initial?.accountType || 'SB')
  const [openingDate, setOpeningDate] = useState(initial?.openingDate || '')
  const [closingDate, setClosingDate] = useState(initial?.closingDate || '')
  const [principalAmount, setPrincipalAmount] = useState(initial?.principalAmount?.toString() || '')
  const [maturityAmount, setMaturityAmount] = useState(initial?.maturityAmount?.toString() || '')
  const [accountNo, setAccountNo] = useState(initial?.accountNo || '')
  const [interestRate, setInterestRate] = useState(initial?.interestRate?.toString() || '')
  const [nominee, setNominee] = useState(initial?.nominee || '')

  function handleSubmit() {
    if (!name || !principalAmount) return
    onSave({
      name,
      accountType,
      openingDate,
      closingDate,
      principalAmount: Number(principalAmount),
      maturityAmount: Number(maturityAmount),
      accountNo,
      interestRate: Number(interestRate),
      nominee,
    })
  }

  const inputClass = "px-3.5 py-2.5 rounded-lg border border-[rgba(212,175,55,0.2)] bg-white/[0.04] text-[#e8e6e1] text-[13px] outline-none w-full focus:border-[#d4af37]"
  const labelClass = "text-xs font-medium text-[#8a9bb5] mb-1"

  return (
    <>
      <div className="grid grid-cols-2 gap-3.5">
        <div className="flex flex-col">
          <label className={labelClass}>Name</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Account holder name"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Account Type</label>
          <select
            className={inputClass}
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as PostalAccount['accountType'])}
          >
            <option value="SB">SB</option>
            <option value="NSC">NSC</option>
            <option value="PPF">PPF</option>
            <option value="KVP">KVP</option>
            <option value="MIS">MIS</option>
            <option value="Other">Other</option>
          </select>
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
          <label className={labelClass}>Principal Amount (₹)</label>
          <input
            className={inputClass}
            type="number"
            value={principalAmount}
            onChange={(e) => setPrincipalAmount(e.target.value)}
            placeholder="100000"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Maturity Amount (₹)</label>
          <input
            className={inputClass}
            type="number"
            value={maturityAmount}
            onChange={(e) => setMaturityAmount(e.target.value)}
            placeholder="150000"
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
        <div className="flex flex-col col-span-2">
          <label className={labelClass}>Nominee</label>
          <input
            className={inputClass}
            value={nominee}
            onChange={(e) => setNominee(e.target.value)}
            placeholder="Nominee name"
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
