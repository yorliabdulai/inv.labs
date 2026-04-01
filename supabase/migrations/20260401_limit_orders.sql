-- ============================================================
-- LIMIT ORDERS MIGRATION
-- inv.labs — 2026-04-01
-- Adds support for pending orders and trade types.
-- ============================================================

-- 1. Extend transactions table with order metadata
ALTER TABLE public.transactions
    ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'market', -- 'market' | 'limit'
    ADD COLUMN IF NOT EXISTS status     TEXT DEFAULT 'completed', -- 'pending' | 'completed' | 'cancelled'
    ADD COLUMN IF NOT EXISTS limit_price DECIMAL,
    ADD COLUMN IF NOT EXISTS executed_at TIMESTAMPTZ;

-- 2. Backfill existing transactions (safety check)
UPDATE public.transactions
SET order_type = 'market', status = 'completed'
WHERE order_type IS NULL OR status IS NULL;

-- 3. Create index for matching engine performance
CREATE INDEX IF NOT EXISTS idx_transactions_pending_orders 
ON public.transactions (status, order_type) 
WHERE status = 'pending';

-- 4. Create index for user history filtering
CREATE INDEX IF NOT EXISTS idx_transactions_user_status
ON public.transactions (user_id, status);
