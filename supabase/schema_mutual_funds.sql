-- Mutual Funds Schema Migration
-- This adds mutual funds investment functionality to the GSE Labs simulator

-- ============================================================================
-- MUTUAL FUNDS TABLE
-- ============================================================================
CREATE TABLE public.mutual_funds (
  fund_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fund_name TEXT NOT NULL,
  fund_manager TEXT NOT NULL,
  fund_type TEXT NOT NULL CHECK (fund_type IN ('Equity Fund', 'Balanced Fund', 'Money Market Fund', 'Fixed Income Fund')),
  current_nav DECIMAL(10, 4) NOT NULL,
  inception_date DATE NOT NULL,
  minimum_investment DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  currency TEXT DEFAULT 'GHS',
  risk_rating INTEGER CHECK (risk_rating BETWEEN 1 AND 5),
  objective TEXT,
  asset_allocation JSONB, -- {"stocks": 60, "bonds": 30, "cash": 10}
  top_holdings JSONB, -- [{"name": "MTN Ghana", "weight": 15.2}, ...]
  expense_ratio DECIMAL(5, 2), -- Annual management fee as percentage
  entry_fee DECIMAL(5, 2) DEFAULT 0, -- One-time fee on purchase
  exit_fee DECIMAL(5, 2) DEFAULT 0, -- Fee on redemption
  minimum_holding_period INTEGER DEFAULT 0, -- Days
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MUTUAL FUND NAV HISTORY TABLE
-- ============================================================================
CREATE TABLE public.mutual_fund_nav_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fund_id UUID REFERENCES public.mutual_funds(fund_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  nav_value DECIMAL(10, 4) NOT NULL,
  daily_change_percent DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fund_id, date)
);

-- Index for faster queries
CREATE INDEX idx_nav_history_fund_date ON public.mutual_fund_nav_history(fund_id, date DESC);

-- ============================================================================
-- MUTUAL FUND PERFORMANCE TABLE
-- ============================================================================
CREATE TABLE public.mutual_fund_performance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fund_id UUID REFERENCES public.mutual_funds(fund_id) ON DELETE CASCADE,
  period TEXT NOT NULL CHECK (period IN ('1_month', '3_months', '6_months', '1_year', '3_years', '5_years', 'inception')),
  return_percent DECIMAL(8, 2) NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fund_id, period)
);

-- ============================================================================
-- USER MUTUAL FUND HOLDINGS TABLE
-- ============================================================================
CREATE TABLE public.user_mutual_fund_holdings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  fund_id UUID REFERENCES public.mutual_funds(fund_id) ON DELETE CASCADE,
  units_held DECIMAL(12, 4) NOT NULL DEFAULT 0,
  average_nav DECIMAL(10, 4) NOT NULL,
  total_invested DECIMAL(12, 2) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, fund_id)
);

