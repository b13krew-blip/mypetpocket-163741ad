import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Species = 'meowchi' | 'puppup' | 'drakeling';
export type LifeStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'senior';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'nightmare';
export type Weather = 'sunny' | 'rainy' | 'cold' | 'hot' | 'storm';
export type Personality = 'lazy' | 'picky_eater' | 'messy' | 'anxious' | 'athletic' | 'sensitive' | 'independent';
export type CriticalEvent = 'choking' | 'escaped' | 'nightmare' | 'tantrum' | 'fever';
export type MisbehaviorType = 'refuses_eat' | 'throws_toys' | 'runs_around' | 'wont_sleep';
export type EvolutionTier = 'base' | 'good' | 'great' | 'ultimate';

export interface EvolutionInfo {
  tier: EvolutionTier;
  name: string;
  emoji: string;
  aura: string;
  requirement: string;
}

// Evolution is computed from bond, avg care stats, and personality alignment
export function getEvolution(species: Species, stage: LifeStage, bond: number, avgStats: number, personality: Personality): EvolutionInfo {
  if (stage === 'egg' || stage === 'baby') {
    return EVOLUTION_DATA[species].base;
  }
  // Personality bonus: certain personalities get a boost if stats are managed well
  const personalityBonus = (['athletic', 'sensitive', 'independent'].includes(personality) && avgStats > 60) ? 10 : 0;
  const score = bond + (avgStats * 0.5) + personalityBonus;

  if (score >= 120) return EVOLUTION_DATA[species].ultimate;
  if (score >= 70) return EVOLUTION_DATA[species].great;
  if (score >= 35) return EVOLUTION_DATA[species].good;
  return EVOLUTION_DATA[species].base;
}

const EVOLUTION_DATA: Record<Species, Record<EvolutionTier, EvolutionInfo>> = {
  meowchi: {
    base: { tier: 'base', name: 'Meowchi', emoji: '🐱', aura: '', requirement: 'Starting form' },
    good: { tier: 'good', name: 'Whiskerion', emoji: '😺', aura: '✨', requirement: 'Bond 20+ & decent care' },
    great: { tier: 'great', name: 'Felionix', emoji: '🦁', aura: '🔥', requirement: 'Bond 50+ & great care' },
    ultimate: { tier: 'ultimate', name: 'Celesticat', emoji: '🐈‍⬛', aura: '👑', requirement: 'Bond 80+ & perfect care' },
  },
  puppup: {
    base: { tier: 'base', name: 'Puppup', emoji: '🐶', aura: '', requirement: 'Starting form' },
    good: { tier: 'good', name: 'Barknight', emoji: '🐕', aura: '✨', requirement: 'Bond 20+ & decent care' },
    great: { tier: 'great', name: 'Howlstorm', emoji: '🐺', aura: '⚡', requirement: 'Bond 50+ & great care' },
    ultimate: { tier: 'ultimate', name: 'Aureowolf', emoji: '🦊', aura: '👑', requirement: 'Bond 80+ & perfect care' },
  },
  drakeling: {
    base: { tier: 'base', name: 'Drakeling', emoji: '🐉', aura: '', requirement: 'Starting form' },
    good: { tier: 'good', name: 'Wyvernscale', emoji: '🐲', aura: '✨', requirement: 'Bond 20+ & decent care' },
    great: { tier: 'great', name: 'Infernax', emoji: '🔥', aura: '💎', requirement: 'Bond 50+ & great care' },
    ultimate: { tier: 'ultimate', name: 'Celestidrake', emoji: '🌟', aura: '👑', requirement: 'Bond 80+ & perfect care' },
  },
};

export const EVOLUTION_TIER_INFO: Record<EvolutionTier, { color: string; label: string }> = {
  base: { color: 'text-muted-foreground', label: 'Base' },
  good: { color: 'text-stat-happiness', label: 'Evolved' },
  great: { color: 'text-primary', label: 'Rare' },
  ultimate: { color: 'text-accent', label: 'Legendary' },
};

