const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log('🌱 Seeding GolfGive database...\n');

  const users = [
    {
      email: 'admin@golfcharity.com',
      password: 'Admin@123',
      full_name: 'Platform Admin',
      role: 'admin',
      subscription_status: 'active',
      subscription_plan: 'yearly',
      subscription_start: new Date().toISOString().split('T')[0],
      subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      charity_contribution_pct: 20,
    },
    {
      email: 'user@golfcharity.com',
      password: 'User@123',
      full_name: 'John Subscriber',
      role: 'subscriber',
      subscription_status: 'active',
      subscription_plan: 'monthly',
      subscription_start: new Date().toISOString().split('T')[0],
      subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      charity_contribution_pct: 10,
    },
    {
      email: 'player2@golfcharity.com',
      password: 'Player@123',
      full_name: 'Sarah Golfer',
      role: 'subscriber',
      subscription_status: 'active',
      subscription_plan: 'monthly',
      subscription_start: new Date().toISOString().split('T')[0],
      subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      charity_contribution_pct: 15,
    },
  ];

  for (const user of users) {
    const { password, ...rest } = user;
    const password_hash = await bcrypt.hash(password, 12);

    const { data, error } = await supabase
      .from('users')
      .upsert({ ...rest, password_hash }, { onConflict: 'email' })
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to create ${user.email}:`, error.message);
    } else {
      console.log(`✅ Created user: ${user.email} (${user.role}) — password: ${password}`);

      // Add sample scores for subscribers
      if (user.role === 'subscriber') {
        const scores = [
          { score: 28, days_ago: 1 },
          { score: 34, days_ago: 5 },
          { score: 21, days_ago: 10 },
          { score: 30, days_ago: 15 },
          { score: 19, days_ago: 20 },
        ];

        for (const s of scores) {
          const date = new Date(Date.now() - s.days_ago * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          await supabase
            .from('golf_scores')
            .upsert({ user_id: data.id, score: s.score, played_date: date }, { onConflict: 'user_id,played_date' });
        }
        console.log(`   ⛳ Added 5 sample scores for ${user.email}`);
      }
    }
  }

  // Create a sample published draw
  console.log('\n🎯 Creating sample draw...');
  const now = new Date();
  const { data: draw, error: drawError } = await supabase
    .from('draws')
    .upsert({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      draw_type: 'random',
      status: 'published',
      winning_numbers: [19, 21, 28, 30, 34],
      total_pool: 450.00,
      jackpot_pool: 180.00,
      four_match_pool: 157.50,
      three_match_pool: 112.50,
      jackpot_rolled_over: false,
      rollover_amount: 0,
      published_at: new Date().toISOString(),
    }, { onConflict: 'month,year' })
    .select()
    .single();

  if (drawError) {
    console.error('❌ Draw creation failed:', drawError.message);
  } else {
    console.log(`✅ Draw created: ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()} — winning numbers: [19, 21, 28, 30, 34]`);
  }

  console.log('\n✨ Seed complete!\n');
  console.log('Test credentials:');
  console.log('  Admin:      admin@golfcharity.com / Admin@123');
  console.log('  Subscriber: user@golfcharity.com / User@123');
  console.log('  Player 2:   player2@golfcharity.com / Player@123\n');
}

seed().catch(console.error);
