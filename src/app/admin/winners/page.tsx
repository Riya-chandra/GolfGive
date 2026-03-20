import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth';

import { supabaseAdmin } from '@/lib/supabase';

import Navbar from '@/components/layout/Navbar';

import AdminWinnerVerify from '@/components/admin/AdminWinnerVerify';

import { MONTH_NAMES } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminWinnersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') redirect('/auth/login');

  const { data: winners } = await supabaseAdmin
    .from('winners')
    .select('*, users(full_name, email), draws(month, year, winning_numbers)')
    .order('created_at', { ascending: false });

  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <a href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</a>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-600">Winners</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal mb-6">Winners & Verification</h1>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Winners', value: (winners || []).length, color: 'text-charcoal' },
              { label: 'Pending Review', value: (winners || []).filter((w: { payment_status: string }) => w.payment_status === 'verification_required').length, color: 'text-gold-600' },
              { label: 'Approved', value: (winners || []).filter((w: { payment_status: string }) => w.payment_status === 'approved').length, color: 'text-forest-600' },
              { label: 'Paid Out', value: (winners || []).filter((w: { payment_status: string }) => w.payment_status === 'paid').length, color: 'text-green-600' },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className={`font-display font-black text-3xl ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Winner</th>
                    <th>Draw</th>
                    <th>Match</th>
                    <th>Prize</th>
                    <th>Status</th>
                    <th>Proof</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(winners || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400">No winners yet</td>
                    </tr>
                  ) : (winners || []).map((w: {
                    id: string;
                    users?: { full_name: string; email: string };
                    draws?: { month: number; year: number; winning_numbers: number[] };
                    match_type: string;
                    matched_numbers: number[];
                    prize_amount: number;
                    payment_status: string;
                    proof_url?: string;
                    submitted_at?: string;
                  }) => (
                    <tr key={w.id}>
                      <td>
                        <div className="font-medium text-charcoal">{w.users?.full_name}</div>
                        <div className="text-xs text-gray-400">{w.users?.email}</div>
                      </td>
                      <td className="text-sm font-medium">
                        {w.draws ? `${MONTH_NAMES[w.draws.month - 1].slice(0, 3)} ${w.draws.year}` : '—'}
                      </td>
                      <td>
                        <span className={`badge ${w.match_type === '5-match' ? 'badge-gold' : 'badge-green'}`}>
                          {w.match_type}
                        </span>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {w.matched_numbers?.map((n) => (
                            <span key={n} className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-forest-100 text-forest-700 text-xs font-bold">
                              {n}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="font-bold text-charcoal">£{w.prize_amount.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${
                          w.payment_status === 'paid' ? 'badge-green' :
                          w.payment_status === 'approved' ? 'badge-green' :
                          w.payment_status === 'verification_required' ? 'badge-gold' :
                          w.payment_status === 'rejected' ? 'badge-red' :
                          'badge-gray'
                        }`}>
                          {w.payment_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        {w.proof_url ? (
                          <a
                            href={w.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-forest-600 hover:underline font-medium"
                          >
                            View proof
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300">None submitted</span>
                        )}
                      </td>
                      <td>
                        <AdminWinnerVerify
                          winnerId={w.id}
                          currentStatus={w.payment_status}
                          hasProof={!!w.proof_url}
                        />
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