export interface PetState {
  name: string;
  species: Species;
  stage: LifeStage;
  hunger: number;
  happiness: number;
  health: number;
  hygiene: number;
  energy: number;
  coins: number;
  level: number;
  xp: number;
  age: number;
  bond: number;
  poops: number;
  isSleeping: boolean;
  isDead: boolean;
  lastUpdate: number;
  createdAt: number;
  adopted: boolean;
  difficulty: Difficulty;
  // Sickness
  isSick: boolean;
  sickSince: number | null;
  // Weather
  weather: Weather;
  weatherChangedAt: number;
  // Personality
  personality: Personality;
  // Critical events
  activeEvent: CriticalEvent | null;
  eventStartedAt: number | null;
  eventTaps: number;
  // Discipline
  activeMisbehavior: MisbehaviorType | null;
  misbehaviorAt: number | null;
  // Death cause
  deathCause: string;
  // Play coin cap
  playCoinsThisHour: number;
  playCoinsHourStart: number;
}

interface PetActions {
  adopt: (name: string, species: Species, difficulty: Difficulty) => void;
  feed: (foodId: string) => void;
  play: () => void;
  clean: () => void;
  sleep: () => void;
  wake: () => void;
  heal: () => void;
  tick: () => void;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  reset: () => void;
  // Critical event responses
  tapEvent: () => void;
  resolveEvent: () => void;
  dismissEvent: () => void;
  // Discipline
  discipline: (response: 'scold' | 'praise' | 'ignore') => void;
}

const SPECIES_DATA: Record<Species, { emoji: string; name: string }> = {
  meowchi: { emoji: '🐱', name: 'Meowchi' },
  puppup: { emoji: '🐶', name: 'Puppup' },
  drakeling: { emoji: '🐉', name: 'Drakeling' },
};

export const FOOD_ITEMS = [
  { id: 'bread', emoji: '🍞', name: 'Bread', hunger: 10, happiness: 0, health: 0, cost: 3, quality: 'basic' as const },
  { id: 'milk', emoji: '🥛', name: 'Milk', hunger: 15, happiness: 5, health: 0, cost: 4, quality: 'basic' as const },
  { id: 'apple', emoji: '🍎', name: 'Apple', hunger: 20, happiness: 0, health: 5, cost: 5, quality: 'basic' as const },
  { id: 'burger', emoji: '🍔', name: 'Burger', hunger: 40, happiness: 10, health: 0, cost: 15, quality: 'premium' as const },
  { id: 'pizza', emoji: '🍕', name: 'Pizza', hunger: 50, happiness: 15, health: 0, cost: 25, quality: 'premium' as const },
  { id: 'cake', emoji: '🍰', name: 'Cake', hunger: 30, happiness: 30, health: 0, cost: 30, quality: 'premium' as const },
  { id: 'sushi', emoji: '🍣', name: 'Sushi', hunger: 60, happiness: 20, health: 5, cost: 50, quality: 'premium' as const },
  { id: 'candy', emoji: '🍬', name: 'Candy', hunger: 5, happiness: 15, health: -5, cost: 6, quality: 'basic' as const },
  { id: 'steak', emoji: '🥩', name: 'Steak', hunger: 70, happiness: 25, health: 10, cost: 80, quality: 'premium' as const },
  { id: 'salad', emoji: '🥗', name: 'Salad', hunger: 25, happiness: 5, health: 15, cost: 10, quality: 'premium' as const },
];

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

const PERSONALITIES: Personality[] = ['lazy', 'picky_eater', 'messy', 'anxious', 'athletic', 'sensitive', 'independent'];
const WEATHERS: Weather[] = ['sunny', 'rainy', 'cold', 'hot', 'storm'];
const CRITICAL_EVENTS: CriticalEvent[] = ['choking', 'escaped', 'nightmare', 'tantrum', 'fever'];
const MISBEHAVIORS: MisbehaviorType[] = ['refuses_eat', 'throws_toys', 'runs_around', 'wont_sleep'];

function randomPersonality(): Personality {
  return PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
}

function randomWeather(): Weather {
  const weights = [35, 25, 15, 15, 10]; // sunny more common
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < WEATHERS.length; i++) {
    r -= weights[i];
    if (r <= 0) return WEATHERS[i];
  }
  return 'sunny';
}

const initialPet: PetState = {
  name: '',
  species: 'meowchi',
  stage: 'egg',
  hunger: 80,
  happiness: 80,
  health: 100,
  hygiene: 80,
  energy: 100,
  coins: 50,
  level: 1,
  xp: 0,
  age: 0,
  bond: 0,
  poops: 0,
  isSleeping: false,
  isDead: false,
  lastUpdate: Date.now(),
  createdAt: Date.now(),
  adopted: false,
  difficulty: 'normal',
  isSick: false,
  sickSince: null,
  weather: 'sunny',
  weatherChangedAt: Date.now(),
  personality: 'lazy',
  activeEvent: null,
  eventStartedAt: null,
  eventTaps: 0,
  activeMisbehavior: null,
  misbehaviorAt: null,
  deathCause: '',
  playCoinsThisHour: 0,
  playCoinsHourStart: Date.now(),
};

