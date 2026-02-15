-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  balance DECIMAL(12, 2) DEFAULT 0.00 CHECK (balance >= 0),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- MARKETS
CREATE TYPE market_status AS ENUM ('OPEN', 'CLOSED', 'RESOLVED', 'CANCELED');
CREATE TYPE resolution_result AS ENUM ('YES', 'NO');

CREATE TABLE public.markets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status market_status DEFAULT 'OPEN',
  total_yes_amount DECIMAL(12, 2) DEFAULT 0.00,
  total_no_amount DECIMAL(12, 2) DEFAULT 0.00,
  total_pool DECIMAL(12, 2) DEFAULT 0.00,
  resolution_result resolution_result,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) -- Admin who created
);

-- BETS
CREATE TYPE bet_side AS ENUM ('YES', 'NO');
CREATE TYPE bet_status AS ENUM ('ACTIVE', 'WON', 'LOST', 'CASHED_OUT');

CREATE TABLE public.bets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  market_id UUID REFERENCES public.markets(id) NOT NULL,
  side bet_side NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  odds_at_entry DECIMAL(10, 2) NOT NULL,
  potential_payout DECIMAL(12, 2) NOT NULL,
  status bet_status DEFAULT 'ACTIVE',
  cashed_out_amount DECIMAL(12, 2), -- If cashed out
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TRANSACTIONS
CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'BET_PLACED', 'BET_WIN', 'CASHOUT', 'REFUND');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(12, 2) NOT NULL, -- Negative for debits, positive for credits? Or just absolute value + type? Standard is amount is always positive, type determines direction. OR amount signed. Let's use signed for ease of aggregation or keep absolute and use type. Let's use absolute and type logic in app/db.
  provider TEXT, -- 'MOCK', 'STRIPE', etc.
  status transaction_status DEFAULT 'COMPLETED',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WITHDRAW REQUESTS
CREATE TABLE public.withdraw_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  risk_score INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACTIVITY LOGS (Admin)
CREATE TABLE public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id), -- Optional, action performer
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUPPORT TICKETS
CREATE TABLE public.support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'OPEN', -- OPEN, SOLVED, CLOSED
  risk_score INT, -- Just reuse structure
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES (Simplified for initial setup)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Markets are viewable by everyone" ON public.markets FOR SELECT USING (true);
-- Only admin can insert/update markets (Add admin check later)

ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own bets" ON public.bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can place bets" ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

-- FUNCTIONS (Triggers for user creation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- SEED DATA (MOCK)
-- Insert some markets
INSERT INTO public.markets (title, description, category, end_date, image_url)
VALUES 
('Bitcoin hit $100k in 2026?', 'Will Bitcoin price exceed $100,000 USD before end of 2026?', 'CRYPTO', NOW() + INTERVAL '30 days', 'https://placehold.co/600x400?text=Bitcoin'),
('Flamengo wins Libertadores?', 'Will Flamengo win the next Libertadores final?', 'SPORTS', NOW() + INTERVAL '7 days', 'https://placehold.co/600x400?text=Flamengo'),
('SpaceX Mars Landing?', 'Will Starship land on Mars successfully this year?', 'TECH', NOW() + INTERVAL '180 days', 'https://placehold.co/600x400?text=Mars');
