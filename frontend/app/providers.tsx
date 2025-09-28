"use client";
import '@mysten/dapp-kit/dist/index.css';
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createNetworkConfig } from '@mysten/dapp-kit';
import { useState } from "react";
import { Toaster } from "./components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  const { networkConfig } = createNetworkConfig({
    testnet: {
      url: 'https://fullnode.testnet.sui.io:443',
    },
    mainnet: {
      url: 'https://fullnode.mainnet.sui.io:443',
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          {children}
          <Toaster />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}