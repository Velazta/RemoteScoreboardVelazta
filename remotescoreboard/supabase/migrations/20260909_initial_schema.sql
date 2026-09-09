-- -- ==============================================================================
-- -- VELAZTA REMOTE SCOREBOARD (VVELCASTING)
-- -- FULL DATABASE SETUP & PRE-SEEDED OPERATOR
-- -- ==============================================================================

-- -- 1. EXTENSIONS
-- create extension if not exists "uuid-ossp";
-- create extension if not exists "pgcrypto";

-- -- ==============================================================================
-- -- 2. TABEL: PROFILES
-- -- Menyimpan profil operator yang terhubung dengan akun login Supabase
-- -- ==============================================================================
-- create table if not exists public.profiles (
--     id uuid primary key references auth.users(id) on delete cascade,
--     email text unique not null,
--     full_name text,
--     role text default 'operator' check (role in ('operator', 'admin')),
--     google_id text unique,
--     avatar_url text,
--     created_at timestamptz default now() not null,
--     updated_at timestamptz default now() not null
-- );

-- -- ==============================================================================
-- -- 3. TABEL: LAYOUTS (Desain Scoreboard Reusable)
-- -- ==============================================================================
-- create table if not exists public.layouts (
--     id uuid primary key default gen_random_uuid(),
--     user_id uuid not null references public.profiles(id) on delete cascade,
--     name text not null default 'Default Scoreboard',
--     background_image_url text,
--     font_family text default 'Montserrat',
--     custom_font_url text,
--     name_font_size int default 24,
--     score_font_size int default 42,
--     is_default boolean default false,
--     created_at timestamptz default now() not null,
--     updated_at timestamptz default now() not null
-- );

-- -- ==============================================================================
-- -- 4. TABEL: LAYOUT_ELEMENTS (4 Elemen Tetap Canvas Positioning)
-- -- ==============================================================================
-- create table if not exists public.layout_elements (
--     id uuid primary key default gen_random_uuid(),
--     layout_id uuid not null references public.layouts(id) on delete cascade,
--     element_key text not null check (element_key in ('team1_name', 'team1_score', 'team2_name', 'team2_score')),
--     pos_x numeric not null default 0,
--     pos_y numeric not null default 0,
--     width numeric not null default 160,
--     height numeric default 50,
--     align text not null default 'left' check (align in ('left', 'center', 'right', 'justify')),
--     created_at timestamptz default now() not null,
--     constraint uq_layout_element unique (layout_id, element_key)
-- );

-- -- ==============================================================================
-- -- 5. TABEL: MATCHES (Sesi Live Pertandingan)
-- -- ==============================================================================
-- create table if not exists public.matches (
--     id uuid primary key default gen_random_uuid(),
--     user_id uuid not null references public.profiles(id) on delete cascade,
--     layout_id uuid references public.layouts(id) on delete set null,
--     obs_token text unique not null default encode(gen_random_bytes(16), 'hex'),
--     status text not null default 'live' check (status in ('draft', 'live', 'archived')),
--     created_at timestamptz default now() not null,
--     updated_at timestamptz default now() not null
-- );

-- -- ==============================================================================
-- -- 6. TABEL: TEAMS (Child dari Match: Max 2 Tim, Slot A & Slot B)
-- -- ==============================================================================
-- create table if not exists public.teams (
--     id uuid primary key default gen_random_uuid(),
--     match_id uuid not null references public.matches(id) on delete cascade,
--     slot text not null check (slot in ('a', 'b')),
--     name text not null default 'TEAM',
--     score int not null default 0 check (score >= 0),
--     name_color text default '#FFFFFF',
--     score_color text default '#FFD700',
--     created_at timestamptz default now() not null,
--     updated_at timestamptz default now() not null,
--     constraint uq_match_team_slot unique (match_id, slot)
-- );

-- -- ==============================================================================
-- -- 7. TRIGGERS & FUNCTIONS
-- -- ==============================================================================

-- -- A. Auto updated_at trigger
-- create or replace function public.handle_updated_at()
-- returns trigger as $$
-- begin
--     new.updated_at = now();
--     return new;
-- end;
-- $$ language plpgsql;

