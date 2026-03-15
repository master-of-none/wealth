export interface FixedDeposit {
  id: string
  bankName: string
  amount: number
  interestRate: number
  startDate: string
  maturityDate: string
  autoRenew: boolean
  notes?: string
}

export interface MutualFund {
  id: string
  fundName: string
  folioNumber?: string
  category: string
  sipAmount: number
  sipDay?: number | string
  totalInvested: number
  currentValue: number
  units?: number | string
  notes?: string
}

export interface Stock {
  id: string
  symbol: string
  companyName: string
  quantity: number
  buyPrice: number
  currentPrice: number
  buyDate?: string
  sector?: string
  notes?: string
}

export interface AppState {
  fds: FixedDeposit[]
  mutualFunds: MutualFund[]
  stocks: Stock[]
}

export type TabId = 'dashboard' | 'fds' | 'mfs' | 'stocks'

export interface AlertItem {
  id: string
  urgency: 'critical' | 'warning' | 'info'
  title: string
  detail: string
  days: number
}

export type UpdateStatus = 'checking' | 'available' | 'downloading' | 'ready' | 'up-to-date' | 'error' | null
