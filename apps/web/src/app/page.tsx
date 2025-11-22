import SwipeDeck from '../components/SwipeDeck';
import TopBar from '../components/TopBar';

export default function Page() {
  return (
    <main className="container">
      <TopBar />
      <div className="deckWrapper">
        <SwipeDeck />
      </div>
    </main>
  );
}


