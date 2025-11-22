import { ethers } from 'hardhat';

async function main() {
  const marketAddr = '0xf8A04186165fE933C08a29da5aFa6eeB3d3E1A20'; // hedef market adresi
  const market = await ethers.getContractAt('PredictionMarket', marketAddr);

  // Güvenli taraf: çağıran oracle mı?
  const [signer] = await ethers.getSigners();
  const caller = await signer.getAddress();
  const oracle = await market.oracle();
  if (caller.toLowerCase() !== oracle.toLowerCase()) {
    throw new Error(`Current signer is not oracle. Caller=${caller}, Oracle=${oracle}`);
  }

  // Outcome enum: { Undecided=0, Win=1, Lose=2, InvalidOutcome=3 }
  const tx = await market.settleMarket(2); // Lose
  const receipt = await tx.wait();
  console.log('Settled to Lose. tx:', receipt.hash);

  const outcome = await market.marketOutcome();
  console.log('marketOutcome (enum):', outcome.toString()); // 2 ise Lose
}

main().catch((e) => { console.error(e); process.exitCode = 1; });