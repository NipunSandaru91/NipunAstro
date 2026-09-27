-- Beta user-testing security hardening.
-- Remove direct client access to internal SECURITY DEFINER objects that the app does not call.

revoke all on function jyotisha.materialize_shadbala_v1(uuid)
  from public, anon, authenticated;
grant execute on function jyotisha.materialize_shadbala_v1(uuid)
  to service_role;

revoke all on function public.get_user_calculation_yoga_v1(uuid)
  from public, anon;
grant execute on function public.get_user_calculation_yoga_v1(uuid)
  to authenticated, service_role;

revoke all on function public.handle_new_user()
  from public, anon, authenticated;
grant execute on function public.handle_new_user()
  to service_role;

revoke all on function public.tdd_create_user_calculation_contract()
  from public, anon, authenticated;
grant execute on function public.tdd_create_user_calculation_contract()
  to service_role;

revoke all on table
  jyotisha.v_regression_test_status,
  jyotisha.v_complete_chart_status,
  jyotisha.varga_sign_metadata,
  jyotisha.varga_sign_lord_mapping,
  jyotisha.varga_strength_dignity,
  jyotisha.varga_graha_synthesis,
  jyotisha.varga_synthesis_summary,
  jyotisha.yoga_dasha_transit_integration
from public, anon, authenticated;

grant select on table
  jyotisha.v_regression_test_status,
  jyotisha.v_complete_chart_status,
  jyotisha.varga_sign_metadata,
  jyotisha.varga_sign_lord_mapping,
  jyotisha.varga_strength_dignity,
  jyotisha.varga_graha_synthesis,
  jyotisha.varga_synthesis_summary,
  jyotisha.yoga_dasha_transit_integration
to service_role;
