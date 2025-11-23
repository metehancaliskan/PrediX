import { ethers } from 'hardhat';

async function main() {
  const Factory = await ethers.getContractFactory('PredictionMarketFactory');
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log('Factory deployed:', factoryAddr);

  const description = 'Galatasaray vs Fenerbahce — Will Galatasaray win this matchup?';
  const tx = await factory.createMarket(description);
  const receipt = await tx.wait();

  const parsed = receipt.logs
    .map((log) => {
      try { return factory.interface.parseLog(log); } catch { return null; }
    })
    .filter(Boolean);

  const created = parsed.find((e: any) => e.name === 'MarketCreated');
  if (!created) throw new Error('MarketCreated event not found');

  const marketAddr = created.args.marketAddress as string;
  console.log('Market deployed:', marketAddr);

  const market = await ethers.getContractAt('PredictionMarket', marketAddr);
  console.log('Market description:', await market.description());
  console.log('Market oracle:', await market.oracle());
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});