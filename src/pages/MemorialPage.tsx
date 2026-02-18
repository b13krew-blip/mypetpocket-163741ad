import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatAge, PERSONALITY_INFO } from '@/store/petStore';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface Memorial {
  id: string;
  name: string;
  species: string;
  personality: string;
  death_cause: string;
  level: number;
  bond: number;
  age_minutes: number;
  stage: string;
  difficulty: string;
  evolution_tier: string;
  evolution_name: string;
  died_at: string;
}

const SPECIES_EMOJI: Record<string, string> = {
  meowchi: '🐱', puppup: '🐶', drakeling: '🐉',
};

const TIER_STYLES: Record<string, string> = {
  base: 'text-muted-foreground',
  good: 'text-stat-happiness',
  great: 'text-primary',
  ultimate: 'text-accent',
};

export default function MemorialPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/auth'); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from('pet_memorials')
        .select('*')
        .eq('user_id', user.id)
        .order('died_at', { ascending: false });
      setMemorials((data as Memorial[]) || []);
      setFetching(false);
    };
    fetch();
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-fredoka text-2xl font-bold text-foreground">🪦 Pet Memorial</h1>
      </div>

      {fetching ? (
        <p className="text-center text-muted-foreground font-nunito mt-8">Loading...</p>
      ) : memorials.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <span className="text-5xl">🌈</span>
          <p className="font-fredoka text-lg text-muted-foreground">No memorials yet</p>
          <p className="font-nunito text-sm text-muted-foreground">Your departed pets will be remembered here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {memorials.map((m, i) => {
            const personalityInfo = PERSONALITY_INFO[m.personality as keyof typeof PERSONALITY_INFO];
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-card border border-border p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{SPECIES_EMOJI[m.species] || '👼'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-fredoka text-lg font-bold text-foreground">{m.name}</h2>
                      {m.evolution_name && (
                        <span className={`text-xs font-bold ${TIER_STYLES[m.evolution_tier] || ''}`}>
                          {m.evolution_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-nunito mt-0.5">
                      {m.death_cause || 'Cause unknown'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs font-nunito">
                      <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        🕐 Lived {formatAge(m.age_minutes)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        ⭐ Lv{m.level}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        💕 Bond {Math.round(m.bond)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        🐣 {m.stage}
                      </span>
                      {personalityInfo && (
                        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {personalityInfo.emoji} {personalityInfo.name}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 font-nunito">
                      Passed on {new Date(m.died_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
