import '../styles/globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'PrediX',
  description: 'Swipe-based prediction UI (mock)'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>
        {children}
      </body>
    </html>
  );
}


