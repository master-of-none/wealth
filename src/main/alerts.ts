import { Notification, BrowserWindow } from 'electron'
import * as schedule from 'node-schedule'
import { dbGetAll } from './db'

let notificationJobs: schedule.Job[] = []

function daysUntil(dateStr: string | undefined): number {
  if (!dateStr) return Infinity
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function nextAnniversary(openingDate: string): string {
  const open = new Date(openingDate)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  let next = new Date(now.getFullYear(), open.getMonth(), open.getDate())
  if (next <= now) next = new Date(now.getFullYear() + 1, open.getMonth(), open.getDate())
  return next.toISOString().split('T')[0]
}

function fmt(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function notify(title: string, body: string): void {
  if (!Notification.isSupported()) return
  const notif = new Notification({ title, body, silent: false })
  notif.on('click', () => {
    const wins = BrowserWindow.getAllWindows()
    if (wins.length > 0) { wins[0].show(); wins[0].focus() }
  })
  notif.show()
}

export function checkAndNotify(): void {
  try {
    const fds           = dbGetAll('fixed_deposits') as Array<{ bankName: string; amount: number; interestRate: number; maturityDate: string; autoRenew: boolean }>
    const mutualFunds   = dbGetAll('mutual_funds')   as Array<{ fundName: string; sipAmount: number }>
    const postalAccts   = dbGetAll('postal_accounts') as Array<{ name: string; closingDate: string; maturityAmount: number }>
    const insPrivate    = dbGetAll('insurance_private') as Array<{ companyName: string; policyNo: string; policyName?: string; openingDate: string; premium: number }>
    const insLIC        = dbGetAll('insurance_lic')  as Array<{ holderName: string; policyNo: string; openingDate: string; premium: number }>

    fds.forEach((fd) => {
      const d = daysUntil(fd.maturityDate)
      if (d === 0)  notify('🏦 FD Matured Today!',       `${fd.bankName}: ${fmt(fd.amount)} has matured. ${fd.autoRenew ? 'Auto-renewal enabled.' : 'Please renew or withdraw.'}`)
      else if (d === 1)  notify('🏦 FD Maturing Tomorrow!',    `${fd.bankName}: ${fmt(fd.amount)} @ ${fd.interestRate}% matures tomorrow.`)
      else if (d === 7)  notify('🏦 FD Maturing in 7 Days',    `${fd.bankName}: ${fmt(fd.amount)} matures in one week.`)
      else if (d === 30) notify('🏦 FD Maturing in 30 Days',   `${fd.bankName}: ${fmt(fd.amount)} matures in one month.`)
    })

    mutualFunds.forEach((mf) => {
      // SIP day-based alerts removed — periodic field replaces sipDay
    })

    postalAccts.forEach((pa) => {
      const d = daysUntil(pa.closingDate)
      if (d === 0)  notify('📮 Postal Account Matured Today!',     `${pa.name}: ${fmt(pa.maturityAmount)} has matured.`)
      else if (d === 1)  notify('📮 Postal Account Maturing Tomorrow!', `${pa.name}: ${fmt(pa.maturityAmount)} matures tomorrow.`)
      else if (d === 7)  notify('📮 Postal Account Maturing in 7 Days', `${pa.name}: ${fmt(pa.maturityAmount)} matures in one week.`)
      else if (d === 30) notify('📮 Postal Account Maturing in 30 Days',`${pa.name}: ${fmt(pa.maturityAmount)} matures in one month.`)
    })

    insPrivate.forEach((ins) => {
      if (!ins.openingDate) return
      const d = daysUntil(nextAnniversary(ins.openingDate))
      const label = ins.policyName || ins.policyNo
      if (d === 7)  notify(`🛡️ ${ins.companyName} Premium in 7 Days`,  `${label}: ${fmt(ins.premium)} due in one week.`)
      else if (d === 30) notify(`🛡️ ${ins.companyName} Premium in 30 Days`, `${label}: ${fmt(ins.premium)} due in one month.`)
    })

    insLIC.forEach((ins) => {
      if (!ins.openingDate) return
      const d = daysUntil(nextAnniversary(ins.openingDate))
      if (d === 7)  notify('🛡️ LIC Premium in 7 Days',  `${ins.policyNo} (${ins.holderName}): ${fmt(ins.premium)} due in one week.`)
      else if (d === 30) notify('🛡️ LIC Premium in 30 Days', `${ins.policyNo} (${ins.holderName}): ${fmt(ins.premium)} due in one month.`)
    })
  } catch {
    // DB may not be ready yet on very first launch
  }
}

export function scheduleAlerts(): void {
  notificationJobs.forEach((j) => j.cancel())
  notificationJobs = []
  const morning = schedule.scheduleJob('0 9 * * *',  () => checkAndNotify())
  const evening = schedule.scheduleJob('0 18 * * *', () => checkAndNotify())
  if (morning) notificationJobs.push(morning)
  if (evening) notificationJobs.push(evening)
  setTimeout(checkAndNotify, 5000)
}

export function cancelAlerts(): void {
  notificationJobs.forEach((j) => j.cancel())
  notificationJobs = []
}
