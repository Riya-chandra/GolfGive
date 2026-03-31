import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';

// POST /api/donations — Create a one-off independent charity donation
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { charityId, amount } = await req.json();

  if (!charityId) return NextResponse.json({ error: 'Charity ID required' }, { status: 400 });
  if (!amount || amount < 1) return NextResponse.json({ error: 'Minimum donation is £1' }, { status: 400 });

  // Verify charity exists
  const { data: charity } = await supabaseAdmin
    .from('charities')
    .select('id, name, is_active')
    .eq('id', charityId)
    .single();

  if (!charity || !charity.is_active) {
    return NextResponse.json({ error: 'Charity not found or inactive' }, { status: 404 });
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('email, full_name, stripe_customer_id')
    .eq('id', session.userId)
    .single();

  const stripe = getStripe();

  // Get or create Stripe customer
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

  // Create Stripe checkout for one-time donation
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `Donation to ${charity.name}`,
            description: `Independent donation — not tied to gameplay`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/charities?donated=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/charities`,
    metadata: {
      userId: session.userId,
      charityId,
      type: 'donation',
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}

// GET /api/donations — Get user's donation history
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('*, charities(name, slug, logo_url)')
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  return NextResponse.json({ donations: data });
}
