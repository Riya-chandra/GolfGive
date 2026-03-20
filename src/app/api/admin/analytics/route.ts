import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const [
    totalUsersRes,
    activeSubsRes,
    totalWinnersRes,
    pendingVerificationsRes,
    charitiesRes,
    recentDrawsRes,
    recentUsersRes,
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    supabaseAdmin.from('winners').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('winners').select('*', { count: 'exact', head: true }).eq('payment_status', 'verification_required'),
    supabaseAdmin.from('charities').select('id, name, total_raised, is_active').eq('is_active', true),
    supabaseAdmin.from('draws').select('*').order('year', { ascending: false }).order('month', { ascending: false }).limit(5),
    supabaseAdmin.from('users').select('id, full_name, email, subscription_status, created_at').order('created_at', { ascending: false }).limit(10),
  ]);

  // Calculate total prize pool from all draws
  const { data: poolData } = await supabaseAdmin.from('draws').select('total_pool').eq('status', 'published');
  const totalPrizePool = (poolData || []).reduce((sum, d) => sum + (d.total_pool || 0), 0);

  // Calculate total charity contributions
  const { data: subData } = await supabaseAdmin.from('users').select('subscription_plan, charity_contribution_pct').eq('subscription_status', 'active');
  const monthlyRevenue = (subData || []).reduce((sum, u) => {
    const base = u.subscription_plan === 'yearly' ? 99.99 / 12 : 9.99;
    return sum + base;
  }, 0);
  const charityTotal = (subData || []).reduce((sum, u) => {
    const base = u.subscription_plan === 'yearly' ? 99.99 / 12 : 9.99;
    return sum + base * (u.charity_contribution_pct / 100);
  }, 0);

  return NextResponse.json({
    stats: {
      totalUsers: totalUsersRes.count || 0,
      activeSubscribers: activeSubsRes.count || 0,
      totalWinners: totalWinnersRes.count || 0,
      pendingVerifications: pendingVerificationsRes.count || 0,
      totalPrizePool,
      monthlyRevenue,
      charityContributionThisMonth: charityTotal,
    },
    charities: charitiesRes.data || [],
    recentDraws: recentDrawsRes.data || [],
    recentUsers: recentUsersRes.data || [],
  });
}
