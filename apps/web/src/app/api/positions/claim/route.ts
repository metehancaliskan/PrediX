import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json(
      { error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE' },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json().catch(() => null)) as {
      user_address?: string;
      market_address?: string;
    } | null;

    const user = body?.user_address;
    const market = body?.market_address;
    if (!user || !market) {
      return NextResponse.json({ error: 'user_address and market_address are required' }, { status: 400 });
    }

    const url = `${SUPABASE_URL}/rest/v1/positions?user_address=eq.${encodeURIComponent(
      user
    )}&market_address=eq.${encodeURIComponent(market)}&is_claimed=is.false`;

    const r = await fetch(url, {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({ is_claimed: true })
    });

    if (!r.ok) {
      const details = await r.text();
      return NextResponse.json({ error: 'Supabase update failed', details }, { status: r.status });
    }

    const rows = await r.json();
    return NextResponse.json({ updated: Array.isArray(rows) ? rows.length : 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}


