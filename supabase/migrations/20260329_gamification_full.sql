-- ============================================================
-- GAMIFICATION FULL MIGRATION
-- inv.labs — 2026-03-29
-- Additive only. No existing tables, columns, or functions removed.
-- ============================================================

-- ── 1. New columns on profiles ────────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_founding_member BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_trades INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_mf_investments INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ato_questions_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lessons_completed_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS videos_watched_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_reviews_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS founding_member_notified BOOLEAN NOT NULL DEFAULT false;

-- ── 2. XP Events log ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.xp_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    xp_value INTEGER NOT NULL DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_events_user_id ON public.xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_event_type ON public.xp_events(event_type);
CREATE INDEX IF NOT EXISTS idx_xp_events_created_at ON public.xp_events(created_at DESC);

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own xp_events" ON public.xp_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own xp_events" ON public.xp_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── 3. User Achievements ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_key TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Service can insert achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── 4. User Daily Missions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_daily_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_key TEXT NOT NULL,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    xp_reward INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id, mission_key, assigned_date)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_missions_user_date ON public.user_daily_missions(user_id, assigned_date);

ALTER TABLE public.user_daily_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own missions" ON public.user_daily_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own missions" ON public.user_daily_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own missions" ON public.user_daily_missions FOR UPDATE USING (auth.uid() = user_id);

-- ── 5. Backfill total_trades from existing transactions ───────────────────────
UPDATE public.profiles p
SET total_trades = COALESCE(tx.cnt, 0)
FROM (
    SELECT user_id, COUNT(*) AS cnt
    FROM public.transactions
    GROUP BY user_id
) tx
WHERE p.id = tx.user_id
  AND p.total_trades = 0;

-- ── 6. Backfill total_mf_investments from existing MF transactions ─────────────
UPDATE public.profiles p
SET total_mf_investments = COALESCE(mf.cnt, 0)
FROM (
    SELECT user_id, COUNT(*) AS cnt
    FROM public.mutual_fund_transactions
    WHERE transaction_type = 'buy'
    GROUP BY user_id
) mf
WHERE p.id = mf.user_id
  AND p.total_mf_investments = 0;

-- ── 7. Assign Founding Member badge — first 1,000 users by created_at ─────────
UPDATE public.profiles
SET is_founding_member = true
WHERE id IN (
    SELECT id FROM public.profiles
    ORDER BY created_at ASC
    LIMIT 1000
);

-- ── 8. Seed XP events for existing trade history (BUY=10xp, SELL=5xp) ────────
-- Only for users who now have knowledge_xp > 0 but no events logged yet
INSERT INTO public.xp_events (user_id, event_type, xp_value, created_at, metadata)
SELECT
    t.user_id,
    CASE WHEN t.type = 'BUY' THEN 'STOCK_TRADE_BUY' ELSE 'STOCK_TRADE_SELL' END AS event_type,
    CASE WHEN t.type = 'BUY' THEN 10 ELSE 5 END AS xp_value,
    t.created_at,
    jsonb_build_object('symbol', t.symbol, 'backfill', true) AS metadata
FROM public.transactions t
WHERE NOT EXISTS (
    SELECT 1 FROM public.xp_events e
    WHERE e.user_id = t.user_id AND e.event_type IN ('STOCK_TRADE_BUY', 'STOCK_TRADE_SELL')
);

-- ── 9. Compute initial levels based on existing knowledge_xp ─────────────────
-- Level thresholds: 1=0, 2=200, 3=600, 4=1200, 5=2500, 6=5000, 7=10000
UPDATE public.profiles
SET level = CASE
    WHEN COALESCE(knowledge_xp, 0) >= 10000 THEN 7
    WHEN COALESCE(knowledge_xp, 0) >= 5000  THEN 6
    WHEN COALESCE(knowledge_xp, 0) >= 2500  THEN 5
    WHEN COALESCE(knowledge_xp, 0) >= 1200  THEN 4
    WHEN COALESCE(knowledge_xp, 0) >= 600   THEN 3
    WHEN COALESCE(knowledge_xp, 0) >= 200   THEN 2
    ELSE 1
END;

-- ── 10. Backfill founding_member achievement for founding members ──────────────
INSERT INTO public.user_achievements (user_id, achievement_key, earned_at)
SELECT id, 'founding_member', created_at
FROM public.profiles
WHERE is_founding_member = true
ON CONFLICT (user_id, achievement_key) DO NOTHING;

