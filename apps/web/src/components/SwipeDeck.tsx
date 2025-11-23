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
  const [active, setActive] = useState<number>(0); // index of current card
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

  const onSwipe = async (direction: string, card: MarketCard) => {
    if (!current || items.length === 0) return;
    if (direction === 'up') { // pass forward
      setActive((i) => (i + 1) % items.length);
      return;
    }
    if (direction === 'down') { // pass backward
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
          <article className="card" style={{ zIndex: 100 }}>
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
            {current.card.marketAddress ? (
              <div className="addr">Addr: {current.card.marketAddress.slice(0, 6)}…{current.card.marketAddress.slice(-4)}</div>
            ) : null}

            <div className="spacer" />
            <div className="choiceRow">
              <span className="badge lose">← Lose</span>
              <span className="badge skip">↑ Skip</span>
              <span className="badge win">Win →</span>
            </div>
          </article>
        </TinderCard>
      )}
    </div>
  );
}