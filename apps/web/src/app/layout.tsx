import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { ReactNode } from 'react';
import { WagmiProviders } from '../providers/WagmiProviders';

export const metadata = {
  title: 'PrediX',
  description: 'Swipe-based prediction UI (mock)'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <WagmiProviders>
          {children}
        </WagmiProviders>
      </body>
    </html>
  );
}


