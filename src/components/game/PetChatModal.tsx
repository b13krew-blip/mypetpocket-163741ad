import { useState, useRef, useEffect, useCallback } from 'react';
import { usePetStore } from '@/store/petStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pet-chat`;

interface PetChatModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PetChatModal({ open, onClose }: PetChatModalProps) {
  const { name, species, stage, hunger, happiness, health, energy, isSleeping, isSick, weather, personality, bond, age } = usePetStore();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const petContext = { name, species, stage, hunger, happiness, health, energy, isSleeping, isSick, weather, personality, bond, age };

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 50);
  }, []);

  // Stream helper
  const streamChat = useCallback(async (msgs: Msg[], onDelta: (t: string) => void, onDone: () => void) => {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: msgs, petContext }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `Error ${resp.status}`);
    }
    if (!resp.body) throw new Error('No response body');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buf.indexOf('\n')) !== -1) {
        let line = buf.slice(0, idx);
        buf = buf.slice(idx + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (!line.startsWith('data: ')) continue;
        const json = line.slice(6).trim();
        if (json === '[DONE]') { onDone(); return; }
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch { /* partial */ }
      }
    }
    onDone();
  }, [petContext]);

  // Get opening message when chat opens
  useEffect(() => {
    if (!open || initialized) return;
    setInitialized(true);
    setIsLoading(true);

    let assistantSoFar = '';
    const update = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages([{ role: 'assistant', content: assistantSoFar }]);
      scrollToBottom();
    };

    streamChat([], update, () => setIsLoading(false)).catch(e => {
      console.error(e);
      toast({ title: '💬 Chat error', description: e.message, variant: 'destructive' });
      setIsLoading(false);
    });
  }, [open, initialized, streamChat, scrollToBottom]);

  // Reset on close
  const handleClose = () => {
    setMessages([]);
    setInitialized(false);
    setInput('');
    onClose();
  };

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    const userMsg: Msg = { role: 'user', content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    scrollToBottom();
    setIsLoading(true);

    let assistantSoFar = '';
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && prev.length > newMsgs.length) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev.slice(0, newMsgs.length), { role: 'assistant', content: assistantSoFar }];
      });
      scrollToBottom();
    };

    try {
      await streamChat(newMsgs, upsert, () => setIsLoading(false));
    } catch (e: any) {
      console.error(e);
      toast({ title: '💬 Chat error', description: e.message, variant: 'destructive' });
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] bg-foreground/40 backdrop-blur-sm flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="w-full max-w-md bg-background rounded-t-3xl flex flex-col"
          style={{ height: '75vh' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <h2 className="font-fredoka text-base font-bold text-foreground">Chat with {name}</h2>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-muted">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm font-nunito ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  {m.content}
                  {m.role === 'assistant' && isLoading && i === messages.length - 1 && (
                    <span className="inline-block w-1.5 h-4 bg-foreground/40 ml-0.5 animate-pulse rounded-sm" />
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages.length === 0 && (
              <div className="flex justify-start">
                <div className="bg-muted px-3 py-2 rounded-2xl rounded-bl-md">
                  <span className="text-sm text-muted-foreground font-nunito animate-pulse">thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-border">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder={`Say something to ${name}...`}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-muted text-foreground text-sm font-nunito placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                disabled={isLoading}
              />
              <button
                onClick={send}
                disabled={isLoading || !input.trim()}
                className="p-2.5 rounded-full bg-primary text-primary-foreground disabled:opacity-40 active:scale-95 transition-transform"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
