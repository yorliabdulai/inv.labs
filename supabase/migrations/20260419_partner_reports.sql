-- ============================================================
-- PARTNER EARNINGS REPORTS SYSTEM
-- inv.labs — 2026-04-19
-- ============================================================

-- 1. Update Partners table with commission rate
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 0.10;

-- 2. Create Partner Earnings Reports table
CREATE TABLE IF NOT EXISTS public.partner_earnings_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    conversions_count INTEGER NOT NULL DEFAULT 0,
    total_revenue NUMERIC NOT NULL DEFAULT 0,
    commission_earned NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'draft', -- 'draft' or 'published'
    share_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(partner_id, month, year)
);

-- RLS for Reports
ALTER TABLE public.partner_earnings_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can full manage reports"
ON public.partner_earnings_reports FOR ALL
USING (public.is_admin());

CREATE POLICY "Partners can view own reports"
ON public.partner_earnings_reports FOR SELECT
USING (partner_id IN (SELECT id FROM public.partners WHERE email = auth.email()));

-- 3. Index for performance
CREATE INDEX IF NOT EXISTS idx_partner_reports_date ON public.partner_earnings_reports(year, month);
