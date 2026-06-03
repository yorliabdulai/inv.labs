-- Ato deep research: macro snapshots, research cache, daily research limits

CREATE TABLE IF NOT EXISTS public.macro_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  policy_rate NUMERIC(6, 2),
  policy_rate_effective_date DATE,
  policy_rate_source_url TEXT,
  sefd_pdf_url TEXT,
  raw_summary TEXT,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_macro_snapshots_fetched_at ON public.macro_snapshots(fetched_at DESC);

CREATE TABLE IF NOT EXISTS public.ato_research_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  symbol TEXT,
  query TEXT NOT NULL,
  brief_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ato_research_cache_key ON public.ato_research_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ato_research_cache_created ON public.ato_research_cache(created_at DESC);

CREATE TABLE IF NOT EXISTS public.ato_research_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  research_count INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_ato_research_usage_user_date ON public.ato_research_usage(user_id, date);

ALTER TABLE public.macro_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ato_research_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ato_research_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read macro snapshots"
  ON public.macro_snapshots FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role manages macro snapshots"
  ON public.macro_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users read research cache"
  ON public.ato_research_cache FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role manages research cache"
  ON public.ato_research_cache FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users view own research usage"
  ON public.ato_research_usage FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own research usage"
  ON public.ato_research_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own research usage"
  ON public.ato_research_usage FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION increment_ato_research_usage(p_user_id UUID)
RETURNS INT AS $$
DECLARE v_count INT;
BEGIN
  INSERT INTO public.ato_research_usage (user_id, date, research_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET research_count = public.ato_research_usage.research_count + 1;

  SELECT research_count INTO v_count
  FROM public.ato_research_usage
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_ato_research_usage(p_user_id UUID)
RETURNS INT AS $$
DECLARE v_count INT;
BEGIN
  SELECT COALESCE(research_count, 0) INTO v_count
  FROM public.ato_research_usage
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_ato_research_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ato_research_usage(UUID) TO authenticated;
