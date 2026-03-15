import { useMemo } from 'react'
import { FixedDeposit, MutualFund, PostalAccount, InsurancePrivate, InsuranceLIC, AlertItem } from '../types'

function daysUntil(dateStr: string | undefined): number {
  if (!dateStr) return Infinity
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const t = new Date(dateStr)
  t.setHours(0, 0, 0, 0)
  return Math.ceil((t.getTime() - now.getTime()) / 864e5)
}

function getNextSIP(day: number): string {
  const now = new Date()
  let n = new Date(now.getFullYear(), now.getMonth(), day)
  if (n <= now) n = new Date(now.getFullYear(), now.getMonth() + 1, day)
  return n.toISOString().split('T')[0]
}

function daysToSIP(day: number): number {
  return daysUntil(getNextSIP(day))
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function nextAnniversary(openingDate: string): string {
  const open = new Date(openingDate)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  let next = new Date(now.getFullYear(), open.getMonth(), open.getDate())
  if (next <= now) next = new Date(now.getFullYear() + 1, open.getMonth(), open.getDate())
  return next.toISOString().split('T')[0]
}

export function fmt(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function fmtDate(d: string | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function useDaysUntil(dateStr: string | undefined): number {
  return daysUntil(dateStr)
}

export function useDaysToSIP(day: number | string | undefined): number | null {
  if (!day) return null
  return daysToSIP(Number(day))
}

export function useAlerts(
  fds: FixedDeposit[],
  mutualFunds: MutualFund[],
  postalAccounts: PostalAccount[] = [],
  insurancePrivate: InsurancePrivate[] = [],
  insuranceLIC: InsuranceLIC[] = []
): AlertItem[] {
  return useMemo(() => {
    const alerts: AlertItem[] = []

    fds.forEach((fd) => {
      const d = daysUntil(fd.maturityDate)
      if (d <= 0) {
        alerts.push({
          id: `fd-m-${fd.id}`,
          urgency: 'critical',
          title: `${fd.bankName} FD Matured!`,
          detail: `${fmt(fd.amount)} — ${fd.autoRenew ? 'Auto-renewal ON' : 'Action needed'}`,
          days: d,
        })
      } else if (d <= 7) {
        alerts.push({
          id: `fd-7-${fd.id}`,
          urgency: 'critical',
          title: `${fd.bankName} FD in ${d}d`,
          detail: `${fmt(fd.amount)} matures ${fmtDate(fd.maturityDate)}`,
          days: d,
        })
      } else if (d <= 30) {
        alerts.push({
          id: `fd-30-${fd.id}`,
          urgency: 'warning',
          title: `${fd.bankName} FD in ${d}d`,
          detail: `${fmt(fd.amount)} matures ${fmtDate(fd.maturityDate)}`,
          days: d,
        })
      }
    })

    mutualFunds.forEach((mf) => {
      if (!mf.sipDay) return
      const d = daysToSIP(Number(mf.sipDay))
      if (d <= 3) {
        alerts.push({
          id: `mf-s-${mf.id}`,
          urgency: d <= 1 ? 'critical' : 'warning',
          title: `${mf.fundName} SIP ${d === 0 ? 'today' : `in ${d}d`}`,
          detail: `SIP of ${fmt(mf.sipAmount)} on the ${ordinal(Number(mf.sipDay))}`,
          days: d,
        })
      }
    })

    postalAccounts.forEach((pa) => {
      const d = daysUntil(pa.closingDate)
      if (d <= 0) {
        alerts.push({
          id: `postal-m-${pa.id}`,
          urgency: 'critical',
          title: `${pa.name} Postal Account Matured!`,
          detail: `${fmt(pa.maturityAmount)} — Action needed`,
          days: d,
        })
      } else if (d <= 7) {
        alerts.push({
          id: `postal-7-${pa.id}`,
          urgency: 'critical',
          title: `${pa.name} Postal Account in ${d}d`,
          detail: `${fmt(pa.maturityAmount)} matures ${fmtDate(pa.closingDate)}`,
          days: d,
        })
      } else if (d <= 30) {
        alerts.push({
          id: `postal-30-${pa.id}`,
          urgency: 'warning',
          title: `${pa.name} Postal Account in ${d}d`,
          detail: `${fmt(pa.maturityAmount)} matures ${fmtDate(pa.closingDate)}`,
          days: d,
        })
      }
    })

    insurancePrivate.forEach((ins) => {
      if (!ins.openingDate) return
      const anniversary = nextAnniversary(ins.openingDate)
      const d = daysUntil(anniversary)
      if (d <= 7) {
        alerts.push({
          id: `ins-priv-7-${ins.id}`,
          urgency: 'critical',
          title: `${ins.companyName} Premium due in ${d}d`,
          detail: `${ins.policyName || ins.policyNo} — ${fmt(ins.premium)} due ${fmtDate(anniversary)}`,
          days: d,
        })
      } else if (d <= 30) {
        alerts.push({
          id: `ins-priv-30-${ins.id}`,
          urgency: 'warning',
          title: `${ins.companyName} Premium due in ${d}d`,
          detail: `${ins.policyName || ins.policyNo} — ${fmt(ins.premium)} due ${fmtDate(anniversary)}`,
          days: d,
        })
      }
    })

    insuranceLIC.forEach((ins) => {
      if (!ins.openingDate) return
      const anniversary = nextAnniversary(ins.openingDate)
      const d = daysUntil(anniversary)
      if (d <= 7) {
        alerts.push({
          id: `ins-lic-7-${ins.id}`,
          urgency: 'critical',
          title: `LIC Premium due in ${d}d`,
          detail: `${ins.policyNo} (${ins.holderName}) — ${fmt(ins.premium)} due ${fmtDate(anniversary)}`,
          days: d,
        })
      } else if (d <= 30) {
        alerts.push({
          id: `ins-lic-30-${ins.id}`,
          urgency: 'warning',
          title: `LIC Premium due in ${d}d`,
          detail: `${ins.policyNo} (${ins.holderName}) — ${fmt(ins.premium)} due ${fmtDate(anniversary)}`,
          days: d,
        })
      }
    })

    return alerts.sort((a, b) => a.days - b.days)
  }, [fds, mutualFunds, postalAccounts, insurancePrivate, insuranceLIC])
}
