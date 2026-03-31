-- ============================================================
-- NOTIFICATIONS + CHALLENGES MIGRATION
-- inv.labs — 2026-03-31
-- Additive only. No existing tables, columns, or functions removed.
-- ============================================================

-- ── 1. Extend profiles with activity tracking ──────────────────────────────────
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS last_inactivity_email_at TIMESTAMPTZ;

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS last_rank1_email_at TIMESTAMPTZ;

-- Backfill last_active_at from existing data (use last_active_date if we have it)
UPDATE public.profiles
SET last_active_at = (last_active_date::TIMESTAMPTZ)
WHERE last_active_at IS NULL AND last_active_date IS NOT NULL;

-- ── 2. Notifications table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    message       TEXT NOT NULL,
    type          TEXT NOT NULL, -- 'learning' | 'portfolio' | 'gamification' | 'mission' | 'founding_member' | 'challenge'
    priority      TEXT NOT NULL DEFAULT 'low', -- 'low' | 'medium' | 'high'
    is_read       BOOLEAN NOT NULL DEFAULT false,
    metadata      JSONB,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id      ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread  ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at   ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own notifications"
    ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own notifications"
    ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own notifications"
    ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Service role can insert notifications on behalf of any user (cron jobs, server actions)
CREATE POLICY IF NOT EXISTS "Service role can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true); -- restricted to service role key at app level

-- ── 3. Extend challenges table (already exists, add missing columns) ──────────
ALTER TABLE public.challenges
    ADD COLUMN IF NOT EXISTS xp_reward    INTEGER NOT NULL DEFAULT 100;

ALTER TABLE public.challenges
    ADD COLUMN IF NOT EXISTS is_active    BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.challenges
    ADD COLUMN IF NOT EXISTS description  TEXT;

-- ── 4. Challenge invitations table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.challenge_invitations (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id     UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    inviter_user_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invite_code      TEXT NOT NULL UNIQUE,
    uses             INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenge_invitations_code        ON public.challenge_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_challenge_invitations_inviter     ON public.challenge_invitations(inviter_user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_invitations_challenge   ON public.challenge_invitations(challenge_id);

ALTER TABLE public.challenge_invitations ENABLE ROW LEVEL SECURITY;

-- Anyone can read an invitation by code (needed for public join page)
CREATE POLICY IF NOT EXISTS "Anyone can view challenge invitations"
    ON public.challenge_invitations FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can create own invitations"
    ON public.challenge_invitations FOR INSERT WITH CHECK (auth.uid() = inviter_user_id);

CREATE POLICY IF NOT EXISTS "Inviters can update own invitation use counts"
    ON public.challenge_invitations FOR UPDATE USING (auth.uid() = inviter_user_id);

-- ── 5. Challenge participants table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.challenge_participants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id    UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invited_by      UUID REFERENCES public.profiles(id),
    xp_at_join      INTEGER NOT NULL DEFAULT 0,
    current_xp      INTEGER NOT NULL DEFAULT 0,
    xp_earned       INTEGER GENERATED ALWAYS AS (current_xp - xp_at_join) STORED,
    completed       BOOLEAN NOT NULL DEFAULT false,
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON public.challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user     ON public.challenge_participants(user_id);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- Participants are visible to everyone (for leaderboard)
CREATE POLICY IF NOT EXISTS "Anyone can view challenge participants"
    ON public.challenge_participants FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can join challenges"
    ON public.challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own participation"
    ON public.challenge_participants FOR UPDATE USING (auth.uid() = user_id);

-- ── 6. Make challenges readable by anyone (for public join page) ───────────────
-- (challenges table already exists, just ensure a policy exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'challenges' AND policyname = 'Anyone can view active challenges'
    ) THEN
        ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Anyone can view active challenges"
            ON public.challenges FOR SELECT USING (is_active = true);
        CREATE POLICY "Authenticated users can create challenges"
            ON public.challenges FOR INSERT WITH CHECK (auth.uid() = creator_id);
    END IF;
END$$;

-- ── 7. Helper function: get challenge with participant count ───────────────────
CREATE OR REPLACE FUNCTION public.get_challenge_preview(p_invite_code TEXT)
RETURNS TABLE (
    challenge_id    UUID,
    title           TEXT,
    description     TEXT,
    end_date        TIMESTAMPTZ,
    xp_reward       INTEGER,
    creator_name    TEXT,
    participant_count BIGINT,
    invite_code     TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        c.id AS challenge_id,
        c.title,
        c.description,
        c.end_date,
        c.xp_reward,
        p.full_name AS creator_name,
        COUNT(cp.id) AS participant_count,
        ci.invite_code
    FROM public.challenge_invitations ci
    JOIN public.challenges c ON c.id = ci.challenge_id
    JOIN public.profiles p ON p.id = c.creator_id
    LEFT JOIN public.challenge_participants cp ON cp.challenge_id = c.id
    WHERE ci.invite_code = p_invite_code
      AND c.is_active = true
    GROUP BY c.id, p.full_name, ci.invite_code;
$$;

GRANT EXECUTE ON FUNCTION public.get_challenge_preview TO anon, authenticated;
