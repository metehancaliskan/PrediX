'use client';

import TopBar from '../../components/TopBar';
import { useAccount, useWriteContract } from 'wagmi';
import { useEffect, useMemo, useState } from 'react';
import PredictionMarketAbi from '../../abi/PredictionMarket.json';

type PositionRow = {
  id: string;
  market_address: `0x${string}` | string | null;
  is_win: boolean | null;
  amount: string | null;
  tx_hash?: string | null;
  is_setteled?: boolean | null; // note schema spelling
  is_claimed?: boolean | null;
};

type MarketRow = {
  id: string;
  market_address: string | null;
  description: string | null;
  image_url: string | null;
  is_settled?: boolean | null;
};

export default function ClaimPage() {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [markets, setMarkets] = useState<MarketRow[]>([]);

  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        const [pRes, mRes] = await Promise.all([
          fetch(`/api/positions?user=${address}&limit=200`, { cache: 'no-store' }),
          fetch(`/api/markets?includeSettled=true&limit=200`, { cache: 'no-store' })
        ]);
        const pJson = await pRes.json();
        const mJson = await mRes.json();
        setPositions(Array.isArray(pJson.positions) ? pJson.positions : []);
        setMarkets(Array.isArray(mJson.markets) ? mJson.markets : []);
      } catch {
        setPositions([]);
        setMarkets([]);
      }
    })();
  }, [address]);

  type Meta = { addr: `0x${string}`; description: string | null; image: string | null };
  const marketMeta = useMemo(() => {
    const map = new Map<string, Meta>();
    markets.forEach((m) => {
      if (m.market_address) {
        map.set(m.market_address, {
          addr: m.market_address as `0x${string}`,
          description: m.description,
          image: m.image_url
        });
      }
    });
    return map;
  }, [markets]);

  const { claimable, open } = useMemo(() => {
    const byMarket = new Map<string, { hasOpen: boolean; hasClaimable: boolean }>();
    positions.forEach((p) => {
      if (!p.market_address) return;
      const addr = p.market_address as string;
      const status = byMarket.get(addr) ?? { hasOpen: false, hasClaimable: false };
      const isOpen = p.is_setteled === false || p.is_setteled == null; // treat null as open
      const isClaimable = p.is_setteled === true && p.is_claimed !== true;
      if (isOpen) status.hasOpen = true;
      if (isClaimable) status.hasClaimable = true;
      byMarket.set(addr, status);
    });
    const claimableList: Meta[] = [];
    const openList: Meta[] = [];
    byMarket.forEach((st, addr) => {
      const meta = marketMeta.get(addr) ?? { addr: addr as `0x${string}`, description: null, image: null };
      if (st.hasClaimable) {
        claimableList.push(meta);
      } else if (st.hasOpen) {
        openList.push(meta);
      }
      // markets that are only claimed (no open, no claimable) are omitted
    });
    return { claimable: claimableList, open: openList };
  }, [positions, marketMeta]);

  const withdraw = async (addr: `0x${string}`) => {
    try {
      await writeContractAsync({
        address: addr,
        abi: PredictionMarketAbi as any,
        functionName: 'withdrawWinnings',
        args: []
      });
      // Refresh positions after withdraw to reflect claim status (if you mark them later)
      if (address) {
        const pRes = await fetch(`/api/positions?user=${address}&limit=200`, { cache: 'no-store' });
        const pJson = await pRes.json();
        setPositions(Array.isArray(pJson.positions) ? pJson.positions : []);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('withdraw failed', e);
    }
  };

  return (
    <main className="container">
      <TopBar />
      <h2 style={{ margin: '12px 0 16px 0' }}>Claim your bets</h2>
      {(!address) && <p>Please connect your wallet.</p>}
      {address && claimable.length === 0 && open.length === 0 && <p>No positions found.</p>}
      {claimable.length > 0 && <h3 style={{ margin: '8px 0' }}>Claimable</h3>}
      <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
        {claimable.map((it) => (
          <div key={it.addr} className="panel" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {it.image ? (
              <div className="imgWrap" style={{ width: 120 }}>
                <img src={it.image} alt="market" />
              </div>
            ) : null}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{it.description ?? it.addr}</div>
              <div className="addr" style={{ marginTop: 4 }}>{it.addr.slice(0, 10)}…{it.addr.slice(-6)}</div>
            </div>
            <button
              className="connect"
              onClick={() => withdraw(it.addr)}
              disabled={isPending}
            >
              {isPending ? 'Withdrawing...' : 'Withdraw'}
            </button>
          </div>
        ))}
      </div>
      {open.length > 0 && <h3 style={{ margin: '8px 0' }}>Open Positions (awaiting settlement)</h3>}
      <div style={{ display: 'grid', gap: 12 }}>
        {open.map((it) => (
          <div key={it.addr} className="panel" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {it.image ? (
              <div className="imgWrap" style={{ width: 120 }}>
                <img src={it.image} alt="market" />
              </div>
            ) : null}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{it.description ?? it.addr}</div>
              <div className="addr" style={{ marginTop: 4 }}>{it.addr.slice(0, 10)}…{it.addr.slice(-6)}</div>
            </div>
            <span className="badge skip">Pending</span>
          </div>
        ))}
      </div>
    </main>
  );
}


