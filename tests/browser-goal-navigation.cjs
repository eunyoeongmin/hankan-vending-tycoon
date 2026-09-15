const {chromium}=require('playwright'),{pathToFileURL}=require('node:url'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));try{
 const artifact=process.env.ARTIFACT_DIR||path.join(process.cwd(),'artifacts','goal-navigation');fs.mkdirSync(artifact,{recursive:true});
 await p.goto(process.env.GAME_URL||'http://127.0.0.1:8765/');

 await p.locator('#menu-new').click();await p.locator('#launch-new').click();await p.evaluate(()=>{livePaused=true;render();});
 const day=await p.evaluate(()=>state.day);
 for(const language of ['ko','ja']){await p.locator('#language').selectOption(language);for(const [width,height] of [[1280,900],[390,844]]){await p.setViewportSize({width,height});await p.locator('#company-goals-button').click();await p.screenshot({path:path.join(artifact,`after-goals-${language}-${width}.png`)});assert.equal(await p.locator('[data-goal-desk]').count(),6);await p.evaluate(()=>closeModal());
 for(const desk of ['equipment','reports','market','manufacture','research']){await p.locator('#company-goals-button').click();await p.locator(`[data-goal-desk="${desk}"]`).first().click();assert.equal(await p.evaluate(()=>deskTab),desk);assert.equal(await p.evaluate(()=>modalView),null);assert.ok(await p.evaluate(()=>livePaused&&!deskMap.hidden&&desktopWindowState==='open'));assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}}
 }
 assert.equal(await p.evaluate(()=>state.day),day);assert.deepEqual(errors,[]);console.log('PASS goal navigation KO/JA desktop/mobile, five actual routes, clock unchanged, map maintained');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
