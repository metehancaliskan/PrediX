'use client';

import Link from 'next/link';

export default function Header({
  collapsed,
  onToggle,
  showToggle = true
}: {
  collapsed: boolean;
  onToggle: () => void;
  showToggle?: boolean;
}) {
  return (
    <header className={`topBar${showToggle ? '' : ' plain'}`}>
      {showToggle && (
        <button
          className="toggleBtn"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ marginLeft: 8 }}
        >
          {collapsed ? '›' : '‹'}
        </button>
      )}
      <nav
        className="nav"
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 16,
          alignItems: 'center'
        }}
      >
        <Link href="/explore" className="badge navBtn" style={{ textDecoration: 'none' }}>
          Explore
        </Link>
        <Link href="/claim" className="badge navBtn" style={{ textDecoration: 'none' }}>
          Claim
        </Link>
      </nav>
    </header>
  );
}