function getStageForAge(ageMinutes: number): LifeStage {
  const hours = ageMinutes / 60;
  if (hours < 10 / 60) return 'egg';
  if (hours < 24) return 'baby';
  if (hours < 72) return 'child';
  if (hours < 144) return 'teen';
  if (hours < 480) return 'adult';
  return 'senior';
}

export function formatAge(ageMinutes: number): string {
  const hours = ageMinutes / 60;
  if (hours < 1) return `${Math.floor(ageMinutes)}m`;
  if (hours < 24) return `${Math.floor(hours)}h ${Math.floor(ageMinutes % 60)}m`;
  const days = Math.floor(hours / 24);
  const remHours = Math.floor(hours % 24);
  return `${days}d ${remHours}h`;
}

export const getSpeciesData = (species: Species) => SPECIES_DATA[species];

export const PERSONALITY_INFO: Record<Personality, { emoji: string; name: string; desc: string }> = {
  lazy: { emoji: '😴', name: 'Lazy', desc: 'Energy drains 50% faster' },
  picky_eater: { emoji: '🤢', name: 'Picky Eater', desc: 'Rejects basic food' },
  messy: { emoji: '💩', name: 'Messy', desc: 'Poops 50% more' },
  anxious: { emoji: '😰', name: 'Anxious', desc: 'Happiness drops 30% faster' },
  athletic: { emoji: '🏃', name: 'Athletic', desc: 'Needs more playtime' },
  sensitive: { emoji: '🤧', name: 'Sensitive', desc: 'Gets sick easier' },
  independent: { emoji: '😎', name: 'Independent', desc: "Doesn't call for help" },
};

export const WEATHER_INFO: Record<Weather, { emoji: string; name: string; effect: string }> = {
  sunny: { emoji: '☀️', name: 'Sunny', effect: 'Happiness decays slower' },
  rainy: { emoji: '🌧️', name: 'Rainy', effect: 'Pet gets sad faster' },
  cold: { emoji: '❄️', name: 'Cold', effect: 'Hunger increases faster' },
  hot: { emoji: '🔥', name: 'Hot', effect: 'Hygiene drops faster' },
  storm: { emoji: '🌪️', name: 'Storm', effect: 'All stats decay 2x for 1hr!' },
};

export const CRITICAL_EVENT_INFO: Record<CriticalEvent, { emoji: string; name: string; instruction: string }> = {
  choking: { emoji: '🚨', name: 'CHOKING!', instruction: 'Tap rapidly to save!' },
  escaped: { emoji: '🏃', name: 'ESCAPED!', instruction: 'Tap to search! Find within 10 min!' },
  nightmare: { emoji: '😱', name: 'NIGHTMARE!', instruction: 'Comfort immediately!' },
  tantrum: { emoji: '😤', name: 'TANTRUM!', instruction: 'Calm down or happiness crashes!' },
  fever: { emoji: '🤒', name: 'FEVER!', instruction: 'Medicine + ice pack needed NOW!' },
};

export const MISBEHAVIOR_INFO: Record<MisbehaviorType, { emoji: string; desc: string; correctResponse: 'scold' | 'praise' }> = {
  refuses_eat: { emoji: '🚫🍔', desc: 'Refuses to eat!', correctResponse: 'scold' },
  throws_toys: { emoji: '🧸💥', desc: 'Throwing toys everywhere!', correctResponse: 'scold' },
  runs_around: { emoji: '🏃💨', desc: "Won't stay still for cleaning!", correctResponse: 'praise' },
  wont_sleep: { emoji: '😤💤', desc: "Won't go to sleep!", correctResponse: 'praise' },
};

const SICKNESS_DRAIN: Record<Difficulty, { rate: number; window: number }> = {
  easy: { rate: 5, window: 360 },
  normal: { rate: 10, window: 180 },
  hard: { rate: 15, window: 120 },
  nightmare: { rate: 20, window: 60 },
};

