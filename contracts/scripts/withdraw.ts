import { ethers } from 'hardhat';



async function main() {
  // Set your target market address
  const marketAddr = '0xf8A04186165fE933C08a29da5aFa6eeB3d3E1A20';

  // Connect as the current signer (the wallet with winnings)
  const [signer] = await ethers.getSigners();
  console.log('Caller:', await signer.getAddress());

  const market = await ethers.getContractAt('PredictionMarket', marketAddr, signer);

  // Optional: quick checks
  const isSettled = await market.isSettled();
  console.log('isSettled:', isSettled.toString());
  console.log('marketOutcome:', (await market.marketOutcome()).toString());

  // Withdraw winnings
  const tx = await market.withdrawWinnings();
  const receipt = await tx.wait();
  console.log('Withdraw tx hash:', receipt.hash);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });