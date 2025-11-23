import { NextResponse } from 'next/server';

type PositionRow = {
  id: string;
  created_at: string;
  user_address: string | null;
  market_address: string | null;
  is_setteled: boolean | null;
  is_win: boolean | null;   // semantic: user's chosen side; true ⇒ bet on win
  amount: string | null;    // store as string; Supabase NUMERIC will accept string
  tx_hash?: string | null;  // optional: if you add this column later
};

export async function GET(request: Request) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');           // optional: filter by user_address
  const market = searchParams.get('market');       // optional: filter by market_address
  const limit = searchParams.get('limit') ?? '100';

  const url = new URL(`${SUPABASE_URL}/rest/v1/positions`);
  url.searchParams.set('select', '*');
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('limit', limit);
  if (user) url.searchParams.set('user_address', `eq.${user}`);
  if (market) url.searchParams.set('market_address', `eq.${market}`);

  const r = await fetch(url.toString(), {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  });

  if (!r.ok) {
    const details = await r.text();
    return NextResponse.json({ error: 'Supabase GET failed', details }, { status: r.status });
  }

  const rows = (await r.json()) as PositionRow[];
  return NextResponse.json({ positions: rows });
}

export async function POST(request: Request) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    return NextResponse.json({ error: 'Missing Supabase service env' }, { status: 500 });
  }

  const body = await request.json().catch(() => null) as {
    user_address?: string;
    market_address?: string;
    is_win?: boolean;
    amount?: string | number;   // suggest sending as string (e.g., wei or decimal)
    is_setteled?: boolean;      // usually false on creation
    tx_hash?: string;           // optional
  } | null;

  if (!body?.user_address || !body?.market_address || typeof body.is_win !== 'boolean' || body.amount == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const payload: Record<string, any> = {
    user_address: body.user_address,
    market_address: body.market_address,
    is_win: body.is_win,
    amount: String(body.amount),
    is_setteled: body.is_setteled ?? false
  };
  if (body.tx_hash) payload.tx_hash = body.tx_hash; // if column exists

  const r = await fetch(`${SUPABASE_URL}/rest/v1/positions`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(payload)
  });

  if (!r.ok) {
    const details = await r.text();
    return NextResponse.json({ error: 'Supabase INSERT failed', details }, { status: r.status });
  }

  const row = (await r.json()) as PositionRow[];
  return NextResponse.json({ position: row?.[0] ?? null }, { status: 201 });
}