-- ── 11. Backfill first_trade achievement for users with trades ────────────────
INSERT INTO public.user_achievements (user_id, achievement_key, earned_at)
SELECT DISTINCT ON (user_id) user_id, 'first_trade', MIN(created_at) OVER (PARTITION BY user_id)
FROM public.transactions
ON CONFLICT (user_id, achievement_key) DO NOTHING;

-- ── 12. Backfill first_mf achievement for users with MF buys ─────────────────
INSERT INTO public.user_achievements (user_id, achievement_key, earned_at)
SELECT DISTINCT ON (user_id) user_id, 'first_mf', MIN(transaction_date) OVER (PARTITION BY user_id)
FROM public.mutual_fund_transactions
WHERE transaction_type = 'buy'
ON CONFLICT (user_id, achievement_key) DO NOTHING;

-- ── 13. Backfill portfolio_builder achievement (25+ trades) ──────────────────
INSERT INTO public.user_achievements (user_id, achievement_key, earned_at)
SELECT user_id, 'portfolio_builder', NOW()
FROM public.profiles
WHERE total_trades >= 25
ON CONFLICT (user_id, achievement_key) DO NOTHING;

-- ── 14. Update get_leaderboard to return new fields ───────────────────────────
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_limit INT, p_offset INT)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    avatar_url TEXT,
    knowledge_xp INTEGER,
    accreditation_level INTEGER,
    level INTEGER,
    is_founding_member BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        id, 
        full_name, 
        avatar_url, 
        knowledge_xp, 
        accreditation_level,
        level,
        is_founding_member
    FROM public.profiles
    ORDER BY knowledge_xp DESC NULLS LAST
    LIMIT p_limit OFFSET p_offset;
$$;

