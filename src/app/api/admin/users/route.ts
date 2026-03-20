import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { userId, subscriptionStatus, subscriptionPlan, selectedCharityId, charityContributionPct } = await req.json();

  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (subscriptionStatus) updates.subscription_status = subscriptionStatus;
  if (subscriptionPlan) updates.subscription_plan = subscriptionPlan;
  if (selectedCharityId !== undefined) updates.selected_charity_id = selectedCharityId;
  if (charityContributionPct !== undefined) updates.charity_contribution_pct = charityContributionPct;

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  return NextResponse.json({ user: data });
}
