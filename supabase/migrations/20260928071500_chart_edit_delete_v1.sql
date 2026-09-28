alter table jyotisha.calculation_runs
  add column if not exists deleted_at timestamptz;

create or replace function public.update_user_calculation_subject_name_v1(
  p_calculation_id uuid,
  p_subject_name text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, jyotisha
as $$
declare
  v_name text := nullif(btrim(p_subject_name), '');
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode='42501';
  end if;

  if v_name is null or char_length(v_name) > 120 then
    raise exception 'INVALID_SUBJECT_NAME';
  end if;

  update jyotisha.calculation_runs
  set subject_name = v_name
  where id = p_calculation_id
    and owner_user_id = auth.uid()
    and deleted_at is null;

  if not found then
    raise exception 'CALCULATION_NOT_FOUND' using errcode='42501';
  end if;
end;
$$;

revoke all on function public.update_user_calculation_subject_name_v1(uuid,text) from public, anon;
grant execute on function public.update_user_calculation_subject_name_v1(uuid,text) to authenticated, service_role;

create or replace function public.delete_user_calculation_v1(
  p_calculation_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, jyotisha
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode='42501';
  end if;

  update jyotisha.calculation_runs
  set deleted_at = now()
  where id = p_calculation_id
    and owner_user_id = auth.uid()
    and deleted_at is null;

  if not found then
    raise exception 'CALCULATION_NOT_FOUND' using errcode='42501';
  end if;
end;
$$;

revoke all on function public.delete_user_calculation_v1(uuid) from public, anon;
grant execute on function public.delete_user_calculation_v1(uuid) to authenticated, service_role;

create or replace view public.user_calculation_runs_v1
with (security_invoker = true)
as
select
  id,
  input_birth_date,
  input_birth_time,
  input_timezone,
  input_place_name,
  input_country,
  calculation_timestamp,
  status,
  engine_version,
  ephemeris_version,
  ayanamsa,
  zodiac_type,
  house_system,
  node_method,
  created_at,
  subject_name
from jyotisha.calculation_runs
where owner_user_id = (select auth.uid())
  and deleted_at is null;

grant select on public.user_calculation_runs_v1 to authenticated, service_role;
