-- Restrict derived chart data to the owning user's visible parent rows.
-- No chart data or grants are changed. Existing reference catalog policies remain unchanged.
alter policy authenticated_select_reference on jyotisha.calculation_bhava_factors
  to authenticated using (jyotisha.user_owns_calculation(calculation_run_id));
alter policy authenticated_select_reference on jyotisha.calculation_bhava_factors
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.calculation_bhaveshas
  to authenticated using (jyotisha.user_owns_calculation(calculation_run_id));
alter policy authenticated_select_reference on jyotisha.calculation_bhaveshas
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.calculation_bhava_summaries
  to authenticated using (jyotisha.user_owns_calculation(calculation_run_id));
alter policy authenticated_select_reference on jyotisha.calculation_bhava_summaries
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.chart_objects
  to authenticated using (jyotisha.user_owns_calculation(calculation_run_id));
alter policy authenticated_select_reference on jyotisha.chart_objects
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.chart_object_links
  to authenticated using (exists (select 1 from jyotisha.chart_objects parent where parent.id = chart_object_links.chart_object_id));
alter policy authenticated_select_reference on jyotisha.chart_object_links
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.chart_layer_status
  to authenticated using (exists (select 1 from jyotisha.chart_objects parent where parent.id = chart_layer_status.chart_object_id));
alter policy authenticated_select_reference on jyotisha.chart_layer_status
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.chart_evidence_index
  to authenticated using (exists (select 1 from jyotisha.chart_objects parent where parent.id = chart_evidence_index.chart_object_id));
alter policy authenticated_select_reference on jyotisha.chart_evidence_index
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.prediction_evidence
  to authenticated using (exists (select 1 from jyotisha.chart_objects parent where parent.id = prediction_evidence.chart_object_id));
alter policy authenticated_select_reference on jyotisha.prediction_evidence
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.prediction_windows
  to authenticated using (exists (select 1 from jyotisha.chart_objects parent where parent.id = prediction_windows.chart_object_id));
alter policy authenticated_select_reference on jyotisha.prediction_windows
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.chart_verification_checks
  to authenticated using (exists (select 1 from jyotisha.chart_objects parent where parent.id = chart_verification_checks.chart_object_id));
alter policy authenticated_select_reference on jyotisha.chart_verification_checks
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.prediction_triggers
  to authenticated using (exists (select 1 from jyotisha.chart_objects parent where parent.id = prediction_triggers.chart_object_id));
alter policy authenticated_select_reference on jyotisha.prediction_triggers
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.prediction_results
  to authenticated using (exists (select 1 from jyotisha.chart_objects parent where parent.id = prediction_results.chart_object_id));
alter policy authenticated_select_reference on jyotisha.prediction_results
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.antardasa_periods
  to authenticated using (exists (select 1 from jyotisha.mahadasa_periods parent where parent.id = antardasa_periods.mahadasa_id));
alter policy authenticated_select_reference on jyotisha.antardasa_periods
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.pratyantardasa_periods
  to authenticated using (exists (select 1 from jyotisha.antardasa_periods parent where parent.id = pratyantardasa_periods.antardasa_id));
alter policy authenticated_select_reference on jyotisha.pratyantardasa_periods
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.prediction_evaluation_evidence
  to authenticated using (exists (select 1 from jyotisha.prediction_evaluations parent where parent.id = prediction_evaluation_evidence.evaluation_id));
alter policy authenticated_select_reference on jyotisha.prediction_evaluation_evidence
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.prediction_modifiers
  to authenticated using (exists (select 1 from jyotisha.prediction_evaluations parent where parent.id = prediction_modifiers.evaluation_id));
alter policy authenticated_select_reference on jyotisha.prediction_modifiers
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.classical_rule_evaluation_evidence
  to authenticated using (exists (select 1 from jyotisha.classical_rule_evaluations parent where parent.id = classical_rule_evaluation_evidence.evaluation_id));
alter policy authenticated_select_reference on jyotisha.classical_rule_evaluation_evidence
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.prediction_synthesis_evaluation_evidence
  to authenticated using (exists (select 1 from jyotisha.prediction_synthesis_evaluations parent where parent.id = prediction_synthesis_evaluation_evidence.synthesis_evaluation_id));
alter policy authenticated_select_reference on jyotisha.prediction_synthesis_evaluation_evidence
  rename to authenticated_select_owned_parent;

alter policy authenticated_select_reference on jyotisha.prediction_modifier_semantics
  to authenticated using (exists (select 1 from jyotisha.prediction_modifiers parent where parent.id = prediction_modifier_semantics.modifier_id));
alter policy authenticated_select_reference on jyotisha.prediction_modifier_semantics
  rename to authenticated_select_owned_parent;
