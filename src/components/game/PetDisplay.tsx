import { motion, AnimatePresence } from 'framer-motion';
import { usePetStore, getSpeciesData, PERSONALITY_INFO } from '@/store/petStore';

const STAGE_EMOJIS: Record<string, Record<string, string>> = {
  meowchi: { egg: '🥚', baby: '🐱', child: '😺', teen: '😼', adult: '🐈', senior: '🐈‍⬛' },
  puppup: { egg: '🥚', baby: '🐶', child: '🐕', teen: '🦮', adult: '🐕‍🦺', senior: '🦴' },
  drakeling: { egg: '🥚', baby: '🐉', child: '🐲', teen: '🔥', adult: '🐲', senior: '🏔️' },
};

const getMood = (hunger: number, happiness: number, health: number, energy: number, isSick: boolean) => {
  if (isSick) return { face: '🤒', text: "I feel terrible..." };
  if (health < 20) return { face: '🤒', text: "I don't feel good..." };
  if (hunger < 20) return { face: '😫', text: "I'm starving!" };
  if (energy < 15) return { face: '😴', text: 'So sleepy...' };
  if (happiness < 20) return { face: '😢', text: "I'm sad..." };
  if (hunger < 40) return { face: '😋', text: "I'm hungry!" };
  if (happiness > 80 && hunger > 60) return { face: '😍', text: 'I love you!' };
  if (happiness > 60) return { face: '😊', text: 'Feeling great!' };
  return { face: '🙂', text: "Hi there!" };
};

export default function PetDisplay() {
  const { species, stage, hunger, happiness, health, energy, isSleeping, isDead, name, poops, isSick, personality } = usePetStore();
  const speciesData = getSpeciesData(species);
  const personalityInfo = PERSONALITY_INFO[personality];

  const petEmoji = STAGE_EMOJIS[species]?.[stage] || speciesData.emoji;
  const mood = getMood(hunger, happiness, health, energy, isSick);

  const petSize = stage === 'egg' ? 'text-7xl' : stage === 'baby' ? 'text-8xl' : 'text-9xl';

  return (
    <div className="relative flex flex-col items-center justify-center py-6 min-h-[280px]">
      {/* Poops */}
      <AnimatePresence>
        {Array.from({ length: poops }).map((_, i) => (
          <motion.div
            key={`poop-${i}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0 }}
            className="absolute text-3xl"
            style={{
              left: `${20 + i * 15}%`,
              bottom: '10%',
            }}
          >
            💩
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Sick indicator */}
      {isSick && !isDead && (
        <motion.div
          className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-sickness/20 text-sickness font-fredoka text-xs font-bold"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          🤒 SICK
        </motion.div>
      )}

      {/* Pet */}
      <motion.div
        className={`${petSize} select-none cursor-pointer`}
        animate={
          isDead
            ? { opacity: 0.3, y: 20, rotate: 0 }
            : isSleeping
            ? { y: [0, -3, 0], rotate: [-2, 2, -2] }
            : isSick
            ? { x: [-2, 2, -2], y: 0 }
            : stage === 'egg'
            ? { rotate: [-5, 5, -5], y: [0, -2, 0] }
            : { y: [0, -8, 0] }
        }
        transition={{
          duration: isSleeping ? 2 : isSick ? 0.3 : stage === 'egg' ? 0.8 : 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileTap={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
      >
        {petEmoji}
      </motion.div>

      {/* Sleep ZZZ */}
      {isSleeping && !isDead && (
        <motion.div
          className="absolute top-4 right-1/4 text-2xl font-fredoka text-muted-foreground"
          animate={{ opacity: [0, 1, 0], y: [0, -20] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          💤
        </motion.div>
      )}

      {/* Death */}
      {isDead && (
        <motion.div
          className="absolute text-4xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: -30 }}
        >
          👼
        </motion.div>
      )}

      {/* Speech bubble */}
      {!isDead && !isSleeping && (
        <motion.div
          className="mt-3 px-4 py-2 bg-card rounded-2xl shadow-sm border border-border/50 font-nunito text-sm text-foreground"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={mood.text}
        >
          <span className="mr-1">{mood.face}</span>
          {mood.text}
        </motion.div>
      )}

      {/* Name + personality */}
      <p className="mt-2 font-fredoka text-lg text-foreground font-semibold">{name}</p>
      <span className="text-xs text-muted-foreground font-nunito">
        {personalityInfo.emoji} {personalityInfo.name}
      </span>
    </div>
  );
}
