const assert=require('node:assert/strict');
const make=require('./management-harness.cjs');
const results=[];
for(const seed of [7,19473])for(const policy of ['manual','margin','share','price2','price3','price4','events']){
 const g=make();g.ev(`profile.tutorialSeen=true;setupRules={...STANDARD_RULES,events:${policy==='events'?3:0},supply:0};mgStartOptions.automation=true;mgStartOptions.review=true;launchNew();state.enterprise.rng=${seed};mgFirm(playerFirm()).pricing='${['margin','share'].includes(policy)?policy:'manual'}';${policy.startsWith('price')?`for(const s of state.machines[0].slots)s.price=${Number(policy.slice(5))*1000};`:''}render=()=>{};save=()=>{};refreshLiveNumbers=()=>{};toast=()=>{};`);
 for(let i=0;i<180&&!g.ev('state.ended');i++)g.ev('if(state.pending){resolveEvent(1);if(state.pending&&state.businessEvents?.pending)state.businessEvents.pending.deferred=true;}if(modalView)closeModal();livePaused=false;if(!state.live)startBusiness();advanceBusiness(DAY_MS);');
 assert.ok(g.ev('valid(state)&&allFirms().every(f=>refCheckConservation(f))'));assert.ok(g.ev('state.day>=181||state.ended'));assert.deepEqual(g.errors,[]);
 results.push(g.ev(`({seed:${seed},policy:'${policy}',day:state.day,cash:state.cash/1000,sold:state.totalSold,events:state.eventsResolved,profit30:refFirm(playerFirm()).reports.filter(r=>r.final).slice(0,30).reduce((n,r)=>n+r.profit,0)/1000})`));g.dom.window.close();
}
console.log(JSON.stringify(results,null,2));
