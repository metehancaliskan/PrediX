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
    const body = await request.json().catch(() => ({}));
    const marketAddress = body?.marketAddress as string | undefined;
    if (!marketAddress || !marketAddress.startsWith('0x')) {
      return NextResponse.json({ error: 'marketAddress is required' }, { status: 400 });
    }

    // Set all positions for this market to is_setteled=true (note: column name in table is `is_setteled`)
    const url = `${SUPABASE_URL}/rest/v1/prediction_markets`;
    // First, ensure the market exists (optional); then update positions

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/positions?market_address=eq.${encodeURIComponent(
        marketAddress
      )}`,
      {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ is_setteled: true })
      }
    );

    if (!res.ok) {
      const details = await res.text();
      return NextResponse.json({ error: 'Supabase update failed', details }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json({ updated: json?.length ?? 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}


