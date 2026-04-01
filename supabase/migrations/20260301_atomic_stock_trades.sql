-- INVESTMENTSIMULATOR: ATOMIC STOCK TRADE EXECUTION
-- Target: Apply to Supabase SQL Editor

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
  p_fees DECIMAL,
  p_order_type TEXT DEFAULT 'market',
  p_status TEXT DEFAULT 'completed'
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

  -- 2. Lock the profile row to prevent concurrent updates (TOCTOU protection)
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
  ELSIF p_type = 'SELL' THEN
    -- Lock the holdings row to prevent concurrent updates
    SELECT quantity INTO v_current_shares
    FROM public.holdings
    WHERE user_id = p_user_id AND symbol = p_symbol
    FOR UPDATE;

    IF v_current_shares IS NULL OR v_current_shares < p_quantity THEN
      RAISE EXCEPTION 'Insufficient shares for this trade';
    END IF;
    v_new_balance := v_cash_balance + p_total_cost;
  ELSE
    RAISE EXCEPTION 'Invalid trade type';
  END IF;

  -- 3. Insert Transaction
  INSERT INTO public.transactions (user_id, symbol, type, quantity, price_per_share, total_amount, fees, order_type, status, limit_price)
  VALUES (p_user_id, p_symbol, p_type, p_quantity, p_current_price, p_total_cost, p_fees, p_order_type, p_status, 
    CASE WHEN p_order_type = 'limit' THEN p_current_price ELSE NULL END);

  -- 4. Update Balance
  UPDATE public.profiles
  SET cash_balance = v_new_balance
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

  RETURN jsonb_build_object('success', true);
END;
$$;
