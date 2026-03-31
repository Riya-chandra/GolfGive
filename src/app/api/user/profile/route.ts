import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

// PATCH /api/user/profile — Update user's charity selection and contribution %
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { charityId, contributionPct } = await req.json();

  const updates: Record<string, unknown> = {};

  if (charityId !== undefined) {
    // Validate charity exists if provided
    if (charityId !== null) {
      const { data: charity } = await supabaseAdmin
        .from('charities')
        .select('id')
        .eq('id', charityId)
        .eq('is_active', true)
        .single();
      if (!charity) return NextResponse.json({ error: 'Charity not found' }, { status: 404 });
    }
    updates.selected_charity_id = charityId;
  }

  if (contributionPct !== undefined) {
    if (contributionPct < 10 || contributionPct > 100) {
      return NextResponse.json({ error: 'Contribution must be between 10% and 100%' }, { status: 400 });
    }
    updates.charity_contribution_pct = contributionPct;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', session.userId)
    .select('id, selected_charity_id, charity_contribution_pct, charities:selected_charity_id(name, slug)')
    .single();

  if (error) return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });

  return NextResponse.json({ user: data, message: 'Profile updated successfully' });
}
