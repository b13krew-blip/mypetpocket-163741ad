import { motion } from 'framer-motion';
import { usePetStore } from '@/store/petStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface StoreItem {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  cost: number;
  effect: { stat: string; value: number };
}

export const STORE_ITEMS: StoreItem[] = [
  { id: 'toy_ball', emoji: '⚽', name: 'Toy Ball', desc: '+25 happiness', cost: 30, effect: { stat: 'happiness', value: 25 } },
  { id: 'premium_bed', emoji: '🛏️', name: 'Premium Bed', desc: '+40 energy', cost: 50, effect: { stat: 'energy', value: 40 } },
  { id: 'vitamins', emoji: '💊', name: 'Vitamins', desc: '+30 health', cost: 40, effect: { stat: 'health', value: 30 } },
  { id: 'luxury_shampoo', emoji: '🧴', name: 'Luxury Shampoo', desc: '+35 hygiene', cost: 35, effect: { stat: 'hygiene', value: 35 } },
  { id: 'treat_bag', emoji: '🎒', name: 'Treat Bag', desc: '+50 hunger', cost: 45, effect: { stat: 'hunger', value: 50 } },
  { id: 'energy_drink', emoji: '⚡', name: 'Energy Drink', desc: '+50 energy', cost: 60, effect: { stat: 'energy', value: 50 } },
];

export default function StorePage() {
  const { coins } = usePetStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const buyItem = async (item: StoreItem) => {
    const store = usePetStore.getState();
    if (!store.spendCoins(item.cost)) {
      toast({ title: 'Not enough coins!', variant: 'destructive' });
      return;
    }

    // Add to inventory in DB
    if (user) {
      const { data: existing } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('item_id', item.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('inventory').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
      } else {
        await supabase.from('inventory').insert({ user_id: user.id, item_id: item.id, quantity: 1 });
      }
    }

    toast({ title: `Bought ${item.emoji} ${item.name}!`, description: 'Added to your inventory.' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="font-fredoka text-xl font-bold text-foreground">🛒 Pet Store</h1>
        <span className="px-3 py-1 rounded-full bg-coin/20 font-fredoka text-sm font-semibold text-accent-foreground">
          💰 {coins}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pb-6">
        {STORE_ITEMS.map((item, i) => {
          const canAfford = coins >= item.cost;
          return (
            <motion.button
              key={item.id}
              className={`game-card p-4 flex flex-col items-center gap-2 transition-all
                ${canAfford ? 'hover:bg-muted/50' : 'opacity-50 cursor-not-allowed'}`}
              onClick={() => canAfford && buyItem(item)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={canAfford ? { scale: 0.95 } : {}}
              disabled={!canAfford}
            >
              <span className="text-4xl">{item.emoji}</span>
              <span className="font-fredoka font-semibold text-sm text-foreground">{item.name}</span>
              <span className="text-[10px] text-muted-foreground font-nunito">{item.desc}</span>
              <span className="text-xs font-fredoka font-semibold text-primary">💰 {item.cost}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
