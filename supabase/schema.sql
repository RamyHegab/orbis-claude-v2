-- ============================================================
-- ORBIS CRM — Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- AGENTS
-- ============================================================
create table if not exists agents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  country text not null,
  city text,
  website text,
  account_manager text,
  status text not null default 'Active' check (status in ('Active','Inactive','Prospect')),
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- BRANCHES (agent offices)
-- ============================================================
create table if not exists branches (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid not null references agents(id) on delete cascade,
  city text not null,
  country text not null,
  address text,
  contact_name text,
  contact_email text,
  contact_phone text,
  is_main boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- SCHOOLS
-- ============================================================
create table if not exists schools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  country text not null,
  city text,
  type text default 'Secondary School',
  website text,
  contact_name text,
  contact_email text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- TRIPS
-- ============================================================
create table if not exists trips (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  countries text[] not null default '{}',
  start_date date not null,
  end_date date not null,
  status text not null default 'Draft' check (status in ('Draft','Approved','In Progress','Completed')),
  created_by text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- TRIP DAYS
-- ============================================================
create table if not exists trip_days (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references trips(id) on delete cascade,
  date date not null,
  day_number integer not null,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- ACTIVITIES
-- ============================================================
create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  trip_day_id uuid not null references trip_days(id) on delete cascade,
  type text not null check (type in ('travel','agent_visit','school_visit','recruitment_event','rest','other')),
  title text,
  time_from text,
  time_to text,
  agent_branch_id uuid references branches(id),
  school_id uuid references schools(id),
  agent_id uuid references agents(id),
  venue_name text,
  venue_address text,
  transport_mode text,
  departure_time text,
  arrival_time text,
  arrival_date date,
  airline text,
  flight_number text,
  cost numeric(10,2),
  rest_type text,
  description text,
  notes text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- FORMS
-- ============================================================
create table if not exists forms (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  activity_type text not null,
  fields jsonb not null default '[]',
  qr_code text,
  created_at timestamptz default now()
);

-- ============================================================
-- FORM SUBMISSIONS
-- ============================================================
create table if not exists form_submissions (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid not null references forms(id) on delete cascade,
  activity_id uuid references activities(id),
  data jsonb not null default '{}',
  submitted_at timestamptz default now(),
  submitted_by text
);

-- ============================================================
-- ROW LEVEL SECURITY (enable for production)
-- ============================================================
-- For now, open access. In production, add auth and RLS policies:
-- alter table agents enable row level security;
-- create policy "Allow all" on agents for all using (true);
-- (repeat for each table, then add user-scoped policies)

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_branches_agent on branches(agent_id);
create index if not exists idx_trip_days_trip on trip_days(trip_id);
create index if not exists idx_activities_day on activities(trip_day_id);
create index if not exists idx_form_submissions_form on form_submissions(form_id);
create index if not exists idx_agents_country on agents(country);
create index if not exists idx_schools_country on schools(country);
