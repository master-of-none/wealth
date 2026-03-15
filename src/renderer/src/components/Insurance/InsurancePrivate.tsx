import React, { useState } from 'react'
import { InsurancePrivate as InsurancePrivateType } from '../../types'
import { fmt, fmtDate } from '../../hooks/useAlerts'
import Modal from '../Modal/Modal'
import InsurancePrivateForm from './InsurancePrivateForm'

interface InsurancePrivateProps {
  insurancePrivate: InsurancePrivateType[]
  onUpdate: (insurancePrivate: InsurancePrivateType[]) => void
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

export default function InsurancePrivate({ insurancePrivate, onUpdate }: InsurancePrivateProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<InsurancePrivateType | undefined>(undefined)

  function openAdd() {
    setEditing(undefined)
    setModalOpen(true)
  }

  function openEdit(ins: InsurancePrivateType) {
    setEditing(ins)
    setModalOpen(true)
  }

  function handleSave(data: Omit<InsurancePrivateType, 'id'>) {
    if (editing) {
      onUpdate(insurancePrivate.map((i) => (i.id === editing.id ? { ...editing, ...data } : i)))
    } else {
      onUpdate([...insurancePrivate, { ...data, id: genId() }])
    }
    setModalOpen(false)
  }

  function handleDelete(id: string) {
    if (confirm('Delete this insurance policy?')) {
      onUpdate(insurancePrivate.filter((i) => i.id !== id))
    }
  }

  const thClass = "px-3.5 py-2.5 text-[11px] font-semibold text-[#6b7a91] uppercase tracking-[0.8px] text-left border-b border-white/5"
  const tdClass = "px-3.5 py-3 text-[13px] bg-white/[0.02] border-t border-white/[0.03]"

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="mb-5">
          <h2 className="text-xl font-serif text-[#d4af37]">Insurance — Private</h2>
          <p className="text-xs text-[#6b7a91] mt-1">Track private insurance policies, premiums, and fund values</p>
        </div>
        <button
          className="px-5 py-2.5 rounded-lg border-none cursor-pointer text-[13px] font-semibold text-[#0a0e17] bg-gradient-to-br from-[#d4af37] to-[#c5a028] hover:brightness-110 inline-flex items-center gap-1.5 transition-all duration-200"
          onClick={openAdd}
        >
          + Add Policy
        </button>
      </div>

      {insurancePrivate.length === 0 ? (
        <div className="text-center py-12 px-5 text-[#6b7a91]">
          <div className="text-4xl mb-3 opacity-30">🛡️</div>
          <div className="font-semibold">No Private Insurance policies yet</div>
          <div className="text-[11px] mt-1">Add your first policy to start tracking</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ borderSpacing: '0 6px', borderCollapse: 'separate' }}>
            <thead>
              <tr>
                <th className={thClass}>#</th>
                <th className={thClass}>Company</th>
                <th className={thClass}>Holder</th>
                <th className={thClass}>Policy No</th>
                <th className={thClass}>Policy Name</th>
                <th className={thClass}>Opening Date</th>
                <th className={thClass}>Closing Date</th>
                <th className={thClass}>Premium/yr</th>
                <th className={thClass}>Fund Value</th>
                <th className={thClass}>A/C No</th>
                <th className={thClass}>Premiums Paid Upto</th>
                <th className={thClass}>Nominee</th>
                <th className={thClass}>Next Premium</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {insurancePrivate.map((ins, idx) => {
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
                    <td className={`${tdClass} font-semibold`}>{ins.companyName}</td>
                    <td className={tdClass}>{ins.holderName}</td>
                    <td className={tdClass}>{ins.policyNo}</td>
                    <td className={tdClass}>{ins.policyName || '—'}</td>
                    <td className={tdClass}>{fmtDate(ins.openingDate)}</td>
                    <td className={tdClass}>{fmtDate(ins.closingDate)}</td>
                    <td className={`${tdClass} font-semibold`}>{fmt(ins.premium)}</td>
                    <td className={tdClass}>{ins.fundValue ? fmt(ins.fundValue) : '—'}</td>
                    <td className={tdClass}>{ins.accountNo || '—'}</td>
                    <td className={tdClass}>{fmtDate(ins.premiumsPaidUpto)}</td>
                    <td className={tdClass}>{ins.nominee || '—'}</td>
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
        title={editing ? 'Edit Insurance Policy' : 'Add Insurance Policy'}
      >
        <InsurancePrivateForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </>
  )
}
