import { NextResponse } from 'next/server';

type InsightRow = {
  market_address: string;
  home_team?: string | null;
  away_team?: string | null;
  last5?: string[] | null;      // e.g., ["GS 2-1 FB", "FB 1-1 BJK", ...]
  injuries?: string[] | null;   // e.g., ["M. Icardi (ankle)", "T. Dirar (hamstring)"]
};

export async function GET(request: Request) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE;
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({ error: 'Missing Supabase env' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const addr = searchParams.get('addr');
  if (!addr) {
    return NextResponse.json({ error: 'addr is required' }, { status: 400 });
  }

  const url = new URL(`${SUPABASE_URL}/rest/v1/prediction_insights`);
  url.searchParams.set('select', 'market_address,home_team,away_team,last5,injuries');
  url.searchParams.set('market_address', `eq.${addr}`);
  url.searchParams.set('limit', '1');

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
    return NextResponse.json({ error: 'Supabase fetch failed', details }, { status: r.status });
  }

  const rows = (await r.json()) as InsightRow[];
  const row = rows?.[0];
  if (!row) {
    return NextResponse.json({
      market_address: addr,
      home_team: null,
      away_team: null,
      last5: [],
      injuries: []
    });
  }

  return NextResponse.json({
    market_address: row.market_address,
    home_team: row.home_team ?? null,
    away_team: row.away_team ?? null,
    last5: Array.isArray(row.last5) ? row.last5 : [],
    injuries: Array.isArray(row.injuries) ? row.injuries : []
  });
}


