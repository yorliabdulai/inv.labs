-- INVESTMENTSIMULATOR: GAMIFICATION SCHEMA
-- Target: Apply to Supabase SQL Editor or Local DB

-- 1. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    level TEXT NOT NULL,
    total_lessons INTEGER NOT NULL DEFAULT 1,
    xp_reward INTEGER NOT NULL DEFAULT 100,
    icon TEXT,
    estimated_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public courses are viewable by everyone" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Only admins can modify courses" ON public.courses FOR ALL USING (is_admin());

-- 2. ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0,
    completed_lessons INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed')),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can insert own enrollments" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON public.enrollments FOR UPDATE USING (auth.uid() = user_id);

-- 3. BADGES TABLE
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    criteria TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public badges are viewable by everyone" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Only admins can modify badges" ON public.badges FOR ALL USING (is_admin());

-- 4. USER_BADGES TABLE
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User badges are viewable by everyone" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Only admins can award badges" ON public.user_badges FOR ALL USING (is_admin());

-- 5. CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    invite_code TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public challenges are viewable by everyone" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Users can create challenges" ON public.challenges FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update challenges" ON public.challenges FOR UPDATE USING (auth.uid() = creator_id);

-- 6. CHALLENGE_PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.challenge_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score NUMERIC NOT NULL DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenge participants viewable by everyone" ON public.challenge_participants FOR SELECT USING (true);
CREATE POLICY "Users can join challenges" ON public.challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own score" ON public.challenge_participants FOR UPDATE USING (auth.uid() = user_id);

-- 7. UPDATE PROFILES FOR GAMIFICATION XP
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS knowledge_xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accreditation_level INTEGER DEFAULT 1;

-- Dummy Seed Data for Courses
INSERT INTO public.courses (title, description, level, total_lessons, xp_reward, estimated_time, icon)
VALUES 
('GSE Fundamentals', 'Master the architecture of the Ghana Stock Exchange.', 'Foundational', 12, 500, '4h 30m', 'Globe'),
('Portfolio Architecture', 'Learn to construct diversified portfolios.', 'Professional', 15, 1200, '6h 15m', 'BrainCircuit'),
('Risk & Volatility Logic', 'Advanced strategies for downside protection.', 'Advanced', 8, 2000, '3h 45m', 'Shield')
ON CONFLICT DO NOTHING;
