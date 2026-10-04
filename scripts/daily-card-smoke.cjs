// Isolated SSR contract checks with explicit synthetic fixtures; no production login/data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
async function scenario({ query = {}, account = 'PERSONAL', authenticated = true, failed = false, empty = false } = {}) {
  let invokes = 0, rpcId = null;
  const client = {
    auth: {getClaims: async () => ({data: authenticated ? {claims:{sub:'fixture-user'}} : null})},
    from: table => ({
      select: () => ({
        order: async () => ({data:empty?[]:[{id:'owned',subject_name:'පරීක්ෂණ කේන්දරය',status:'CALCULATED'}]}),
        single: async () => ({data:{account_type:account}}),
      }),
    }),
    functions: {invoke: async (_name, {body}) => {
      invokes++;
      return {error:failed ? Error('offline') : null,data:{input:body,sunrise:1791073687646,sunset:1791117027100,referenceAt:1791073687646,sun:166.57565605808455,moon:82.62941870107143,engine:'SWISS_MOSEPH_LAHIRI_DAILY_V1'}};
    }},
    rpc: async (_name, args) => {rpcId=args.p_calculation_id;return {data:{lagna:{rasi_id:4},grahas:[{graha_id:2,rasi_id:9}]}};},
  };
  function load(filename) {
    const source=fs.readFileSync(filename,'utf8');
    const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;
    const module={exports:{}};
    const localRequire = spec => {
      if(spec==='next/link') return ({children,...props})=>React.createElement('a',props,children);
      if(spec==='next/navigation') return {redirect: url=>{throw Error('REDIRECT:'+url);}};
      if(spec==='@/app/components/app-nav') return ()=>React.createElement('nav',null,'navigation');
      if(spec==='./daily-controls') return ()=>React.createElement('form',null,'location controls');
      if(spec==='@/lib/supabase/server') return {createClient:async()=>client};
      if(spec==='@/lib/calculations/load-deep-dasha') return {loadDeepDasha:async()=>({periods:[]})};
      if(spec.startsWith('@/') || spec.startsWith('.')) {
        let target=spec.startsWith('@/')?path.join(root,spec.slice(2)):path.resolve(path.dirname(filename),spec);
        if(!path.extname(target))target+='.ts';
        return load(target);
      }
      return require(spec);
    };
    vm.runInThisContext('(function(require,module,exports){'+output+'\n})',{filename})(localRequire,module,module.exports);
    return module.exports;
  }
  const page=load(path.join(root,'app/forecast/daily-page.tsx')).default;
  const html=renderToStaticMarkup(await page({searchParams:Promise.resolve(query)}));
  return {html,invokes,rpcId};
}
(async()=>{
  const query={calculation:'owned',date:'2026-10-04',lat:'6.9271',lon:'79.8612',tz:'Asia/Colombo',place:'කොළඹ'};
  for(const account of ['PERSONAL','PROFESSIONAL']) {
    const {html,invokes,rpcId}=await scenario({query,account});
    for(const label of ['මුදල් / අයවැය','රැකියාව / කටයුතු','සම්බන්ධතා','අද අවධානය','ජය අංක','ජය වර්ණ','සුබ දිශාව','මරු සිටින දිශාව','රාහු කාලය','පංචාංගය','නැකත','තිථිය','කරණය','යෝගය']) assert.ok(html.includes(label),label);
    assert.equal(invokes,1);assert.equal(rpcId,'owned');
    assert.equal(html.includes('href="/predictions"'),account==='PROFESSIONAL');
  }
  assert.equal((await scenario()).invokes,0);
  assert.equal((await scenario({query:{...query,lat:''}})).invokes,0);
  assert.equal((await scenario({query:{...query,tz:'invalid'}})).invokes,0);
  assert.equal((await scenario({query:{...query,calculation:'foreign-chart'}})).rpcId,'owned');
  assert.equal((await scenario({query,empty:true})).invokes,0);
  const failure=await scenario({query,failed:true});
  assert.ok(failure.html.includes('නැවත උත්සාහ'));assert.ok(!failure.html.includes('දවසේ පංචාංගය'));
  await assert.rejects(scenario({query,authenticated:false}),/REDIRECT:\/login/);
  console.log('PASS daily SSR: both roles, all card fields, empty/invalid locations, owned chart selection, signed-out redirect, failure state. Synthetic fixtures only.');
})().catch(error=>{console.error(error);process.exitCode=1;});
