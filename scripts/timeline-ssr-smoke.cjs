// Synthetic fixtures only: verifies real route guards before chart reads.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve(__dirname,'..');
async function scenario(account='PROFESSIONAL',authenticated=true,foreign=false,empty=false){
 let reads=0,chosen=null;
 const client={auth:{getClaims:async()=>({data:authenticated?{claims:{sub:'fixture'}}:null})},
 from:table=>({select:()=>({single:async()=>({data:{account_type:account}}),order:async()=>{reads++;return {data:empty?[]:[{id:'owned',subject_name:'Golden fixture',status:'CALCULATED',input_timezone:'Asia/Colombo'}]};}})}),
 rpc:async(_name,args)=>{chosen=args.p_calculation_id;return {data:{lagna:{rasi_id:4},grahas:[12,9,3,1,4,1,10,10,4].map((rasi_id,i)=>({graha_id:i+1,rasi_id}))}};}};
 function load(file){
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;
  const module={exports:{}};
  const req=spec=>{
   if(spec==='next/navigation')return {redirect:url=>{throw Error('REDIRECT:'+url)}};
   if(spec==='next/link')return ({children,...props})=>React.createElement('a',props,children);
   if(spec==='@/app/components/app-nav')return ()=>React.createElement('nav');
   if(spec==='@/lib/supabase/server')return {createClient:async()=>client};
   if(spec==='@/lib/calculations/load-deep-dasha')return {loadDeepDasha:async()=>({run:{utc_timestamp:'1991-04-06T08:42:00.000Z'},periods:load(path.join(root,'supabase/functions/jyotisha-calculator/core/deep-dasha.ts')).generateDeepVimshottari({birth_at:'1991-04-06T08:42:00.000Z',moon_longitude_sidereal:252.348067345,depth:5,md_count:18})})};
   if(spec.startsWith('@/')||spec.startsWith('.')){let p=spec.startsWith('@/')?path.join(root,spec.slice(2)):path.resolve(path.dirname(file),spec);if(!path.extname(p))p+=fs.existsSync(p+'.ts')?'.ts':'.tsx';return load(p);}
   return require(spec);
  };
  vm.runInThisContext('(function(require,module,exports){'+code+'\n})',{filename:file})(req,module,module.exports);return module.exports;
 }
 try {
  const page=load(path.join(root,'app/timeline/page.tsx')).default;
  const html=renderToStaticMarkup(await page({searchParams:Promise.resolve({calculation:foreign?'not-owned':'owned'})}));
  return {html,reads,chosen};
 }catch(error){return {error:error.message,reads,chosen};}
}
(async()=>{
 for(const account of ['PERSONAL','ADMIN',null]){const r=await scenario(account);assert.equal(r.error,'REDIRECT:/dashboard');assert.equal(r.reads,0);}
 const signedOut=await scenario('PROFESSIONAL',false);assert.equal(signedOut.error,'REDIRECT:/login?next=%2Ftimeline');assert.equal(signedOut.reads,0);
 const result=await scenario('PROFESSIONAL',true,true);assert.equal(result.chosen,'owned');assert.ok(result.html.includes('අතීත කාල පරාස'));assert.ok(result.html.includes('ඉදිරි කාල පරාස'));assert.ok(result.html.includes('අනුබල දෙන පැත්ත වැඩියි'));assert.ok(result.html.includes('දශා මට්ටම් 3'));assert.ok(!result.html.includes('සූක්ෂ්ම'));assert.ok(!result.html.includes('ප්‍රාණ'));
 assert.ok((await scenario('PROFESSIONAL',true,false,true)).html.includes('මුලින් කේන්දරයක්'));
 console.log('PASS timeline SSR: signed-out and Personal denied before chart reads, owned selection, Professional three-level output, empty state.');
})().catch(e=>{console.error(e);process.exitCode=1});
