
CREATE TABLE public.pet_memorials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  personality TEXT NOT NULL,
  death_cause TEXT NOT NULL DEFAULT '',
  level INTEGER NOT NULL DEFAULT 1,
  bond NUMERIC NOT NULL DEFAULT 0,
  age_minutes NUMERIC NOT NULL DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'egg',
  difficulty TEXT NOT NULL DEFAULT 'normal',
  evolution_tier TEXT NOT NULL DEFAULT 'base',
  evolution_name TEXT NOT NULL DEFAULT '',
  died_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pet_memorials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memorials" ON public.pet_memorials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memorials" ON public.pet_memorials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own memorials" ON public.pet_memorials FOR DELETE USING (auth.uid() = user_id);
