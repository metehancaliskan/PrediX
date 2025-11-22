'use client';

import type { ReactNode } from 'react';
import { WagmiProvider, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defineChain } from 'viem';
import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit';

const chiliz = defineChain({
  id: 88888,
  name: 'Chiliz Chain',
  nativeCurrency: { name: 'Chiliz', symbol: 'CHZ', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.chiliz.com'] },
    public: { http: ['https://rpc.chiliz.com'] }
  },
  blockExplorers: {
    default: { name: 'ChilizScan', url: 'https://chiliscan.com' }
  }
});

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

const config = getDefaultConfig({
  appName: 'PrediX',
  projectId,
  chains: [chiliz],
  transports: {
    [chiliz.id]: http('https://rpc.chiliz.com')
  },
  ssr: true
});

const queryClient = new QueryClient();

export function WagmiProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={chiliz}
          theme={darkTheme({
            accentColor: '#22c55e',
            borderRadius: 'large'
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


