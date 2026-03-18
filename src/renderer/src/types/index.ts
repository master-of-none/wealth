export interface FixedDeposit {
  id: string
  bankName: string
  holderName?: string
  amount: number
  interestRate: number
  startDate: string
  maturityDate: string
  accountNo?: string
  nominee?: string
  autoRenew: boolean
  notes?: string
}

export interface MutualFund {
  id: string
  fundName: string
  folioNumber?: string
  category?: string
  sipAmount: number
  periodic?: string
  initialInvestmentDate?: string
  totalInvested: number
  nav: number
  navDate?: string
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
  priceAsOnDate?: string
  initialDate?: string
  sector?: string
  notes?: string
}

export interface PostalAccount {
  id: string
  name: string
  accountType: 'SB' | 'NSC' | 'PPF' | 'KVP' | 'MIS' | 'Other'
  openingDate: string
  closingDate: string
  principalAmount: number
  maturityAmount: number
  accountNo: string
  interestRate: number
  nominee?: string
}

export interface InsurancePrivate {
  id: string
  companyName: string
  holderName: string
  policyNo: string
  policyName?: string
  openingDate: string
  closingDate: string
  premium: number
  fundValue?: number
  fundValueDate?: string
  accountNo?: string
  lastPremiumDue?: string
  nominee?: string
  notes?: string
}

export interface InsuranceLIC {
  id: string
  holderName: string
  policyNo: string
  openingDate: string
  closingDate: string
  premium: number
  fundValue?: number
  fundValueDate?: string
  lastPremiumDue?: string
  nominee?: string
  notes?: string
}

export interface AppState {
  fds: FixedDeposit[]
  mutualFunds: MutualFund[]
  stocks: Stock[]
  postalAccounts: PostalAccount[]
  insurancePrivate: InsurancePrivate[]
  insuranceLIC: InsuranceLIC[]
}

export type TabId = 'dashboard' | 'fds' | 'mfs' | 'stocks' | 'postal' | 'ins-private' | 'ins-lic'

export interface AlertItem {
  id: string
  urgency: 'critical' | 'warning' | 'info'
  title: string
  detail: string
  days: number
}

export type UpdateStatus = 'checking' | 'available' | 'downloading' | 'ready' | 'up-to-date' | 'error' | null
