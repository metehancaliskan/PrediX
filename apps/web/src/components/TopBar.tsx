import WalletConnect from './WalletConnect';

export default function TopBar() {
  return (
    <header className="topBar">
      <div className="brand">
        <span className="logo">🎰</span>
        <span>PrediX</span>
      </div>
      <WalletConnect />
    </header>
  );
}


