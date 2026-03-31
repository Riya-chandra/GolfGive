import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
<<<<<<< HEAD
=======
import { sendWinnerVerificationEmail, sendPayoutApprovedEmail } from '@/lib/email';
>>>>>>> 3fda15e (added)

// GET /api/winners — get user's winnings or all winners (admin)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const drawId = searchParams.get('draw_id');

  if (session.role === 'admin') {
    let query = supabaseAdmin
      .from('winners')
      .select('*, users(full_name, email), draws(month, year)')
      .order('created_at', { ascending: false });

    if (drawId) query = query.eq('draw_id', drawId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: 'Failed to fetch winners' }, { status: 500 });
    return NextResponse.json({ winners: data });
  }

  // Regular user — get their own winnings
  const { data, error } = await supabaseAdmin
    .from('winners')
    .select('*, draws(month, year, winning_numbers)')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Failed to fetch winnings' }, { status: 500 });
  return NextResponse.json({ winners: data });
}

// PATCH /api/winners — submit proof or admin verify
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { winnerId, action, proofUrl, paymentStatus } = await req.json();

  if (!winnerId) return NextResponse.json({ error: 'Winner ID required' }, { status: 400 });

  // User submits proof
  if (action === 'submit_proof') {
    if (!proofUrl) return NextResponse.json({ error: 'Proof URL required' }, { status: 400 });

<<<<<<< HEAD
=======
    // Fetch winner + user details for email
    const { data: winnerData } = await supabaseAdmin
      .from('winners')
      .select('match_type, prize_amount, users(full_name, email)')
      .eq('id', winnerId)
      .eq('user_id', session.userId)
      .single();

>>>>>>> 3fda15e (added)
    const { error } = await supabaseAdmin
      .from('winners')
      .update({
        proof_url: proofUrl,
        payment_status: 'verification_required',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', winnerId)
<<<<<<< HEAD
      .eq('user_id', session.userId); // Ensure ownership

    if (error) return NextResponse.json({ error: 'Failed to submit proof' }, { status: 500 });
=======
      .eq('user_id', session.userId);

    if (error) return NextResponse.json({ error: 'Failed to submit proof' }, { status: 500 });

    // Send verification pending email (non-blocking)
    if (winnerData) {
      const u = winnerData.users as unknown as { full_name: string; email: string } | null;
      if (u) {
        sendWinnerVerificationEmail(
          u.email,
          u.full_name,
          winnerData.match_type,
          winnerData.prize_amount
        ).catch(console.error);
      }
    }

>>>>>>> 3fda15e (added)
    return NextResponse.json({ success: true, message: 'Proof submitted for review' });
  }

  // Admin verifies/rejects
  if (action === 'admin_verify') {
    if (session.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

<<<<<<< HEAD
=======
    // Fetch winner + user details for email
    const { data: winnerData } = await supabaseAdmin
      .from('winners')
      .select('match_type, prize_amount, users(full_name, email)')
      .eq('id', winnerId)
      .single();

>>>>>>> 3fda15e (added)
    const updates: Record<string, unknown> = {
      payment_status: paymentStatus,
      verified_at: new Date().toISOString(),
      verified_by: session.userId,
    };

    if (paymentStatus === 'paid') updates.paid_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from('winners')
      .update(updates)
      .eq('id', winnerId);

    if (error) return NextResponse.json({ error: 'Failed to update winner status' }, { status: 500 });
<<<<<<< HEAD
=======

    // Send payout approved email (non-blocking)
    if (paymentStatus === 'paid' && winnerData) {
      const u = winnerData.users as unknown as { full_name: string; email: string } | null;
      if (u) {
        sendPayoutApprovedEmail(
          u.email,
          u.full_name,
          winnerData.prize_amount
        ).catch(console.error);
      }
    }

>>>>>>> 3fda15e (added)
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
