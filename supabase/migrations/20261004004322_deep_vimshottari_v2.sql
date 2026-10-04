-- Additive V2: never updates the legacy sequence, MD/AD/PD tables or RPC.
-- Precision contract: UTC, fixed 365.25 days/year, integer milliseconds, [start,end).
create function jyotisha.deep_vimshottari_rows_v2(
  p_birth_at timestamptz, p_moon double precision,
  p_md_count integer default 9, p_depth integer default 3
) returns table (
  path text, parent_path text, level integer, sequence_order integer,
  graha_id smallint, start_at timestamptz, end_at timestamptz,
  duration_ms bigint, calculation_version text
) language plpgsql immutable security invoker set search_path = pg_catalog as $$
declare
  birth_ms bigint; lon double precision; nak integer; first_lord integer;
  origin_ms bigint; fraction double precision;
  years integer[] := array[7,20,6,10,7,18,16,19,17];
  lords smallint[] := array[9,6,1,2,3,8,5,7,4];
begin
  if p_birth_at is null or not isfinite(p_birth_at)
    or p_birth_at <> date_trunc('milliseconds',p_birth_at)
    or extract(year from p_birth_at at time zone 'UTC') not between 1 and 9999 then
    raise exception 'birth_at must be finite UTC at millisecond precision';
  end if;
  if p_moon is null or abs(p_moon)>360 or p_moon in ('NaN'::float8,'Infinity'::float8,'-Infinity'::float8) then
    raise exception 'Moon longitude must be finite and within -360..360';
  end if;
  if p_md_count is null or p_md_count not between 1 and 18 or p_depth is null or p_depth not between 1 and 5 then
    raise exception 'md_count must be 1..18 and depth 1..5';
  end if;
  birth_ms := (extract(epoch from p_birth_at)*1000)::bigint;
  -- Float remainder without converting the Moon to rounded decimal degrees.
  lon := p_moon - trunc(p_moon/360)*360;
  if lon < 0 then lon := lon+360; end if;
  nak := least(26,floor(lon/(360.0::float8/27))::integer);
  first_lord := nak%9;
  fraction := (lon-nak*(360.0::float8/27))/(360.0::float8/27);
  origin_ms := floor(birth_ms::float8 - fraction*years[first_lord+1]*31557600000::float8 + 0.5)::bigint;
  return query
  with recursive roots as (
    select i, (first_lord+i)%9 as lord,
      origin_ms+coalesce(sum(years[(first_lord+i)%9+1]::bigint*31557600000)
        over(order by i rows between unbounded preceding and 1 preceding),0)::bigint as s
    from generate_series(0,p_md_count-1) i
  ), tree(route,lord,lev,ord,s,e) as (
    select array[i+1],lord,1,i+1,s,s+years[lord+1]::bigint*31557600000
    from roots
    union all
    select t.route||(c.i+1),(t.lord+c.i)%9,t.lev+1,c.i+1,
      floor(t.s::float8+(t.e-t.s)::float8*c.before_weight/120+0.5)::bigint,
      floor(t.s::float8+(t.e-t.s)::float8*c.after_weight/120+0.5)::bigint
    from tree t
    cross join lateral (
      select i,
        coalesce(sum(years[(t.lord+i)%9+1]) over(order by i rows between unbounded preceding and 1 preceding),0)::float8 as before_weight,
        sum(years[(t.lord+i)%9+1]) over(order by i)::float8 as after_weight
      from generate_series(0,8) i
    ) c
    where t.lev<p_depth and t.e>birth_ms
  )
  select array_to_string(t.route,'.'),
    case when t.lev=1 then null else array_to_string(t.route[1:t.lev-1],'.') end,
    t.lev,t.ord,lords[t.lord+1],
    -- Split epoch milliseconds into whole days and a small remainder to avoid
    -- floating-second loss for distant dates. UTC conversion ignores session DST.
    (timestamp 'epoch'+(greatest(t.s,birth_ms)/86400000)::integer*interval '1 day'
      +(greatest(t.s,birth_ms)%86400000)::float8*interval '1 millisecond') at time zone 'UTC',
    (timestamp 'epoch'+(t.e/86400000)::integer*interval '1 day'
      +(t.e%86400000)::float8*interval '1 millisecond') at time zone 'UTC',
    t.e-greatest(t.s,birth_ms),'VIMSHOTTARI_365.250_V2'::text
  from tree t where t.e>greatest(t.s,birth_ms) order by t.route;
