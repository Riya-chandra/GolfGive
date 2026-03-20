import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

// GET /api/scores — get current user's 5 scores
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('golf_scores')
    .select('*')
    .eq('user_id', session.userId)
    .order('played_date', { ascending: false })
    .limit(5);

  if (error) return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });

  return NextResponse.json({ scores: data });
}

// POST /api/scores — add a new score
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check active subscription
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('subscription_status')
    .eq('id', session.userId)
    .single();

  if (!user || user.subscription_status !== 'active') {
    return NextResponse.json({ error: 'Active subscription required to enter scores' }, { status: 403 });
  }

  const { score, playedDate } = await req.json();

  if (!score || !playedDate) {
    return NextResponse.json({ error: 'Score and date are required' }, { status: 400 });
  }

  if (score < 1 || score > 45) {
    return NextResponse.json({ error: 'Score must be between 1 and 45 (Stableford)' }, { status: 400 });
  }

  // Check date is not in the future
  if (new Date(playedDate) > new Date()) {
    return NextResponse.json({ error: 'Score date cannot be in the future' }, { status: 400 });
  }

  // Get existing scores count
  const { count } = await supabaseAdmin
    .from('golf_scores')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.userId);

  // If user already has 5 scores, delete the oldest
  if ((count || 0) >= 5) {
    const { data: oldest } = await supabaseAdmin
      .from('golf_scores')
      .select('id')
      .eq('user_id', session.userId)
      .order('played_date', { ascending: true })
      .limit(1)
      .single();

    if (oldest) {
      await supabaseAdmin.from('golf_scores').delete().eq('id', oldest.id);
    }
  }

  // Insert new score
  const { data: newScore, error } = await supabaseAdmin
    .from('golf_scores')
    .insert({ user_id: session.userId, score, played_date: playedDate })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You already have a score for this date' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }

  return NextResponse.json({ score: newScore, message: 'Score added successfully' });
}

// DELETE /api/scores — delete a score by id
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const scoreId = searchParams.get('id');

  if (!scoreId) return NextResponse.json({ error: 'Score ID required' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('golf_scores')
    .delete()
    .eq('id', scoreId)
    .eq('user_id', session.userId); // Ensure ownership

  if (error) return NextResponse.json({ error: 'Failed to delete score' }, { status: 500 });

  return NextResponse.json({ success: true });
}
