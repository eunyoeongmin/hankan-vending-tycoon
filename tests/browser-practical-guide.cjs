const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),p=await b.newPage({viewport:{width:1280,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
try{fs.mkdirSync('artifacts/practical-guide',{recursive:true});
for(const language of ['ko','ja']){
 await p.goto((process.env.GAME_URL||'http://127.0.0.1:8765/')+'?lang='+language);await p.locator('#menu-new').click();await p.locator('#guide-launch').click();
 assert.equal(await p.locator('#practical-guide').isVisible(),true);assert.equal(await p.locator('[data-desk="research"]').isDisabled(),true);
 for(let step=0;step<16;step++){
  assert.equal(await p.evaluate(()=>state.guide.step),step);
  if([1,3,5,8,11,13,15].includes(step)){
   await p.locator('#guide-focus').click();await p.locator('#scene-pause').click();
   await p.evaluate(step=>{for(let i=0;i<1800&&state.guide.step===step;i++){if(!state.live)startBusiness();advanceBusiness(1000);guideCheck();}},step);
  }else{
   await p.locator('#guide-focus').click();
   if(step===14){await p.locator('[data-ref-action="route-auto"]').first().click();await p.locator('[data-ref-action="route-run"]').first().click();await p.locator('#scene-pause').click();await p.evaluate(()=>{for(let i=0;i<1800&&state.guide.step===14;i++){if(!state.live)startBusiness();advanceBusiness(1000);guideCheck();}});}
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
