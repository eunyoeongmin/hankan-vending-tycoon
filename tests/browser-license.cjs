const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('artifacts/license',{recursive:true});
try{for(const language of ['ko','ja'])for(const [width,height] of [[1280,900],[390,844]]){
 await p.setViewportSize({width,height});await p.goto((process.env.GAME_URL||'http://127.0.0.1:8765/')+'?lang='+language);
 await p.locator('#menu-license').click();assert.equal(await p.evaluate(()=>modalView),'license');
 const text=await p.locator('#license-notice').innerText();assert.match(text,/0BSD/);assert.match(text,/CC0/);assert.match(text,language==='ko'?/출처 표시/:/出典表示/);
 await p.screenshot({path:`artifacts/license/${language}-${width}.png`});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await p.locator('#license-notice summary').first().click();assert.match(await p.locator('#license-notice pre').first().innerText(),/Permission to use, copy, modify/);
 await p.locator('#license-notice summary').last().click();assert.match(await p.locator('#license-notice pre').last().innerText(),/Public License Fallback/);
 await p.locator('#license-back').click();assert.equal(await p.evaluate(()=>modalView),'menu');assert.equal(await p.locator('#game-menu-close').count(),0);
 await p.locator('#menu-license').click();await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>modalView),'menu');
 await p.locator('#menu-new').click();await p.locator('#launch-new').click();await p.locator('#game-menu').click();
 const before=await p.evaluate(()=>JSON.stringify({state,livePaused,sceneSpeed,menuOpen}));
 await p.locator('#menu-license').click();await p.waitForTimeout(250);await p.locator('#license-back').click();assert.equal(await p.evaluate(()=>modalView),'pause');assert.equal(await p.evaluate(()=>JSON.stringify({state,livePaused,sceneSpeed,menuOpen})),before);
 await p.locator('#menu-license').click();await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>modalView),'pause');assert.equal(await p.locator('#menu-license').count(),1);
 await p.locator('#game-menu-close').click();assert.equal(await p.evaluate(()=>modalView),null);assert.ok(await p.locator('#advisor-window-portrait').isVisible());
 }assert.deepEqual(errors,[]);console.log('PASS license notice KO/JA PC/mobile: both menus, embedded standard texts, scroll, return/Escape, no title close, unchanged game/save/clock and advisor restoration');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
