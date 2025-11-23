'use client';

type Props = {
  amount: string;
  onChange: (v: string) => void;
};

export default function BetSettings({ amount, onChange }: Props) {
  return (
    <div className="panel">
      <h3 className="panelTitle">Trading Settings</h3>
      <div className="field">
        <label className="label">Amount per Trade (CHZ)</label>
        <div className="row">
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => onChange(e.target.value)}
          />
          <span className="suffix">CHZ</span>
        </div>
        <input
          className="slider"
          type="range"
          min="0.01"
          max="5"
          step="0.01"
          value={Number(amount) || 0}
          onChange={(e) => onChange(e.target.value)}
        />
        <p className="help">Swipe right = Win, left = Lose. This amount will be used for each bet.</p>
      </div>
    </div>
  );
}