end;
$$;
revoke all on function jyotisha.deep_vimshottari_rows_v2(timestamptz,float8,integer,integer) from public,anon,authenticated;
grant execute on function jyotisha.deep_vimshottari_rows_v2(timestamptz,float8,integer,integer) to service_role;

create table jyotisha.deep_dasha_periods_v2 (
  calculation_id uuid not null references jyotisha.calculation_runs(id) on delete cascade,
  calculation_version text not null check(calculation_version='VIMSHOTTARI_365.250_V2'),
  path text not null,
  parent_path text,
  level integer not null check(level between 1 and 5),
  sequence_order integer not null check(sequence_order between 1 and 18),
  graha_id smallint not null references jyotisha.grahas(id),
  start_at timestamptz not null,
  end_at timestamptz not null check(end_at>start_at),
  duration_ms bigint not null check(duration_ms>0),
  primary key(calculation_id,calculation_version,path),
  foreign key(calculation_id,calculation_version,parent_path)
    references jyotisha.deep_dasha_periods_v2(calculation_id,calculation_version,path),
  check((level=1)=(parent_path is null)),
  check(duration_ms=extract(epoch from (end_at-start_at))*1000)
);
create index deep_dasha_periods_v2_parent on jyotisha.deep_dasha_periods_v2(calculation_id,calculation_version,parent_path);
create index deep_dasha_periods_v2_lookup on jyotisha.deep_dasha_periods_v2(calculation_id,level,start_at,end_at);
alter table jyotisha.deep_dasha_periods_v2 enable row level security;
revoke all on jyotisha.deep_dasha_periods_v2 from public,anon,authenticated;
grant select on jyotisha.deep_dasha_periods_v2 to authenticated;
grant select,insert,delete on jyotisha.deep_dasha_periods_v2 to service_role;
create policy deep_dasha_owner_read on jyotisha.deep_dasha_periods_v2 for select to authenticated
using (exists(select 1 from jyotisha.calculation_runs r
  where r.id=calculation_id and r.owner_user_id=(select auth.uid()) and r.deleted_at is null));

-- Internal materializer reads canonical saved inputs; no caller-supplied chart data.
-- Parent run lock serializes regeneration. Statement failure rolls back the delete.
create function jyotisha.generate_deep_vimshottari_v2(
  p_calculation_id uuid,p_md_count integer default 9,p_depth integer default 3
) returns integer language plpgsql security invoker set search_path=pg_catalog as $$
declare birth_at timestamptz; moon float8; n integer;
begin
  select r.utc_timestamp into strict birth_at from jyotisha.calculation_runs r
  where r.id=p_calculation_id and r.deleted_at is null and r.status='CALCULATED' for update;
  select g.longitude_sidereal into strict moon from jyotisha.graha_positions g
  where g.calculation_id=p_calculation_id and g.graha_id=2;
  delete from jyotisha.deep_dasha_periods_v2 where calculation_id=p_calculation_id;
  insert into jyotisha.deep_dasha_periods_v2
    (calculation_id,calculation_version,path,parent_path,level,sequence_order,graha_id,start_at,end_at,duration_ms)
  select p_calculation_id,d.calculation_version,d.path,d.parent_path,d.level,d.sequence_order,d.graha_id,d.start_at,d.end_at,d.duration_ms
  from jyotisha.deep_vimshottari_rows_v2(birth_at,moon,p_md_count,p_depth) d;
  get diagnostics n=row_count;
  return n;
end;
$$;
revoke all on function jyotisha.generate_deep_vimshottari_v2(uuid,integer,integer) from public,anon,authenticated;
grant execute on function jyotisha.generate_deep_vimshottari_v2(uuid,integer,integer) to service_role;
