// Regression coverage for explicitly retained pre-supply-chain saves.
const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(require('node:path').join(__dirname,'../dist/index.html'),'utf8');
const results=[];
for(const preset of ['standard','hard'])for(const policy of ['idle','steady','expand']){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const d=new JSDOM(html,{runScripts:'dangerously',url:'https://hankan.test',virtualConsole:vc,beforeParse(w){w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.Math.random=()=>.5;}}),ev=s=>d.window.eval(s);
 ev(`profile.tutorialSeen=true;setupRules={...RULE_PRESETS.${preset},events:0};setupPreset='${preset}';chosenDuration=36500;launchBeforeSupplyChain();state.enterprise.rng=731293;render=()=>{};save=()=>{};refreshLiveNumbers=()=>{};toast=()=>{};`);
 const start=performance.now();let maxBytes=0;
 for(let n=0;n<365&&!ev('state.ended');n++){
  if(policy!=='idle')ev(`state.enterprise.autoOrder=true;state.enterprise.emergency=false;state.staff.collect=1;state.staff.restock=1;for(const m of state.machines)if(m.condition<35&&state.cash>=15000){enterpriseExpense(15000,'maintenance');m.condition=100;}if(!state.live)startBusiness();`);
  if(policy==='expand')ev(`if(state.machines.length<8&&state.cash>450000){const site=LOCATIONS.filter(l=>!machine(l.id)&&!rivalLocations().includes(l.id)&&canBuild(l.id)&&state.cash>l.cost+250000).sort((a,b)=>(b.traffic*700-b.rent)/b.cost-(a.traffic*700-a.rent)/a.cost)[0];if(site){selected=site.id;act('buy');}}`);
  ev('if(!state.live&&!state.ended){livePaused=false;closeModal();startBusiness();}advanceBusiness(DAY_MS);');
  assert.ok(ev('valid(state)'),`${preset}/${policy} invalid at ${n}`);
  assert.ok(ev('rivalFirms().every(f=>f.machines.every(m=>m.stock>=0&&m.slots.every(s=>s.stock>=0&&s.value>=0)))'));
  assert.ok(ev('rivalFirms().every(f=>f.ops.orders.length<1000&&f.meta.history.length<=60)'));
  maxBytes=Math.max(maxBytes,Buffer.byteLength(ev('JSON.stringify(state)'),'utf8'));
  if([29,89,364].includes(n))console.log(JSON.stringify({preset,policy,checkpoint:n+1,day:ev('state.day'),cash:ev('state.cash'),machines:ev('state.machines.length'),rivals:ev('rivalFirms().map(f=>({id:f.id,machines:f.machines.length,credit:f.meta.credit,closed:f.policy.defeated}))')}));
 }
 const result={preset,policy,days:ev('state.day-1'),ended:ev('state.ended'),cash:ev('state.cash'),equity:ev('companyEquity(playerFirm())'),machines:ev('state.machines.length'),maxSaveBytes:maxBytes,elapsedMs:Math.round(performance.now()-start)};results.push(result);assert.ok(maxBytes<2000000);assert.deepEqual(errors,[]);d.window.close();
}
console.log('BALANCE_RESULTS '+JSON.stringify(results));
console.log('PASS: six seeded 30/90/365-day strategy runs, finite assets, disjoint ownership, bounded history/save size. These are simulation samples, not calibrated human difficulty.');
