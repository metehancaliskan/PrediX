const { ethers } = require('hardhat');


const FACTORY_ADDR =
  process.env.FACTORY_ADDR ||
  '0x95Ef99dbFFC5398337f598Bcf68cF374f1CF69f6';

const DESCRIPTIONS = [
  'Galatasaray vs Fenerbahce — Will Galatasaray win this matchup?',
  'Manchester City vs Paris Saint-Germain — Will Manchester City win this matchup?',
  'AC Milan vs Arsenal — Will AC Milan win this matchup?'
];

async function createOne(factory: any, description: string) {
  const tx = await factory.createMarket(description);
  const receipt = await tx.wait();

  const parsed = receipt.logs
    .map((log: any) => {
      try { return factory.interface.parseLog(log); } catch { return null; }
    })
    .filter(Boolean);

  const created = parsed.find((e: any) => e.name === 'MarketCreated');
  if (!created) throw new Error('MarketCreated event not found');

  const marketAddr = created.args.marketAddress as string;
  console.log(`Created: "${description}" -> ${marketAddr}`);
  return marketAddr;
}

async function main() {
  const [signer] = await ethers.getSigners();
  console.log('Signer:', await signer.getAddress());
  console.log('Using factory:', FACTORY_ADDR);

  const factory = await ethers.getContractAt('PredictionMarketFactory', FACTORY_ADDR, signer);

  const addresses: string[] = [];
  for (const d of DESCRIPTIONS) {
    const addr = await createOne(factory, d);
    addresses.push(addr);
  }
  console.log('All markets:', addresses);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });