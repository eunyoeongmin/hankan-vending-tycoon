const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('artifacts/advisor-window',{recursive:true});
const geometry=()=>p.evaluate(()=>[officeStatus,deskLayout,deskMap,deskContent,officeRegister].map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}));
try{for(const lang of ['ko','ja'])for(const [width,height] of [[1280,900],[390,844],[320,568],[640,480]]){
 await p.setViewportSize({width,height});await p.goto((process.env.GAME_URL||'http://127.0.0.1:8765/')+'?lang='+lang);await p.locator('#menu-new').click();await p.locator('#guide-launch').click();
 assert.ok(await p.locator('#advisor-window-portrait').evaluate(e=>e.complete&&e.naturalWidth>0));
 assert.equal(await p.locator('#office-register #practical-guide').count(),0);
 const initial=await geometry();await p.locator('#advisor-fold').click();assert.deepEqual(await geometry(),initial);assert.ok(await p.locator('#advisor-restore img').isVisible());await p.locator('#advisor-restore').click();assert.deepEqual(await geometry(),initial);
 await p.locator('#guide-ready').click();await p.locator('#guide-focus').click();assert.ok(await p.locator('#advisor-restore').isVisible());await p.locator('.guide-target').click();assert.equal(await p.evaluate(()=>state.guide.step),1);assert.ok(await p.locator('#advisor-window').isVisible());
 // Finished lesson state is a fixture; this test checks UI isolation, not earned graduation.
 await p.evaluate(()=>{state.guide.active=false;state.guide.step=16;delete state.continuingGuide;livePaused=true;render();});
 await p.locator('[data-continuing="welcome"]').click();
 const stable=await geometry(),before=await p.evaluate(()=>JSON.stringify({cash:state.cash,day:state.day,machines:state.machines,paused:livePaused,speed:sceneSpeed}));
 await p.locator('[data-continuing="list"]').click();await p.locator('[data-continuing="refill"]').click();assert.deepEqual(await geometry(),stable);
 assert.ok(await p.locator('#advisor-window-portrait').isVisible());
 await p.evaluate(()=>{window.advisorNode=$('advisor-fold');for(let i=0;i<10;i++)updateDesk();});assert.ok(await p.evaluate(()=>advisorNode===$('advisor-fold')));
 await p.screenshot({path:`artifacts/advisor-window/${lang}-${width}-open.png`});
 await p.locator('[data-continuing="go"]').click();assert.ok(await p.locator('#advisor-restore').isVisible());await p.locator('#ref-sku').selectOption(await p.locator('#ref-sku option').first().getAttribute('value'));
 await p.locator('#advisor-restore').click();await p.locator('#advisor-fold').click();await p.locator('#operating-advisor-toggle').click();assert.ok(await p.locator('#operating-advisor').isVisible());assert.ok(await p.locator('#advisor-window-portrait').isVisible());assert.deepEqual(await geometry(),stable);
 assert.equal(await p.evaluate(()=>JSON.stringify({cash:state.cash,day:state.day,machines:state.machines,paused:livePaused,speed:sceneSpeed})),before);
 const bar=await p.locator('#advisor-window-bar').boundingBox();await p.mouse.move(bar.x+20,bar.y+10);await p.mouse.down();await p.mouse.move(20,200);await p.mouse.up();
 const bounds=await p.locator('#advisor-window').boundingBox();assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=width+1&&bounds.y+bounds.height<=height+1,JSON.stringify(bounds));
 await p.locator('#advisor-fold').click();await p.locator('#game-menu').click();assert.ok(await p.locator('#advisor-layer').isHidden());await p.locator('#game-menu-close').click();assert.ok(await p.locator('#advisor-restore').isVisible());
 await p.reload();await p.locator('#menu-load').click();assert.ok(await p.locator('#advisor-window-portrait').isVisible());
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }assert.deepEqual(errors,[]);console.log('PASS advisor layer KO/JA 1280/390/320/640: portraits, unchanged layout/state, tutorial focus/next stage, post-tutorial tracks, consultation, fold/restore/drag/menu/reload and stable nodes');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

