import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePetStore } from '@/store/petStore';
import { toast } from '@/hooks/use-toast';

interface Props { onBack: () => void; }

export default function CatchTheStarGame({ onBack }: Props) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [starPos, setStarPos] = useState<{ x: number; y: number } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  const spawnStar = useCallback(() => {
    setStarPos({ x: 10 + Math.random() * 75, y: 10 + Math.random() * 75 });
  }, []);

  useEffect(() => {
    if (gameOver) return;
    spawnStar();
    const interval = setInterval(spawnStar, 1500);
    return () => clearInterval(interval);
  }, [gameOver, spawnStar]);

  useEffect(() => {
    if (gameOver) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          clearInterval(t);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [gameOver]);

  const handleCatch = () => {
    setScore(s => s + 1);
    setStarPos(null);
    setTimeout(spawnStar, 200);
  };

  const claimReward = () => {
    const coins = score * 3;
    const xp = score * 5;
    usePetStore.getState().addCoins(coins);
    usePetStore.getState().addXp(xp);
    toast({ title: `⭐ Earned ${coins} coins & ${xp} XP!` });
    onBack();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="font-fredoka text-lg font-bold text-foreground">⭐ Catch the Star</span>
        <div className="flex gap-3 font-fredoka text-sm font-semibold">
          <span className="text-primary">Score: {score}</span>
          <span className="text-destructive">⏱ {timeLeft}s</span>
        </div>
      </div>

      <div
        ref={areaRef}
        className="flex-1 min-h-[400px] bg-pet-bg rounded-3xl relative overflow-hidden border border-border"
      >
        {!gameOver && (
          <AnimatePresence>
            {starPos && (
              <motion.button
                key={`${starPos.x}-${starPos.y}`}
                className="absolute text-4xl cursor-pointer select-none"
                style={{ left: `${starPos.x}%`, top: `${starPos.y}%` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={handleCatch}
                whileTap={{ scale: 1.5 }}
              >
                ⭐
              </motion.button>
            )}
          </AnimatePresence>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <span className="text-6xl">🏆</span>
            <h2 className="font-fredoka text-2xl font-bold text-foreground">Game Over!</h2>
            <p className="font-nunito text-muted-foreground">You caught {score} stars!</p>
            <p className="font-nunito text-sm text-primary font-semibold">Reward: {score * 3} coins + {score * 5} XP</p>
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
    </div>
  );
}
