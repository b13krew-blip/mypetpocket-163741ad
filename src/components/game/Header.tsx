import { usePetStore, WEATHER_INFO } from '@/store/petStore';

export default function Header() {
  const { coins, level, weather } = usePetStore();
  const weatherInfo = WEATHER_INFO[weather];

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <h1 className="font-fredoka text-xl font-bold text-foreground tracking-tight">
        🐾 PetPocket
      </h1>
      <div className="flex items-center gap-2 font-fredoka text-xs font-semibold">
        <span className="weather-banner bg-muted">
          {weatherInfo.emoji} {weatherInfo.name}
        </span>
        <span className="px-2 py-1 rounded-full bg-accent/30 text-accent-foreground">
          ⭐ Lv{level}
        </span>
        <span className="px-2 py-1 rounded-full bg-coin/20 text-accent-foreground">
          💰 {coins}
        </span>
      </div>
    </div>
  );
}
