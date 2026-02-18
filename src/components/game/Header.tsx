import { usePetStore, WEATHER_INFO } from '@/store/petStore';
import { Settings } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsModal from './SettingsModal';

export default function Header() {
  const { coins, level, xp, weather } = usePetStore();
  const weatherInfo = WEATHER_INFO[weather];
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const xpNeeded = level * 50;
  const xpPercent = Math.min(100, (xp / xpNeeded) * 100);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="font-fredoka text-xl font-bold text-foreground tracking-tight">
          🐾 PetPocket
        </h1>
        <div className="flex items-center gap-2 font-fredoka text-xs font-semibold">
          <span className="weather-banner bg-muted">
            {weatherInfo.emoji} {weatherInfo.name}
          </span>
          <div className="flex flex-col items-center">
            <span className="px-2 py-1 rounded-full bg-accent/30 text-accent-foreground">
              ⭐ Lv{level}
            </span>
            <div className="w-full h-1.5 rounded-full bg-muted mt-0.5 overflow-hidden">
              <div
                className="h-full bg-xp rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
          <span className="px-2 py-1 rounded-full bg-coin/20 text-accent-foreground">
            💰 {coins}
          </span>
          <button
            onClick={() => navigate('/memorial')}
            className="p-1.5 rounded-full hover:bg-muted"
            title="Pet Memorial"
          >
            <span className="text-sm">🪦</span>
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 rounded-full hover:bg-muted"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
