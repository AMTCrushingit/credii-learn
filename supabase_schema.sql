-- ============================================================
--  CREDII FOUNDATION — Supabase Schema
--  Trinidad & Tobago Pilot
--  Run this entire file in Supabase SQL Editor
-- ============================================================

-- 1. PROFILES
create table if not exists public.credii_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  email         text not null,
  role          text not null default 'learner'
                  check (role in ('learner','msme','instructor','admin')),
  country       text default 'Trinidad and Tobago',
  organisation  text,
  bio           text,
  phone         text,
  linkedin      text,
  created_at    timestamptz default now()
);

-- 2. COURSES
create table if not exists public.credii_courses (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  pillar          integer not null check (pillar between 1 and 7),
  level           text default 'Beginner' check (level in ('Beginner','Intermediate','Advanced')),
  duration_hours  numeric default 2,
  published       boolean default false,
  sdg_tags        text[] default '{}',
  objectives      text,
  target_audience text,
  created_by      uuid references public.credii_profiles(id),
  created_at      timestamptz default now()
);

-- 3. MODULES
create table if not exists public.credii_modules (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.credii_courses(id) on delete cascade,
  title        text not null,
  type         text default 'video' check (type in ('video','reading','activity','quiz')),
  duration_mins integer default 20,
  content      text,
  order_num    integer not null,
  created_at   timestamptz default now()
);

-- 4. ENROLLMENTS
create table if not exists public.credii_enrollments (
  id          uuid primary key default gen_random_uuid(),
  learner_id  uuid not null references public.credii_profiles(id) on delete cascade,
  course_id   uuid not null references public.credii_courses(id) on delete cascade,
  progress    integer default 0 check (progress between 0 and 100),
  enrolled_at timestamptz default now(),
  completed_at timestamptz,
  unique(learner_id, course_id)
);

-- 5. CREDENTIALS
create table if not exists public.credii_credentials (
  id              uuid primary key default gen_random_uuid(),
  learner_id      uuid not null references public.credii_profiles(id) on delete cascade,
  course_id       uuid not null references public.credii_courses(id),
  credential_id   text not null unique,
  issued_at       timestamptz default now(),
  blockchain_hash text,
  status          text default 'issued' check (status in ('issued','revoked','expired')),
  created_at      timestamptz default now()
);

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================

alter table public.credii_profiles    enable row level security;
alter table public.credii_courses     enable row level security;
alter table public.credii_modules     enable row level security;
alter table public.credii_enrollments enable row level security;
alter table public.credii_credentials enable row level security;

-- Helper: is admin or instructor?
create or replace function public.credii_is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.credii_profiles
    where id = auth.uid() and role in ('admin','instructor')
  );
$$;

-- PROFILES
create policy "Users view own profile or admin views all"
  on public.credii_profiles for select
  using (id = auth.uid() or public.credii_is_admin());

create policy "Users update own profile"
  on public.credii_profiles for update
  using (id = auth.uid() or public.credii_is_admin());

create policy "Allow insert on signup"
  on public.credii_profiles for insert
  with check (id = auth.uid());

-- COURSES (public read for published, admin write)
create policy "Anyone can view published courses"
  on public.credii_courses for select
  using (published = true or public.credii_is_admin());

create policy "Admins manage courses"
  on public.credii_courses for all
  using (public.credii_is_admin());

-- MODULES
create policy "Anyone can view modules of published courses"
  on public.credii_modules for select
  using (exists (
    select 1 from public.credii_courses
    where id = course_id and (published = true or public.credii_is_admin())
  ));

create policy "Admins manage modules"
  on public.credii_modules for all
  using (public.credii_is_admin());

-- ENROLLMENTS
create policy "Learners see own enrollments; admins see all"
  on public.credii_enrollments for select
  using (learner_id = auth.uid() or public.credii_is_admin());

create policy "Learners manage own enrollments"
  on public.credii_enrollments for insert
  with check (learner_id = auth.uid());

