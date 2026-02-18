import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePetStore, getEvolution } from '@/store/petStore';
import { useAuth } from './useAuth';

export function useMemorialSave() {
  const { user } = useAuth();
  const saved = useRef(false);
  const { isDead, name, species, personality, deathCause, level, bond, age, stage, difficulty, hunger, happiness, health, hygiene, energy } = usePetStore();

  useEffect(() => {
    if (!isDead || !user || saved.current || !name) return;
    saved.current = true;

    const avgStats = (hunger + happiness + health + hygiene + energy) / 5;
    const evolution = getEvolution(species, stage, bond, avgStats, personality);

    supabase.from('pet_memorials').insert({
      user_id: user.id,
      name,
      species,
      personality,
      death_cause: deathCause || 'Unknown',
      level,
      bond,
      age_minutes: age,
      stage,
      difficulty,
      evolution_tier: evolution.tier,
      evolution_name: evolution.name,
    });
  }, [isDead, user, name, species, personality, deathCause, level, bond, age, stage, difficulty, hunger, happiness, health, hygiene, energy]);

  // Reset ref when pet is alive again (new adoption)
  useEffect(() => {
    if (!isDead) saved.current = false;
  }, [isDead]);
}
