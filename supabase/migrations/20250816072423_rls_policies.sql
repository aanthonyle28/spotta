-- Row Level Security policies for Spotta
-- Per CLAUDE.md: enforce RLS and assume client runs in untrusted environment

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.exercises enable row level security;
alter table public.templates enable row level security;
alter table public.template_exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.set_entries enable row level security;
alter table public.clubs enable row level security;
alter table public.club_memberships enable row level security;
alter table public.club_messages enable row level security;
alter table public.progress_photos enable row level security;
alter table public.measurements enable row level security;
alter table public.pacts enable row level security;
alter table public.pact_participants enable row level security;
alter table public.ladders enable row level security;
alter table public.ladder_participants enable row level security;
alter table public.pr_points enable row level security;

-- Profiles: Users can view all profiles, but only modify their own
create policy "Users can view all profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- User preferences: Users can only access their own preferences
create policy "Users can access own preferences" on public.user_preferences for all using (auth.uid() = user_id);

-- Equipment and muscle groups: Read-only for all authenticated users
create policy "Authenticated users can view equipment" on public.equipment for select using (auth.role() = 'authenticated');
create policy "Authenticated users can view muscle groups" on public.muscle_groups for select using (auth.role() = 'authenticated');

-- Exercises: Users can view all exercises, modify only their custom ones
create policy "Users can view all exercises" on public.exercises for select using (auth.role() = 'authenticated');
create policy "Users can create custom exercises" on public.exercises for insert with check (auth.uid() = user_id and is_custom = true);
create policy "Users can update own custom exercises" on public.exercises for update using (auth.uid() = user_id and is_custom = true);
create policy "Users can delete own custom exercises" on public.exercises for delete using (auth.uid() = user_id and is_custom = true);

-- Exercise junction tables: Read-only for authenticated users
create policy "Users can view exercise muscle groups" on public.exercise_muscle_groups for select using (auth.role() = 'authenticated');
create policy "Users can view exercise equipment" on public.exercise_equipment for select using (auth.role() = 'authenticated');

-- Templates: Users can view public templates and manage their own
create policy "Users can view public templates" on public.templates for select using (is_public = true or auth.uid() = user_id);
create policy "Users can manage own templates" on public.templates for all using (auth.uid() = user_id);

-- Template exercises: Users can manage exercises for their templates
create policy "Users can view template exercises" on public.template_exercises for select using (
  exists (
    select 1 from public.templates t 
    where t.id = template_id 
    and (t.is_public = true or t.user_id = auth.uid())
  )
);
create policy "Users can manage own template exercises" on public.template_exercises for all using (
  exists (
    select 1 from public.templates t 
    where t.id = template_id 
    and t.user_id = auth.uid()
  )
);

-- Workouts: Users can only access their own workouts
create policy "Users can access own workouts" on public.workouts for all using (auth.uid() = user_id);

-- Set entries: Users can only access sets from their own workouts
create policy "Users can access own set entries" on public.set_entries for all using (
  exists (
    select 1 from public.workouts w 
    where w.id = workout_id 
    and w.user_id = auth.uid()
  )
);

-- Clubs: Users can view public clubs and clubs they're members of
create policy "Users can view accessible clubs" on public.clubs for select using (
  is_private = false or 
  exists (
    select 1 from public.club_memberships cm 
    where cm.club_id = id 
    and cm.user_id = auth.uid()
  )
);
create policy "Club owners can update clubs" on public.clubs for update using (auth.uid() = owner_id);
create policy "Users can create clubs" on public.clubs for insert with check (auth.uid() = owner_id);

-- Club memberships: Members and club owners can view, owners can manage
create policy "Members can view club memberships" on public.club_memberships for select using (
  auth.uid() = user_id or 
  exists (
    select 1 from public.clubs c 
    where c.id = club_id 
    and c.owner_id = auth.uid()
  )
);
create policy "Users can join clubs" on public.club_memberships for insert with check (auth.uid() = user_id);
create policy "Users can leave clubs" on public.club_memberships for delete using (
  auth.uid() = user_id or 
  exists (
    select 1 from public.clubs c 
    where c.id = club_id 
    and c.owner_id = auth.uid()
  )
);

