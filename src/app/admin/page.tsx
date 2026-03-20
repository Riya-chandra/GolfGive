import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import AdminDrawManager from '@/components/admin/AdminDrawManager';
import { MONTH_NAMES } from '@/types';

async function getAdminData() {
  const [statsRes, usersRes, drawsRes, winnersRes, charitiesRes] = await Promise.all([
    Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
      supabaseAdmin.from('winners').select('*', { count: 'exact', head: true }).eq('payment_status', 'verification_required'),
    ]),
    supabaseAdmin.from('users').select('id, full_name, email, subscription_status, subscription_plan, created_at, selected_charity_id, charity_contribution_pct').order('created_at', { ascending: false }).limit(20),
    supabaseAdmin.from('draws').select('*').order('year', { ascending: false }).order('month', { ascending: false }).limit(10),
    supabaseAdmin.from('winners').select('*, users(full_name, email), draws(month, year)').order('created_at', { ascending: false }).limit(20),
    supabaseAdmin.from('charities').select('*').order('is_featured', { ascending: false }),
  ]);

  const [totalRes, activeRes, pendingVerifyRes] = statsRes;

  return {
    stats: {
      totalUsers: totalRes.count || 0,
      activeSubscribers: activeRes.count || 0,
      pendingVerifications: pendingVerifyRes.count || 0,
    },
    users: usersRes.data || [],
    draws: drawsRes.data || [],
    winners: winnersRes.data || [],
    charities: charitiesRes.data || [],
  };
}

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') redirect('/auth/login');

  const { stats, users, draws, winners, charities } = await getAdminData();

  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-charcoal">Admin Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">GolfGive platform control centre</p>
            </div>
            <span className="badge badge-green">Platform live</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'text-blue-600' },
              { label: 'Active Subscribers', value: stats.activeSubscribers, icon: '✅', color: 'text-green-600' },
              { label: 'Pending Payouts', value: stats.pendingVerifications, icon: '⏳', color: 'text-gold-600' },
              { label: 'Active Charities', value: charities.filter((c: { is_active: boolean }) => c.is_active).length, icon: '❤️', color: 'text-red-500' },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{s.icon}</span>
                  <div className={`font-display font-black text-3xl ${s.color}`}>{s.value}</div>
                </div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Draw Manager */}
          <div className="mb-8">
            <AdminDrawManager draws={draws} />
          </div>

          {/* Bottom grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Users table */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl text-charcoal">Recent Users</h2>
                <span className="text-xs text-gray-400">{users.length} shown</span>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Plan</th>
                      <th>Charity %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: { id: string; full_name: string; email: string; subscription_status: string; subscription_plan?: string; charity_contribution_pct: number }) => (
                      <tr key={u.id}>
                        <td>
                          <div className="font-medium text-charcoal">{u.full_name}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </td>
                        <td>
                          <span className={`badge ${u.subscription_status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                            {u.subscription_status}
                          </span>
                        </td>
                        <td className="text-sm capitalize">{u.subscription_plan || '—'}</td>
                        <td className="text-sm font-medium text-forest-600">{u.charity_contribution_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Winners & Verification */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl text-charcoal">Winners & Payouts</h2>
                {stats.pendingVerifications > 0 && (
                  <span className="badge badge-gold">{stats.pendingVerifications} pending</span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Winner</th>
                      <th>Draw</th>
                      <th>Prize</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {winners.length === 0 ? (
                      <tr><td colSpan={5} className="text-center text-gray-400 py-8">No winners yet</td></tr>
                    ) : winners.map((w: { id: string; users?: { full_name: string }; draws?: { month: number; year: number }; prize_amount: number; payment_status: string; match_type: string }) => (
                      <tr key={w.id}>
                        <td className="font-medium">{w.users?.full_name}</td>
                        <td className="text-sm">{w.draws ? `${MONTH_NAMES[w.draws.month - 1].slice(0,3)} ${w.draws.year}` : '—'}</td>
                        <td className="font-bold text-charcoal">£{w.prize_amount.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${
                            w.payment_status === 'paid' ? 'badge-green' :
                            w.payment_status === 'verification_required' ? 'badge-gold' :
                            'badge-gray'
                          }`}>
                            {w.payment_status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          {w.payment_status === 'verification_required' && (
                            <AdminVerifyButton winnerId={w.id} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charities */}
            <div className="card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl text-charcoal">Charities</h2>
                <AddCharityButton />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {charities.map((c: { id: string; name: string; short_description?: string; category?: string; is_featured: boolean; is_active: boolean; total_raised: number }) => (
                  <div key={c.id} className="border border-gray-100 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div className="font-semibold text-sm text-charcoal">{c.name}</div>
                      <span className={`badge text-xs ${c.is_active ? 'badge-green' : 'badge-gray'}`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">{c.short_description}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">{c.category}</span>
                      <span className="text-xs font-medium text-forest-600">£{c.total_raised.toFixed(0)} raised</span>
                    </div>
                    {c.is_featured && <span className="badge badge-gold text-xs self-start">Featured</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Inline client component for verify action
function AdminVerifyButton({ winnerId }: { winnerId: string }) {
  return (
    <div className="flex gap-1">
      <form action={async () => {
        'use server';
        const { supabaseAdmin: db } = await import('@/lib/supabase');
        await db.from('winners').update({ payment_status: 'approved', verified_at: new Date().toISOString() }).eq('id', winnerId);
      }}>
        <button type="submit" className="text-xs text-green-600 hover:underline font-medium">Approve</button>
      </form>
    </div>
  );
}

function AddCharityButton() {
  return (
    <Link href="/admin/charities/new" className="btn-primary text-sm py-2 px-4">
      + Add charity
    </Link>
  );
}
