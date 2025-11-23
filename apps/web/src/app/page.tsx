'use client';

import SwipeDeck from '../components/SwipeDeck';
import TopBar from '../components/TopBar';
import BetSettings from '../components/BetSettings';
import { useState } from 'react';

export default function Page() {
  const [amount, setAmount] = useState<string>('0.05'); // CHZ
  return (
    <main className="container">
      <TopBar />
      <div className="layoutGrid">
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


