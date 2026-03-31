import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      if (userId && session.subscription) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub: any = await stripe.subscriptions.retrieve(session.subscription as string);
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString().split('T')[0];
        await supabaseAdmin.from('users').update({
          subscription_status: 'active', subscription_plan: plan,
          subscription_start: new Date().toISOString().split('T')[0],
          subscription_end: periodEnd, stripe_subscription_id: sub.id,
        }).eq('id', userId);
        await supabaseAdmin.from('transactions').insert({
          user_id: userId, type: 'subscription',
          amount: (session.amount_total || 0) / 100,
          stripe_payment_intent_id: session.payment_intent as string,
          status: 'completed', metadata: { plan, period_end: periodEnd },
        });
      }
      break;
    }
    case 'invoice.payment_succeeded': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice: any = event.data.object;
      const customerId = invoice.customer as string;
      const { data: user } = await supabaseAdmin.from('users').select('id').eq('stripe_customer_id', customerId).single();
      if (user && invoice.subscription) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub: any = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString().split('T')[0];
        await supabaseAdmin.from('users').update({ subscription_status: 'active', subscription_end: periodEnd }).eq('id', user.id);
      }
      break;
    }
    case 'invoice.payment_failed': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice: any = event.data.object;
      await supabaseAdmin.from('users').update({ subscription_status: 'lapsed' }).eq('stripe_customer_id', invoice.customer as string);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await supabaseAdmin.from('users').update({ subscription_status: 'cancelled', stripe_subscription_id: null }).eq('stripe_customer_id', sub.customer as string);
      break;
    }
<<<<<<< HEAD
=======
    case 'checkout.session.completed': {
      // Also handle one-off donation payments
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.type === 'donation' && session.mode === 'payment') {
        const { userId, charityId } = session.metadata;
        if (userId && charityId) {
          const donationAmount = (session.amount_total || 0) / 100;
          await supabaseAdmin.from('donations').insert({
            user_id: userId,
            charity_id: charityId,
            amount: donationAmount,
            stripe_payment_intent_id: session.payment_intent as string,
            status: 'completed',
          });
          // Update charity total_raised
          const { data: charity } = await supabaseAdmin.from('charities').select('total_raised').eq('id', charityId).single();
          if (charity) {
            await supabaseAdmin.from('charities').update({
              total_raised: (charity.total_raised || 0) + donationAmount,
            }).eq('id', charityId);
          }
        }
      }
      break;
    }
>>>>>>> 3fda15e (added)
  }

  return NextResponse.json({ received: true });
}
