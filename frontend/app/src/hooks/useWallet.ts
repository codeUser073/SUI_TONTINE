'use client';

import {
  useCurrentWallet,
  useCurrentAccount,
  useConnectWallet,
  useDisconnectWallet,
  useSuiClient,
  useSignAndExecuteTransaction,
  useSignTransaction,
  // useWallets, // <- si tu veux lister/choisir une wallet précise
} from '@mysten/dapp-kit';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

export interface WalletBalance {
  sui: string;
  mist: string;
  usdc?: string;
  usdt?: string;
}

export interface WalletInfo {
  address: string;
  walletName: string;
  isConnected: boolean;
  publicKey?: string;
}

export const useWalletInfo = () => {
  const { currentWallet, isConnected, isConnecting, connectionStatus } = useCurrentWallet();
  const account = useCurrentAccount(); // ✅ plus simple que currentWallet.accounts[0]
  const { mutate: connect, isPending: isConnectingWallet } = useConnectWallet();
  const { mutate: disconnect, isPending: isDisconnectingWallet } = useDisconnectWallet();
  const { mutate: signAndExecute, isPending: isExecutingTransaction } = useSignAndExecuteTransaction();
  const { mutate: signTransaction, isPending: isSigningTransaction } = useSignTransaction();
  const suiClient = useSuiClient();

  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Compte courant (string)
  const currentAccount = useMemo(() => account ?? null, [account]);

  // Recharger le solde quand l'adresse change
  useEffect(() => {
    if (currentAccount?.address && isConnected) {
      void loadBalance();
    } else {
      setBalance(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount?.address, isConnected]);

  // ✅ Connexion : OUVRIR le sélecteur de wallet
  const connectWallet = useCallback(async () => {
    try {
       // ne passe rien -> ouvre le flow standard
      // Si tu veux forcer une wallet précise :
      // connect({ wallet: '<WALLET_ID>' });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, [connect]);

  // ✅ Déconnexion
  const disconnectWallet = useCallback(async () => {
    try {
      disconnect();
      setBalance(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }, [disconnect]);

  // Raccourcir l’adresse
  const getShortAddress = useCallback((address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  // Charger le solde
  const loadBalance = useCallback(async () => {
    if (!currentAccount?.address) return null;

    setIsLoadingBalance(true);
    try {
      const address = currentAccount.address;

      // SUI
      const suiBalance = await suiClient.getBalance({
        owner: address,
        coinType: SUI_TYPE_ARG,
      });

      // USDC (placeholder — à remplacer par le vrai coin type si tu en as besoin)
      let usdcBalance = null;
      try {
        usdcBalance = await suiClient.getBalance({
          owner: address,
          coinType: 'REPLACE_WITH_USDC_COIN_TYPE',
        });
      } catch {}

      // USDT (placeholder)
      let usdtBalance = null;
      try {
        usdtBalance = await suiClient.getBalance({
          owner: address,
          coinType: 'REPLACE_WITH_USDT_COIN_TYPE',
        });
      } catch {}

      const balanceData: WalletBalance = {
        sui: (parseInt(suiBalance.totalBalance) / 1e9).toFixed(4),
        mist: suiBalance.totalBalance,
        usdc: usdcBalance ? (parseInt(usdcBalance.totalBalance) / 1e6).toFixed(2) : undefined,
        usdt: usdtBalance ? (parseInt(usdtBalance.totalBalance) / 1e6).toFixed(2) : undefined,
      };

      setBalance(balanceData);
      return balanceData;
    } catch (error) {
      console.error('Failed to get account balance:', error);
      setBalance(null);
      return null;
    } finally {
      setIsLoadingBalance(false);
    }
  }, [currentAccount?.address, suiClient]);

  const getAccountBalance = useCallback(() => balance, [balance]);

  const getWalletInfo = useCallback((): WalletInfo | null => {
    if (!currentAccount?.address) return null;
    return {
      address: currentAccount.address,
      walletName: currentWallet?.name || 'Unknown',
      isConnected,
      publicKey: currentAccount.publicKey ? Buffer.from(currentAccount.publicKey).toString('hex') : undefined,
    };
  }, [currentAccount, currentWallet, isConnected]);

  const sendSui = useCallback(async (recipient: string, amount: string) => {
    if (!currentAccount?.address) throw new Error('No wallet connected');
    try {
      const tx = new Transaction();
      const mist = BigInt(Math.floor(Number(amount) * 1e9)); // sécurise la conversion
      const [coin] = tx.splitCoins(tx.gas, [mist]);
      tx.transferObjects([coin], recipient);
      await signAndExecute({ transaction: tx });
      await loadBalance();
    } catch (error) {
      console.error('Failed to send SUI:', error);
      throw error;
    }
  }, [currentAccount?.address, signAndExecute, loadBalance]);

  const executeTransaction = useCallback(async (transaction: Transaction) => {
    if (!currentAccount?.address) throw new Error('No wallet connected');
    try {
      await signAndExecute({ transaction });
      await loadBalance();
    } catch (error) {
      console.error('Failed to execute transaction:', error);
      throw error;
    }
  }, [currentAccount?.address, signAndExecute, loadBalance]);

  const signTransactionOnly = useCallback(async (transaction: Transaction) => {
    if (!currentAccount?.address) throw new Error('No wallet connected');
    try {
      return await signTransaction({ transaction });
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  }, [currentAccount?.address, signTransaction]);

  const getTransactionHistory = useCallback(async (limit = 10) => {
    if (!currentAccount?.address) return [];
    try {
      const transactions = await suiClient.queryTransactionBlocks({
        filter: { FromAddress: currentAccount.address },
        options: { showInput: true, showEffects: true, showEvents: true },
        limit,
      });
      return transactions.data;
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }, [currentAccount?.address, suiClient]);

  const hasFeature = useCallback(
    (feature: string) => !!currentWallet?.features && feature in currentWallet.features,
    [currentWallet]
  );

  const getNetworkInfo = useCallback(() => {
    // Tu peux aussi utiliser SuiClient pour récupérer des infos réelles si besoin
    return { name: 'Sui Network', chainId: 'sui' };
  }, []);

  return {
    // état
    currentWallet,
    currentAccount,
    isConnected,
    isConnecting: isConnecting || isConnectingWallet,
    isDisconnecting: isDisconnectingWallet,
    connectionStatus,

    // balance
    balance,
    isLoadingBalance,

    // actions
    connectWallet,
    disconnectWallet,
    loadBalance,

    // tx
    sendSui,
    executeTransaction,
    signTransactionOnly,
    isExecutingTransaction,
    isSigningTransaction,

    // utils
    getShortAddress,
    getAccountBalance,
    getWalletInfo,
    getTransactionHistory,
    hasFeature,
    getNetworkInfo,

    // accès direct (si besoin)
    connect,
    disconnect,
    signAndExecute,
    signTransaction,
    suiClient,
  };
};