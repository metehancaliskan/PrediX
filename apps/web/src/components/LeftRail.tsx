'use client';

import WalletConnect from './WalletConnect';
import { useAccount, useBalance } from 'wagmi';
import BetSettings from './BetSettings';

export default function LeftRail({ amount, onChange }: { amount: string; onChange: (v: string) => void }) {
  const { address } = useAccount();
  const { data: bal, isLoading } = useBalance({
    address: address as `0x${string}` | undefined
  });

  return (
    <aside className="leftPanel">
      <div className="leftPlain">
        <div className="panelTitle" style={{ marginBottom: 8 }}>Wallet</div>
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

        <div className="divider" />

        <BetSettings amount={amount} onChange={onChange} bare />
      </div>
    </aside>
  );
}


