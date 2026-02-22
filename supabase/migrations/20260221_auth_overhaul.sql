-- INVESTMENTSIMULATOR: PRODUCTION AUTH MIGRATION (RBAC & RLS)
-- Target: Apply to Supabase SQL Editor

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. HARDEN PROFILES TABLE
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- 3. ADMIN CHECK HELPER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. HARDEN RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Only the owner or an admin can view/edit private data
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by owner or admin" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can initialize own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Transactions: Strict ownership enforced at DB level
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;

CREATE POLICY "Strict transaction ownership" 
ON public.transactions FOR ALL 
USING (auth.uid() = user_id OR is_admin());

-- Holdings: Strict ownership
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own holdings" ON public.holdings;
CREATE POLICY "Strict holdings ownership" 
ON public.holdings FOR ALL 
USING (auth.uid() = user_id OR is_admin());

-- 5. SECURE PROFILE TRIGGER (Atomic Balance Seeding)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, cash_balance)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    'user',
    10000.00
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
