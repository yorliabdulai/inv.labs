-- LEADERBOARD FIX: Replace view with SECURITY DEFINER functions
-- Views do NOT bypass RLS in Supabase. SECURITY DEFINER functions run as the 
-- DB owner and bypass RLS, exposing only the specific safe columns below.

-- Drop the old view if it exists
DROP VIEW IF EXISTS public.leaderboard_profiles;

-- Function: paginated leaderboard data
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_limit INT, p_offset INT)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    avatar_url TEXT,
    knowledge_xp INTEGER,
    accreditation_level INTEGER
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT id, full_name, avatar_url, knowledge_xp, accreditation_level
    FROM public.profiles
    ORDER BY knowledge_xp DESC NULLS LAST
    LIMIT p_limit OFFSET p_offset;
$$;

-- Function: total count of ranked users
CREATE OR REPLACE FUNCTION public.get_leaderboard_count()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT COUNT(*) FROM public.profiles;
$$;

-- Grant execute to authenticated users and anon
GRANT EXECUTE ON FUNCTION public.get_leaderboard TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_count TO anon, authenticated;
