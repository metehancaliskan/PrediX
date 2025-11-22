import { ethers } from 'hardhat';

async function betWin() {
  const marketAddr = '0xf8A04186165fE933C08a29da5aFa6eeB3d3E1A20';
  const market = await ethers.getContractAt('PredictionMarket', marketAddr);

  const tx = await market.betWin({ value: ethers.parseEther('5') });
  const r = await tx.wait();
  console.log('Bet tx hash:', r.hash);
}

betWin().catch((e) => { console.error(e); process.exitCode = 1; });