import { motion } from 'framer-motion';
import { usePetStore } from '@/store/petStore';
import { useState } from 'react';
import FeedModal from './FeedModal';

const ACTIONS = [
  { id: 'feed', emoji: '🍕', label: 'Feed', bg: 'bg-stat-hunger/15 hover:bg-stat-hunger/25 text-foreground' },
  { id: 'play', emoji: '🎮', label: 'Play', bg: 'bg-stat-happiness/15 hover:bg-stat-happiness/25 text-foreground' },
  { id: 'clean', emoji: '🛁', label: 'Clean', bg: 'bg-stat-hygiene/15 hover:bg-stat-hygiene/25 text-foreground' },
  { id: 'sleep', emoji: '😴', label: 'Sleep', bg: 'bg-stat-energy/15 hover:bg-stat-energy/25 text-foreground' },
  { id: 'heal', emoji: '💊', label: 'Heal', bg: 'bg-stat-health/15 hover:bg-stat-health/25 text-foreground' },
];

export default function ActionButtons() {
  const { play, clean, sleep, wake, heal, isSleeping, isDead, stage } = usePetStore();
  const [feedOpen, setFeedOpen] = useState(false);

  const handleAction = (id: string) => {
    if (isDead) return;
    switch (id) {
      case 'feed': setFeedOpen(true); break;
      case 'play': play(); break;
      case 'clean': clean(); break;
      case 'sleep': isSleeping ? wake() : sleep(); break;
      case 'heal': heal(); break;
    }
  };

  return (
    <>
      <div className="flex justify-center gap-3 px-2">
        {ACTIONS.map(({ id, emoji, label, bg }, i) => (
          <motion.button
            key={id}
            className={`action-btn ${bg}`}
            onClick={() => handleAction(id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.9 }}
            disabled={isDead}
          >
            <span className="text-2xl">{emoji}</span>
            <span>{id === 'sleep' && isSleeping ? 'Wake' : label}</span>
            {id === 'heal' && stage === 'senior' && (
              <span className="text-[9px] text-destructive">2x cost</span>
            )}
          </motion.button>
        ))}
      </div>
      <FeedModal open={feedOpen} onClose={() => setFeedOpen(false)} />
    </>
  );
}
