'use client';

type Chip = {
  id: string;
  label: string;
};

const DEFAULT_CHIPS: Chip[] = [
  { id: 'live', label: 'Live' },
  { id: 'all', label: 'All Markets' },
  { id: 'de', label: 'Germany' },
  { id: 'es', label: 'Spain' }
];

export default function FilterBar({
  activeId,
  onChange,
  chips = DEFAULT_CHIPS
}: {
  activeId: string;
  onChange: (id: string) => void;
  chips?: Chip[];
}) {
  return (
    <div className="filterBar">
      {chips.map((c) => {
        const active = c.id === activeId;
        return (
          <button
            key={c.id}
            className={`chipBtn ${active ? 'active' : ''}`}
            onClick={() => onChange(c.id)}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}


