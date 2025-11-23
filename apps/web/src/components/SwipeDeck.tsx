'use client';

import { useEffect, useMemo, useState } from 'react';
import TinderCard from 'react-tinder-card';
import { useAccount } from 'wagmi';

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
  const { address } = useAccount();

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
      } catch {
        setItems([]);
      }
    })();
  }, []);

  const cards = useMemo(() => items.slice(0, 10), [items]);

  const onSwipe = async (direction: string, idx: number) => {
    if (direction === 'up') {
      // Skip: do nothing other than moving to next card
      return;
    }
    const pick = direction === 'right' ? 'WIN' : direction === 'left' ? 'LOSE' : null;
    if (!pick) return;

    const card = cards[idx];
    setFlash(pick);
    setTimeout(() => setFlash(null), 900);

    try {
      if (!address) return;
      if (!card?.marketAddress) return;
      if (!amount || Number(amount) <= 0) return;

      await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: address,
          market_address: card.marketAddress,
          is_win: pick === 'WIN',
          amount: String(amount)
        })
      });
    } catch (e) {
      console.error('positions insert failed', e);
    }
  };

  return (
    <div className="deck">
      {flash && (
        <div className={`resultFlash ${flash === 'WIN' ? 'win' : 'lose'}`}>
          {flash}
        </div>
      )}
      {cards.map((p, idx) => (
        <TinderCard
          className="swipe"
          onSwipe={(d) => onSwipe(d, idx)}
          preventSwipe={['down']}
          key={p.id}
        >
          <article className="card" style={{ zIndex: 100 - idx }}>
            {p.imageUrl ? (
              <div className="imgWrap">
                <img src={p.imageUrl} alt="prediction" />
              </div>
            ) : null}

            <div className="cardHeader">
              <span className="chip">Market</span>
              <span className="time">{p.endsAt ? `Ends: ${new Date(p.endsAt * 1000).toLocaleString()}` : ''}</span>
            </div>

            <h3 className="question">{p.question}</h3>
            {p.marketAddress ? (
              <div className="addr">Addr: {p.marketAddress.slice(0, 6)}…{p.marketAddress.slice(-4)}</div>
            ) : null}

            <div className="spacer" />
            <div className="choiceRow">
              <span className="badge lose">← Lose</span>
              <span className="badge skip">↑ Skip</span>
              <span className="badge win">Win →</span>
            </div>
          </article>
        </TinderCard>
      ))}
    </div>
  );
}