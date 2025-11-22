'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function WalletConnect() {
  const { address } = useAccount();
  const { connect, connectors, status } = useConnect();
  const { disconnect } = useDisconnect();

  if (address) {
    const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <button className="connect" onClick={() => disconnect()}>
        {short}
      </button>
    );
  }

  const preferred =
    connectors.find((c) => c.id === 'injected' && c.ready) ?? connectors[0];

  const onClick = () => {
    if (preferred) connect({ connector: preferred });
  };

  return (
    <button
      className="connect"
      onClick={onClick}
      disabled={status === 'pending'}
    >
      {status === 'pending' ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}


