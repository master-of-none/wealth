import { Notification, BrowserWindow } from 'electron'
import * as schedule from 'node-schedule'
import Store from 'electron-store'

const store = new Store({ name: 'wealthpulse-data' }) as InstanceType<typeof Store>

let notificationJobs: schedule.Job[] = []

function daysUntil(dateStr: string | undefined): number {
  if (!dateStr) return Infinity
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function getNextSIPDate(sipDay: number): string {
  const now = new Date()
  let next = new Date(now.getFullYear(), now.getMonth(), sipDay)
  if (next <= now) {
    next = new Date(now.getFullYear(), now.getMonth() + 1, sipDay)
  }
  return next.toISOString().split('T')[0]
}

function nextAnniversary(openingDate: string): string {
  const open = new Date(openingDate)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  let next = new Date(now.getFullYear(), open.getMonth(), open.getDate())
  if (next <= now) next = new Date(now.getFullYear() + 1, open.getMonth(), open.getDate())
  return next.toISOString().split('T')[0]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function showNotification(title: string, body: string): void {
  if (Notification.isSupported()) {
    const notif = new Notification({ title, body, silent: false })
    notif.on('click', () => {
      const wins = BrowserWindow.getAllWindows()
      if (wins.length > 0) {
        wins[0].show()
        wins[0].focus()
      }
    })
    notif.show()
  }
}

export function checkAndNotify(): void {
  const data = store.get('finance-data', {
    fds: [],
    mutualFunds: [],
    stocks: [],
    postalAccounts: [],
    insurancePrivate: [],
    insuranceLIC: [],
  }) as {
    fds: Array<{ bankName: string; amount: number; interestRate: number; maturityDate: string; autoRenew: boolean }>
    mutualFunds: Array<{ fundName: string; sipAmount: number; sipDay?: number | string }>
    stocks: unknown[]
    postalAccounts: Array<{ name: string; closingDate: string; maturityAmount: number }>
    insurancePrivate: Array<{ companyName: string; policyNo: string; policyName?: string; openingDate: string; premium: number }>
    insuranceLIC: Array<{ holderName: string; policyNo: string; openingDate: string; premium: number }>
  }

  data.fds.forEach((fd) => {
    const days = daysUntil(fd.maturityDate)
    if (days === 0) {
      showNotification(
        '🏦 FD Matured Today!',
        `${fd.bankName}: ${formatCurrency(fd.amount)} has matured. ${fd.autoRenew ? 'Auto-renewal is enabled.' : 'Please renew or withdraw.'}`
      )
    } else if (days === 1) {
      showNotification(
        '🏦 FD Maturing Tomorrow!',
        `${fd.bankName}: ${formatCurrency(fd.amount)} @ ${fd.interestRate}% matures tomorrow.`
      )
    } else if (days === 7) {
      showNotification(
        '🏦 FD Maturing in 7 Days',
        `${fd.bankName}: ${formatCurrency(fd.amount)} matures in one week.`
      )
    } else if (days === 30) {
      showNotification(
        '🏦 FD Maturing in 30 Days',
        `${fd.bankName}: ${formatCurrency(fd.amount)} matures in one month.`
      )
    }
  })

  data.mutualFunds.forEach((mf) => {
    if (!mf.sipDay) return
    const nextSIP = getNextSIPDate(Number(mf.sipDay))
    const days = daysUntil(nextSIP)
    if (days === 0) {
      showNotification('📈 SIP Due Today!', `${mf.fundName}: SIP of ${formatCurrency(mf.sipAmount)} is due today.`)
    } else if (days === 1) {
      showNotification('📈 SIP Due Tomorrow', `${mf.fundName}: SIP of ${formatCurrency(mf.sipAmount)} is due tomorrow.`)
    } else if (days === 3) {
      showNotification('📈 SIP Coming Up', `${mf.fundName}: SIP of ${formatCurrency(mf.sipAmount)} is due in 3 days.`)
    }
  })

  data.postalAccounts.forEach((pa) => {
    const days = daysUntil(pa.closingDate)
    if (days === 0) {
      showNotification(
        '📮 Postal Account Matured Today!',
        `${pa.name}: ${formatCurrency(pa.maturityAmount)} has matured. Please take action.`
      )
    } else if (days === 1) {
      showNotification(
        '📮 Postal Account Maturing Tomorrow!',
        `${pa.name}: ${formatCurrency(pa.maturityAmount)} matures tomorrow.`
      )
    } else if (days === 7) {
      showNotification(
        '📮 Postal Account Maturing in 7 Days',
        `${pa.name}: ${formatCurrency(pa.maturityAmount)} matures in one week.`
      )
    } else if (days === 30) {
      showNotification(
        '📮 Postal Account Maturing in 30 Days',
        `${pa.name}: ${formatCurrency(pa.maturityAmount)} matures in one month.`
      )
    }
  })

  data.insurancePrivate.forEach((ins) => {
    if (!ins.openingDate) return
    const anniversary = nextAnniversary(ins.openingDate)
    const days = daysUntil(anniversary)
    const policyLabel = ins.policyName || ins.policyNo
    if (days === 7) {
      showNotification(
        `🛡️ ${ins.companyName} Premium in 7 Days`,
        `${policyLabel}: ${formatCurrency(ins.premium)} premium due in one week.`
      )
    } else if (days === 30) {
      showNotification(
        `🛡️ ${ins.companyName} Premium in 30 Days`,
        `${policyLabel}: ${formatCurrency(ins.premium)} premium due in one month.`
      )
    }
  })

  data.insuranceLIC.forEach((ins) => {
    if (!ins.openingDate) return
    const anniversary = nextAnniversary(ins.openingDate)
    const days = daysUntil(anniversary)
    if (days === 7) {
      showNotification(
        `🛡️ LIC Premium in 7 Days`,
        `${ins.policyNo} (${ins.holderName}): ${formatCurrency(ins.premium)} premium due in one week.`
      )
    } else if (days === 30) {
      showNotification(
        `🛡️ LIC Premium in 30 Days`,
        `${ins.policyNo} (${ins.holderName}): ${formatCurrency(ins.premium)} premium due in one month.`
      )
    }
  })
}

export function scheduleAlerts(): void {
  notificationJobs.forEach((job) => job.cancel())
  notificationJobs = []

  const morningJob = schedule.scheduleJob('0 9 * * *', () => checkAndNotify())
  if (morningJob) notificationJobs.push(morningJob)

  const eveningJob = schedule.scheduleJob('0 18 * * *', () => checkAndNotify())
  if (eveningJob) notificationJobs.push(eveningJob)

  setTimeout(checkAndNotify, 5000)
}

export function cancelAlerts(): void {
  notificationJobs.forEach((job) => job.cancel())
  notificationJobs = []
}