-- ============================================================================
-- MUTUAL FUND TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE public.mutual_fund_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  fund_id UUID REFERENCES public.mutual_funds(fund_id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'redeem')),
  units DECIMAL(12, 4) NOT NULL,
  nav_at_transaction DECIMAL(10, 4) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL, -- Gross amount before fees
  entry_fee_amount DECIMAL(10, 2) DEFAULT 0,
  exit_fee_amount DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(12, 2) NOT NULL, -- Actual amount debited/credited
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'settled' CHECK (status IN ('pending', 'settled', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user transaction queries
CREATE INDEX idx_mf_transactions_user ON public.mutual_fund_transactions(user_id, transaction_date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Mutual Funds (public read)
ALTER TABLE public.mutual_funds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mutual funds are viewable by everyone" ON public.mutual_funds FOR SELECT USING (true);

-- NAV History (public read)
ALTER TABLE public.mutual_fund_nav_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "NAV history is viewable by everyone" ON public.mutual_fund_nav_history FOR SELECT USING (true);

-- Performance (public read)
ALTER TABLE public.mutual_fund_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Performance data is viewable by everyone" ON public.mutual_fund_performance FOR SELECT USING (true);

-- User Holdings (private)
ALTER TABLE public.user_mutual_fund_holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own mutual fund holdings" ON public.user_mutual_fund_holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mutual fund holdings" ON public.user_mutual_fund_holdings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mutual fund holdings" ON public.user_mutual_fund_holdings FOR UPDATE USING (auth.uid() = user_id);

-- Transactions (private)
ALTER TABLE public.mutual_fund_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own mutual fund transactions" ON public.mutual_fund_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mutual fund transactions" ON public.mutual_fund_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SEED DATA: Sample Mutual Funds
-- ============================================================================

INSERT INTO public.mutual_funds (fund_name, fund_manager, fund_type, current_nav, inception_date, minimum_investment, risk_rating, objective, asset_allocation, top_holdings, expense_ratio, entry_fee, exit_fee) VALUES
-- 1. Databank Epack Investment Fund
('Databank Epack Investment Fund', 'Databank Asset Management', 'Equity Fund', 2.4523, '2010-03-15', 100.00, 4, 
'To achieve long-term capital growth by investing primarily in equities listed on the Ghana Stock Exchange.',
'{"stocks": 85, "bonds": 10, "cash": 5}'::jsonb,
'[{"name": "MTN Ghana", "weight": 18.5}, {"name": "GCB Bank", "weight": 12.3}, {"name": "Ecobank Ghana", "weight": 10.8}, {"name": "CAL Bank", "weight": 8.2}, {"name": "Standard Chartered", "weight": 7.5}]'::jsonb,
2.50, 0.00, 0.00),

-- 2. EDC Equity Fund
('EDC Equity Fund', 'EDC Investment Management', 'Equity Fund', 1.8934, '2012-06-01', 50.00, 4,
'To provide investors with long-term capital appreciation through investment in a diversified portfolio of equities.',
'{"stocks": 80, "bonds": 15, "cash": 5}'::jsonb,
'[{"name": "MTN Ghana", "weight": 15.2}, {"name": "Access Bank", "weight": 11.5}, {"name": "Ecobank Ghana", "weight": 9.8}, {"name": "GOIL", "weight": 8.5}, {"name": "Fan Milk", "weight": 7.2}]'::jsonb,
2.25, 1.50, 0.00),

-- 3. Republic Balanced Fund
('Republic Balanced Fund', 'Republic Asset Management', 'Balanced Fund', 1.5678, '2011-09-20', 100.00, 3,
'To achieve a balance between capital growth and income generation through a mix of equities and fixed income securities.',
'{"stocks": 60, "bonds": 35, "cash": 5}'::jsonb,
'[{"name": "GCB Bank", "weight": 12.5}, {"name": "Government Bonds", "weight": 25.0}, {"name": "MTN Ghana", "weight": 10.2}, {"name": "Corporate Bonds", "weight": 15.5}, {"name": "CAL Bank", "weight": 8.0}]'::jsonb,
2.00, 0.00, 0.00),

-- 4. NTHC Money Market Fund
('NTHC Money Market Fund', 'NTHC Asset Management', 'Money Market Fund', 1.0234, '2015-01-10', 50.00, 1,
'To provide investors with a high level of liquidity and capital preservation through investment in short-term money market instruments.',
'{"stocks": 0, "bonds": 0, "cash": 100}'::jsonb,
'[{"name": "Treasury Bills", "weight": 65.0}, {"name": "Bank Deposits", "weight": 25.0}, {"name": "Commercial Paper", "weight": 10.0}]'::jsonb,
1.50, 0.00, 0.00),

-- 5. IC Securities Fixed Income Fund
('IC Securities Fixed Income Fund', 'IC Securities Asset Management', 'Fixed Income Fund', 1.3421, '2013-04-12', 100.00, 2,
'To generate regular income and preserve capital through investment in high-quality fixed income securities.',
'{"stocks": 5, "bonds": 90, "cash": 5}'::jsonb,
'[{"name": "Government Bonds", "weight": 55.0}, {"name": "Corporate Bonds", "weight": 30.0}, {"name": "Treasury Bills", "weight": 10.0}, {"name": "Bank Deposits", "weight": 5.0}]'::jsonb,
1.75, 0.00, 1.00),

-- 6. SIC Equity Growth Fund
('SIC Equity Growth Fund', 'SIC Asset Management', 'Equity Fund', 2.1256, '2011-11-05', 100.00, 5,
'To maximize long-term capital growth through aggressive investment in high-growth equities.',
'{"stocks": 90, "bonds": 5, "cash": 5}'::jsonb,
'[{"name": "AngloGold Ashanti", "weight": 20.5}, {"name": "MTN Ghana", "weight": 16.8}, {"name": "Ecobank Ghana", "weight": 12.3}, {"name": "Total Petroleum", "weight": 9.5}, {"name": "GCB Bank", "weight": 8.2}]'::jsonb,
2.75, 2.00, 1.50),

-- 7. Fidelity Balanced Fund
('Fidelity Balanced Fund', 'Fidelity Securities', 'Balanced Fund', 1.6789, '2014-02-28', 100.00, 3,
'To provide a balanced approach to wealth creation through diversified investment in equities and bonds.',
'{"stocks": 55, "bonds": 40, "cash": 5}'::jsonb,
'[{"name": "MTN Ghana", "weight": 14.0}, {"name": "Government Bonds", "weight": 30.0}, {"name": "GCB Bank", "weight": 10.5}, {"name": "Corporate Bonds", "weight": 12.0}, {"name": "CAL Bank", "weight": 7.5}]'::jsonb,
2.00, 0.00, 0.00),

-- 8. Merban Money Market Fund
('Merban Money Market Fund', 'Merban Investment Management', 'Money Market Fund', 1.0156, '2016-08-15', 50.00, 1,
'To provide capital preservation and liquidity through investment in short-term, low-risk money market instruments.',
'{"stocks": 0, "bonds": 0, "cash": 100}'::jsonb,
'[{"name": "Treasury Bills", "weight": 70.0}, {"name": "Bank Deposits", "weight": 20.0}, {"name": "Commercial Paper", "weight": 10.0}]'::jsonb,
1.25, 0.00, 0.00),

-- 9. Strategic African Securities Fund
('Strategic African Securities Fund', 'Strategic Initiatives', 'Equity Fund', 1.9567, '2013-07-20', 200.00, 4,
'To achieve superior returns through strategic investment in carefully selected African equities.',
'{"stocks": 82, "bonds": 13, "cash": 5}'::jsonb,
'[{"name": "MTN Ghana", "weight": 17.5}, {"name": "Access Bank", "weight": 13.2}, {"name": "Ecobank Ghana", "weight": 11.8}, {"name": "AngloGold Ashanti", "weight": 10.5}, {"name": "GCB Bank", "weight": 9.0}]'::jsonb,
2.50, 1.00, 0.50),

-- 10. CDH Fixed Income Fund
('CDH Fixed Income Fund', 'CDH Investment Bank', 'Fixed Income Fund', 1.4123, '2012-10-10', 100.00, 2,
'To generate stable income through investment in a diversified portfolio of fixed income securities.',
'{"stocks": 0, "bonds": 95, "cash": 5}'::jsonb,
'[{"name": "Government Bonds", "weight": 60.0}, {"name": "Corporate Bonds", "weight": 30.0}, {"name": "Treasury Bills", "weight": 10.0}]'::jsonb,
1.80, 0.00, 0.75);

-- ============================================================================
-- GENERATE HISTORICAL NAV DATA (1 year of daily data)
-- ============================================================================

-- Function to generate realistic NAV history for a fund
CREATE OR REPLACE FUNCTION generate_nav_history(
  p_fund_id UUID,
  p_current_nav DECIMAL,
  p_fund_type TEXT,
  p_days INTEGER DEFAULT 365
) RETURNS void AS $$
DECLARE
  v_date DATE;
  v_nav DECIMAL;
  v_daily_change DECIMAL;
  v_volatility DECIMAL;
  v_trend DECIMAL;
BEGIN
  -- Set volatility and trend based on fund type
  CASE p_fund_type
    WHEN 'Equity Fund' THEN
      v_volatility := 0.015; -- 1.5% daily volatility
      v_trend := 0.0003; -- Slight upward trend
    WHEN 'Balanced Fund' THEN
      v_volatility := 0.008;
      v_trend := 0.0002;
    WHEN 'Fixed Income Fund' THEN
      v_volatility := 0.003;
      v_trend := 0.0001;
    WHEN 'Money Market Fund' THEN
      v_volatility := 0.001;
      v_trend := 0.00005;
  END CASE;

  -- Start from current NAV and work backwards
  v_nav := p_current_nav;
  v_date := CURRENT_DATE;

  FOR i IN 0..p_days LOOP
    -- Calculate daily change (random walk with trend)
    v_daily_change := (random() - 0.5) * v_volatility * 2 + v_trend;
    
    -- Insert NAV for this date
    INSERT INTO public.mutual_fund_nav_history (fund_id, date, nav_value, daily_change_percent)
    VALUES (p_fund_id, v_date, v_nav, v_daily_change * 100)
    ON CONFLICT (fund_id, date) DO NOTHING;
    
    -- Move to previous day and adjust NAV
    v_date := v_date - INTERVAL '1 day';
    v_nav := v_nav / (1 + v_daily_change);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate NAV history for all funds
DO $$
DECLARE
  fund RECORD;
BEGIN
  FOR fund IN SELECT fund_id, current_nav, fund_type FROM public.mutual_funds LOOP
    PERFORM generate_nav_history(fund.fund_id, fund.current_nav, fund.fund_type, 365);
  END LOOP;
END $$;

-- ============================================================================
-- CALCULATE AND INSERT PERFORMANCE DATA
-- ============================================================================

-- Function to calculate performance for different periods
CREATE OR REPLACE FUNCTION calculate_fund_performance(p_fund_id UUID) RETURNS void AS $$
DECLARE
  v_current_nav DECIMAL;
  v_1m_nav DECIMAL;
  v_3m_nav DECIMAL;
  v_6m_nav DECIMAL;
  v_1y_nav DECIMAL;
  v_inception_nav DECIMAL;
BEGIN
  -- Get current NAV
  SELECT nav_value INTO v_current_nav
  FROM public.mutual_fund_nav_history
  WHERE fund_id = p_fund_id
  ORDER BY date DESC
  LIMIT 1;

  -- Get historical NAVs
  SELECT nav_value INTO v_1m_nav FROM public.mutual_fund_nav_history
  WHERE fund_id = p_fund_id AND date <= CURRENT_DATE - INTERVAL '1 month'
  ORDER BY date DESC LIMIT 1;

  SELECT nav_value INTO v_3m_nav FROM public.mutual_fund_nav_history
  WHERE fund_id = p_fund_id AND date <= CURRENT_DATE - INTERVAL '3 months'
  ORDER BY date DESC LIMIT 1;

  SELECT nav_value INTO v_6m_nav FROM public.mutual_fund_nav_history
  WHERE fund_id = p_fund_id AND date <= CURRENT_DATE - INTERVAL '6 months'
  ORDER BY date DESC LIMIT 1;

  SELECT nav_value INTO v_1y_nav FROM public.mutual_fund_nav_history
  WHERE fund_id = p_fund_id AND date <= CURRENT_DATE - INTERVAL '1 year'
  ORDER BY date DESC LIMIT 1;

  SELECT nav_value INTO v_inception_nav FROM public.mutual_fund_nav_history
  WHERE fund_id = p_fund_id
  ORDER BY date ASC LIMIT 1;

  -- Insert performance data
  INSERT INTO public.mutual_fund_performance (fund_id, period, return_percent) VALUES
  (p_fund_id, '1_month', ((v_current_nav - v_1m_nav) / v_1m_nav * 100)),
  (p_fund_id, '3_months', ((v_current_nav - v_3m_nav) / v_3m_nav * 100)),
  (p_fund_id, '6_months', ((v_current_nav - v_6m_nav) / v_6m_nav * 100)),
  (p_fund_id, '1_year', ((v_current_nav - v_1y_nav) / v_1y_nav * 100)),
  (p_fund_id, 'inception', ((v_current_nav - v_inception_nav) / v_inception_nav * 100))
  ON CONFLICT (fund_id, period) DO UPDATE
  SET return_percent = EXCLUDED.return_percent, calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Calculate performance for all funds
DO $$
DECLARE
  fund RECORD;
BEGIN
  FOR fund IN SELECT fund_id FROM public.mutual_funds LOOP
    PERFORM calculate_fund_performance(fund.fund_id);
  END LOOP;
END $$;

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

-- Drop the temporary function (optional, keep if you want to regenerate data)
-- DROP FUNCTION IF EXISTS generate_nav_history(UUID, DECIMAL, TEXT, INTEGER);
-- DROP FUNCTION IF EXISTS calculate_fund_performance(UUID);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
