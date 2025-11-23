'use client';

import type { CSSProperties } from 'react';
import LeftSection from './LeftSection';
import Image from 'next/image';

export default function Sidebar({
  amount,
  onChange,
  collapsed,
  onToggle
}: {
  amount: string;
  onChange: (v: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="sidebar">
      <div className="sidebarHeader">
        <Image
          src="/predix_logo.png"
          alt="PrediX"
          width={collapsed ? 40 : 160}
          height={collapsed ? 40 : 32}
          style={{ height: collapsed ? 40 : 32, width: 'auto' }}
        />
        <button className="toggleBtn" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? '›' : '‹'}
        </button>
      </div>
      {!collapsed && <LeftSection amount={amount} onChange={onChange} />}
    </div>
  );
}


