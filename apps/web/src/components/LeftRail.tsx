'use client';

import WalletConnect from './WalletConnect';
import { useAccount, useBalance } from 'wagmi';

export default function LeftRail() {
  const { address } = useAccount();
  const { data: bal, isLoading } = useBalance({
    address: address as `0x${string}` | undefined,
    watch: true
  });

  return (
    <aside className="leftPanel">
      <div className="panel" style={{ marginBottom: 12 }}>
        <div className="panelTitle">Wallet</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <WalletConnect />
        </div>
        {address ? (
          <div className="balanceWrap" style={{ marginTop: 12 }}>
            <div className="label" style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 4 }}>Balance</div>
            <div
              className="balanceValue"
              style={{ fontSize: 20, fontWeight: 800, letterSpacing: .3, lineHeight: 1.1 }}
              title={bal?.value ? bal.value.toString() : ''}
            >
              {isLoading
                ? '…'
                : `${Number(bal?.formatted ?? 0).toLocaleString(undefined, {
                    maximumFractionDigits: 2
                  })} ${bal?.symbol ?? 'CHZ'}`}
            </div>
          </div>
        ) : null}
      </div>
      <div className="panel">
        <div className="panelTitle">Filters</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span className="badge" style={{ cursor: 'default' }}>All</span>
          <span className="badge" style={{ cursor: 'default' }}>Football</span>
          <span className="badge" style={{ cursor: 'default' }}>Crypto</span>
          <span className="badge" style={{ cursor: 'default' }}>Esports</span>
        </div>
      </div>
    </aside>
  );
}


