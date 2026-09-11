const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(require('node:path').join(__dirname,'../dist/index.html'),'utf8');
for(const seed of [7,19473]){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://hankan.test',virtualConsole:vc,beforeParse(w){w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.Math.random=()=>.5;}}),ev=s=>dom.window.eval(s);
 ev(`profile.tutorialSeen=true;setupRules={...STANDARD_RULES,events:3,supply:1};mgStartOptions.automation=true;mgStartOptions.review=true;launchNew();state.cash=5000000;state.enterprise.rng=${seed};refWorld().management.pauseMonth=false;render=()=>{};save=()=>{};refreshLiveNumbers=()=>{};toast=()=>{};`);
 let decisions=0;
 for(let i=0;i<365&&!ev('state.ended');i++){
  const previous=ev('state.day');
  ev(`if(state.pending&&beState().pending){const q=beState().pending,choice=beChoices(q).findIndex(c=>!c.block&&c.fee<=state.cash);if(state.day%3===0||choice<0)q.deferred=true;else beResolve(choice);}if(modalView)closeModal();livePaused=false;if(!state.live)startBusiness();advanceBusiness(DAY_MS);`);
  assert.ok(ev('state.day>0&&valid(state)&&allFirms().every(f=>refCheckConservation(f))'),'valid day '+ev('state.day'));
  if(ev('state.day')===previous){ev('if(beState().pending)beState().pending.deferred=true;if(modalView)closeModal();livePaused=false;if(!state.live)startBusiness();advanceBusiness(DAY_MS);');}
  assert.ok(ev('state.day')>previous||ev('state.ended'),'single clock can advance after a decision/defer');
  assert.ok(ev('allFirms().every(f=>refFirm(f).reports.filter(r=>r.final).every(r=>Math.abs(r.operating+r.investing+r.financing-r.cashChange)<.01))'),'cash journal conservation');
 }
 decisions=ev('state.eventsResolved');assert.ok(decisions>5,'natural event scheduling');assert.ok(ev('state.totalSold>100'));
 console.log('EVENT_LONG',JSON.stringify({seed,day:ev('state.day'),decisions,sold:ev('state.totalSold'),pendingTasks:ev('beState().tasks.length')}));assert.deepEqual(errors,[]);dom.window.close();
}
