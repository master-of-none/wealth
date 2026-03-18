import React, { useState } from 'react'
import { Stock } from '../../types'

interface StockFormProps {
  initial?: Stock
  onSave: (stock: Omit<Stock, 'id'>) => void
  onCancel: () => void
}

export default function StockForm({ initial, onSave, onCancel }: StockFormProps) {
  const [symbol, setSymbol] = useState(initial?.symbol || '')
  const [companyName, setCompanyName] = useState(initial?.companyName || '')
  const [quantity, setQuantity] = useState(initial?.quantity?.toString() || '')
  const [buyPrice, setBuyPrice] = useState(initial?.buyPrice?.toString() || '')
  const [currentPrice, setCurrentPrice] = useState(initial?.currentPrice?.toString() || '')
  const [priceAsOnDate, setPriceAsOnDate] = useState(initial?.priceAsOnDate || '')
  const [initialDate, setInitialDate] = useState(initial?.initialDate || initial?.buyDate || '')
  const [notes, setNotes] = useState(initial?.notes || '')

  function handleSubmit() {
    if (!symbol || !quantity) return
    onSave({
      symbol: symbol.toUpperCase(),
      companyName,
      quantity: Number(quantity),
      buyPrice: Number(buyPrice),
      currentPrice: Number(currentPrice),
      priceAsOnDate: priceAsOnDate || undefined,
      initialDate: initialDate || undefined,
      notes,
    })
  }

  const inputClass = "px-3.5 py-2.5 rounded-lg border border-[rgba(212,175,55,0.2)] bg-white/[0.04] text-[#e8e6e1] text-[13px] outline-none w-full focus:border-[#d4af37]"
  const labelClass = "text-xs font-medium text-[#8a9bb5] mb-1"

  return (
    <>
      <div className="grid grid-cols-2 gap-3.5">
        <div className="flex flex-col">
          <label className={labelClass}>Stock Symbol</label>
          <input
            className={`${inputClass} uppercase`}
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="ABC"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Company Name</label>
          <input
            className={inputClass}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="ABC"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Quantity</label>
          <input
            className={inputClass}
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0000"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Buy Price (₹)</label>
          <input
            className={inputClass}
            type="number"
            step="0.01"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            placeholder="0000"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Price (₹)</label>
          <input
            className={inputClass}
            type="number"
            step="0.01"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            placeholder="0000"
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Price As On</label>
          <input
            className={inputClass}
            type="date"
            value={priceAsOnDate}
            onChange={(e) => setPriceAsOnDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className={labelClass}>Initial Date</label>
          <input
            className={inputClass}
            type="date"
            value={initialDate}
            onChange={(e) => setInitialDate(e.target.value)}
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
