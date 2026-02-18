import { motion } from 'framer-motion';
import { usePetStore } from '@/store/petStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeedModal from './FeedModal';
import InventoryModal from './InventoryModal';
import PetChatModal from './PetChatModal';
import { toast } from '@/hooks/use-toast';

const ACTIONS = [
  { id: 'feed', emoji: '🍕', label: 'Feed', bg: 'bg-stat-hunger/15 hover:bg-stat-hunger/25 text-foreground' },
  { id: 'play', emoji: '🎮', label: 'Play', bg: 'bg-stat-happiness/15 hover:bg-stat-happiness/25 text-foreground' },
  { id: 'clean', emoji: '🛁', label: 'Clean', bg: 'bg-stat-hygiene/15 hover:bg-stat-hygiene/25 text-foreground' },
  { id: 'sleep', emoji: '😴', label: 'Sleep', bg: 'bg-stat-energy/15 hover:bg-stat-energy/25 text-foreground' },
  { id: 'heal', emoji: '💊', label: 'Heal', bg: 'bg-stat-health/15 hover:bg-stat-health/25 text-foreground' },
];

const NAV_BUTTONS = [
  { id: 'chat', emoji: '💬', label: 'Chat' },
  { id: 'store', emoji: '🛒', label: 'Store' },
  { id: 'inventory', emoji: '🎒', label: 'Items' },
  { id: 'minigames', emoji: '🕹️', label: 'Games' },
];

export default function ActionButtons() {
  const { play, clean, sleep, wake, heal, isSleeping, isDead, stage } = usePetStore();
  const [feedOpen, setFeedOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (id: string) => {
    if (isDead) return;
    switch (id) {
      case 'feed': setFeedOpen(true); break;
      case 'play':
        play();
        toast({ title: '🎮 Playtime!', description: 'Your pet had fun!' });
        break;
      case 'clean':
        clean();
        toast({ title: '🛁 All clean!', description: 'Your pet is sparkling!' });
        break;
      case 'sleep': 
        if (isSleeping) {
          wake();
          toast({ title: '☀️ Good morning!' });
        } else {
          sleep();
          toast({ title: '😴 Sweet dreams...' });
        }
        break;
      case 'heal':
        heal();
        toast({ title: '💊 Medicine given!', description: 'Health restored.' });
        break;
    }
  };

  const handleNav = (id: string) => {
    if (id === 'chat') setChatOpen(true);
    if (id === 'store') navigate('/store');
    if (id === 'inventory') setInventoryOpen(true);
    if (id === 'minigames') navigate('/minigames');
  };

  return (
    <>
      <div className="flex justify-center gap-3 px-2 mb-3">
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

      {/* Nav row */}
      <div className="flex justify-center gap-3 px-2">
        {NAV_BUTTONS.map(({ id, emoji, label }, i) => (
          <motion.button
            key={id}
            className="action-btn bg-muted/50 hover:bg-muted text-foreground"
            onClick={() => handleNav(id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.05 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-2xl">{emoji}</span>
            <span>{label}</span>
          </motion.button>
        ))}
      </div>

      <FeedModal open={feedOpen} onClose={() => setFeedOpen(false)} />
      <InventoryModal open={inventoryOpen} onClose={() => setInventoryOpen(false)} />
      <PetChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
