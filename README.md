# Orbis — International Office CRM

A multi-tenant SaaS CRM for UK university international offices. Manages agent relationships, partner schools, trip itinerary planning, and AI-powered trip reporting.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) |
| Styling | Tailwind CSS + Custom CSS vars |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| Version control | GitHub |

---

## Quick Setup (for non-coders)

### Step 1 — Fork & clone via GitHub

1. Go to the GitHub repo
2. Click **Fork** (top right)
3. You now have your own copy

### Step 2 — Create your Supabase database

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it e.g. `orbis-lincoln`
3. Choose a strong database password (save it somewhere safe)
4. Once created, go to **SQL Editor** in the left sidebar
5. Paste the entire contents of `supabase/schema.sql`
6. Click **Run** — all tables will be created

### Step 3 — Get your Supabase keys

1. In Supabase, go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xxxxxx.supabase.co`)
   - **anon / public key** (a long string starting with `eyJ...`)

### Step 4 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub fork
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
4. Click **Deploy**
5. Your CRM is live! 🎉

---

## For each new university

Each university gets their own Supabase project with isolated data. The same Vercel deployment serves all universities — just different environment variables. If you want fully separate deployments per university, fork the repo again and repeat steps 2–4.

---

## Local development

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/orbis-crm

# 2. Install dependencies
cd orbis-crm
npm install

# 3. Set up environment
cp .env.local.example .env.local
# Fill in your Supabase URL and key

# 4. Run locally
npm run dev
# Open http://localhost:3000
```

---

## Importing your existing data

After setting up the database, you can import your existing agents and schools using Supabase's CSV import:

1. Go to **Table Editor** in Supabase
2. Select the `agents` table
3. Click **Insert → Import data from CSV**
4. Map your columns to the table columns

Column mapping for Agents:
- Agent Name → `name`
- Country → `country`  
- City → `city`
- Website → `website`
- Status → `status` (must be: Active, Inactive, or Prospect)

Column mapping for Schools:
- School Name → `name`
- Country → `country`
- City → `city`
- Type → `type`

---

## Features

### Agents
- Full agent database with search and status filters
- Branches sub-table for worldwide offices
- Account Manager assignment
- Internal notes

### Schools
- Partner school database with country filtering
- Type classification (Secondary, Sixth Form, College, etc.)
- Contact information

### Trip Planner
- Create trips with multiple countries and date ranges
- Day-by-day itinerary builder
- 6 activity types: Travel, Agent Visit, School Visit, Recruitment Event, Rest Day, Other
- Full activity details (transport, times, costs, links to agents/schools)
- AI-powered trip report generation

### Forms
- Admin-created lead capture forms
- Link to activity types (Recruitment Event, Agent Visit, etc.)
- QR code generation for offline use
- Submissions feed into AI report

---

## Colour palette

| Token | Hex | Use |
|-------|-----|-----|
| Midnight | `#0a0f1e` | Background |
| Midnight Soft | `#111827` | Sidebar |
| Midnight Card | `#1a2236` | Cards |
| Sky | `#38bdf8` | Primary accent |
| Success | `#34d399` | Schools, positive states |
| Warning | `#fbbf24` | Trips, caution |
| Danger | `#f87171` | Errors, delete |
