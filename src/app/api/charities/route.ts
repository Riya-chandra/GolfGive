import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get('featured');
  const slug = searchParams.get('slug');

  let query = supabaseAdmin
    .from('charities')
    .select('*, charity_events(*)');

  if (slug) {
    query = query.eq('slug', slug);
  } else {
    query = query.eq('is_active', true);
    if (featured === 'true') query = query.eq('is_featured', true);
    query = query.order('is_featured', { ascending: false }).order('total_raised', { ascending: false });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Failed to fetch charities' }, { status: 500 });

  return NextResponse.json({ charities: slug ? data?.[0] : data });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, shortDescription, category, website, logoUrl, isFeatured } = body;

  if (!name || !description) {
    return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const { data, error } = await supabaseAdmin
    .from('charities')
    .insert({
      name,
      slug,
      description,
      short_description: shortDescription,
      category,
      website,
      logo_url: logoUrl,
      is_featured: isFeatured || false,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Charity with this name already exists' }, { status: 409 });
    return NextResponse.json({ error: 'Failed to create charity' }, { status: 500 });
  }

  return NextResponse.json({ charity: data });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: 'Charity ID required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('charities')
    .update({
      name: updates.name,
      description: updates.description,
      short_description: updates.shortDescription,
      category: updates.category,
      website: updates.website,
      logo_url: updates.logoUrl,
      is_featured: updates.isFeatured,
      is_active: updates.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Failed to update charity' }, { status: 500 });

  return NextResponse.json({ charity: data });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Charity ID required' }, { status: 400 });

  // Soft delete
  const { error } = await supabaseAdmin
    .from('charities')
    .update({ is_active: false })
    .eq('id', id);

  if (error) return NextResponse.json({ error: 'Failed to delete charity' }, { status: 500 });

  return NextResponse.json({ success: true });
}