-- drop trigger if exists tr_profiles_updated_at on public.profiles;
-- create trigger tr_profiles_updated_at before update on public.profiles for each row execute function public.handle_updated_at();

-- drop trigger if exists tr_layouts_updated_at on public.layouts;
-- create trigger tr_layouts_updated_at before update on public.layouts for each row execute function public.handle_updated_at();

-- drop trigger if exists tr_matches_updated_at on public.matches;
-- create trigger tr_matches_updated_at before update on public.matches for each row execute function public.handle_updated_at();

-- drop trigger if exists tr_teams_updated_at on public.teams;
-- create trigger tr_teams_updated_at before update on public.teams for each row execute function public.handle_updated_at();

-- -- B. Auto create profile saat user dibuat di auth.users
-- create or replace function public.handle_new_user()
-- returns trigger as $$
-- begin
--     insert into public.profiles (id, email, full_name, avatar_url)
--     values (
--         new.id,
--         new.email,
--         coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
--         new.raw_user_meta_data->>'avatar_url'
--     )
--     on conflict (id) do update set
--         email = excluded.email,
--         full_name = coalesce(excluded.full_name, public.profiles.full_name);
--     return new;
-- end;
-- $$ language plpgsql security definer;

-- drop trigger if exists on_auth_user_created on auth.users;
-- create trigger on_auth_user_created
--     after insert or update on auth.users
--     for each row execute function public.handle_new_user();

-- -- ==============================================================================
-- -- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- -- ==============================================================================
-- alter table public.profiles enable row level security;
-- alter table public.layouts enable row level security;
-- alter table public.layout_elements enable row level security;
-- alter table public.matches enable row level security;
-- alter table public.teams enable row level security;

-- -- PROFILES
-- drop policy if exists "Profiles are viewable by owner" on public.profiles;
-- create policy "Profiles are viewable by owner" on public.profiles for select using (auth.uid() = id);

-- drop policy if exists "Profiles are editable by owner" on public.profiles;
-- create policy "Profiles are editable by owner" on public.profiles for update using (auth.uid() = id);

-- -- LAYOUTS (Operator kelola sendiri, OBS bisa baca publik)
-- drop policy if exists "Operators manage own layouts" on public.layouts;
-- create policy "Operators manage own layouts" on public.layouts for all using (auth.uid() = user_id);

-- drop policy if exists "Public view layouts" on public.layouts;
-- create policy "Public view layouts" on public.layouts for select using (true);

-- -- LAYOUT ELEMENTS
-- drop policy if exists "Operators manage own elements" on public.layout_elements;
-- create policy "Operators manage own elements" on public.layout_elements for all using (
--     exists (select 1 from public.layouts where layouts.id = layout_elements.layout_id and layouts.user_id = auth.uid())
-- );

-- drop policy if exists "Public view layout elements" on public.layout_elements;
-- create policy "Public view layout elements" on public.layout_elements for select using (true);

-- -- MATCHES (Operator kelola match, OBS bisa baca via token/id)
-- drop policy if exists "Operators manage own matches" on public.matches;
-- create policy "Operators manage own matches" on public.matches for all using (auth.uid() = user_id);

-- drop policy if exists "Public view matches" on public.matches;
-- create policy "Public view matches" on public.matches for select using (true);

-- -- TEAMS
-- drop policy if exists "Operators manage own teams" on public.teams;
-- create policy "Operators manage own teams" on public.teams for all using (
--     exists (select 1 from public.matches where matches.id = teams.match_id and matches.user_id = auth.uid())
-- );

-- drop policy if exists "Public view teams" on public.teams;
-- create policy "Public view teams" on public.teams for select using (true);

-- -- ==============================================================================
-- -- 9. REALTIME WEBSOCKET REPLICATION
-- -- OBS Studio & Remote Panel update instan tanpa refresh
-- -- ==============================================================================
-- begin;
--   drop publication if exists supabase_realtime;
--   create publication supabase_realtime for table public.matches, public.teams, public.layouts;
-- commit;

