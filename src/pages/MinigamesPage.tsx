import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CatchTheStarGame from '@/components/game/minigames/CatchTheStar';
import MemoryMatchGame from '@/components/game/minigames/MemoryMatch';

export default function MinigamesPage() {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  if (activeGame === 'catch') return <CatchTheStarGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'memory') return <MemoryMatchGame onBack={() => setActiveGame(null)} />;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-fredoka text-xl font-bold text-foreground">🎮 Minigames</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 pb-6">
        {[
          { id: 'catch', emoji: '⭐', name: 'Catch the Star', desc: 'Tap stars before they vanish! 15 sec timer.' },
          { id: 'memory', emoji: '🃏', name: 'Memory Match', desc: 'Flip cards to find matching emoji pairs!' },
        ].map((game, i) => (
          <motion.button
            key={game.id}
            className="game-card p-6 flex items-center gap-4 text-left hover:bg-muted/50"
            onClick={() => setActiveGame(game.id)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-5xl">{game.emoji}</span>
            <div>
              <span className="font-fredoka font-semibold text-lg text-foreground block">{game.name}</span>
              <span className="text-xs text-muted-foreground font-nunito">{game.desc}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
