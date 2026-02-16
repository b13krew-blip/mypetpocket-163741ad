import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePetStore, PetState } from '@/store/petStore';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

const PET_STATE_KEYS: (keyof PetState)[] = [
  'name', 'species', 'stage', 'hunger', 'happiness', 'health', 'hygiene', 'energy',
  'coins', 'level', 'xp', 'age', 'bond', 'poops', 'isSleeping', 'isDead', 'lastUpdate',
  'createdAt', 'adopted', 'difficulty', 'isSick', 'sickSince', 'weather', 'weatherChangedAt',
  'personality', 'activeEvent', 'eventStartedAt', 'eventTaps', 'activeMisbehavior',
  'misbehaviorAt', 'deathCause',
];

function extractPetState(store: any): Partial<PetState> {
  const data: any = {};
  for (const key of PET_STATE_KEYS) {
    data[key] = store[key];
  }
  return data;
}

export function usePetSync() {
  const { user } = useAuth();
  const loaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setInterval>>();

  // Load pet data from cloud on login
  useEffect(() => {
    if (!user || loaded.current) return;
    loaded.current = true;

    const load = async () => {
      const { data } = await supabase
        .from('pet_saves')
        .select('pet_data')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.pet_data && typeof data.pet_data === 'object') {
        const petData = data.pet_data as Record<string, any>;
        if (petData.adopted) {
          usePetStore.setState(petData as any);
        }
      }

      // Daily bonus check
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_daily_bonus')
        .eq('user_id', user.id)
        .maybeSingle();

      const lastBonus = profile?.last_daily_bonus ? new Date(profile.last_daily_bonus) : null;
      const now = new Date();
      const isNewDay = !lastBonus || lastBonus.toDateString() !== now.toDateString();

      if (isNewDay) {
        usePetStore.getState().addCoins(50);
        await supabase.from('profiles').update({ last_daily_bonus: now.toISOString() }).eq('user_id', user.id);
        toast({ title: '🎁 Daily Bonus!', description: '+50 coins for logging in today!' });
      }
    };

    load();
  }, [user]);

  // Auto-save every 30 seconds
  const save = useCallback(async () => {
    if (!user) return;
    const state = usePetStore.getState();
    if (!state.adopted) return;
    const petData = extractPetState(state);
    await supabase.from('pet_saves').upsert(
      { user_id: user.id, pet_data: petData as any },
      { onConflict: 'user_id' }
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;
    saveTimer.current = setInterval(save, 30000);
    // Save on page unload
    const handleUnload = () => save();
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      clearInterval(saveTimer.current);
      window.removeEventListener('beforeunload', handleUnload);
      save(); // save on unmount
    };
  }, [user, save]);

  return { save };
}
