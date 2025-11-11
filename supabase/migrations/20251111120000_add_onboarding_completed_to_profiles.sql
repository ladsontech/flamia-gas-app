-- Add onboarding_completed flag to profiles for cross-device onboarding state
alter table public.profiles
add column if not exists onboarding_completed boolean not null default false;


