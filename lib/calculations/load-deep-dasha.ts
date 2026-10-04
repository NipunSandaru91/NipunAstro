import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { generateDeepVimshottari } from '../../supabase/functions/jyotisha-calculator/core/deep-dasha.ts';
import { savedDeepDashaInput } from './deep-dasha-view.ts';

/** Use the signed-in client: ownership remains enforced by existing RLS. */
export async function loadDeepDasha(client:SupabaseClient, calculationId:string, depth:number) {
  const {data:run,error:runError}=await client.schema('jyotisha').from('calculation_runs')
    .select('id,subject_name,input_place_name,input_timezone,status,utc_timestamp')
    .eq('id',calculationId).is('deleted_at',null).maybeSingle();
  if(runError)throw new Error('DASHA_INPUT_READ_FAILED');
  if(!run)return null;
  const {data:moon,error:moonError}=await client.schema('jyotisha').from('graha_positions')
    .select('longitude_sidereal').eq('calculation_id',calculationId).eq('graha_id',2).maybeSingle();
  if(moonError)throw new Error('DASHA_MOON_READ_FAILED');
  const input=savedDeepDashaInput(run,moon,depth);
  return {run,periods:input?generateDeepVimshottari(input):[]};
}
