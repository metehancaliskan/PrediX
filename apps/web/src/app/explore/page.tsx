'use client';

import SwipeDeck from '../../components/SwipeDeck';
import TopBar from '../../components/TopBar';
import BetSettings from '../../components/BetSettings';
import LeftRail from '../../components/LeftRail';
import { useState } from 'react';

export default function ExplorePage() {
  const [amount, setAmount] = useState<string>('0.05'); // CHZ
  return (
    <main className="container">
      <TopBar />
      <div className="layoutGrid">
        <LeftRail />
        <div className="deckWrapper">
          <SwipeDeck amount={amount} />
        </div>
        <aside className="sidePanel">
          <BetSettings amount={amount} onChange={setAmount} />
        </aside>
      </div>
    </main>
  );
}


