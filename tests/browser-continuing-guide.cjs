const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));const output=process.env.ARTIFACT_DIR||path.join(process.cwd(),'artifacts','continuing-guide');fs.mkdirSync(output,{recursive:true});
async function layout(label){const result=await p.evaluate(()=>{const map=document.querySelector('.map-wrap').getBoundingClientRect(),content=deskContent.getBoundingClientRect(),tabs=$('office-register-tabs').getBoundingClientRect();return {mapWidth:map.width,mapHeight:map.height,contentHeight:content.height,tabsHeight:tabs.height,tabsBottom:tabs.bottom,viewport:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth+1};});assert.ok(result.mapWidth>100&&result.mapHeight>40&&result.contentHeight>40&&!result.overflow&&result.tabsHeight>15&&result.tabsBottom<=result.viewport,JSON.stringify({label,...result}));}
try{
for(const language of ['ko','ja']){
 await p.goto((process.env.GAME_URL||'http://127.0.0.1:8765/')+'?lang='+language);await p.locator('#menu-new').click();await p.locator('#guide-launch').click();
 // Only the handoff state is a fixture. Ordering and receipt below use ordinary gameplay operations.
 await p.evaluate(()=>{state.guide.active=false;state.guide.step=16;delete state.guide.intro;delete state.continuingGuide;const f=playerFirm(),m=f.machines[0];for(const slot of m.slots){slot.batches=[];refSyncBucket(slot,true);}syncMachine(m);for(const bucket of f.ops.warehouse){bucket.batches=[];refSyncBucket(bucket);}livePaused=true;setDesktopWindow('open');render();});
 assert.ok(await p.locator('#continuing-guide [data-continuing="welcome"]').isVisible());
 for(const [width,height] of [[1280,900],[390,844]]){await p.setViewportSize({width,height});await layout('welcome');await p.screenshot({path:path.join(output,`${language}-${width}-welcome.png`)});}
 await p.locator('#continuing-guide [data-continuing="welcome"]').click();assert.equal(await p.evaluate(()=>modalView),null,'welcome must not open market confirmation after button reuse');await p.locator('#continuing-guide [data-continuing="list"]').click();await p.locator('#continuing-guide [data-continuing="refill"]').last().click();
 assert.ok(await p.evaluate(()=>continuingState().active.kind==='refill'&&continuingState().active.step===0));
 await p.locator('#continuing-guide [data-continuing="go"]').click();assert.equal(await p.evaluate(()=>deskTab),'supply');await layout('active');
 assert.ok(await p.locator('.continuing-target').count()>0);const stable=await p.evaluate(()=>{const node=$('ref-sku');for(let i=0;i<10;i++)refreshLiveNumbers();return node===$('ref-sku');});assert.ok(stable);
 const cash=await p.evaluate(()=>state.cash);await p.locator('#ref-sku').selectOption('aqua:0');await p.locator('#ref-qty').fill('200');await p.locator('[data-ref-action="order"]').click();
 assert.ok(await p.evaluate(()=>refFirm(playerFirm()).work.some(w=>w.kind==='purchase')));assert.ok(await p.evaluate(cash=>state.cash<cash,cash));assert.equal(await p.evaluate(()=>continuingState().active.step),1);assert.ok(await p.evaluate(()=>!continuingState().done.refill));
 await p.screenshot({path:path.join(output,`${language}-390-actual-order.png`)});await layout('ordered');
 await p.locator('#office-register-tabs button').first().click();
 await p.locator('#advisor-restore').click();await p.locator('#continuing-guide [data-continuing="toggle"]').click();assert.ok(await p.evaluate(()=>!continuingState().enabled&&!continuingState().active));await p.reload();await p.locator('#menu-load').click();assert.ok(await p.evaluate(()=>!continuingState().enabled&&!continuingState().active));
 await p.locator('#continuing-guide [data-continuing="list"]').click();await p.locator('#continuing-guide [data-continuing="refill"]').last().click();assert.ok(await p.evaluate(()=>continuingState().enabled&&continuingState().active.kind==='refill'));await layout('resumed');
 // Keep the real outstanding order while testing the optional market transition.
 await p.evaluate(()=>{livePaused=true;sceneSpeed=4;render();});
 const snapshot=()=>p.evaluate(()=>JSON.stringify({day:state.day,cash:state.cash,machines:state.machines,staff:chainFirm(playerFirm()).staff,notes:refFirm(playerFirm()).notes,bills:refFirm(playerFirm()).bills,work:refFirm(playerFirm()).work,jobs:state.jobs,enabled:mgFirm(playerFirm()).enabled,paused:livePaused,speed:sceneSpeed,rules:Object.fromEntries(Object.entries(state.scenario.rules).filter(([k])=>!['events','supply'].includes(k)))}));
 const original=await snapshot();assert.deepEqual(await p.evaluate(()=>[state.scenario.rules.events,state.scenario.rules.supply]),[0,0]);
 for(const [width,height] of [[1280,900],[390,844]]){
  await p.setViewportSize({width,height});await p.locator('[data-continuing="market"]').click();assert.equal(await p.evaluate(()=>modalView),'continuing-market');
  await p.screenshot({path:path.join(output,`${language}-${width}-market-confirm.png`)});
  await p.locator('#continuing-market-confirm').scrollIntoViewIfNeeded();assert.ok(await p.locator('#continuing-market-confirm').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}));
  await p.locator('#modal-body [data-close]').first().click();assert.ok(await p.locator('#continuing-guide').isVisible(),'closing market dialog must restore ongoing guidance');assert.equal(await snapshot(),original);assert.deepEqual(await p.evaluate(()=>[state.scenario.rules.events,state.scenario.rules.supply]),[0,0]);await layout('market-kept');
  await p.locator('[data-continuing="market"]').click();await p.locator('#modal-body [data-close]').last().click();assert.ok(await p.locator('#continuing-guide').isVisible(),'close button must restore ongoing guidance');assert.equal(await snapshot(),original);
 }
 await p.locator('[data-continuing="market"]').click();await p.locator('#continuing-market-confirm').click();assert.deepEqual(await p.evaluate(()=>[state.scenario.rules.events,state.scenario.rules.supply]),[2,1]);assert.equal(await snapshot(),original);assert.equal(await p.locator('[data-continuing="market"]').count(),0);
 await p.reload();await p.locator('#menu-load').click();assert.deepEqual(await p.evaluate(()=>[state.scenario.rules.events,state.scenario.rules.supply]),[2,1]);assert.equal(await p.evaluate(()=>state.day),JSON.parse(original).day);await layout('market-reloaded');

}
assert.deepEqual(errors,[]);console.log('PASS continuing handoff KO/JA PC/mobile: welcome/picker, actualorder/debit tracked, no prematurecompletion, stablefocus, proposals off/reload/resume, city/content/log access; market transition cancel/confirm invariants and save reload');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
