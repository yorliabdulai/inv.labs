-- Award XP for every trade executed
-- BUY = 10 XP, SELL = 5 XP (encourages buying/holding longer)
-- Also backfill existing traders based on transaction count

-- 1. Update the execute_stock_trade function to award XP
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
BEGIN
  -- 1. Upsert Stock to satisfy Foreign Key
  INSERT INTO public.stocks (symbol, name, sector, current_price, change_percent, updated_at)
  VALUES (p_symbol, p_stock_name, p_stock_sector, p_current_price, p_change_percent, NOW())
  ON CONFLICT (symbol) DO UPDATE
  SET name = EXCLUDED.name,
      sector = EXCLUDED.sector,
      current_price = EXCLUDED.current_price,
      change_percent = EXCLUDED.change_percent,
      updated_at = EXCLUDED.updated_at;

  -- 2. Lock the profile row
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
    v_xp_reward := 10; -- BUY earns 10 XP
  ELSIF p_type = 'SELL' THEN
    SELECT quantity INTO v_current_shares
    FROM public.holdings
    WHERE user_id = p_user_id AND symbol = p_symbol
    FOR UPDATE;

    IF v_current_shares IS NULL OR v_current_shares < p_quantity THEN
      RAISE EXCEPTION 'Insufficient shares for this trade';
    END IF;
    v_new_balance := v_cash_balance + p_total_cost;
    v_xp_reward := 5; -- SELL earns 5 XP
  ELSE
    RAISE EXCEPTION 'Invalid trade type';
  END IF;

  -- 3. Insert Transaction
  INSERT INTO public.transactions (user_id, symbol, type, quantity, price_per_share, total_amount, fees)
  VALUES (p_user_id, p_symbol, p_type, p_quantity, p_current_price, p_total_cost, p_fees);

  -- 4. Update Balance AND award XP atomically
  UPDATE public.profiles
  SET cash_balance = v_new_balance,
      knowledge_xp = COALESCE(knowledge_xp, 0) + v_xp_reward
  WHERE id = p_user_id;

  -- 5. Update Holdings
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
      UPDATE public.holdings
      SET quantity = v_new_quantity
      WHERE user_id = p_user_id AND symbol = p_symbol;
    ELSE
      DELETE FROM public.holdings
      WHERE user_id = p_user_id AND symbol = p_symbol;
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'xp_awarded', v_xp_reward);
END;
$$;

-- 2. Backfill XP for all existing traders based on their historical transaction count
-- BUY transactions = 10 XP each, SELL = 5 XP each
UPDATE public.profiles p
SET knowledge_xp = COALESCE(p.knowledge_xp, 0) + COALESCE(tx.earned_xp, 0)
FROM (
    SELECT 
        user_id,
        SUM(CASE WHEN type = 'BUY' THEN 10 ELSE 5 END) AS earned_xp
    FROM public.transactions
    GROUP BY user_id
) tx
WHERE p.id = tx.user_id
  AND COALESCE(p.knowledge_xp, 0) = 0; -- Only backfill users who have 0 XP to avoid double-counting