create policy "Learners update own enrollments"
  on public.credii_enrollments for update
  using (learner_id = auth.uid() or public.credii_is_admin());

-- CREDENTIALS
create policy "Learners see own credentials; admins see all"
  on public.credii_credentials for select
  using (learner_id = auth.uid() or public.credii_is_admin());

create policy "System issues credentials"
  on public.credii_credentials for insert
  with check (learner_id = auth.uid() or public.credii_is_admin());

create policy "Admins update credentials"
  on public.credii_credentials for update
  using (public.credii_is_admin());

-- Public verification (no auth needed)
create policy "Public can verify credentials by credential_id"
  on public.credii_credentials for select
  using (true);

-- ============================================================
--  AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.credii_handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.credii_profiles (id, full_name, email, role, country)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'learner'),
    coalesce(new.raw_user_meta_data->>'country', 'Trinidad and Tobago')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists credii_on_auth_user_created on auth.users;
create trigger credii_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.credii_handle_new_user();

-- ============================================================
--  SAMPLE COURSES (T&T Pilot Seed Data)
-- ============================================================
insert into public.credii_courses (title, description, pillar, level, duration_hours, published, sdg_tags, objectives, target_audience)
values
  ('Introduction to Caribbean Tourism Standards', 'Learn the foundational standards and best practices for tourism and hospitality in the Caribbean context, aligned with regional and international frameworks.', 1, 'Beginner', 3, true, '{"SDG 8","SDG 9"}', 'Understand Caribbean tourism standards; Apply hospitality best practices; Earn a verified credential', 'Tourism workers, hospitality staff, entrepreneurs'),
  ('Workforce Mobility & Skills Passport', 'Build your Caribbean skills passport and understand how to navigate workforce mobility across CARICOM territories with verified digital credentials.', 2, 'Beginner', 2, true, '{"SDG 4","SDG 8"}', 'Create a digital skills passport; Understand CARICOM mobility frameworks; Get blockchain-verified', 'Job seekers, recent graduates, migrant workers'),
  ('MSME Digital Capability Foundations', 'Essential digital skills for Caribbean micro, small and medium enterprises — from digital marketing to financial management and ESG compliance.', 3, 'Beginner', 4, true, '{"SDG 9","SDG 10"}', 'Build digital business capabilities; Understand ESG for MSMEs; Access financial readiness tools', 'MSME owners, entrepreneurs, women-led businesses'),
  ('ESG Fundamentals for Caribbean Business', 'Understand Environmental, Social and Governance principles in the Caribbean business context and how to align your organisation with global ESG standards.', 4, 'Intermediate', 3, true, '{"SDG 13","SDG 9"}', 'Understand ESG frameworks; Apply to Caribbean context; Build ESG credentials', 'Business owners, managers, NGO leaders'),
  ('Public Sector Digital Governance', 'Equip public servants with the digital governance skills needed to lead Caribbean digital transformation initiatives effectively.', 5, 'Intermediate', 4, true, '{"SDG 16","SDG 17"}', 'Understand digital governance; Lead transformation initiatives; Build public sector capability', 'Civil servants, government officers, policy makers'),
  ('Blockchain & Digital Credentials Explained', 'A non-technical introduction to blockchain technology, digital credentials, and how the Credii trust infrastructure works for Caribbean citizens.', 6, 'Beginner', 2, true, '{"SDG 9","SDG 4"}', 'Understand blockchain basics; Know how digital credentials work; Use Credii platform effectively', 'All Caribbean citizens, youth, community leaders'),
  ('Caribbean Resilience & Systems Thinking', 'Develop the systems thinking skills needed to contribute to Caribbean regional resilience, sustainability, and long-term development.', 7, 'Advanced', 5, true, '{"SDG 17","SDG 10"}', 'Apply systems thinking; Contribute to regional resilience; Lead transformation', 'Leaders, managers, development practitioners')
on conflict do nothing;