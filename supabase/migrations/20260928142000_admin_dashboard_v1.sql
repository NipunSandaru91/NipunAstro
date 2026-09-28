create or replace function public.admin_list_users_v1()
returns table (
  user_id uuid,
  email text,
  display_name text,
  role text,
  account_type text,
  created_at timestamptz,
  chart_count bigint
)
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role::text = 'ADMIN'
  ) then
    raise exception 'ADMIN_REQUIRED' using errcode = '42501';
  end if;

  return query
  select
    u.id,
    u.email::text,
    p.display_name,
    coalesce(ur.role::text, 'USER'),
    coalesce(p.account_type, 'PERSONAL'),
    u.created_at,
    count(cr.id)::bigint
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join public.user_roles ur on ur.user_id = u.id
  left join jyotisha.calculation_runs cr
    on cr.owner_user_id = u.id
   and cr.deleted_at is null
  group by u.id, u.email, p.display_name, ur.role, p.account_type, u.created_at
  order by u.created_at desc;
end;
$$;

create or replace function public.admin_delete_user_v1(p_target_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role::text = 'ADMIN'
  ) then
    raise exception 'ADMIN_REQUIRED' using errcode = '42501';
  end if;

  if p_target_user_id = auth.uid() then
    raise exception 'ADMIN_SELF_DELETE_BLOCKED' using errcode = '22023';
  end if;

  update jyotisha.calculation_runs
  set deleted_at = coalesce(deleted_at, now())
  where owner_user_id = p_target_user_id;

  delete from auth.users
  where id = p_target_user_id;

  return found;
end;
$$;

revoke all on function public.admin_list_users_v1() from public, anon;
revoke all on function public.admin_delete_user_v1(uuid) from public, anon;
grant execute on function public.admin_list_users_v1() to authenticated, service_role;
grant execute on function public.admin_delete_user_v1(uuid) to authenticated, service_role;
