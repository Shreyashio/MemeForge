import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    // Suppress warnings from optional wagmi peer deps that aren't installed
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      "@walletconnect/ethereum-provider": false,
      "@safe-global/safe-apps-sdk": false,
      "@safe-global/safe-apps-provider": false,
      "@coinbase/wallet-sdk": false,
      "@metamask/connect-evm": false,
      "@base-org/account": false,
      accounts: false,
    };
    return config;
  },
};

export default nextConfig;
