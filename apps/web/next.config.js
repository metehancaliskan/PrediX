/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['wagmi', '@wagmi/core', '@wagmi/connectors', 'viem', '@rainbow-me/rainbowkit']
};

module.exports = nextConfig;


