-- ============================================================
-- REFERRAL TRACKING SYSTEM
-- inv.labs — 2026-04-18
-- Adds partners and referrals tables, updates user registration,
-- and hooks into stock & mutual fund trades for activation.
-- ============================================================

-- ── 1. Create Partners Table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    referral_code TEXT UNIQUE NOT NULL,
    email TEXT,
    status TEXT DEFAULT 'active',
    clicks_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (only admin can read/write partners openly)
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can completely manage partners"
ON public.partners FOR ALL
USING (public.is_admin());
-- Read-only policy for partners themselves
CREATE POLICY "Partners can view own profile"
ON public.partners FOR SELECT
USING (auth.email() = email);

-- ── 2. Add referred_by to profiles ────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.partners(id) ON DELETE SET NULL;

-- ── 3. Create Referrals Table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activation_status BOOLEAN NOT NULL DEFAULT FALSE,
    activation_date TIMESTAMP WITH TIME ZONE,
    revenue_attributed NUMERIC NOT NULL DEFAULT 0,
    UNIQUE(referred_user_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can completely manage referrals"
ON public.referrals FOR ALL
USING (public.is_admin());
-- Partners can only see their referrals
CREATE POLICY "Partners can view own referrals"
ON public.referrals FOR SELECT
USING (partner_id IN (SELECT id FROM public.partners WHERE email = auth.email()));

-- ── 4. Update User Registration Hook ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_code TEXT;
  v_partner_id UUID;
BEGIN
  v_referral_code := new.raw_user_meta_data->>'referral_code';
  v_partner_id := NULL;

  -- Attempt to lookup partner via referral code
  IF v_referral_code IS NOT NULL THEN
    SELECT id INTO v_partner_id FROM public.partners WHERE referral_code = v_referral_code;
  END IF;

  INSERT INTO public.profiles (id, full_name, avatar_url, role, cash_balance, referred_by)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    'user',
    10000.00,
    v_partner_id
  );

  -- If partner was found, insert into referrals
  IF v_partner_id IS NOT NULL THEN
    INSERT INTO public.referrals (partner_id, referred_user_id)
    VALUES (v_partner_id, new.id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── 5. Hook Activation to Mutual Fund Trades ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_mf_activation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_type = 'buy' AND NEW.status = 'settled' THEN
    UPDATE public.referrals
    SET activation_status = true, activation_date = now()
    WHERE referred_user_id = NEW.user_id AND activation_status = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_mf_trade_activation ON public.mutual_fund_transactions;
CREATE TRIGGER on_mf_trade_activation
  AFTER INSERT ON public.mutual_fund_transactions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_mf_activation();


-- ── 6. Patch Stock Trade RPC for Activation ───────────────────────────────────
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

  -- 9. Activate Referral (if any exist for user and not activated)
  UPDATE public.referrals
  SET activation_status = true, activation_date = now()
  WHERE referred_user_id = p_user_id AND activation_status = false;

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
