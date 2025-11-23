"use client";

import { useState } from 'react';
import { usePublicClient, useWriteContract } from 'wagmi';
import PredictionMarketAbi from '../../abi/PredictionMarket.json';

export default function SettleClient({ marketAddress }: { marketAddress: string }) {
  const [outcome, setOutcome] = useState<number>(1);
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();

  const settle = async () => {
    if (!outcome || ![1, 2, 3].includes(outcome)) {
      alert('Outcome 1=Win, 2=Lose, 3=Invalid');
      return;
    }
    if (!marketAddress || !marketAddress.startsWith('0x')) {
      alert('Invalid market address');
      return;
    }
    try {
      const txHash = await writeContractAsync({
        address: marketAddress as `0x${string}`,
        abi: PredictionMarketAbi as any,
        functionName: 'settleMarket',
        args: [BigInt(outcome)]
      });

      // Wait for on-chain confirmation before updating DB
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      await fetch('/api/admin/settle-positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketAddress })
      });
      await fetch('/api/admin/settle-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketAddress, isSettled: true })
      });

      alert('Settled & DB updated!');
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert(e?.shortMessage || e?.message || 'Error');
    }
  };

  return (
    <div className="leftNavSection">
      <div className="sectionTitle">Outcome (1=Win, 2=Lose, 3=Invalid)</div>
      <div className="row">
        <input
          className="input"
          type="number"
          min={1}
          max={3}
          value={outcome}
          onChange={(e) => setOutcome(Number(e.target.value))}
          style={{ width: 120 }}
        />
        <button className="connect" onClick={settle} disabled={isPending}>
          {isPending ? 'Settling…' : 'Settle'}
        </button>
      </div>
    </div>
  );
}
