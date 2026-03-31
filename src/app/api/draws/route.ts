import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import {
  generateRandomDraw,
  generateAlgorithmicDraw,
  checkMatch,
  calculatePrizePools,
} from '@/lib/draw-engine';
<<<<<<< HEAD
=======
import { sendDrawResultEmail } from '@/lib/email';
import { MONTH_NAMES } from '@/types';
>>>>>>> 3fda15e (added)

export async function GET(req: NextRequest) {
  const session = await getSession();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let query = supabaseAdmin
    .from('draws')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (!session || session.role !== 'admin') {
    query = query.eq('status', 'published');
  } else if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Failed to fetch draws' }, { status: 500 });
  return NextResponse.json({ draws: data });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { action, drawId, month, year, drawType } = await req.json();

  if (action === 'create') {
    const { data: existing } = await supabaseAdmin
      .from('draws')
      .select('id')
      .eq('month', month)
      .eq('year', year)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Draw already exists for this month/year' }, { status: 409 });
    }

    const { count: activeCount } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active');

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const { data: prevDraw } = await supabaseAdmin
      .from('draws')
      .select('jackpot_pool, jackpot_rolled_over')
      .eq('month', prevMonth)
      .eq('year', prevYear)
      .eq('status', 'published')
      .single();

    const rolloverAmount = prevDraw?.jackpot_rolled_over ? prevDraw.jackpot_pool : 0;
    const pools = calculatePrizePools(activeCount || 0, 9.99, rolloverAmount);

    const { data: draw, error } = await supabaseAdmin
      .from('draws')
      .insert({
        month, year,
        draw_type: drawType || 'random',
        status: 'upcoming',
        total_pool: pools.total,
        jackpot_pool: pools.jackpot,
        four_match_pool: pools.fourMatch,
        three_match_pool: pools.threeMatch,
        rollover_amount: rolloverAmount,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Failed to create draw' }, { status: 500 });
    return NextResponse.json({ draw, message: 'Draw created successfully' });
  }

  if (action === 'simulate') {
    const { data: draw } = await supabaseAdmin
      .from('draws').select('*').eq('id', drawId).single();
    if (!draw) return NextResponse.json({ error: 'Draw not found' }, { status: 404 });

    let result;
    if (draw.draw_type === 'algorithmic') {
      const { data: allScores } = await supabaseAdmin.from('golf_scores').select('score');
      const scores = (allScores || []).map((s: { score: number }) => s.score);
      result = generateAlgorithmicDraw(scores);
    } else {
      result = generateRandomDraw();
    }

    const { data: entries } = await supabaseAdmin
      .from('draw_entries').select('*').eq('draw_id', drawId);

    const matchResults = { fiveMatch: [] as string[], fourMatch: [] as string[], threeMatch: [] as string[] };
    (entries || []).forEach((entry: { user_id: string; scores_snapshot: number[] }) => {
      const { matchType } = checkMatch(entry.scores_snapshot, result.winningNumbers);
      if (matchType === '5-match') matchResults.fiveMatch.push(entry.user_id);
      else if (matchType === '4-match') matchResults.fourMatch.push(entry.user_id);
      else if (matchType === '3-match') matchResults.threeMatch.push(entry.user_id);
    });

    await supabaseAdmin.from('draws').update({
      winning_numbers: result.winningNumbers,
      status: 'simulated',
      jackpot_rolled_over: matchResults.fiveMatch.length === 0,
    }).eq('id', drawId);

    return NextResponse.json({
      winningNumbers: result.winningNumbers,
      method: result.method,
      matches: matchResults,
      message: 'Simulation complete. Review before publishing.',
    });
  }

  if (action === 'publish') {
    const { data: draw } = await supabaseAdmin.from('draws').select('*').eq('id', drawId).single();
    if (!draw) return NextResponse.json({ error: 'Draw not found' }, { status: 404 });
    if (!draw.winning_numbers?.length) {
      return NextResponse.json({ error: 'Run simulation before publishing' }, { status: 400 });
    }

    const { data: entries } = await supabaseAdmin.from('draw_entries').select('*').eq('draw_id', drawId);

    const winnersList: Array<{ userId: string; matchType: string; matchedNumbers: number[] }> = [];
    const fiveMatchUsers: string[] = [];
    const fourMatchUsers: string[] = [];
    const threeMatchUsers: string[] = [];

    (entries || []).forEach((entry: { user_id: string; scores_snapshot: number[] }) => {
      const { matchType, matchedNumbers } = checkMatch(entry.scores_snapshot, draw.winning_numbers);
      if (matchType) {
        if (matchType === '5-match') fiveMatchUsers.push(entry.user_id);
        else if (matchType === '4-match') fourMatchUsers.push(entry.user_id);
        else if (matchType === '3-match') threeMatchUsers.push(entry.user_id);
        winnersList.push({ userId: entry.user_id, matchType, matchedNumbers });
      }
    });

    const prizePerFive = fiveMatchUsers.length > 0 ? draw.jackpot_pool / fiveMatchUsers.length : 0;
    const prizePerFour = fourMatchUsers.length > 0 ? draw.four_match_pool / fourMatchUsers.length : 0;
    const prizePerThree = threeMatchUsers.length > 0 ? draw.three_match_pool / threeMatchUsers.length : 0;

    for (const w of winnersList) {
      let prize = 0;
      if (w.matchType === '5-match') prize = prizePerFive;
      else if (w.matchType === '4-match') prize = prizePerFour;
      else if (w.matchType === '3-match') prize = prizePerThree;

      await supabaseAdmin.from('winners').insert({
        draw_id: drawId,
        user_id: w.userId,
        match_type: w.matchType,
        matched_numbers: w.matchedNumbers,
        prize_amount: prize,
        payment_status: 'pending',
      });
    }

    await supabaseAdmin.from('draws').update({
      status: 'published',
      published_at: new Date().toISOString(),
      jackpot_rolled_over: fiveMatchUsers.length === 0,
    }).eq('id', drawId);

<<<<<<< HEAD
=======
    // Send draw result emails to all entrants (non-blocking)
    ;(async () => {
      try {
        const { data: allEntries } = await supabaseAdmin
          .from('draw_entries')
          .select('user_id, scores_snapshot, users(full_name, email)')
          .eq('draw_id', drawId);

        const monthName = MONTH_NAMES[draw.month - 1];
        for (const entry of allEntries || []) {
          const u = entry.users as unknown as { full_name: string; email: string } | null;
          if (u?.email) {
            await sendDrawResultEmail(
              u.email,
              u.full_name,
              monthName,
              draw.year,
              draw.winning_numbers,
              entry.scores_snapshot
            );
          }
        }
      } catch (err) {
        console.error('[Draw email error]', err);
      }
    })();

>>>>>>> 3fda15e (added)
    return NextResponse.json({
      message: 'Draw published successfully',
      winnersCount: winnersList.length,
      jackpotRolledOver: fiveMatchUsers.length === 0,
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
