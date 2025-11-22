/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['wagmi', '@wagmi/core', '@wagmi/connectors', 'viem']
};

module.exports = nextConfig;


