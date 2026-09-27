type Level="NONE"|"WEAK"|"MODERATE"|"STRONG";
type Input={themeCode:string;natalLevel:Exclude<Level,"NONE">;dasha:{status:"ACTIVE"|"DORMANT";activation_level:Level};transit:{status:"TRIGGERED"|"UNTRIGGERED";activation_level:Level}};
export function combineCareerTiming(input:Input){
 const d=input.dasha.status==="ACTIVE",t=input.transit.status==="TRIGGERED";
 if(d&&t)return {theme_code:input.themeCode,natal_level:input.natalLevel,status:"ACTIVE_NOW" as const,level:"STRONG" as const,rule_version:"CAREER_TIMING_V1" as const};
 if(d)return {theme_code:input.themeCode,natal_level:input.natalLevel,status:"DASHA_ACTIVE_WAITING_TRIGGER" as const,level:"MODERATE" as const,rule_version:"CAREER_TIMING_V1" as const};
 if(t)return {theme_code:input.themeCode,natal_level:input.natalLevel,status:"TRANSIT_ONLY" as const,level:"MODERATE" as const,rule_version:"CAREER_TIMING_V1" as const};
 return {theme_code:input.themeCode,natal_level:input.natalLevel,status:"DORMANT" as const,level:"WEAK" as const,rule_version:"CAREER_TIMING_V1" as const};
}
