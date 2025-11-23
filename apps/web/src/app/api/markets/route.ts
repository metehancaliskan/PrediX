import { NextResponse } from 'next/server';

type MarketRow = {
  id: string;
  created_at: string;
  market_address: string | null;
  description: string | null;
  image_url: string | null;
  is_settled?: boolean | null;
};

export async function GET(request: Request) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json(
      { error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') ?? '50';
  const includeSettled = searchParams.get('includeSettled') === 'true';

  const url = new URL(`${SUPABASE_URL}/rest/v1/prediction_markets`);
  url.searchParams.set('select', 'id,created_at,market_address,description,image_url,is_settled');
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('limit', limit);
  if (!includeSettled) {
    url.searchParams.set('is_settled', 'eq.false');
  }

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
    return NextResponse.json({ error: 'Supabase request failed', details }, { status: r.status });
  }

  const rows = (await r.json()) as MarketRow[];
  return NextResponse.json({ markets: rows });
}