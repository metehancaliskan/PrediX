import { NextResponse } from 'next/server';

type MarketRow = {
  id: string;
  created_at: string;
  market_address: string | null;
  description: string | null;
  image_url: string | null;
};

export async function GET(request: Request) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') ?? '50';

  const url = new URL(`${SUPABASE_URL}/rest/v1/prediction_markets`);
  url.searchParams.set('select', 'id,created_at,market_address,description,image_url');
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('limit', limit);

  const r = await fetch(url.toString(), {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  });

  if (!r.ok) {
    const details = await r.text();
    return NextResponse.json({ error: 'Supabase request failed', details }, { status: r.status });
  }

  const rows = (await r.json()) as MarketRow[];
  return NextResponse.json({ markets: rows });
}