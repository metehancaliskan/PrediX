'use client';

type Chip = { id: string; label: string };
const DEFAULT_CHIPS: Chip[] = [
  { id: 'all', label: 'All Markets' },
  { id: 'football', label: 'Football' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'esports', label: 'Esports' }
];

export default function FiltersBar({
  chips = DEFAULT_CHIPS,
  active = 'all',
  onChange
}: {
  chips?: Chip[];
  active?: string;
  onChange?: (id: string) => void;
}) {
  return (
    <div className="filtersBar">
      {chips.map((c) => (
        <button
          key={c.id}
          className={`chip ${active === c.id ? 'chipActive' : ''}`}
          onClick={() => onChange?.(c.id)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}


