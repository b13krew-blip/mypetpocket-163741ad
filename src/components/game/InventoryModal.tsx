import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { usePetStore } from '@/store/petStore';
import { STORE_ITEMS } from '@/pages/StorePage';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface Props { open: boolean; onClose: () => void; }

interface InvItem { id: string; item_id: string; quantity: number; }

export default function InventoryModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<InvItem[]>([]);

  useEffect(() => {
    if (!open || !user) return;
    supabase.from('inventory').select('id, item_id, quantity').eq('user_id', user.id).then(({ data }) => {
      if (data) setItems(data);
    });
  }, [open, user]);

  const useItem = async (inv: InvItem) => {
    const storeItem = STORE_ITEMS.find(s => s.id === inv.item_id);
    if (!storeItem) return;

    const state = usePetStore.getState();
    const stat = storeItem.effect.stat as keyof typeof state;
    const current = typeof state[stat] === 'number' ? state[stat] as number : 0;
    usePetStore.setState({ [stat]: Math.min(100, current + storeItem.effect.value) } as any);

    if (inv.quantity <= 1) {
      await supabase.from('inventory').delete().eq('id', inv.id);
      setItems(prev => prev.filter(i => i.id !== inv.id));
    } else {
      await supabase.from('inventory').update({ quantity: inv.quantity - 1 }).eq('id', inv.id);
      setItems(prev => prev.map(i => i.id === inv.id ? { ...i, quantity: i.quantity - 1 } : i));
    }

    toast({ title: `Used ${storeItem.emoji} ${storeItem.name}!` });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md bg-card rounded-t-3xl p-6 pb-8"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-fredoka text-xl font-semibold text-foreground">🎒 Inventory</h3>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-center text-muted-foreground font-nunito text-sm py-8">
                No items yet! Visit the store to buy some.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {items.map(inv => {
                  const storeItem = STORE_ITEMS.find(s => s.id === inv.item_id);
                  if (!storeItem) return null;
                  return (
                    <motion.button
                      key={inv.id}
                      className="game-card p-3 flex flex-col items-center gap-1 hover:bg-muted/50"
                      onClick={() => useItem(inv)}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-3xl">{storeItem.emoji}</span>
                      <span className="text-xs font-fredoka font-semibold text-foreground">{storeItem.name}</span>
                      <span className="text-[10px] text-primary font-bold font-nunito">x{inv.quantity}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
