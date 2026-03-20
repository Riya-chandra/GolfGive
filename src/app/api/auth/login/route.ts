import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyPassword, signToken, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check subscription status (lapse detection)
    if (
      user.subscription_status === 'active' &&
      user.subscription_end &&
      new Date(user.subscription_end) < new Date()
    ) {
      await supabaseAdmin
        .from('users')
        .update({ subscription_status: 'lapsed' })
        .eq('id', user.id);
      user.subscription_status = 'lapsed';
    }

    // Create session token
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const cookieOptions = setSessionCookie(token);

    const redirectTo = user.role === 'admin' ? '/admin' : '/dashboard';

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
      redirectTo,
    });

    response.cookies.set(cookieOptions);
    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
