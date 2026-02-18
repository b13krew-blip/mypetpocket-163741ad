import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePetStore, formatAge, WEATHER_INFO } from '@/store/petStore';
import { useAuth } from '@/hooks/useAuth';
import { usePetSync } from '@/hooks/usePetSync';
import Header from '@/components/game/Header';
import PetDisplay from '@/components/game/PetDisplay';
import StatsBar from '@/components/game/StatsBar';
import ActionButtons from '@/components/game/ActionButtons';
import CriticalEventOverlay from '@/components/game/CriticalEventOverlay';
import DisciplineOverlay from '@/components/game/DisciplineOverlay';
import { motion } from 'framer-motion';

export default function Index() {
  const { adopted, isDead, reset, tick, stage, age, level, isSick, weather, deathCause, bond, isSleeping } = usePetStore();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  usePetSync();

  // Toggle dark mode when pet is sleeping (night time)
  useEffect(() => {
    if (isSleeping) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return () => document.documentElement.classList.remove('dark');
  }, [isSleeping]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!adopted) {
      navigate('/adopt');
      return;
    }
    tick();
    const interval = setInterval(tick, 10000);
    return () => clearInterval(interval);
  }, [adopted, navigate, tick, user, loading]);

  if (loading || !user || !adopted) return null;

  const weatherInfo = WEATHER_INFO[weather];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <Header />

      {/* Stage, Age & Bond */}
      <div className="flex justify-center gap-3 text-xs font-nunito text-muted-foreground font-semibold px-4 flex-wrap">
        <span className="px-2 py-0.5 rounded-full bg-muted">🐣 {stage}</span>
        <span className="px-2 py-0.5 rounded-full bg-muted">🕐 {formatAge(age)}</span>
        <span className="px-2 py-0.5 rounded-full bg-muted">💕 Bond: {Math.round(bond)}</span>
        {isSick && (
          <span className="px-2 py-0.5 rounded-full bg-sickness/20 text-sickness font-bold">🤒 Sick!</span>
        )}
      </div>

      {/* Weather banner */}
      {weather === 'storm' && (
        <motion.div
          className="mx-3 mt-2 px-3 py-2 rounded-2xl bg-weather-storm/15 text-center font-fredoka text-xs font-bold text-foreground"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          🌪️ STORM! All stats decaying 2x faster!
        </motion.div>
      )}

      {/* Pet area */}
      <div className={`flex-1 rounded-3xl mx-3 mt-2 mb-3 relative overflow-hidden transition-colors duration-700 ${isSleeping ? 'bg-[hsl(230,25%,12%)]' : 'bg-pet-bg'}`}>
        {isSleeping ? (
          <>
            <div className="absolute top-4 left-6 text-2xl opacity-40">🌙</div>
            <div className="absolute top-6 right-8 text-sm opacity-30">⭐</div>
            <div className="absolute top-12 left-1/3 text-xs opacity-20">✨</div>
            <div className="absolute bottom-8 right-6 text-sm opacity-25">⭐</div>
          </>
        ) : (
          <>
            <div className="absolute top-4 left-4 text-2xl opacity-20">🌿</div>
            <div className="absolute top-6 right-6 text-xl opacity-20">
              {weatherInfo.emoji}
            </div>
            <div className="absolute bottom-4 right-4 text-xl opacity-20">🌸</div>
          </>
        )}

        <PetDisplay />
      </div>

      {/* Stats */}
      <div className="px-3 mb-3">
        <StatsBar />
      </div>

      {/* Actions */}
      <div className="px-3 mb-4">
        <ActionButtons />
      </div>

      {/* Critical event overlay */}
      <CriticalEventOverlay />

      {/* Discipline overlay */}
      <DisciplineOverlay />

      {/* Death overlay */}
      {isDead && (
        <div
          className="fixed inset-0 z-[100] bg-foreground/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="text-6xl">👼</span>
          <h2 className="font-fredoka text-2xl text-primary-foreground font-bold">Rest in Peace</h2>
          <p className="font-nunito text-primary-foreground/80 text-sm text-center px-8">
            {deathCause || 'Your pet has passed away...'}
          </p>
          <button
            className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-fredoka font-semibold text-lg active:scale-95 transition-transform"
            onClick={() => { reset(); navigate('/adopt'); }}
          >
            🥚 Adopt New Pet
          </button>
        </div>
      )}
    </div>
  );
}
