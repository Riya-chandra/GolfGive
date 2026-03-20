import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword, signToken, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, charityId, contributionPct } = await req.json();

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Check existing user
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name: fullName,
        selected_charity_id: charityId || null,
        charity_contribution_pct: contributionPct || 10,
        role: 'subscriber',
        subscription_status: 'inactive',
      })
      .select()
      .single();

    if (error) {
      console.error('User creation error:', error);
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    // Create JWT token
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const cookieOptions = setSessionCookie(token);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
      redirectTo: '/dashboard',
    });

    response.cookies.set(cookieOptions);
    return response;
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
