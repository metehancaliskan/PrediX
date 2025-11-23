'use client';

import SwipeDeck from './SwipeDeck';

export default function MarketPanel({ amount }: { amount: string }) {
  return (
    <section className="marketPanel">
      <SwipeDeck amount={amount} />
    </section>
  );
}


