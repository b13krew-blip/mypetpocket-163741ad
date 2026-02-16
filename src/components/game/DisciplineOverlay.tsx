import { motion, AnimatePresence } from 'framer-motion';
import { usePetStore, MISBEHAVIOR_INFO } from '@/store/petStore';

export default function DisciplineOverlay() {
  const { activeMisbehavior, discipline } = usePetStore();

  if (!activeMisbehavior) return null;
  const info = MISBEHAVIOR_INFO[activeMisbehavior];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[55] bg-discipline/10 backdrop-blur-sm flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-sm bg-card rounded-3xl p-6 text-center border-2 border-discipline/30 shadow-xl"
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <span className="text-5xl block mb-3">{info.emoji}</span>
          <h2 className="font-fredoka text-xl font-bold text-foreground mb-1">Misbehaving!</h2>
          <p className="font-nunito text-sm text-muted-foreground mb-5">{info.desc}</p>

          <div className="flex gap-3">
            <motion.button
              className="flex-1 py-3 rounded-2xl font-fredoka font-semibold bg-destructive/15 text-destructive hover:bg-destructive/25"
              onClick={() => discipline('scold')}
              whileTap={{ scale: 0.95 }}
            >
              😠 Scold
            </motion.button>
            <motion.button
              className="flex-1 py-3 rounded-2xl font-fredoka font-semibold bg-primary/15 text-primary hover:bg-primary/25"
              onClick={() => discipline('praise')}
              whileTap={{ scale: 0.95 }}
            >
              🥰 Praise
            </motion.button>
            <motion.button
              className="flex-1 py-3 rounded-2xl font-fredoka font-semibold bg-muted text-muted-foreground"
              onClick={() => discipline('ignore')}
              whileTap={{ scale: 0.95 }}
            >
              🤷 Ignore
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
