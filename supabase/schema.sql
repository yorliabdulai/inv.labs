-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Public Profiles (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  cash_balance DECIMAL(12, 2) DEFAULT 10000.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Stocks Table
CREATE TABLE public.stocks (
  symbol TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT,
  current_price DECIMAL(10, 2) NOT NULL,
  previous_close DECIMAL(10, 2),
  market_cap DECIMAL(15, 2),
  change_percent DECIMAL(5, 2),
  logo_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  symbol TEXT REFERENCES public.stocks(symbol),
  type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL')),
  quantity INT NOT NULL,
  price_per_share DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  fees DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio Holdings
CREATE TABLE public.holdings (
  user_id UUID REFERENCES public.profiles(id),
  symbol TEXT REFERENCES public.stocks(symbol),
  quantity INT NOT NULL DEFAULT 0,
  average_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, symbol)
);

-- RLS Policies (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stocks are viewable by everyone" ON public.stocks FOR SELECT USING (true);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own holdings" ON public.holdings FOR SELECT USING (auth.uid() = user_id);
