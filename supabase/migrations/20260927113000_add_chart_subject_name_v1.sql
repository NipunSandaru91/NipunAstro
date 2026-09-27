alter table jyotisha.calculation_runs
  add column if not exists subject_name text;

comment on column jyotisha.calculation_runs.subject_name is
  'Human-readable name of the person or subject represented by this natal chart.';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'calculation_runs_subject_name_length_check'
      and conrelid = 'jyotisha.calculation_runs'::regclass
  ) then
    alter table jyotisha.calculation_runs
      add constraint calculation_runs_subject_name_length_check
      check (
        subject_name is null
        or char_length(btrim(subject_name)) between 1 and 120
      );
  end if;
end
$$;

create or replace function public.create_user_calculation_v2(
  p_birth_date date,
  p_birth_time time without time zone,
  p_timezone text,
  p_latitude numeric,
  p_longitude numeric,
  p_place_name text default null,
  p_country text default null,
  p_subject_name text default null
)
returns uuid
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'jyotisha'
as $function$
declare
  v_user_id uuid := auth.uid();
  v_standard jyotisha.system_standards%rowtype;
  v_id uuid;
  v_subject_name text := nullif(btrim(p_subject_name), '');
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;

  if p_birth_date is null or p_birth_time is null or nullif(btrim(p_timezone),'') is null then
    raise exception 'INVALID_BIRTH_INPUT';
  end if;

  if v_subject_name is not null and char_length(v_subject_name) > 120 then
    raise exception 'INVALID_SUBJECT_NAME';
  end if;

  if p_latitude is null or p_latitude < -90 or p_latitude > 90 then
    raise exception 'INVALID_LATITUDE';
  end if;

  if p_longitude is null or p_longitude < -180 or p_longitude > 180 then
    raise exception 'INVALID_LONGITUDE';
  end if;

  select *
    into strict v_standard
  from jyotisha.system_standards
  where is_default = true
    and status = 'ACTIVE'
  order by created_at desc
  limit 1;

  insert into jyotisha.calculation_runs (
    standard_id,
    subject_name,
    input_birth_date,
    input_birth_time,
    input_timezone,
    input_latitude,
    input_longitude,
    input_place_name,
    input_country,
    ephemeris_version,
    engine_version,
    status,
    ephemeris_engine,
    ayanamsa,
    zodiac_type,
    house_system,
    node_method,
    calculation_metadata,
    owner_user_id
  )
  values (
    v_standard.id,
    v_subject_name,
    p_birth_date,
    p_birth_time,
    btrim(p_timezone),
    p_latitude,
    p_longitude,
    nullif(btrim(p_place_name),''),
    nullif(btrim(p_country),''),
    v_standard.ephemeris,
    'USER_CALCULATION_V2',
    'PENDING',
    v_standard.ephemeris,
    v_standard.ayanamsa,
    v_standard.zodiac_type,
    v_standard.house_system,
    v_standard.node_method,
    jsonb_build_object(
      'creation_contract', 'USER_CALCULATION_V2',
      'calculation_state', 'PENDING_ENGINE_HANDOFF',
      'standard_code', v_standard.standard_code,
      'standard_version', v_standard.version
    ),
    v_user_id
  )
  returning id into v_id;

  return v_id;
end;
$function$;

revoke all on function public.create_user_calculation_v2(
  date, time without time zone, text, numeric, numeric, text, text, text
) from public, anon;

grant execute on function public.create_user_calculation_v2(
  date, time without time zone, text, numeric, numeric, text, text, text
) to authenticated, service_role;

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
where owner_user_id = (select auth.uid());

grant select on public.user_calculation_runs_v1 to authenticated, service_role;
