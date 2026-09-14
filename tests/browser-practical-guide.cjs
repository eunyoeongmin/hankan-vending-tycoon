const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),p=await b.newPage({viewport:{width:1280,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
try{fs.mkdirSync('artifacts/practical-guide',{recursive:true});
for(const language of ['ko','ja']){
 await p.goto((process.env.GAME_URL||'http://127.0.0.1:8765/')+'?lang='+language);await p.locator('#menu-new').click();await p.locator('#guide-launch').click();
 assert.ok(await p.evaluate(()=>guideIntro()&&livePaused));
 assert.equal(await p.locator('#guide-spotlight').isVisible(),false);assert.equal(await p.locator('.guide-target').count(),0);
 await p.screenshot({path:`artifacts/practical-guide/${language}-welcome.png`});
 if(language==='ko'){
  await p.setViewportSize({width:390,height:844});await p.screenshot({path:'artifacts/practical-guide/mobile-welcome.png'});
  assert.ok(await p.locator('#practical-guide').evaluate(el=>el.scrollWidth<=el.clientWidth+2));await p.setViewportSize({width:1280,height:900});
  await p.locator('#guide-question').click();assert.equal(await p.evaluate(()=>state.guide.intro),'reassure');
  await p.reload();await p.locator('#menu-load').click();assert.ok(await p.evaluate(()=>guideIntro()&&livePaused&&state.guide.intro==='reassure'));
  await p.locator('#guide-question').click();assert.equal(await p.evaluate(()=>state.guide.intro),'plan');
  await p.locator('#guide-time').click();assert.equal(await p.evaluate(()=>state.guide.intro),'time');
 }
 const day=await p.evaluate(()=>state.day);await p.locator('#scene-pause').click();await p.waitForTimeout(400);assert.ok(await p.evaluate(day=>livePaused&&state.day===day,day));
 await p.locator('#guide-ready').click();assert.ok(await p.evaluate(()=>!guideIntro()&&livePaused&&state.guide.step===0));
 assert.equal(await p.locator('#practical-guide').isVisible(),true);assert.equal(await p.locator('[data-desk="research"]').isDisabled(),true);
 for(let step=0;step<16;step++){
  assert.equal(await p.evaluate(()=>state.guide.step),step,await p.evaluate(()=>JSON.stringify({guide:state.guide,work:refFirm(playerFirm()).work,stock:state.machines.map(m=>({loc:m.loc,stock:m.stock}))})));
  if([1,3,5,8,11,13,15].includes(step)){
   await p.locator('#guide-focus').click();
   assert.equal(await p.locator('#guide-spotlight').evaluate(el=>getComputedStyle(el).pointerEvents),'none');
   assert.ok(await p.locator('#guide-holes rect').count()>=3);
   if(step===1){assert.match(await p.locator('#guide-status').innerText(),language==='ko'?/첫 판매 대기/:/最初の購入待ち/);assert.equal(await p.locator('#guide-progress').isVisible(),false);}
   if(step===5){assert.equal(await p.locator('#guide-progress').isVisible(),true);assert.match(await p.locator('#guide-status').innerText(),language==='ko'?/남은 작업 시간/:/残り作業時間/);}
   await p.locator('#scene-pause').click();
   if(step===1||step===5){await p.waitForTimeout(400);await p.screenshot({path:`artifacts/practical-guide/${language}-waiting-${step}.png`});}
   await p.evaluate(step=>{for(let i=0;i<1800&&state.guide.step===step;i++){if(!state.live)startBusiness();advanceBusiness(1000);guideCheck();}},step);
  }else{
   await p.locator('#guide-focus').click();
   if(step===14){
    // The original order may be consumed while waiting for the second machine; follow the lesson's additional-order branch.
    await p.locator('[data-desk="supply"]').click();await p.locator('[data-ref-action="order"]').click();
    assert.ok(await p.evaluate(()=>refFirm(playerFirm()).work.some(j=>j.kind==='purchase')));
    await p.locator('#scene-pause').click();
    await p.evaluate(()=>{for(let i=0;i<1800&&refFirm(playerFirm()).work.some(j=>j.kind==='purchase');i++){if(!state.live)startBusiness();advanceBusiness(1000);}livePaused=true;render();});
    assert.ok(await p.evaluate(()=>!refFirm(playerFirm()).work.some(j=>j.kind==='purchase')));
    await p.locator('#guide-focus').click();await p.locator('[data-ref-action="route-auto"]').first().click();await p.locator('[data-ref-action="route-run"]').first().click();assert.ok(await p.evaluate(()=>refFirm(playerFirm()).work.some(j=>j.kind==='route'&&j.stops.some(s=>s.loc===state.guide.target&&s.cargo.length))));await p.locator('#scene-pause').click();await p.evaluate(()=>{for(let i=0;i<90000&&state.guide.step===14;i++){if(!state.live)startBusiness();advanceBusiness(20);guideCheck();}});}
   else await p.locator('.guide-target').click();
  }
  if([0,4,9,13].includes(step))await p.screenshot({path:`artifacts/practical-guide/${language}-${step+1}.png`});
  if(step===4){await p.reload();await p.locator('#menu-load').click();assert.equal(await p.evaluate(()=>state.guide.step),5);}
 }
 assert.ok(await p.evaluate(()=>!guideActive()&&state.guide.step===16&&state.machines.length===2&&machine(state.guide.target).total>0));assert.equal(await p.locator('[data-desk="research"]').isDisabled(),false);
}
await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{state.guide.active=true;state.guide.step=4;render();});await p.screenshot({path:'artifacts/practical-guide/mobile.png'});assert.ok(await p.locator('#practical-guide').evaluate(el=>el.scrollWidth<=el.clientWidth+2));assert.deepEqual(errors,[]);
console.log('PASS real UI practical guide KO/JA: all 16 actions, save reload, actual second machine sale, locks/release and mobile');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