-- ── 15. Update execute_stock_trade to also log to xp_events and increment total_trades ─
CREATE OR REPLACE FUNCTION public.execute_stock_trade(
  p_user_id UUID,
  p_symbol TEXT,
  p_stock_name TEXT,
  p_stock_sector TEXT,
  p_current_price DECIMAL,
  p_change_percent DECIMAL,
  p_type TEXT,
  p_quantity INT,
  p_total_cost DECIMAL,
  p_fees DECIMAL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cash_balance DECIMAL;
  v_current_shares INT;
  v_new_balance DECIMAL;
  v_new_quantity INT;
  v_total_existing_cost DECIMAL;
  v_new_total_cost DECIMAL;
  v_new_average_cost DECIMAL;
  v_xp_reward INT;
  v_event_type TEXT;
  v_new_total_trades INT;
  v_new_xp INT;
  v_new_level INT;
BEGIN
  -- 1. Upsert Stock
  INSERT INTO public.stocks (symbol, name, sector, current_price, change_percent, updated_at)
  VALUES (p_symbol, p_stock_name, p_stock_sector, p_current_price, p_change_percent, NOW())
  ON CONFLICT (symbol) DO UPDATE
  SET name = EXCLUDED.name,
      sector = EXCLUDED.sector,
      current_price = EXCLUDED.current_price,
      change_percent = EXCLUDED.change_percent,
      updated_at = EXCLUDED.updated_at;

  -- 2. Lock profile row
  SELECT cash_balance INTO v_cash_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_cash_balance IS NULL THEN
    RAISE EXCEPTION 'Could not retrieve user balance';
  END IF;

  IF p_type = 'BUY' THEN
    IF v_cash_balance < p_total_cost THEN
      RAISE EXCEPTION 'Insufficient funds for this trade';
    END IF;
    v_new_balance := v_cash_balance - p_total_cost;
    v_xp_reward := 10;
    v_event_type := 'STOCK_TRADE_BUY';
  ELSIF p_type = 'SELL' THEN
    SELECT quantity INTO v_current_shares
    FROM public.holdings
    WHERE user_id = p_user_id AND symbol = p_symbol
    FOR UPDATE;

    IF v_current_shares IS NULL OR v_current_shares < p_quantity THEN
      RAISE EXCEPTION 'Insufficient shares for this trade';
    END IF;
    v_new_balance := v_cash_balance + p_total_cost;
    v_xp_reward := 5;
    v_event_type := 'STOCK_TRADE_SELL';
  ELSE
    RAISE EXCEPTION 'Invalid trade type';
  END IF;

  -- 3. Insert Transaction
  INSERT INTO public.transactions (user_id, symbol, type, quantity, price_per_share, total_amount, fees)
  VALUES (p_user_id, p_symbol, p_type, p_quantity, p_current_price, p_total_cost, p_fees);

  -- 4. Log XP event
  INSERT INTO public.xp_events (user_id, event_type, xp_value, metadata)
  VALUES (p_user_id, v_event_type, v_xp_reward, jsonb_build_object('symbol', p_symbol, 'quantity', p_quantity));

  -- 5. Update balance, XP, total_trades, and level atomically
  UPDATE public.profiles
  SET 
    cash_balance = v_new_balance,
    knowledge_xp = COALESCE(knowledge_xp, 0) + v_xp_reward,
    total_trades = COALESCE(total_trades, 0) + 1,
    level = CASE
        WHEN (COALESCE(knowledge_xp, 0) + v_xp_reward) >= 10000 THEN 7
        WHEN (COALESCE(knowledge_xp, 0) + v_xp_reward) >= 5000  THEN 6
        WHEN (COALESCE(knowledge_xp, 0) + v_xp_reward) >= 2500  THEN 5
        WHEN (COALESCE(knowledge_xp, 0) + v_xp_reward) >= 1200  THEN 4
        WHEN (COALESCE(knowledge_xp, 0) + v_xp_reward) >= 600   THEN 3
        WHEN (COALESCE(knowledge_xp, 0) + v_xp_reward) >= 200   THEN 2
        ELSE 1
    END
  WHERE id = p_user_id
  RETURNING total_trades, knowledge_xp, level 
  INTO v_new_total_trades, v_new_xp, v_new_level;

  -- 6. Award first_trade achievement
  IF v_new_total_trades = 1 THEN
    INSERT INTO public.user_achievements (user_id, achievement_key)
    VALUES (p_user_id, 'first_trade')
    ON CONFLICT DO NOTHING;
  END IF;

  -- 7. Award portfolio_builder achievement (25 trades)
  IF v_new_total_trades = 25 THEN
    INSERT INTO public.user_achievements (user_id, achievement_key)
    VALUES (p_user_id, 'portfolio_builder')
    ON CONFLICT DO NOTHING;
  END IF;

  -- 8. Update Holdings
  IF p_type = 'BUY' THEN
    SELECT quantity, average_cost INTO v_current_shares, v_new_average_cost
    FROM public.holdings
    WHERE user_id = p_user_id AND symbol = p_symbol
    FOR UPDATE;

    IF v_current_shares IS NOT NULL THEN
      v_new_quantity := v_current_shares + p_quantity;
      v_total_existing_cost := v_current_shares * v_new_average_cost;
      v_new_total_cost := v_total_existing_cost + p_total_cost;
      v_new_average_cost := v_new_total_cost / v_new_quantity;
      UPDATE public.holdings
      SET quantity = v_new_quantity, average_cost = v_new_average_cost
      WHERE user_id = p_user_id AND symbol = p_symbol;
    ELSE
      v_new_average_cost := p_total_cost / p_quantity;
      INSERT INTO public.holdings (user_id, symbol, quantity, average_cost)
      VALUES (p_user_id, p_symbol, p_quantity, v_new_average_cost);
    END IF;

  ELSIF p_type = 'SELL' THEN
    v_new_quantity := v_current_shares - p_quantity;
    IF v_new_quantity > 0 THEN
      UPDATE public.holdings SET quantity = v_new_quantity
      WHERE user_id = p_user_id AND symbol = p_symbol;
    ELSE
      DELETE FROM public.holdings WHERE user_id = p_user_id AND symbol = p_symbol;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'xp_awarded', v_xp_reward,
    'total_trades', v_new_total_trades,
    'new_level', v_new_level,
    'milestone_first_trade', (v_new_total_trades = 1),
    'milestone_10_trades', (v_new_total_trades = 10),
    'milestone_25_trades', (v_new_total_trades = 25),
    'milestone_50_trades', (v_new_total_trades = 50),
    'milestone_100_trades', (v_new_total_trades = 100)
  );
END;
$$;

-- Grant leaderboard functions access
GRANT EXECUTE ON FUNCTION public.get_leaderboard TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_count TO anon, authenticated;
