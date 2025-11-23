import Link from 'next/link';

export default function TopBar() {
  return (
    <header className="topBar" style={{ position: 'relative' }}>
      <div className="brand" />
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
        <Link
          href="/explore"
          className="badge"
          style={{ textDecoration: 'none', fontSize: 16, fontWeight: 700, padding: '10px 16px' }}
        >
          Explore
        </Link>
        <Link
          href="/claim"
          className="badge"
          style={{ textDecoration: 'none', fontSize: 16, fontWeight: 700, padding: '10px 16px' }}
        >
          Claim
        </Link>
      </nav>
    </header>
  );
}


