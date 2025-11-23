'use client';

import Header from '../../components/Header';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { useEffect, useMemo, useState } from 'react';
import PredictionMarketAbi from '../../abi/PredictionMarket.json';
import { formatEther } from 'viem';

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
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending } = useWriteContract();
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [markets, setMarkets] = useState<MarketRow[]>([]);
  const [payouts, setPayouts] = useState<Record<string, string>>({}); // addr -> formatted amount
  const [payoutsWei, setPayoutsWei] = useState<Record<string, bigint>>({}); // addr -> raw amount

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

  // Load on-chain claimable amount per market
  useEffect(() => {
    if (!address || !publicClient) return;
    if (claimable.length === 0) { setPayouts({}); return; }

    (async () => {
      const next: Record<string, string> = {};
      const nextWei: Record<string, bigint> = {};
      for (const it of claimable) {
        const addr = it.addr;
        try {
          const [isSettled, outcome, totalWin, totalLose, userWin, userLose, balance] = await Promise.all([
            publicClient.readContract({ address: addr, abi: PredictionMarketAbi as any, functionName: 'isSettled', args: [] }) as Promise<boolean>,
            publicClient.readContract({ address: addr, abi: PredictionMarketAbi as any, functionName: 'marketOutcome', args: [] }) as Promise<number>,
            publicClient.readContract({ address: addr, abi: PredictionMarketAbi as any, functionName: 'totalWinBets', args: [] }) as Promise<bigint>,
            publicClient.readContract({ address: addr, abi: PredictionMarketAbi as any, functionName: 'totalLoseBets', args: [] }) as Promise<bigint>,
            publicClient.readContract({ address: addr, abi: PredictionMarketAbi as any, functionName: 'winBets', args: [address] }) as Promise<bigint>,
            publicClient.readContract({ address: addr, abi: PredictionMarketAbi as any, functionName: 'loseBets', args: [address] }) as Promise<bigint>,
            publicClient.getBalance({ address: addr })
          ]);

          if (!isSettled) continue;
          let payout: bigint = 0n;
          // Outcome enum: 0=Undecided, 1=Win, 2=Lose, 3=InvalidOutcome
          if (outcome === 1 && userWin > 0n && totalWin > 0n) {
            payout = (balance * userWin) / totalWin;
          } else if (outcome === 2 && userLose > 0n && totalLose > 0n) {
            payout = (balance * userLose) / totalLose;
          } else if (outcome === 3) {
            payout = userWin + userLose;
          }
          if (payout > 0n) {
            next[addr] = `${Number(formatEther(payout)).toLocaleString(undefined, { maximumFractionDigits: 6 })} CHZ`;
            nextWei[addr] = payout;
          }
        } catch {
          // ignore per-market errors
        }
      }
      setPayouts(next);
      setPayoutsWei(nextWei);
    })();
  }, [address, publicClient, claimable]);

  const totalClaimableFmt = useMemo(() => {
    let sum: bigint = 0n;
    for (const v of Object.values(payoutsWei)) sum += v;
    if (sum <= 0n) return null;
    return `${Number(formatEther(sum)).toLocaleString(undefined, { maximumFractionDigits: 6 })} CHZ`;
  }, [payoutsWei]);

  const withdraw = async (addr: `0x${string}`) => {
    try {
      const txHash = await writeContractAsync({
        address: addr,
        abi: PredictionMarketAbi as any,
        functionName: 'withdrawWinnings',
        args: []
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      // Mark claimed in Supabase for this wallet and market
      if (address) {
        await fetch('/api/positions/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_address: address, market_address: addr })
        });
      }

      // Refresh positions after withdraw
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
    <>
      <main className="container">
        <Header collapsed={false} onToggle={() => {}} showToggle={false} />
        <h2 style={{ margin: '12px 0 16px 0' }}>Claim your bets</h2>
        {totalClaimableFmt && (
          <div className="panel" style={{ marginBottom: 12, fontWeight: 700 }}>
            Total claimable: {totalClaimableFmt}
          </div>
        )}
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
                {payouts[it.addr] && (
                  <div className="label" style={{ marginTop: 6, color: 'var(--gold)' }}>Claimable: {payouts[it.addr]}</div>
                )}
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
              </div>
              <span className="badge skip">Pending</span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}