-- Club messages: Members can view and send messages
create policy "Club members can view messages" on public.club_messages for select using (
  exists (
    select 1 from public.club_memberships cm 
    where cm.club_id = club_id 
    and cm.user_id = auth.uid()
  )
);
create policy "Club members can send messages" on public.club_messages for insert with check (
  auth.uid() = user_id and 
  exists (
    select 1 from public.club_memberships cm 
    where cm.club_id = club_id 
    and cm.user_id = auth.uid()
  )
);
create policy "Users can update own messages" on public.club_messages for update using (auth.uid() = user_id);
create policy "Users can delete own messages" on public.club_messages for delete using (auth.uid() = user_id);

-- Progress photos: Users control their own photos, visibility controls viewing
create policy "Users can view accessible progress photos" on public.progress_photos for select using (
  auth.uid() = user_id or
  (visibility = 'public') or
  (visibility = 'club' and exists (
    select 1 from public.club_memberships cm1
    join public.club_memberships cm2 on cm1.club_id = cm2.club_id
    where cm1.user_id = auth.uid() and cm2.user_id = progress_photos.user_id
  ))
);
create policy "Users can manage own progress photos" on public.progress_photos for all using (auth.uid() = user_id);

-- Measurements: Users can only access their own measurements
create policy "Users can access own measurements" on public.measurements for all using (auth.uid() = user_id);

-- Pacts: Club members can view pacts in their clubs
create policy "Club members can view pacts" on public.pacts for select using (
  exists (
    select 1 from public.club_memberships cm 
    where cm.club_id = club_id 
    and cm.user_id = auth.uid()
  )
);
create policy "Club owners can manage pacts" on public.pacts for all using (
  exists (
    select 1 from public.clubs c 
    where c.id = club_id 
    and c.owner_id = auth.uid()
  )
);

-- Pact participants: Users can view and manage their own participation
create policy "Users can view pact participants" on public.pact_participants for select using (
  exists (
    select 1 from public.pacts p
    join public.club_memberships cm on p.club_id = cm.club_id
    where p.id = pact_id and cm.user_id = auth.uid()
  )
);
create policy "Users can join pacts" on public.pact_participants for insert with check (
  auth.uid() = user_id and
  exists (
    select 1 from public.pacts p
    join public.club_memberships cm on p.club_id = cm.club_id
    where p.id = pact_id and cm.user_id = auth.uid()
  )
);
create policy "Users can leave pacts" on public.pact_participants for delete using (auth.uid() = user_id);

-- Ladders: Club members can view ladders in their clubs
create policy "Club members can view ladders" on public.ladders for select using (
  exists (
    select 1 from public.club_memberships cm 
    where cm.club_id = club_id 
    and cm.user_id = auth.uid()
  )
);
create policy "Club owners can manage ladders" on public.ladders for all using (
  exists (
    select 1 from public.clubs c 
    where c.id = club_id 
    and c.owner_id = auth.uid()
  )
);

-- Ladder participants: Users can view and manage their own participation
create policy "Users can view ladder participants" on public.ladder_participants for select using (
  exists (
    select 1 from public.ladders l
    join public.club_memberships cm on l.club_id = cm.club_id
    where l.id = ladder_id and cm.user_id = auth.uid()
  )
);
create policy "Users can join ladders" on public.ladder_participants for insert with check (
  auth.uid() = user_id and
  exists (
    select 1 from public.ladders l
    join public.club_memberships cm on l.club_id = cm.club_id
    where l.id = ladder_id and cm.user_id = auth.uid()
  )
);
create policy "Users can leave ladders" on public.ladder_participants for delete using (auth.uid() = user_id);

-- PR Points: Users can view their own and club members' PRs
create policy "Users can view accessible PR points" on public.pr_points for select using (
  auth.uid() = user_id or
  exists (
    select 1 from public.club_memberships cm1
    join public.club_memberships cm2 on cm1.club_id = cm2.club_id
    where cm1.user_id = auth.uid() and cm2.user_id = pr_points.user_id
  )
);
create policy "Users can manage own PR points" on public.pr_points for all using (auth.uid() = user_id);