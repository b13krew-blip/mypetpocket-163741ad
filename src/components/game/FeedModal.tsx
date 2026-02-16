import { motion, AnimatePresence } from 'framer-motion';
import { FOOD_ITEMS, usePetStore } from '@/store/petStore';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function FeedModal({ open, onClose }: Props) {
  const { feed, coins, personality, isSick } = usePetStore();

  const handleFeed = (foodId: string) => {
    feed(foodId);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md bg-card rounded-t-3xl p-6 pb-8"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-fredoka text-xl font-semibold text-foreground">Choose Food</h3>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            {personality === 'picky_eater' && (
              <p className="text-xs text-destructive font-nunito mb-3">🤢 Picky eater — rejects basic food!</p>
            )}
            {isSick && (
              <p className="text-xs text-sickness font-nunito mb-3">🤒 Sick — gets less from food</p>
            )}
            <div className="grid grid-cols-4 gap-3">
              {FOOD_ITEMS.map((food) => {
                const canAfford = coins >= food.cost;
                const rejected = personality === 'picky_eater' && food.quality === 'basic';
                return (
                  <motion.button
                    key={food.id}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border border-border/50 transition-colors
                      ${rejected ? 'opacity-30 cursor-not-allowed' : canAfford ? 'hover:bg-muted active:scale-95' : 'opacity-40 cursor-not-allowed'}`}
                    onClick={() => canAfford && !rejected && handleFeed(food.id)}
                    whileTap={canAfford && !rejected ? { scale: 0.9 } : {}}
                    disabled={!canAfford || rejected}
                  >
                    <span className="text-2xl">{food.emoji}</span>
                    <span className="text-xs font-nunito font-semibold text-foreground">{food.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      💰{food.cost}
                    </span>
                    <span className="text-[10px] text-primary font-semibold">+{food.hunger}🍔</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
