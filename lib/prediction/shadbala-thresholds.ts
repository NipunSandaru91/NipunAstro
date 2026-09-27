import { assertClassicalGraha } from "../../supabase/functions/jyotisha-calculator/core/shadbala.ts";
export const SHADBALA_THRESHOLD_VERSION="BPHS_6_5_SUN_V1" as const;
const MINIMUM_RUPA:Record<number,number>={1:6.5,2:6,3:5,4:7,5:6.5,6:5.5,7:5};
export function shadbalaMinimumRupa(grahaId:number):number{
 assertClassicalGraha(grahaId);
 return MINIMUM_RUPA[grahaId];
}
