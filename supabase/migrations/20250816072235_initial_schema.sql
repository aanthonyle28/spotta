-- Spotta Fitness App - Initial Database Schema
-- Based on PRD specifications and CLAUDE.md guidelines

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null check (char_length(username) >= 3),
  display_name text not null check (char_length(display_name) >= 1),
  avatar_url text,
  bio text,
  timezone text default 'UTC',
  units text not null default 'metric' check (units in ('metric', 'imperial')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User preferences
create table public.user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rest_timer_sound boolean not null default true,
  workout_reminders boolean not null default true,
  club_updates boolean not null default true,
  pr_celebrations boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- Equipment table
create table public.equipment (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null check (category in ('free_weights', 'machines', 'cardio', 'bodyweight', 'accessories')),
  description text,
  created_at timestamptz not null default now()
);

-- Muscle groups table
create table public.muscle_groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null check (category in ('primary', 'secondary')),
  parent_group_id uuid references public.muscle_groups(id),
  created_at timestamptz not null default now()
);

-- Exercises table
create table public.exercises (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  instructions text,
  category text not null check (category in ('strength', 'cardio', 'flexibility', 'balance', 'sports')),
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  is_custom boolean not null default false,
  user_id uuid references public.profiles(id) on delete cascade, -- null for system exercises
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Exercise muscle groups junction table
create table public.exercise_muscle_groups (
  exercise_id uuid references public.exercises(id) on delete cascade,
  muscle_group_id uuid references public.muscle_groups(id) on delete cascade,
  primary key (exercise_id, muscle_group_id)
);

-- Exercise equipment junction table
create table public.exercise_equipment (
  exercise_id uuid references public.exercises(id) on delete cascade,
  equipment_id uuid references public.equipment(id) on delete cascade,
  primary key (exercise_id, equipment_id)
);

-- Workout templates
create table public.templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Template exercises
create table public.template_exercises (
  id uuid default uuid_generate_v4() primary key,
  template_id uuid references public.templates(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete cascade not null,
  order_index integer not null,
  sets integer not null default 1,
  reps integer,
  weight numeric,
  rest_time integer, -- seconds
  created_at timestamptz not null default now()
);

-- Workouts table
create table public.workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  template_id uuid references public.templates(id) on delete set null,
  name text not null,
  notes text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration integer, -- seconds
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Set entries
create table public.set_entries (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid references public.workouts(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete cascade not null,
  set_number integer not null,
  reps integer check (reps >= 0),
  weight numeric check (weight >= 0),
  duration integer check (duration >= 0), -- seconds for time-based exercises
  distance numeric check (distance >= 0), -- for cardio
  completed boolean not null default false,
  rest_time integer check (rest_time >= 0), -- seconds
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Clubs table
create table public.clubs (
  id uuid default uuid_generate_v4() primary key,
  name text not null check (char_length(name) <= 50),
  description text check (char_length(description) <= 500),
  avatar_url text,
  is_private boolean not null default false,
  invite_code text unique,
  member_count integer not null default 1,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Club memberships
create table public.club_memberships (
  id uuid default uuid_generate_v4() primary key,
  club_id uuid references public.clubs(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  unique(club_id, user_id)
);

-- Club messages
create table public.club_messages (
  id uuid default uuid_generate_v4() primary key,
  club_id uuid references public.clubs(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) <= 2000),
  type text not null default 'text' check (type in ('text', 'workout_share', 'system')),
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Progress photos
create table public.progress_photos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  url text not null,
  caption text,
  body_weight numeric,
  visibility text not null default 'private' check (visibility in ('private', 'club', 'public')),
  created_at timestamptz not null default now()
);

-- Measurements
create table public.measurements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('weight', 'body_fat', 'muscle_mass', 'circumference', 'custom')),
  value numeric not null,
  unit text not null,
  body_part text,
  notes text,
  created_at timestamptz not null default now()
);

-- Pacts (accountability challenges)
create table public.pacts (
  id uuid default uuid_generate_v4() primary key,
  club_id uuid references public.clubs(id) on delete cascade not null,
  name text not null,
  description text not null,
  goal_type text not null check (goal_type in ('workout_count', 'streak_days', 'custom')),
  goal_target integer not null,
  goal_period text not null check (goal_period in ('daily', 'weekly', 'monthly', 'total')),
  start_date timestamptz not null,
  end_date timestamptz not null,
  rewards text,
  penalties text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pact participants
create table public.pact_participants (
  id uuid default uuid_generate_v4() primary key,
  pact_id uuid references public.pacts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz not null default now(),
  unique(pact_id, user_id)
);

-- Ladders (leaderboards)
create table public.ladders (
  id uuid default uuid_generate_v4() primary key,
  club_id uuid references public.clubs(id) on delete cascade not null,
  name text not null,
  description text not null,
  metric_type text not null check (metric_type in ('total_weight', 'workout_count', 'pr_count', 'streak_days')),
  exercise_id uuid references public.exercises(id) on delete cascade, -- for exercise-specific ladders
  start_date timestamptz not null,
  end_date timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ladder participants
create table public.ladder_participants (
  id uuid default uuid_generate_v4() primary key,
  ladder_id uuid references public.ladders(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz not null default now(),
  unique(ladder_id, user_id)
);

-- PR Points (personal records)
create table public.pr_points (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete cascade not null,
  type text not null check (type in ('weight', 'reps', 'time', 'distance')),
  value numeric not null,
  previous_value numeric,
  workout_id uuid references public.workouts(id) on delete cascade not null,
  celebrated_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index idx_profiles_username on public.profiles(username);
create index idx_workouts_user_id on public.workouts(user_id);
create index idx_workouts_started_at on public.workouts(started_at);
create index idx_set_entries_workout_id on public.set_entries(workout_id);
create index idx_club_messages_club_id on public.club_messages(club_id);
create index idx_club_messages_created_at on public.club_messages(created_at);
create index idx_club_memberships_user_id on public.club_memberships(user_id);
create index idx_pr_points_user_exercise on public.pr_points(user_id, exercise_id);

-- Updated at triggers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_user_preferences_updated_at before update on public.user_preferences
  for each row execute procedure public.handle_updated_at();

create trigger handle_exercises_updated_at before update on public.exercises
  for each row execute procedure public.handle_updated_at();

create trigger handle_templates_updated_at before update on public.templates
  for each row execute procedure public.handle_updated_at();

create trigger handle_workouts_updated_at before update on public.workouts
  for each row execute procedure public.handle_updated_at();

create trigger handle_set_entries_updated_at before update on public.set_entries
  for each row execute procedure public.handle_updated_at();

create trigger handle_clubs_updated_at before update on public.clubs
  for each row execute procedure public.handle_updated_at();

create trigger handle_club_messages_updated_at before update on public.club_messages
  for each row execute procedure public.handle_updated_at();

create trigger handle_pacts_updated_at before update on public.pacts
  for each row execute procedure public.handle_updated_at();

create trigger handle_ladders_updated_at before update on public.ladders
  for each row execute procedure public.handle_updated_at();