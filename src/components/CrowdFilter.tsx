import { CrowdLevel } from '@/data/places';
import { cn } from '@/lib/utils';

interface CrowdFilterProps {
  selectedLevels: CrowdLevel[];
  onChange: (levels: CrowdLevel[]) => void;
}

export function CrowdFilter({ selectedLevels, onChange }: CrowdFilterProps) {
  const toggleLevel = (level: CrowdLevel) => {
    if (selectedLevels.includes(level)) {
      onChange(selectedLevels.filter(l => l !== level));
    } else {
      onChange([...selectedLevels, level]);
    }
  };

  const levels: { level: CrowdLevel; label: string; bgClass: string; activeClass: string }[] = [
    { level: 'low', label: 'Low', bgClass: 'bg-green-100 text-green-700 border-green-200', activeClass: 'bg-green-500 text-white border-green-500' },
    { level: 'medium', label: 'Medium', bgClass: 'bg-yellow-100 text-yellow-700 border-yellow-200', activeClass: 'bg-yellow-500 text-white border-yellow-500' },
    { level: 'high', label: 'High', bgClass: 'bg-red-100 text-red-700 border-red-200', activeClass: 'bg-red-500 text-white border-red-500' },
  ];

  return (
    <div className="flex gap-2">
      {levels.map(({ level, label, bgClass, activeClass }) => {
        const isActive = selectedLevels.includes(level);
        return (
          <button
            key={level}
            onClick={() => toggleLevel(level)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
              isActive ? activeClass : bgClass,
              'hover:opacity-90'
            )}
          >
            {isActive && '✓ '}{label}
          </button>
        );
      })}
    </div>
  );
}
