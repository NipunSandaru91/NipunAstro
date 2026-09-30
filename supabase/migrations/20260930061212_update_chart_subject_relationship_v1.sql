create or replace function public.update_user_calculation_subject_relationship_v1(
  p_calculation_id uuid,
  p_subject_relationship text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, jyotisha
as $$
declare
  v_relationship text := upper(btrim(coalesce(p_subject_relationship, '')));
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  if v_relationship not in ('SELF', 'PARTNER', 'MOTHER', 'FATHER', 'SIBLING', 'OTHER') then
    raise exception 'INVALID_SUBJECT_RELATIONSHIP';
  end if;

  update jyotisha.calculation_runs
  set subject_relationship = v_relationship,
      calculation_metadata = coalesce(calculation_metadata, '{}'::jsonb)
        || jsonb_build_object(
          'subject_relationship', v_relationship,
          'subject_relationship_updated_at', now()
        )
  where id = p_calculation_id
    and owner_user_id = auth.uid()
    and deleted_at is null;

  if not found then
    raise exception 'CALCULATION_NOT_FOUND' using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.update_user_calculation_subject_relationship_v1(uuid, text)
  from public, anon;
grant execute on function public.update_user_calculation_subject_relationship_v1(uuid, text)
  to authenticated, service_role;
