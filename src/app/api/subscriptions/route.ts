import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan } = await req.json();
  const stripe = getStripe();

  const priceId = plan === 'yearly'
    ? process.env.STRIPE_YEARLY_PRICE_ID
    : process.env.STRIPE_MONTHLY_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 });
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('email, full_name, stripe_customer_id')
    .eq('id', session.userId)
    .single();

  let customerId = user?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user?.email,
      name: user?.full_name,
      metadata: { userId: session.userId },
    });
    customerId = customer.id;
    await supabaseAdmin
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', session.userId);
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/signup?cancelled=true`,
    metadata: { userId: session.userId, plan },
    subscription_data: { metadata: { userId: session.userId, plan } },
  });

  return NextResponse.json({ url: checkoutSession.url });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const stripe = getStripe();
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('stripe_subscription_id')
    .eq('id', session.userId)
    .single();

  if (!user?.stripe_subscription_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
  }

  await stripe.subscriptions.update(user.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  await supabaseAdmin
    .from('users')
    .update({ subscription_status: 'cancelled' })
    .eq('id', session.userId);

  return NextResponse.json({ success: true, message: 'Subscription will cancel at end of billing period' });
}
