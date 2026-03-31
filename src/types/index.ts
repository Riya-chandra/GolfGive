<<<<<<< HEAD
=======
// ============================================
// Platform Types
// ============================================

>>>>>>> 3fda15e (added)
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'subscriber' | 'admin';
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'lapsed';
  subscription_plan?: 'monthly' | 'yearly';
  subscription_start?: string;
  subscription_end?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  selected_charity_id?: string;
  charity_contribution_pct: number;
  total_won: number;
  created_at: string;
  charities?: { name: string; slug: string };
}

export interface GolfScore {
  id: string;
  user_id: string;
  score: number;
  played_date: string;
  created_at: string;
}

export interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  logo_url?: string;
  cover_image_url?: string;
  website?: string;
  total_raised: number;
  is_featured: boolean;
  is_active: boolean;
  category?: string;
  charity_events?: CharityEvent[];
}

export interface CharityEvent {
  id: string;
  charity_id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
}

export interface Draw {
  id: string;
  month: number;
  year: number;
  status: 'upcoming' | 'simulated' | 'published';
  draw_type: 'random' | 'algorithmic';
  winning_numbers: number[];
  total_pool: number;
  jackpot_pool: number;
  four_match_pool: number;
  three_match_pool: number;
  jackpot_rolled_over: boolean;
  rollover_amount: number;
  published_at?: string;
  created_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  scores_snapshot: number[];
  created_at: string;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: '5-match' | '4-match' | '3-match';
  matched_numbers: number[];
  prize_amount: number;
  payment_status: 'pending' | 'verification_required' | 'approved' | 'paid' | 'rejected';
  proof_url?: string;
  submitted_at?: string;
  verified_at?: string;
  paid_at?: string;
  users?: { full_name: string; email: string };
  draws?: { month: number; year: number };
}

export interface Transaction {
  id: string;
  user_id?: string;
  type: 'subscription' | 'prize_payout' | 'charity_contribution' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  priceId: string;
  savings?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 9.99,
    interval: 'month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || '',
  },
  {
    id: 'yearly',
    name: 'Annual',
    price: 99.99,
    interval: 'year',
    priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || '',
    savings: 'Save 17%',
  },
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
