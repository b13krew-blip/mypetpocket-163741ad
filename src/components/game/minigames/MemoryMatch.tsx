import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePetStore } from '@/store/petStore';
import { toast } from '@/hooks/use-toast';

interface Props { onBack: () => void; }

const EMOJIS = ['🐱', '🐶', '🐉', '🌟', '🎈', '🍕', '🎮', '💎'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryMatchGame({ onBack }: Props) {
  const [cards] = useState(() => shuffle([...EMOJIS, ...EMOJIS]).map((emoji, i) => ({ id: i, emoji, matched: false })));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const gameWon = matched.size === cards.length;

  useEffect(() => {
    if (flipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = flipped;
      if (cards[a].emoji === cards[b].emoji) {
        setMatched(prev => new Set([...prev, a, b]));
        setFlipped([]);
      } else {
        const t = setTimeout(() => setFlipped([]), 800);
        return () => clearTimeout(t);
      }
    }
  }, [flipped, cards]);

  const handleFlip = (idx: number) => {
    if (flipped.length >= 2 || flipped.includes(idx) || matched.has(idx)) return;
    setFlipped(prev => [...prev, idx]);
  };

  const claimReward = () => {
    const coins = Math.max(10, 50 - moves);
    const xp = 30;
    usePetStore.getState().addCoins(coins);
    usePetStore.getState().addXp(xp);
    toast({ title: `🃏 Earned ${coins} coins & ${xp} XP!` });
    onBack();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="font-fredoka text-lg font-bold text-foreground">🃏 Memory Match</span>
        <span className="font-fredoka text-sm font-semibold text-muted-foreground">Moves: {moves}</span>
      </div>

      {!gameWon ? (
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || matched.has(idx);
            return (
              <motion.button
                key={card.id}
                className={`aspect-square rounded-2xl text-3xl flex items-center justify-center font-bold border transition-all
                  ${matched.has(idx)
                    ? 'bg-primary/15 border-primary/30'
                    : isFlipped
                    ? 'bg-card border-border'
                    : 'bg-muted border-border hover:bg-muted/80'}`}
                onClick={() => handleFlip(idx)}
                whileTap={{ scale: 0.95 }}
              >
                {isFlipped ? card.emoji : '❓'}
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <span className="text-6xl">🎉</span>
          <h2 className="font-fredoka text-2xl font-bold text-foreground">You Win!</h2>
          <p className="font-nunito text-muted-foreground">Completed in {moves} moves</p>
          <p className="font-nunito text-sm text-primary font-semibold">
            Reward: {Math.max(10, 50 - moves)} coins + 30 XP
          </p>
          <div className="flex gap-3">
            <motion.button
              className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-fredoka font-semibold"
              onClick={claimReward}
              whileTap={{ scale: 0.95 }}
            >
              Claim!
            </motion.button>
            <motion.button
              className="px-6 py-3 rounded-2xl bg-muted text-foreground font-fredoka font-semibold"
              onClick={onBack}
              whileTap={{ scale: 0.95 }}
            >
              Back
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
