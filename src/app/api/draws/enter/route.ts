import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

// POST /api/draws/enter — Enter user into an upcoming draw using their current scores
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Must have active subscription
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('subscription_status')
    .eq('id', session.userId)
    .single();

  if (!user || user.subscription_status !== 'active') {
    return NextResponse.json({ error: 'Active subscription required to enter draws' }, { status: 403 });
  }

  const { drawId } = await req.json();
  if (!drawId) return NextResponse.json({ error: 'Draw ID required' }, { status: 400 });

  // Check draw exists and is upcoming/open
  const { data: draw } = await supabaseAdmin
    .from('draws')
    .select('id, status, month, year')
    .eq('id', drawId)
    .single();

  if (!draw) return NextResponse.json({ error: 'Draw not found' }, { status: 404 });
  if (draw.status === 'published') {
    return NextResponse.json({ error: 'This draw has already been completed' }, { status: 400 });
  }

  // Get user's current scores (up to 5)
  const { data: scores } = await supabaseAdmin
    .from('golf_scores')
    .select('score')
    .eq('user_id', session.userId)
    .order('played_date', { ascending: false })
    .limit(5);

  if (!scores || scores.length === 0) {
    return NextResponse.json({ error: 'You need at least 1 score to enter a draw' }, { status: 400 });
  }

  const scoresSnapshot = scores.map((s: { score: number }) => s.score);

  // Check if already entered
  const { data: existing } = await supabaseAdmin
    .from('draw_entries')
    .select('id')
    .eq('draw_id', drawId)
    .eq('user_id', session.userId)
    .single();

  if (existing) {
    // Update their entry with latest scores snapshot
    const { error } = await supabaseAdmin
      .from('draw_entries')
      .update({ scores_snapshot: scoresSnapshot })
      .eq('id', existing.id);

    if (error) return NextResponse.json({ error: 'Failed to update draw entry' }, { status: 500 });
    return NextResponse.json({ message: 'Draw entry updated with latest scores', scoresSnapshot });
  }

  // Create new entry
  const { error } = await supabaseAdmin
    .from('draw_entries')
    .insert({
      draw_id: drawId,
      user_id: session.userId,
      scores_snapshot: scoresSnapshot,
    });

  if (error) return NextResponse.json({ error: 'Failed to enter draw' }, { status: 500 });

  return NextResponse.json({
    message: 'Successfully entered into draw!',
    scoresSnapshot,
  });
}

// GET /api/draws/enter?drawId=... — Check if current user is entered in a draw
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const drawId = searchParams.get('drawId');

  if (!drawId) {
    // Return all draws user has entered
    const { data, error } = await supabaseAdmin
      .from('draw_entries')
      .select('*, draws(month, year, status)')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    return NextResponse.json({ entries: data });
  }

  const { data } = await supabaseAdmin
    .from('draw_entries')
    .select('id, scores_snapshot, created_at')
    .eq('draw_id', drawId)
    .eq('user_id', session.userId)
    .single();

  return NextResponse.json({ entered: !!data, entry: data || null });
}