export const usePetStore = create<PetState & PetActions>()(
  persist(
    (set, get) => ({
      ...initialPet,

      adopt: (name, species, difficulty) => set({
        ...initialPet,
        name,
        species,
        difficulty,
        stage: 'egg',
        personality: randomPersonality(),
        weather: randomWeather(),
        weatherChangedAt: Date.now(),
        lastUpdate: Date.now(),
        createdAt: Date.now(),
        adopted: true,
      }),

      feed: (foodId) => {
        const food = FOOD_ITEMS.find(f => f.id === foodId);
        if (!food) return;
        const s = get();
        if (s.isDead || s.isSleeping) return;
        if (s.coins < food.cost) return;
        // Picky eater rejects basic food
        if (s.personality === 'picky_eater' && food.quality === 'basic') {
          set({ happiness: clamp(s.happiness - 5) });
          return;
        }
        // Sick pet gets less from food
        const sickPenalty = s.isSick ? 0.5 : 1;
        const xpGain = Math.ceil(food.cost / 5);
        let newXp = s.xp + xpGain;
        let newLevel = s.level;
        const xpNeeded = newLevel * 50;
        if (newXp >= xpNeeded) {
          newXp -= xpNeeded;
          newLevel++;
        }
        set({
          hunger: clamp(s.hunger + food.hunger * sickPenalty),
          happiness: clamp(s.happiness + food.happiness * sickPenalty),
          health: clamp(s.health + food.health),
          energy: clamp(s.energy - 2),
          coins: s.coins - food.cost,
          bond: clamp(s.bond + 1),
          xp: newXp,
          level: newLevel,
        });
      },

      play: () => {
        const s = get();
        if (s.isDead || s.isSleeping || s.energy < 10) return;
        const now = Date.now();
        // Reset hourly counter if an hour has passed
        let playCoinsThisHour = s.playCoinsThisHour;
        let playCoinsHourStart = s.playCoinsHourStart;
        if (now - playCoinsHourStart > 3600000) {
          playCoinsThisHour = 0;
          playCoinsHourStart = now;
        }
        const coinEarned = playCoinsThisHour >= 30 ? 0 : Math.min(Math.floor(Math.random() * 10) + 5, 30 - playCoinsThisHour);
        const happinessGain = s.personality === 'athletic' ? 30 : 20;
        const energyCost = s.personality === 'athletic' ? 20 : 15;
        const xpGain = 5;
        let newXp = s.xp + xpGain;
        let newLevel = s.level;
        const xpNeeded = newLevel * 50;
        if (newXp >= xpNeeded) {
          newXp -= xpNeeded;
          newLevel++;
        }
        set({
          happiness: clamp(s.happiness + happinessGain),
          energy: clamp(s.energy - energyCost),
          hunger: clamp(s.hunger - 5),
          bond: clamp(s.bond + 2),
          coins: s.coins + coinEarned,
          playCoinsThisHour: playCoinsThisHour + coinEarned,
          playCoinsHourStart,
          xp: newXp,
          level: newLevel,
        });
      },

      clean: () => {
        const s = get();
        if (s.isDead) return;
        set({
          hygiene: clamp(s.hygiene + 30),
          poops: 0,
          happiness: clamp(s.happiness + 5),
          bond: clamp(s.bond + 1),
        });
      },

      sleep: () => {
        const s = get();
        if (s.isDead) return;
        set({ isSleeping: true });
      },

      wake: () => set({ isSleeping: false }),

      heal: () => {
        const s = get();
        if (s.isDead) return;
        const baseCost = 20;
        const cost = s.stage === 'senior' ? baseCost * 2 : baseCost;
        if (s.coins < cost) return;
        set({
          health: clamp(s.health + 40),
          happiness: clamp(s.happiness - 10),
          coins: s.coins - cost,
          isSick: false,
          sickSince: null,
        });
      },

      addCoins: (amount) => set(s => ({ coins: s.coins + amount })),
      spendCoins: (amount) => {
        const s = get();
        if (s.coins < amount) return false;
        set({ coins: s.coins - amount });
        return true;
      },
      addXp: (amount) => {
        const s = get();
        let newXp = s.xp + amount;
        let newLevel = s.level;
        const xpNeeded = newLevel * 50;
        if (newXp >= xpNeeded) {
          newXp -= xpNeeded;
          newLevel++;
        }
        set({ xp: newXp, level: newLevel });
      },

      tapEvent: () => {
        const s = get();
        if (!s.activeEvent) return;
        const newTaps = s.eventTaps + 1;
        if (s.activeEvent === 'choking' && newTaps >= 15) {
          set({ activeEvent: null, eventStartedAt: null, eventTaps: 0, bond: clamp(s.bond + 5) });
        } else if (s.activeEvent === 'escaped' && newTaps >= 20) {
          set({ activeEvent: null, eventStartedAt: null, eventTaps: 0, bond: clamp(s.bond + 5) });
        } else {
          set({ eventTaps: newTaps });
        }
      },

      resolveEvent: () => {
        const s = get();
        if (!s.activeEvent) return;
        const event = s.activeEvent;
        let updates: Partial<PetState> = { activeEvent: null, eventStartedAt: null, eventTaps: 0 };
        if (event === 'nightmare') {
          updates.happiness = clamp(s.happiness + 10);
          updates.bond = clamp(s.bond + 3);
        } else if (event === 'tantrum') {
          updates.happiness = clamp(s.happiness + 5);
          updates.bond = clamp(s.bond + 2);
        } else if (event === 'fever') {
          if (s.coins >= 30) {
            updates.health = clamp(s.health + 30);
            updates.coins = s.coins - 30;
            updates.isSick = false;
            updates.sickSince = null;
          }
        }
        set(updates);
      },

      dismissEvent: () => {
        const s = get();
        if (!s.activeEvent) return;
        const event = s.activeEvent;
        let updates: Partial<PetState> = { activeEvent: null, eventStartedAt: null, eventTaps: 0 };
        // Penalties for ignoring
        if (event === 'choking') {
          updates.health = clamp(s.health - 50);
          if (s.difficulty === 'nightmare') updates.isDead = true;
        } else if (event === 'escaped') {
          updates.happiness = clamp(s.happiness - 40);
          updates.bond = clamp(s.bond - 10);
        } else if (event === 'tantrum') {
          updates.happiness = clamp(s.happiness - 30);
        } else if (event === 'fever') {
          updates.health = clamp(s.health - 30);
          updates.isSick = true;
          updates.sickSince = Date.now();
        } else if (event === 'nightmare') {
          updates.happiness = clamp(s.happiness - 20);
        }
        set(updates);
      },

      discipline: (response) => {
        const s = get();
        if (!s.activeMisbehavior) return;
        const info = MISBEHAVIOR_INFO[s.activeMisbehavior];
        let updates: Partial<PetState> = { activeMisbehavior: null, misbehaviorAt: null };
        if (response === 'ignore') {
          updates.bond = clamp(s.bond - 5);
        } else if (response === info.correctResponse) {
          updates.bond = clamp(s.bond + 3);
          updates.happiness = clamp(s.happiness + 5);
        } else {
          updates.happiness = clamp(s.happiness - 10);
        }
        set(updates);
      },

      tick: () => {
        const s = get();
        if (!s.adopted || s.isDead) return;
        const now = Date.now();
        const elapsed = (now - s.lastUpdate) / 60000;
        if (elapsed < 0.5) return;

        const ageNow = s.age + elapsed;
        const newStage = getStageForAge(ageNow);

        let hunger = s.hunger;
        let happiness = s.happiness;
        let hygiene = s.hygiene;
        let energy = s.energy;
        let health = s.health;
        let poops = s.poops;
        let isSick = s.isSick;
        let sickSince = s.sickSince;
        let weather = s.weather;
        let weatherChangedAt = s.weatherChangedAt;
        let activeEvent = s.activeEvent;
        let eventStartedAt = s.eventStartedAt;
        let activeMisbehavior = s.activeMisbehavior;
        let misbehaviorAt = s.misbehaviorAt;
        let isDead = false;
        let deathCause = '';

        // Weather change every ~60 min
        if (now - weatherChangedAt > 60 * 60000) {
          weather = randomWeather();
          weatherChangedAt = now;
        }

        // Weather multipliers
        let hungerMult = 1;
        let happinessMult = 1;
        let hygieneMult = 1;
        let energyMult = 1;
        switch (weather) {
          case 'sunny': happinessMult = 0.7; energyMult = 0.8; break;
          case 'rainy': happinessMult = 1.5; break;
          case 'cold': hungerMult = 1.5; break;
          case 'hot': hygieneMult = 1.5; break;
          case 'storm': hungerMult = 2; happinessMult = 2; hygieneMult = 2; energyMult = 2; break;
        }

        // Personality multipliers
        if (s.personality === 'lazy') energyMult *= 1.5;
        if (s.personality === 'anxious') happinessMult *= 1.3;
        if (s.personality === 'athletic' && happiness > 50) happinessMult *= 1.2;

        // Senior aging effects
        if (newStage === 'senior') {
          energyMult *= 1.5;
        }

        if (!s.isSleeping) {
          hunger = clamp(hunger - elapsed * 0.5 * hungerMult);
          happiness = clamp(happiness - elapsed * 0.3 * happinessMult);
          hygiene = clamp(hygiene - elapsed * 0.2 * hygieneMult);
          energy = clamp(energy - elapsed * 0.15 * energyMult);
        } else {
          energy = clamp(energy + elapsed * 2);
          if (energy >= 100) {
            // Will wake via UI
          }
        }

        // Poops
        const poopChance = s.personality === 'messy' ? 0.045 : 0.03;
        if (Math.random() < elapsed * poopChance) {
          poops = Math.min(poops + 1, 5);
          hygiene = clamp(hygiene - 10);
        }

        // Sickness system
        if (!isSick) {
          const sickChance = s.personality === 'sensitive' ? 0.008 : 0.004;
          if ((hunger < 30 || hygiene < 30) && Math.random() < elapsed * sickChance) {
            isSick = true;
            sickSince = now;
          }
        }

        if (isSick) {
          const sickInfo = SICKNESS_DRAIN[s.difficulty];
          health = clamp(health - elapsed * sickInfo.rate / 60);
          // Sickness spreads
          hunger = clamp(hunger - elapsed * 0.2);
          happiness = clamp(happiness - elapsed * 0.3);
          hygiene = clamp(hygiene - elapsed * 0.15);
          // Check sickness window
          if (sickSince && (now - sickSince) > sickInfo.window * 60000) {
            if (s.difficulty === 'nightmare') {
              isDead = true;
              deathCause = 'Died from untreated illness';
            } else {
              health = clamp(health - 30);
            }
          }
        }

        // Health degrades if stats are low
        if (hunger < 30 || hygiene < 30) {
          health = clamp(health - elapsed * 0.3);
        }
        if (hunger < 10 || hygiene < 10) {
          health = clamp(health - elapsed * 0.8);
        }

        // Senior peaceful passing
        if (newStage === 'senior' && ageNow > 30 * 24 * 60) {
          if (Math.random() < elapsed * 0.001) {
            isDead = true;
            deathCause = 'Passed away peacefully of old age';
          }
        }

        if (health <= 0) {
          isDead = true;
          deathCause = deathCause || 'Health reached zero';
        }

        // Random critical events (not during sleep, not if one is active)
        if (!activeEvent && !s.isSleeping && !isDead && Math.random() < elapsed * 0.003) {
          activeEvent = CRITICAL_EVENTS[Math.floor(Math.random() * CRITICAL_EVENTS.length)];
          eventStartedAt = now;
        }

        // Auto-fail events after timeout
        if (activeEvent && eventStartedAt) {
          const eventElapsed = (now - eventStartedAt) / 60000;
          const timeout = activeEvent === 'escaped' ? 10 : 2;
          if (eventElapsed > timeout) {
            // Event timed out - apply penalties
            if (activeEvent === 'choking' && s.difficulty === 'nightmare') {
              isDead = true;
              deathCause = 'Choked';
            } else if (activeEvent === 'choking') {
              health = clamp(health - 40);
            } else if (activeEvent === 'escaped') {
              happiness = clamp(happiness - 30);
            } else if (activeEvent === 'fever') {
              health = clamp(health - 20);
              isSick = true;
              sickSince = sickSince || now;
            } else if (activeEvent === 'tantrum') {
              happiness = clamp(happiness - 25);
            } else if (activeEvent === 'nightmare') {
              happiness = clamp(happiness - 15);
            }
            activeEvent = null;
            eventStartedAt = null;
          }
        }

        // Random misbehavior (not during sleep)
        if (!activeMisbehavior && !s.isSleeping && !isDead && newStage === 'teen' && Math.random() < elapsed * 0.005) {
          activeMisbehavior = MISBEHAVIORS[Math.floor(Math.random() * MISBEHAVIORS.length)];
          misbehaviorAt = now;
        }

        // Auto-dismiss misbehavior after 5 min
        if (activeMisbehavior && misbehaviorAt && (now - misbehaviorAt) > 5 * 60000) {
          activeMisbehavior = null;
          misbehaviorAt = null;
        }

        set({
          hunger, happiness, hygiene, energy, health, poops,
          age: ageNow,
          stage: newStage,
          isDead,
          deathCause,
          lastUpdate: now,
          isSick, sickSince,
          weather, weatherChangedAt,
          activeEvent, eventStartedAt,
          activeMisbehavior, misbehaviorAt,
        });
      },

      reset: () => set({ ...initialPet }),
    }),
    { name: 'petpocket-save' }
  )
);
