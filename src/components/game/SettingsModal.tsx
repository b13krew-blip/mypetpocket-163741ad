import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePetStore, getSpeciesData, PERSONALITY_INFO, formatAge } from '@/store/petStore';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface Props { open: boolean; onClose: () => void; }

export default function SettingsModal({ open, onClose }: Props) {
  const { name, species, stage, age, personality, difficulty, level, bond, reset } = usePetStore();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const speciesData = getSpeciesData(species);
  const personalityInfo = PERSONALITY_INFO[personality];

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    reset();
    navigate('/adopt');
    onClose();
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-sm bg-card rounded-3xl p-6 mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-fredoka text-xl font-semibold text-foreground">⚙️ Settings</h3>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Pet Info */}
            <div className="bg-muted rounded-2xl p-4 mb-4 space-y-1 text-sm font-nunito">
              <p className="font-semibold text-foreground">{speciesData.emoji} {name}</p>
              <p className="text-muted-foreground">Species: {speciesData.name} • Stage: {stage}</p>
              <p className="text-muted-foreground">Age: {formatAge(age)} • Level: {level}</p>
              <p className="text-muted-foreground">Personality: {personalityInfo.emoji} {personalityInfo.name}</p>
              <p className="text-muted-foreground">Bond: {Math.round(bond)} • Difficulty: {difficulty}</p>
            </div>

            {/* Sound toggle */}
            <button
              onClick={() => setSoundOn(!soundOn)}
              className="w-full mb-3 py-2 rounded-2xl font-fredoka text-sm font-semibold bg-muted text-foreground"
            >
              {soundOn ? '🔊 Sound: ON' : '🔇 Sound: OFF'} (placeholder)
            </button>

            {/* Delete pet */}
            <button
              onClick={handleDelete}
              className="w-full mb-3 py-2 rounded-2xl font-fredoka text-sm font-semibold bg-destructive/15 text-destructive hover:bg-destructive/25"
            >
              {confirmDelete ? '⚠️ Confirm Delete Pet?' : '🗑️ Delete Pet'}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full py-2 rounded-2xl font-fredoka text-sm font-semibold bg-muted text-foreground hover:bg-muted/80"
            >
              🚪 Log Out
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
