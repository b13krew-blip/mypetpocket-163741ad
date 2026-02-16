import { motion, AnimatePresence } from 'framer-motion';
import { usePetStore, CRITICAL_EVENT_INFO } from '@/store/petStore';

export default function CriticalEventOverlay() {
  const { activeEvent, eventTaps, tapEvent, resolveEvent, dismissEvent, coins } = usePetStore();

  if (!activeEvent) return null;
  const info = CRITICAL_EVENT_INFO[activeEvent];
  const isTapEvent = activeEvent === 'choking' || activeEvent === 'escaped';
  const needsCoins = activeEvent === 'fever';
  const tapsNeeded = activeEvent === 'choking' ? 15 : 20;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] bg-critical/20 backdrop-blur-sm flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-sm bg-card rounded-3xl p-6 text-center border-2 border-critical/50 shadow-xl"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <motion.span
            className="text-6xl block mb-3"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {info.emoji}
          </motion.span>
          <h2 className="font-fredoka text-2xl font-bold text-destructive mb-2">{info.name}</h2>
          <p className="font-nunito text-sm text-muted-foreground mb-4">{info.instruction}</p>

          {isTapEvent && (
            <>
              <div className="mb-3">
                <div className="stat-bar w-full h-4">
                  <motion.div
                    className="stat-bar-fill bg-primary"
                    animate={{ width: `${(eventTaps / tapsNeeded) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-nunito mt-1 block">
                  {eventTaps}/{tapsNeeded} taps
                </span>
              </div>
              <motion.button
                className="w-full py-4 rounded-2xl font-fredoka font-bold text-lg bg-destructive text-destructive-foreground critical-pulse"
                onClick={tapEvent}
                whileTap={{ scale: 0.95 }}
              >
                TAP! TAP! TAP!
              </motion.button>
            </>
          )}

          {!isTapEvent && (
            <div className="flex gap-3">
              <motion.button
                className="flex-1 py-3 rounded-2xl font-fredoka font-semibold bg-primary text-primary-foreground"
                onClick={resolveEvent}
                whileTap={{ scale: 0.95 }}
                disabled={needsCoins && coins < 30}
              >
                {needsCoins ? `💊 Treat (💰30)` : '💚 Comfort'}
              </motion.button>
              <motion.button
                className="flex-1 py-3 rounded-2xl font-fredoka font-semibold bg-muted text-foreground"
                onClick={dismissEvent}
                whileTap={{ scale: 0.95 }}
              >
                Ignore ⚠️
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
