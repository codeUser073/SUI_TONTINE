// TODO: Network configuration for Tontine Sui
// Based on the BSA template pattern

export const TESTNET_TONTINE_PACKAGE_ID = "YOUR_PACKAGE_ID_HERE";

// TODO: Add mainnet configuration when ready
export const MAINNET_TONTINE_PACKAGE_ID = "YOUR_MAINNET_PACKAGE_ID_HERE";

// TODO: Network configuration object
export const networkConfig = {
  testnet: {
    tontinePackageId: TESTNET_TONTINE_PACKAGE_ID,
    rpcUrl: "https://fullnode.testnet.sui.io:443",
    explorerUrl: "https://suiexplorer.com/",
  },
  mainnet: {
    tontinePackageId: MAINNET_TONTINE_PACKAGE_ID,
    rpcUrl: "https://fullnode.mainnet.sui.io:443",
    explorerUrl: "https://suiexplorer.com/",
  },
};

// TODO: Get current network from environment
export const getCurrentNetwork = () => {
  return process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet';
};

// TODO: Get package ID for current network
export const getTontinePackageId = () => {
  const network = getCurrentNetwork();
  return networkConfig[network].tontinePackageId;
};
