'use client';

import FilterBar from '../../components/FilterBar';
import MarketPanel from '../../components/MarketPanel';
import { useState } from 'react';
import Header from '../../components/Header';
import Image from 'next/image';
import WalletConnect from '../../components/WalletConnect';
import { useAccount, useBalance } from 'wagmi';

export default function ExplorePage() {
  const [amount, setAmount] = useState<string>('100'); // CHZ default
  const [activeFilter, setActiveFilter] = useState<string>('live');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { address } = useAccount();
  const { data: bal } = useBalance({
    address: address as `0x${string}` | undefined
  });
  return (
    <>
      <main className={`container withLeftNav ${collapsed ? 'collapsed' : ''}`}>
        <aside className="leftNav">
          <div className="leftNav-inner">
            <div className="leftNavHeader">
              <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Image src="/predix_logo.png" alt="PrediX" width={120} height={32} style={{ height: 32, width: 'auto' }} />
              </div>
              <button
                className="toggleBtn"
                onClick={() => setCollapsed((v) => !v)}
                aria-label={collapsed ? 'Expand navbar' : 'Collapse navbar'}
                title={collapsed ? 'Expand' : 'Collapse'}
              >
                {collapsed ? '›' : '‹'}
              </button>
            </div>
            <div className="leftNav-content">
              <div className="leftNavSection">
                <div className="sectionTitle">Wallet</div>
                <WalletConnect />
                {address ? (
                  <div style={{ marginTop: 10 }}>
                    <div className="label" style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 4 }}>Balance</div>
                    <div style={{ fontWeight: 800 }}>
                      {Number(bal?.formatted ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} {bal?.symbol ?? 'CHZ'}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="leftNavSection">
                <div className="sectionTitle">Prediction Amount</div>
                <div className="row">
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                  />
                  <span className="suffix">CHZ</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
        <div className="pageContent">
          <Header collapsed={false} onToggle={() => {}} showToggle={false} />
          <div className="contentCenter">
            <FilterBar activeId={activeFilter} onChange={setActiveFilter} />
            <MarketPanel amount={amount} />
          </div>
        </div>
      </main>
    </>
  );
}


