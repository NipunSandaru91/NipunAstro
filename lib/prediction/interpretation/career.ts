import type { AggregatedCareerTheme } from "../topics/career-aggregation.ts";
type Timing={theme_code:string;natal_level:"WEAK"|"MODERATE"|"STRONG";status:"ACTIVE_NOW"|"DASHA_ACTIVE_WAITING_TRIGGER"|"TRANSIT_ONLY"|"DORMANT";level:"WEAK"|"MODERATE"|"STRONG";rule_version:"CAREER_TIMING_V1"};
export type CareerReasoning={graha:string;rasi:string;bhava:number;rule_si:string};
export type CareerConclusion={reasoning:CareerReasoning[];topic:"CAREER";theme_code:AggregatedCareerTheme["code"];natal_level:"WEAK"|"MODERATE"|"STRONG";timing_status:Timing["status"];timing_level:Timing["level"];reason_si:string;supporting:AggregatedCareerTheme["supporting"];contradicting:AggregatedCareerTheme["contradicting"];evidence_refs:string[];conclusion_version:"CAREER_CONCLUSION_V1"};
export function buildCareerConclusion(input:{theme:AggregatedCareerTheme;timing:Timing;reasoning?:CareerReasoning[]}):CareerConclusion{
 if(input.theme.code!==input.timing.theme_code)throw new Error("THEME_TIMING_MISMATCH");
 return {reasoning:input.reasoning??[],topic:"CAREER",theme_code:input.theme.code,natal_level:input.theme.level,timing_status:input.timing.status,timing_level:input.timing.level,reason_si:input.theme.text_si,supporting:input.theme.supporting,contradicting:input.theme.contradicting,evidence_refs:input.theme.evidence_refs,conclusion_version:"CAREER_CONCLUSION_V1"};
}
const TITLE:Record<CareerConclusion["theme_code"],string>={FOREIGN_LINKED_CAREER:"විදේශ හෝ දුරස්ථ සම්බන්ධ වෘත්තීය තේමාව",BUSINESS_INDEPENDENT_EARNING:"ව්‍යාපාර හා ස්වාධීන ආදායම් තේමාව",COMMUNICATION_TECHNICAL_CAREER:"සන්නිවේදන හා තාක්ෂණික වෘත්තීය තේමාව"};
const TIMING:Record<CareerConclusion["timing_status"],string>={ACTIVE_NOW:"දශා සක්‍රීයතාව සහ ගෝචර trigger එක එකවර සහාය දක්වයි.",DASHA_ACTIVE_WAITING_TRIGGER:"දශා සක්‍රීයතාව පවතින නමුත් ගෝචර trigger එක තවම තහවුරු වී නැත.",TRANSIT_ONLY:"ගෝචර trigger එකක් ඇත, නමුත් අදාල දශා සක්‍රීයතාව නොමැත.",DORMANT:"දශා සහ ගෝචර සක්‍රීයතාව දැනට නොපෙනේ."};
function lines(xs:CareerConclusion["supporting"]){return xs.length?xs.map(x=>`• ${x.text_si}`).join("\n"):"• විශේෂ සාධක වාර්තා වී නැත";}
export function renderCareerConclusionSi(c:CareerConclusion):string{
 const final=c.timing_status==="ACTIVE_NOW"?`${TITLE[c.theme_code]} සඳහා ජන්ම සාධක සහ වත්මන් කාල සක්‍රීයතාව එකිනෙක සහාය දක්වයි.`:`${TITLE[c.theme_code]} ජන්ම සටහනේ පවතින නමුත් එහි කාල සක්‍රීයතාව ${c.timing_level} මට්ටමේය.`;
 const reasoning=c.reasoning.length?c.reasoning.map(x=>`• ග්‍රහ: ${x.graha} | රාශිය: ${x.rasi} | භාවය: ${x.bhava}\n  නීතිය: ${x.rule_si}`).join("\n"):"• සවිස්තර placement reasoning නොමැත";\n return `ප්‍රතිඵලය\n${TITLE[c.theme_code]} — ජන්ම සාධක ශක්තිය: ${c.natal_level}\n\nහේතුව\n${c.reason_si}\n${reasoning}\n\nසහායක සාධක\n${lines(c.supporting)}\n\nවිරුද්ධ සාධක\n${lines(c.contradicting)}\n\nකාල සක්‍රීයතාව\n${TIMING[c.timing_status]}\n\nඅවසාන නිගමනය\n${final}`;
}
