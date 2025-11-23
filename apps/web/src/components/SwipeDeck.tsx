'use client';

import { useEffect, useMemo, useState } from 'react';
import TinderCard from 'react-tinder-card';
import { useAccount, useChainId, useSwitchChain, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import PredictionMarketAbi from '../abi/PredictionMarket.json';

type MarketCard = {
  id: string;
  question: string;
  marketAddress?: string;
  imageUrl?: string | null;
  endsAt?: number;
};

export default function SwipeDeck({ amount }: { amount: string }) {
  const [items, setItems] = useState<MarketCard[]>([]);
  const [flash, setFlash] = useState<null | 'WIN' | 'LOSE'>(null);
  const [active, setActive] = useState<number>(0); // index of current card
  const [flipped, setFlipped] = useState<boolean>(false);
  const [insightsCache, setInsightsCache] = useState<Record<string, { last5: string[]; injuries: string[]; home?: string | null; away?: string | null }>>({});
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const REQUIRED_CHAIN_ID = 88888; // Chiliz

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/markets', { cache: 'no-store' });
        const data = await r.json();
        const cards: MarketCard[] = (data?.markets || []).map((m: any) => ({
          id: m.id,
          question: m.description ?? 'Prediction',
          marketAddress: m.market_address ?? undefined,
          imageUrl: m.image_url ?? null,
          endsAt: m.created_at ? Math.floor(new Date(m.created_at).getTime() / 1000) + 86400 : undefined
        }));
        setItems(cards);
        setActive(0);
      } catch {
        setItems([]);
        setActive(0);
      }
    })();
  }, []);

  const current = useMemo(() => {
    if (items.length === 0) return null;
    const i = ((active % items.length) + items.length) % items.length;
    return { card: items[i], index: i } as { card: MarketCard; index: number };
  }, [items, active]);

  // Reset flip state when active card changes
  useEffect(() => {
    setFlipped(false);
  }, [active]);

  const getMockInsights = (title?: string) => {
    const t = (title || '').toLowerCase();
    if (!t) return null;
    if (t.includes('milan') && t.includes('arsenal')) {
      return {
        last5: ['2-1 (MIL-NAP)', '1-1 (MIL-INT)', '0-2 (ARS-MCI)', '3-0 (ARS-BOU)', '2-2 (MIL-ARS)'],
        injuries: ['Leão (thigh)', 'Saka (knock)']
      };
    }
    if ((t.includes('galatasaray') || t.includes('gs')) && (t.includes('fener') || t.includes('fb'))) {
      return {
        last5: ['2-2 (GS-FB)', '3-1 (GS-KON)', '0-0 (FB-BJK)', '1-2 (GS-TS)', '4-0 (FB-ANT)'],
        injuries: ['Icardi (ankle)', 'Fred (hamstring)']
      };
    }
    return { last5: [], injuries: [] };
  };

  const ensureInsights = async (addr?: string, title?: string) => {
    const key = addr || (title || '');
    if (!key) return;
    if (insightsCache[key]) return;
    try {
      let last5: string[] = [];
      let injuries: string[] = [];
      let home: string | null = null;
      let away: string | null = null;
      if (addr) {
        const r = await fetch(`/api/insights?addr=${addr}`, { cache: 'no-store' });
        const j = await r.json();
        last5 = Array.isArray(j.last5) ? j.last5 : [];
        injuries = Array.isArray(j.injuries) ? j.injuries : [];
        home = j.home_team ?? null;
        away = j.away_team ?? null;
      }
      if ((!last5?.length && !injuries?.length) || !addr) {
        const mock = getMockInsights(title);
        if (mock) {
          last5 = mock.last5;
          injuries = mock.injuries;
        }
      }
      setInsightsCache((prev) => ({
        ...prev,
        [key]: { last5, injuries, home, away }
      }));
    } catch {
      const mock = getMockInsights(title);
      if (mock) {
        setInsightsCache((prev) => ({
          ...prev,
          [key]: { last5: mock.last5, injuries: mock.injuries }
        }));
      }
    }
  };

  const onCardClick = async (addr?: string) => {
    if (!flipped) {
      await ensureInsights(addr, current?.card?.question);
    }
    setFlipped((v) => !v);
  };

  const onSwipe = async (direction: string, card: MarketCard) => {
    if (!current || items.length === 0) return;
    if (direction === 'up') { // pass forward
      setActive((i) => (i + 1) % items.length);
      return;
    }
    if (direction === 'down') {
      // previous card
      setActive((i) => (i - 1 + items.length) % items.length);
      return;
    }
    const pick = direction === 'right' ? 'WIN' : direction === 'left' ? 'LOSE' : null;
    if (!pick) return;

    setFlash(pick);
    setTimeout(() => setFlash(null), 900);

    try {
      if (!address) return;
      if (!card?.marketAddress) return;
      const amountStr = String(amount).replace(',', '.');
      if (!amountStr || Number(amountStr) <= 0) return;

      // Ensure connected to required chain
      if (chainId !== REQUIRED_CHAIN_ID && switchChainAsync) {
        await switchChainAsync({ chainId: REQUIRED_CHAIN_ID });
      }

      // On-chain bet
      const functionName = pick === 'WIN' ? 'betWin' : 'betLose';
      const txHash = await writeContractAsync({
        address: card.marketAddress as `0x${string}`,
        abi: PredictionMarketAbi as any,
        functionName,
        args: [],
        value: parseEther(amountStr)
      });

      await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: address,
          market_address: card.marketAddress,
          is_win: pick === 'WIN',
          amount: amountStr
        })
      });
    } catch (e) {
      console.error('positions insert failed', e);
    }
    // Move to next card after a bet
    setActive((i) => (i + 1) % items.length);
  };

  return (
    <div className="deck">
      {flash && (
        <div className={`resultFlash ${flash === 'WIN' ? 'win' : 'lose'}`}>
          {flash}
        </div>
      )}
      {current && (
        <TinderCard
          className="swipe"
          onSwipe={(d) => onSwipe(d, current.card)}
          preventSwipe={[]}
          key={`${current.card.id}-${current.index}-${active}`}
        >
          <article className="card" style={{ zIndex: 100 }} onClick={() => onCardClick(current.card.marketAddress)}>
            <div className={`cardInner ${flipped ? 'flipped' : ''}`}>
              {/* Front face */}
              <div className="cardFace front">
                {current.card.imageUrl ? (
                  <div className="imgWrap">
                    <img src={current.card.imageUrl} alt="prediction" />
                  </div>
                ) : null}
                <div className="cardHeader">
                  <span className="chip">Market</span>
                  <span className="time">{current.card.endsAt ? `Ends: ${new Date(current.card.endsAt * 1000).toLocaleString()}` : ''}</span>
                </div>
                <h3 className="question">{current.card.question}</h3>
                <div className="spacer" />
                <div className="choiceRow">
                  <span className="badge lose">← Lose</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span className="badge skip">↑ Skip</span>
                    <span className="badge skip">↓ Previous</span>
                  </div>
                  <span className="badge win">Win →</span>
                </div>
              </div>
              {/* Back face */}
              <div className="cardFace back">
                <h4 style={{ margin: '4px 0 8px 0' }}>Insights</h4>
                <div className="insightsGrid">
                  <div>
                    <div className="miniTitle">Last 5</div>
                    <ul className="miniList">
                      {(insightsCache[(current.card.marketAddress ?? current.card.question)]?.last5 ?? []).length
                        ? (insightsCache[(current.card.marketAddress ?? current.card.question)]!.last5).slice(0, 5).map((s, i) => (
                            <li key={i}>{s}</li>
                          ))
                        : <li>No data</li>}
                    </ul>
                  </div>
                  <div>
                    <div className="miniTitle">Injuries</div>
                    <ul className="miniList">
                      {(insightsCache[(current.card.marketAddress ?? current.card.question)]?.injuries ?? []).length
                        ? (insightsCache[(current.card.marketAddress ?? current.card.question)]!.injuries).slice(0, 5).map((s, i) => (
                            <li key={i}>{s}</li>
                          ))
                        : <li>No data</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </TinderCard>
      )}
    </div>
  );
}