-- -- ==============================================================================
-- -- 10. STORAGE BUCKETS (Background & Font)
-- -- ==============================================================================
-- insert into storage.buckets (id, name, public)
-- values ('backgrounds', 'backgrounds', true), ('fonts', 'fonts', true)
-- on conflict (id) do update set public = true;

-- drop policy if exists "Public Access to Backgrounds" on storage.objects;
-- create policy "Public Access to Backgrounds" on storage.objects for select using (bucket_id = 'backgrounds');

-- drop policy if exists "Public Access to Fonts" on storage.objects;
-- create policy "Public Access to Fonts" on storage.objects for select using (bucket_id = 'fonts');

-- drop policy if exists "Auth users upload backgrounds" on storage.objects;
-- create policy "Auth users upload backgrounds" on storage.objects for insert with check (bucket_id = 'backgrounds' and auth.role() = 'authenticated');

-- drop policy if exists "Auth users upload fonts" on storage.objects;
-- create policy "Auth users upload fonts" on storage.objects for insert with check (bucket_id = 'fonts' and auth.role() = 'authenticated');

-- -- ==============================================================================
-- -- 11. PRE-SEEDED AKUN OPERATOR
-- -- Otomatis membuat akun login operator di database
-- -- ==============================================================================
-- do $$
-- declare
--     v_user_id uuid := gen_random_uuid();
--     v_email text := 'operator@velazta.com';
--     v_password text := 'Operator2026!';
--     v_layout_id uuid := gen_random_uuid();
--     v_match_id uuid := gen_random_uuid();
-- begin
--     -- Cek jika akun belum ada, buat baru:
--     if not exists (select 1 from auth.users where email = v_email) then
--         insert into auth.users (
--             instance_id,
--             id,
--             aud,
--             role,
--             email,
--             encrypted_password,
--             email_confirmed_at,
--             raw_app_meta_data,
--             raw_user_meta_data,
--             created_at,
--             updated_at,
--             confirmation_token,
--             email_change,
--             email_change_token_new,
--             recovery_token
--         ) values (
--             '00000000-0000-0000-0000-000000000000',
--             v_user_id,
--             'authenticated',
--             'authenticated',
--             v_email,
--             crypt(v_password, gen_salt('bf')),
--             now(),
--             '{"provider":"email","providers":["email"]}',
--             '{"full_name":"Velazta Operator"}',
--             now(),
--             now(),
--             '', '', '', ''
--         );

--         -- Pastikan role di tabel profiles terisi 'operator'
--         insert into public.profiles (id, email, full_name, role)
--         values (v_user_id, v_email, 'Velazta Operator', 'operator')
--         on conflict (id) do update set role = 'operator';

--         -- Buat 1 layout default bawaan
--         insert into public.layouts (id, user_id, name, font_family, name_font_size, score_font_size, is_default)
--         values (v_layout_id, v_user_id, 'Standard 1080p Esports', 'Montserrat', 24, 42, true);

--         -- Buat 4 posisi elemen kanvas
--         insert into public.layout_elements (layout_id, element_key, pos_x, pos_y, width, height, align)
--         values
--             (v_layout_id, 'team1_name', 260, 80, 200, 45, 'center'),
--             (v_layout_id, 'team1_score', 480, 70, 70, 65, 'center'),
--             (v_layout_id, 'team2_score', 570, 70, 70, 65, 'center'),
--             (v_layout_id, 'team2_name', 660, 80, 200, 45, 'center');

--         -- Buat 1 match sesi awal
--         insert into public.matches (id, user_id, layout_id, status)
--         values (v_match_id, v_user_id, v_layout_id, 'live');

--         -- Buat 2 tim awal
--         insert into public.teams (match_id, slot, name, score, name_color, score_color)
--         values
--             (v_match_id, 'a', 'SADNESS', 0, '#FFFFFF', '#FFD700'),
--             (v_match_id, 'b', 'NBA', 0, '#FFFFFF', '#FFD700');

--         raise notice 'Sukses! Akun operator: % dengan password: %', v_email, v_password;
--     else
--         raise notice 'Akun operator % sudah ada di database.', v_email;
--     end if;
-- end $$;