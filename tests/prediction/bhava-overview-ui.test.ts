import { buildBhavaOverview } from "../../lib/prediction/ui/bhava-overview.ts";

Deno.test("buildBhavaOverview returns 12 lagna-relative houses and marks career-backed bhavas",()=>{
  const rows=buildBhavaOverview({
    lagnaRasiId:4,
    positions:[{graha_id:5,rasi_id:4},{graha_id:3,rasi_id:3},{graha_id:7,rasi_id:10}],
    careerEvidenceBhavas:[10,12],
  });
  if(rows.length!==12)throw new Error("expected twelve bhavas");
  if(rows[0].bhava!==1||rows[0].rasi_id!==4)throw new Error("lagna mapping changed");
  if(rows[8].rasi_id!==12)throw new Error("ninth bhava mapping changed");
  if(rows[11].rasi_id!==3)throw new Error("twelfth bhava mapping changed");
  if(rows[0].graha_ids.join(",")!=="5")throw new Error("graha occupancy mapping changed");
  if(rows[9].prediction_status!=="CAREER_V1")throw new Error("career-backed house not marked");
  if(rows[10].prediction_status!=="FOUNDATION_ONLY")throw new Error("unsupported house must not claim prediction");
});

Deno.test("buildBhavaOverview validates lagna",()=>{
  let threw=false;
  try{buildBhavaOverview({lagnaRasiId:0,positions:[],careerEvidenceBhavas:[]});}catch{threw=true;}
  if(!threw)throw new Error("invalid lagna must fail");
});
