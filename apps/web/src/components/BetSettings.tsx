'use client';

type Props = {
  amount: string;
  onChange: (v: string) => void;
  bare?: boolean;
};

export default function BetSettings({ amount, onChange, bare }: Props) {
  const content = (
    <>
      <h3 className="panelTitle">Prediction Settings</h3>
      <div className="field">
        <label className="label">Bet Amount (CHZ)</label>
        <div className="row">
          <input
            className="input"
            type="number"
            min="0"
            step="1"
            value={amount}
            onChange={(e) => onChange(e.target.value)}
            placeholder="100"
          />
          <span className="suffix">CHZ</span>
        </div>
      </div>
    </>
  );
  if (bare) return content as any;
  return <div className="panel">{content}</div>;
}


