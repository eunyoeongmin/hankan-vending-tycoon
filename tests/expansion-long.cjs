// Regression coverage for explicitly retained pre-supply-chain saves.
const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(require('node:path').join(__dirname,'../dist/index.html'),'utf8');
function create(raw){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://hankan.test',virtualConsole:vc,beforeParse(w){w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.Math.random=()=>.5;if(raw)w.localStorage.setItem('hankan-tycoon-v1',raw);}});return {dom,errors,ev:s=>dom.window.eval(s)};}
const results=[];
for(const seed of [7,19473,731293]){
 const {dom,errors,ev}=create();ev(`profile.tutorialSeen=true;setupRules={...STANDARD_RULES,events:3,supply:2};chosenDuration=36500;launchBeforeSupplyChain();state.enterprise.rng=${seed};state.cash=20000000;state.research.products=3;state.enterprise.tech.logistics=3;state.staff={collect:3,restock:3};buildFactory(playerFirm(),'drink');buildFactory(playerFirm(),'machine');produce(playerFirm(),'machine',0,1);tradeStock(playerFirm(),'maker:1',100);openNewCity();for(const a of state.enterprise.expansion.auctions)bidLand(playerFirm(),a.id,500000);const au=expansionFirm(playerFirm()).automation;Object.assign(au,{enabled:true,min:100,target:400,markup:160,repair:40,transfer:1,reserve:150000});render=()=>{};save=()=>{};refreshLiveNumbers=()=>{};toast=()=>{};`);
 let maxBytes=0;const start=performance.now();
 for(let n=0;n<120&&!ev('state.ended');n++){
  ev('if(state.pending)resolveEvent(1);if(modalView&&!state.pending)closeModal();livePaused=false;if(!state.live)startBusiness();advanceBusiness(DAY_MS);');
  assert.ok(ev('valid(state)'),`seed ${seed} day ${ev('state.day')} invalid`);assert.ok(ev('allFirms().every(f=>Number.isFinite(companyEquity(f))&&f.machines.every(m=>m.slots.every(s=>s.stock>=0&&s.value>=0)))'));
  const raw=ev('JSON.stringify(state)');maxBytes=Math.max(maxBytes,Buffer.byteLength(raw));
  if(n===29||n===89){const reload=create(raw);assert.equal(reload.ev('state.day'),ev('state.day'));assert.ok(reload.ev('valid(state)'));assert.equal(reload.ev('JSON.stringify(state.enterprise.expansion)'),ev('JSON.stringify(state.enterprise.expansion)'));assert.deepEqual(reload.errors,[]);reload.dom.window.close();}
 }
 assert.ok(maxBytes<2000000);assert.deepEqual(errors,[]);results.push({seed,day:ev('state.day'),produced:ev('expansionFirm(playerFirm()).produced'),expired:ev('expansionFirm(playerFirm()).waste'),queued:ev('state.enterprise.expansion.queue.length'),mergers:ev('state.enterprise.expansion.mergers'),maxSaveBytes:maxBytes,elapsedMs:Math.round(performance.now()-start)});dom.window.close();
}
console.log('EXPANSION_STABILITY '+JSON.stringify(results));console.log('PASS: three seeds × 120 days with production, auctions, holdings, automation, frequent events, delayed supply and checkpoint reloads. Extra starting funds exercise systems; this is not a difficulty calibration.');
