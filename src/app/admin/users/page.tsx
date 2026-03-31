import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth';

import { supabaseAdmin } from '@/lib/supabase';

import Navbar from '@/components/layout/Navbar';

import AdminUserActions from '@/components/admin/AdminUserActions';

import AdminScoreEditor from '@/components/admin/AdminScoreEditor';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') redirect('/auth/login');

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, full_name, email, role, subscription_status, subscription_plan, subscription_end, charity_contribution_pct, total_won, created_at')
    .order('created_at', { ascending: false });

  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <a href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</a>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-600">Users</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal mb-6">User Management</h1>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Subscription</th>
                    <th>Plan</th>
                    <th>Renewal</th>
                    <th>Charity %</th>
                    <th>Won</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(users || []).map((u: {
                    id: string;
                    full_name: string;
                    email: string;
                    role: string;
                    subscription_status: string;
                    subscription_plan?: string;
                    subscription_end?: string;
                    charity_contribution_pct: number;
                    total_won: number;
                    created_at: string;
                  }) => (
                    <tr key={u.id}>
                      <td>
                        <div className="font-medium text-charcoal">{u.full_name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                        {u.role === 'admin' && <span className="badge badge-gold text-xs">Admin</span>}
                      </td>
                      <td>
                        <span className={`badge ${
                          u.subscription_status === 'active' ? 'badge-green' :
                          u.subscription_status === 'cancelled' ? 'badge-red' :
                          'badge-gray'
                        }`}>
                          {u.subscription_status}
                        </span>
                      </td>
                      <td className="capitalize text-sm">{u.subscription_plan || '—'}</td>
                      <td className="text-sm text-gray-500">
                        {u.subscription_end
                          ? new Date(u.subscription_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
                          : '—'}
                      </td>
                      <td className="font-medium text-forest-600">{u.charity_contribution_pct}%</td>
                      <td className="font-medium text-gold-600">£{u.total_won.toFixed(2)}</td>
                      <td className="text-sm text-gray-400">
                        {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                      <td>
                        <AdminUserActions userId={u.id} currentStatus={u.subscription_status} />
                        <div className="flex gap-2 flex-wrap">
                          <AdminUserActions userId={u.id} currentStatus={u.subscription_status} />
                          <AdminScoreEditor userId={u.id} userName={u.full_name} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
