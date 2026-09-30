-- Account type is an access/presentation mode controlled by administrators.
-- Newly created profiles keep the column default PERSONAL; OAuth input cannot override it.
alter table public.profiles
  alter column account_type set default 'PERSONAL',
  alter column account_type set not null;

create or replace function public.enforce_profile_account_type_admin_v1()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if old.account_type is distinct from new.account_type then
    if auth.uid() is null
      or auth.uid() = old.id
      or not exists (
        select 1
        from public.user_roles ur
        where ur.user_id = auth.uid()
          and ur.role = 'ADMIN'
      ) then
      raise exception 'ACCOUNT_TYPE_ADMIN_REQUIRED' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_account_type_admin_guard on public.profiles;
create trigger profiles_account_type_admin_guard
before update of account_type on public.profiles
for each row
execute function public.enforce_profile_account_type_admin_v1();

create or replace function public.admin_set_user_account_type_v1(
  p_target_user_id uuid,
  p_account_type text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  if p_account_type is null or p_account_type not in ('PERSONAL', 'PROFESSIONAL') then
    raise exception 'INVALID_ACCOUNT_TYPE' using errcode = '22023';
  end if;

  if p_target_user_id is null or p_target_user_id = auth.uid() then
    raise exception 'ADMIN_CANNOT_CHANGE_OWN_ACCOUNT_TYPE' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'ADMIN'
  ) then
    raise exception 'ADMIN_REQUIRED' using errcode = '42501';
  end if;

  update public.profiles
  set account_type = p_account_type,
      updated_at = now()
  where id = p_target_user_id;

  if not found then
    raise exception 'TARGET_PROFILE_NOT_FOUND' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.admin_set_user_account_type_v1(uuid, text) from public, anon;
grant execute on function public.admin_set_user_account_type_v1(uuid, text) to authenticated;

comment on function public.admin_set_user_account_type_v1(uuid, text) is
  'Changes another user’s account type. Only an ADMIN may call it; users cannot change their own type.';
