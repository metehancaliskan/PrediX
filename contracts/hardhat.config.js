require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const CHILIZ_RPC_URL = process.env.CHILIZ_RPC_URL || '';

const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.24',
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: { chainId: 31337 },
    chiliz: {
      url: CHILIZ_RPC_URL,     
      chainId: 88888,
      accounts
    }
  }
};