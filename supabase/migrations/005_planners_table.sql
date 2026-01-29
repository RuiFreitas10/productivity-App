-- Create planners table
create table public.planners (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  created_at timestamp with time zone not null default now(),
  constraint planners_pkey primary key (id)
);

-- Add planner_id to habits
alter table public.habits
add column planner_id uuid references public.planners (id) on delete cascade;

-- Enable RLS
alter table public.planners enable row level security;

-- Policies for planners
create policy "Users can view their own planners" on public.planners
  for select using (auth.uid() = user_id);

create policy "Users can insert their own planners" on public.planners
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own planners" on public.planners
  for update using (auth.uid() = user_id);

create policy "Users can delete their own planners" on public.planners
  for delete using (auth.uid() = user_id);

-- Migration Function to create default planners for existing users
do $$
declare
  user_record record;
  default_planner_id uuid;
begin
  for user_record in select distinct user_id from public.habits where planner_id is null
  loop
    -- Create default planner for user
    insert into public.planners (user_id, title)
    values (user_record.user_id, 'Principal')
    returning id into default_planner_id;

    -- Update existing habits
    update public.habits
    set planner_id = default_planner_id
    where user_id = user_record.user_id and planner_id is null;
  end loop;
end $$;
