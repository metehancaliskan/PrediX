/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useMemo, useState } from 'react';
import TinderCard from 'react-tinder-card';

type Prediction = {
  id: string;
  title: string;
  endsAt: number;
  details?: string;
};

export default function SwipeDeck() {
  const [items, setItems] = useState<Prediction[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/predictions');
        const data = await r.json();
        setItems(data.predictions);
      } catch {
        setItems([
          { id: '1', title: 'BTC 24 saat içinde +%2 kapanır mı?', endsAt: Math.floor(Date.now() / 1000) + 86400 },
          { id: '2', title: 'ETH haftayı $4k üstünde kapatır mı?', endsAt: Math.floor(Date.now() / 1000) + 604800 }
        ]);
      }
    })();
  }, []);

  const cards = useMemo(() => items.slice(0, 10), [items]);

  const onSwipe = (direction: string, id: string) => {
    const pick = direction === 'right' ? 'WIN' : direction === 'left' ? 'LOSE' : null;
    if (!pick) return;
    // UI-only: burada sadece console.log ile gösteriyoruz
    // Sonraki aşamada kontrata bet yazımı entegre edilecek.
    // eslint-disable-next-line no-console
    console.log('picked', { id, pick });
  };

  return (
    <div className="deck">
      {cards.map((p, idx) => (
        <TinderCard
          className="swipe"
          onSwipe={(d) => onSwipe(d, p.id)}
          preventSwipe={['up', 'down']}
          key={p.id}
        >
          <article className="card" style={{ zIndex: 100 - idx }}>
            <div className="cardHeader">
              <span className="chip">Prediction</span>
              <span className="time">
                Ends: {new Date(p.endsAt * 1000).toLocaleString()}
              </span>
            </div>
            <h3 className="question">{p.title}</h3>
            <div className="spacer" />
            <div className="hint">Swipe Right = Win, Left = Lose</div>
          </article>
        </TinderCard>
      ))}
    </div>
  );
}


