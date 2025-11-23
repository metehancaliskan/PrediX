'use client';

import { useEffect, useState } from 'react';
import SettleClient from './SettleClient';

type MarketRow = {
  id: string;
  created_at: string;
  market_address: `0x${string}` | string | null;
  description: string | null;
  image_url: string | null;
  is_settled: boolean | null;
};

export default function AdminPage() {
  const [rows, setRows] = useState<MarketRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  async function load() {
    setLoading(true);
    try {
      // Use internal API route with relative URL (no public base URL needed)
      const r = await fetch('/api/markets?includeSettled=false&limit=200', { cache: 'no-store' });
      const j = await r.json();
      setRows(Array.isArray(j?.markets) ? (j.markets as MarketRow[]) : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="container">
      <h2 style={{ margin: '12px 0 16px 0' }}>Admin – Settle Markets</h2>
      {loading && <p>Loading...</p>}
      {!loading && rows.length === 0 && <p>No unsettled markets.</p>}
      <div style={{ display: 'grid', gap: 12 }}>
        {rows.map((m) => {
          const addr = (m.market_address || '') as `0x${string}`;
          return (
            <div key={m.id} className="panel" style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {m.image_url ? (
                  <div className="imgWrap" style={{ width: 120 }}>
                    <img src={m.image_url} alt="market" />
                  </div>
                ) : null}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>{m.description ?? '(no description)'}</div>
                  <div className="addr" style={{ marginTop: 4 }}>
                    {addr ? `${addr.slice(0, 10)}…${addr.slice(-6)}` : ''}
                  </div>
                </div>
              </div>
              <SettleClient marketAddress={addr} />
            </div>
          );
        })}
      </div>
    </main>
  );
}