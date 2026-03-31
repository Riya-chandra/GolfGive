import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

// GET /api/admin/users/scores?userId=xxx — Get a user's scores
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('golf_scores')
    .select('*')
    .eq('user_id', userId)
    .order('played_date', { ascending: false })
    .limit(5);

  if (error) return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  return NextResponse.json({ scores: data });
}

// POST /api/admin/users/scores — Add a score for a user (admin override)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { userId, score, playedDate } = await req.json();

  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  if (!score || score < 1 || score > 45) {
    return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 });
  }
  if (!playedDate) return NextResponse.json({ error: 'Date required' }, { status: 400 });

  // Enforce 5-score rolling limit — delete oldest if at limit
  const { count } = await supabaseAdmin
    .from('golf_scores')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if ((count || 0) >= 5) {
    const { data: oldest } = await supabaseAdmin
      .from('golf_scores')
      .select('id')
      .eq('user_id', userId)
      .order('played_date', { ascending: true })
      .limit(1)
      .single();
    if (oldest) {
      await supabaseAdmin.from('golf_scores').delete().eq('id', oldest.id);
    }
  }

  const { data, error } = await supabaseAdmin
    .from('golf_scores')
    .insert({ user_id: userId, score, played_date: playedDate })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This user already has a score for that date' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to add score' }, { status: 500 });
  }

  return NextResponse.json({ score: data, message: 'Score added successfully' });
}

// DELETE /api/admin/users/scores?scoreId=xxx — Remove a score
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const scoreId = searchParams.get('scoreId');
  if (!scoreId) return NextResponse.json({ error: 'Score ID required' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('golf_scores')
    .delete()
    .eq('id', scoreId);

  if (error) return NextResponse.json({ error: 'Failed to delete score' }, { status: 500 });
  return NextResponse.json({ success: true });
}
