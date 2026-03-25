export type UserRole = 'subscriber' | 'admin'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  handicap_index: number | null
  total_winnings: number
  role: UserRole
  created_at: string
}

export interface Charity {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  website_url: string | null
  category: string | null
  total_raised: number
  featured: boolean
  active: boolean
  created_at: string
}

export type SubscriptionPlan = 'monthly' | 'yearly'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'expired'

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: SubscriptionPlan
  status: SubscriptionStatus
  charity_id: string | null
  charity_contribution_pct: number
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  charity?: Charity
}

export interface Score {
  id: string
  user_id: string
  score: number
  played_at: string
  created_at: string
}

export type DrawAlgorithm = 'random' | 'weighted'
export type DrawStatus = 'pending' | 'running' | 'published'

export interface Draw {
  id: string
  month: string
  algorithm: DrawAlgorithm
  status: DrawStatus
  jackpot_pool: number
  rollover_amount: number
  winning_numbers: number[] | null
  total_pool: number | null
  created_at: string
}

export type MatchCount = 3 | 4 | 5
export type VerificationStatus = 'pending' | 'approved' | 'rejected'
export type PaymentStatus = 'pending' | 'paid'

export interface DrawResult {
  id: string
  draw_id: string
  user_id: string
  match_count: MatchCount
  prize_amount: number
  status: string
  created_at: string
}

export interface Winner {
  id: string
  draw_result_id: string
  user_id: string
  proof_url: string | null
  verification_status: VerificationStatus
  payment_status: PaymentStatus
  admin_notes: string | null
  created_at: string
  profile?: Profile
  draw_result?: DrawResult
}

export interface Payment {
  id: string
  user_id: string
  stripe_payment_intent_id: string | null
  amount: number
  currency: string
  type: 'subscription' | 'prize_payout'
  status: string
  created_at: string
}

export interface Analytics {
  total_users: number
  active_subscribers: number
  total_prize_pool: number
  total_charity_raised: number
  monthly_revenue: number
}
