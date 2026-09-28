-- Account presentation mode V1
alter table public.profiles
  add column if not exists account_type text;

-- Preserve the current full experience for existing accounts.
update public.profiles
set account_type = 'PROFESSIONAL'
where account_type is null;

alter table public.profiles
  alter column account_type set default 'PERSONAL',
  alter column account_type set not null;

alter table public.profiles
  drop constraint if exists profiles_account_type_check;

alter table public.profiles
  add constraint profiles_account_type_check
  check (account_type in ('PERSONAL','PROFESSIONAL'));

comment on column public.profiles.account_type is
  'Presentation/access mode selected by the user: PERSONAL or PROFESSIONAL.';
