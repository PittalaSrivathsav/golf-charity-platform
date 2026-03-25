-- Golf Charity Platform - Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES
-- ============================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  phone text,
  handicap_index numeric(4,1),
  total_winnings numeric(10,2) default 0,
  role text not null default 'subscriber' check (role in ('subscriber', 'admin')),
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- CHARITIES
-- ============================================
create table if not exists charities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  logo_url text,
  website_url text,
  category text,
  total_raised numeric(10,2) default 0,
  featured boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

-- Insert sample charities
insert into charities (name, description, category, featured, active) values
('Cancer Research UK', 'Fighting cancer through research, diagnosis and treatment.', 'Health', true, true),
('British Heart Foundation', 'Funding pioneering research on heart and circulatory diseases.', 'Health', false, true),
('RNLI', 'Saving lives at sea around the UK and Ireland coasts.', 'Rescue', false, true),
('Mind', 'Mental health charity providing advice, support and campaigning.', 'Mental Health', false, true),
('WWF', 'Conserving nature and reducing the most pressing threats to wildlife.', 'Environment', false, true),
('Shelter', 'We help millions of people struggling with bad housing or homelessness.', 'Housing', false, true);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles on delete cascade not null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan text not null check (plan in ('monthly', 'yearly')),
  status text not null default 'inactive' check (status in ('active', 'inactive', 'cancelled', 'expired')),
  charity_id uuid references charities,
  charity_contribution_pct numeric(5,2) default 10 check (charity_contribution_pct between 10 and 90),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- SCORES (max 5 per user)
-- ============================================
create table if not exists scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles on delete cascade not null,
  score integer not null check (score between 1 and 45),
  played_at date not null,
  created_at timestamptz default now()
);

-- Function: enforce max 5 scores per user (delete oldest when adding a 6th)
create or replace function enforce_max_five_scores()
returns trigger as $$
declare
  score_count integer;
  oldest_id uuid;
begin
  select count(*) into score_count from scores where user_id = new.user_id;
  if score_count >= 5 then
    select id into oldest_id
    from scores
    where user_id = new.user_id
    order by played_at asc, created_at asc
    limit 1;
    delete from scores where id = oldest_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists enforce_max_scores on scores;
create trigger enforce_max_scores
  before insert on scores
  for each row execute procedure enforce_max_five_scores();

-- ============================================
-- DRAWS
-- ============================================
create table if not exists draws (
  id uuid primary key default uuid_generate_v4(),
  month date not null,
  algorithm text not null default 'random' check (algorithm in ('random', 'weighted')),
  status text not null default 'pending' check (status in ('pending', 'running', 'published')),
  jackpot_pool numeric(10,2) default 0,
  rollover_amount numeric(10,2) default 0,
  winning_numbers integer[],
  total_pool numeric(10,2),
  created_at timestamptz default now()
);

-- ============================================
-- DRAW RESULTS
-- ============================================
create table if not exists draw_results (
  id uuid primary key default uuid_generate_v4(),
  draw_id uuid references draws on delete cascade not null,
  user_id uuid references profiles on delete cascade not null,
  match_count integer not null check (match_count in (3, 4, 5)),
  prize_amount numeric(10,2) not null default 0,
  status text not null default 'pending',
  created_at timestamptz default now()
);

-- ============================================
-- WINNERS
-- ============================================
create table if not exists winners (
  id uuid primary key default uuid_generate_v4(),
  draw_result_id uuid references draw_results on delete cascade not null,
  user_id uuid references profiles on delete cascade not null,
  proof_url text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  admin_notes text,
  created_at timestamptz default now()
);

-- ============================================
-- PAYMENTS
-- ============================================
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles on delete cascade not null,
  stripe_payment_intent_id text,
  amount numeric(10,2) not null,
  currency text not null default 'gbp',
  type text not null check (type in ('subscription', 'prize_payout')),
  status text not null,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table scores enable row level security;
alter table charities enable row level security;
alter table draws enable row level security;
alter table draw_results enable row level security;
alter table winners enable row level security;
alter table payments enable row level security;

-- Function to check admin status without infinite recursion
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Profiles: users can read/update/insert their own
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (public.is_admin());

-- Subscriptions: own data
create policy "Users can view own subscription" on subscriptions for select using (auth.uid() = user_id);
create policy "Users can update own subscription" on subscriptions for update using (auth.uid() = user_id);
create policy "Service role full access subscriptions" on subscriptions for all using (auth.role() = 'service_role');

-- Scores: own data
create policy "Users can manage own scores" on scores for all using (auth.uid() = user_id);

-- Charities: public read
create policy "Anyone can view active charities" on charities for select using (active = true);
create policy "Admins can manage charities" on charities for all using (public.is_admin());

-- Draws: public read published, admin full
create policy "Anyone can view published draws" on draws for select using (status = 'published');
create policy "Admins can manage draws" on draws for all using (public.is_admin());

-- Draw results: own data
create policy "Users can view own draw results" on draw_results for select using (auth.uid() = user_id);
create policy "Admins can view all draw results" on draw_results for all using (public.is_admin());

-- Winners: own data
create policy "Users can view own winners" on winners for select using (auth.uid() = user_id);
create policy "Users can update own winners (proof)" on winners for update using (auth.uid() = user_id);
create policy "Admins can manage winners" on winners for all using (public.is_admin());

-- Payments: own data
create policy "Users can view own payments" on payments for select using (auth.uid() = user_id);
create policy "Service role payment access" on payments for all using (auth.role() = 'service_role');
