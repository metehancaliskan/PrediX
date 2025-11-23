'use client';

import SwipeDeck from './SwipeDeck';
import FiltersBar from './FiltersBar';

export default function RightSection({ amount }: { amount: string }) {
  return (
    <div className="rightPanel">
      <FiltersBar />
      <div className="deckWrapper">
        <SwipeDeck amount={amount} />
      </div>
    </div>
  );
}


