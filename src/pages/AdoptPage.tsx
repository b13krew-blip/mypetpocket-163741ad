import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePetStore, Species, Difficulty, PERSONALITY_INFO, Personality } from '@/store/petStore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePetSync } from '@/hooks/usePetSync';

const SPECIES = [
  { id: 'meowchi' as Species, emoji: '🐱', name: 'Meowchi', desc: 'Independent & playful', trait: '9 lives!' },
  { id: 'puppup' as Species, emoji: '🐶', name: 'Puppup', desc: 'Loyal & energetic', trait: 'Fetches coins!' },
  { id: 'drakeling' as Species, emoji: '🐉', name: 'Drakeling', desc: 'Proud & magical', trait: 'Fire power!' },
];

const DIFFICULTIES: { id: Difficulty; name: string; emoji: string; desc: string }[] = [
  { id: 'easy', name: 'Easy', emoji: '🟢', desc: 'Relaxed pace' },
  { id: 'normal', name: 'Normal', emoji: '🟡', desc: 'Balanced challenge' },
  { id: 'hard', name: 'Hard', emoji: '🟠', desc: 'Punishing' },
  { id: 'nightmare', name: 'Nightmare', emoji: '💀', desc: 'Instant death events!' },
];

const ALL_PERSONALITIES: Personality[] = ['lazy', 'picky_eater', 'messy', 'anxious', 'athletic', 'sensitive', 'independent'];

export default function AdoptPage() {
  const [selected, setSelected] = useState<Species | null>(null);
  const [petName, setPetName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const adopt = usePetStore((s) => s.adopt);
  const adopted = usePetStore((s) => s.adopted);
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { synced } = usePetSync();

  // Redirect to auth if not logged in, or to home if already has a pet
  useEffect(() => {
    if (loading || !synced) return;
    if (!user) {
      navigate('/auth');
    } else if (adopted) {
      navigate('/');
    }
  }, [loading, synced, user, adopted, navigate]);

  if (loading || !synced) return null;
  if (!user || adopted) return null;

  const handleAdopt = () => {
    if (!selected || !petName.trim()) return;
    adopt(petName.trim(), selected, difficulty);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <motion.h1
            className="font-fredoka text-4xl font-bold text-foreground mb-2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            🐾 PetPocket
          </motion.h1>
          <p className="text-muted-foreground font-nunito">Choose your companion!</p>
        </div>

        {/* Species selection */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {SPECIES.map((s, i) => (
            <motion.button
              key={s.id}
              className={`game-card p-4 flex flex-col items-center gap-2 transition-all
                ${selected === s.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}
              onClick={() => setSelected(s.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-5xl">{s.emoji}</span>
              <span className="font-fredoka font-semibold text-sm text-foreground">{s.name}</span>
              <span className="text-[10px] text-muted-foreground text-center">{s.desc}</span>
              <span className="text-[10px] text-primary font-semibold">✨ {s.trait}</span>
            </motion.button>
          ))}
        </div>

        {/* Difficulty selection */}
        <div className="mb-6">
          <p className="font-fredoka text-sm font-semibold text-foreground mb-2 text-center">Difficulty</p>
          <div className="grid grid-cols-4 gap-2">
            {DIFFICULTIES.map((d) => (
              <motion.button
                key={d.id}
                className={`p-2 rounded-xl font-fredoka text-xs text-center transition-all border
                  ${difficulty === d.id
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted/50'}`}
                onClick={() => setDifficulty(d.id)}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg block">{d.emoji}</span>
                <span className="font-semibold">{d.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Personality preview */}
        <div className="mb-6">
          <p className="font-fredoka text-sm font-semibold text-foreground mb-2 text-center">Possible Personalities</p>
          <div className="flex flex-wrap justify-center gap-2">
            {ALL_PERSONALITIES.map(p => {
              const info = PERSONALITY_INFO[p];
              return (
                <span key={p} className="px-2 py-1 rounded-full bg-muted text-[10px] font-nunito font-semibold text-muted-foreground">
                  {info.emoji} {info.name}
                </span>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1 font-nunito">Your pet will get a random personality!</p>
        </div>

        {/* Name + adopt */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: selected ? 1 : 0.4 }}
        >
          <input
            type="text"
            placeholder="Name your pet..."
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            maxLength={16}
            className="w-full px-4 py-3 rounded-2xl bg-card border border-border font-nunito text-foreground
                       placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg"
            disabled={!selected}
          />
          <motion.button
            className="w-full py-3 rounded-2xl font-fredoka font-semibold text-lg
                       bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleAdopt}
            disabled={!selected || !petName.trim()}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
          >
            🥚 Adopt!
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
