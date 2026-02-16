import { usePetStore } from '@/store/petStore';
import { motion } from 'framer-motion';

const STATS = [
  { key: 'hunger' as const, emoji: '🍔', label: 'Hunger', color: 'bg-stat-hunger' },
  { key: 'happiness' as const, emoji: '😊', label: 'Happy', color: 'bg-stat-happiness' },
  { key: 'health' as const, emoji: '❤️', label: 'Health', color: 'bg-stat-health' },
  { key: 'hygiene' as const, emoji: '🧼', label: 'Clean', color: 'bg-stat-hygiene' },
  { key: 'energy' as const, emoji: '😴', label: 'Energy', color: 'bg-stat-energy' },
];

export default function StatsBar() {
  const store = usePetStore();

  return (
    <div className="grid grid-cols-5 gap-2 px-2">
      {STATS.map(({ key, emoji, label, color }) => {
        const value = store[key];
        const isLow = value < 25;
        return (
          <div key={key} className="flex flex-col items-center gap-1">
            <span className={`text-sm ${isLow ? 'animate-bounce' : ''}`}>{emoji}</span>
            <div className="stat-bar w-full">
              <motion.div
                className={`stat-bar-fill ${color} ${isLow ? 'opacity-80' : ''}`}
                initial={false}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className={`text-[10px] font-nunito font-semibold ${isLow ? 'text-destructive' : 'text-muted-foreground'}`}>
              {Math.round(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
