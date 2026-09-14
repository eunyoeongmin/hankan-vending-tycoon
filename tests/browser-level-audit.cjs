const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),page=await browser.newPage(),errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('artifacts/level-audit',{recursive:true});
try{
await page.goto(process.env.GAME_URL||'http://127.0.0.1:8765/');await page.locator('#menu-new').click();await page.locator('#launch-new').click();await page.evaluate(()=>{if(modalView)closeModal();livePaused=true;render();window.levelCity=document.querySelector('.map-wrap');});
for(const stage of ['early','full-map-fixture']){
 if(stage==='full-map-fixture')await page.evaluate(()=>{const f=playerFirm(),hub=refHome(f);for(const other of rivalFirms()){other.ops.machines=[];other.account.owned=[];}for(const l of LOCATIONS){if(machine(l.id))continue;const m=npcMachine(l.id,0);state.machines.push(m);refInitializeMachine(f,m,hub.id);}state.live=null;render();});
 for(const language of ['ko','ja']){await page.locator('#language').selectOption(language);
 for(const [width,height] of [[1280,900],[390,844]]){await page.setViewportSize({width,height});
 await page.locator('#desk-nav [data-desk="finance"]').click();
 await page.locator('#operating-advisor-toggle').click();assert.ok(await page.locator('#operating-advisor').isVisible());
 const consultation=await page.evaluate(()=>{const c=deskContent.getBoundingClientRect(),t=$('desktop-titlebar').getBoundingClientRect(),a=$('operating-advisor').getBoundingClientRect();return {contentHeight:c.height,titleWidth:t.width,advisorHeight:a.height,overflow:document.documentElement.scrollWidth>innerWidth+1};});
 assert.ok(consultation.contentHeight>30&&consultation.advisorHeight>30&&!consultation.overflow,JSON.stringify({stage,language,width,consultation}));
 await page.screenshot({path:`artifacts/level-audit/${stage}-${language}-${width}-consultation.png`});
 await page.locator('#operating-advisor-toggle').click();
 await page.locator('#company-goals-button').click();assert.ok(await page.evaluate(()=>modalView==='company-goals'));
 await page.screenshot({path:`artifacts/level-audit/${stage}-${language}-${width}-goals.png`});await page.evaluate(()=>closeModal());

 for(const tab of await page.evaluate(()=>visibleDeskTabs().map(t=>t[0]))){
 await page.locator(`#desk-nav [data-desk="${tab}"]`).click();
 const geometry=await page.evaluate(()=>{const city=document.querySelector('.map-wrap'),c=city.getBoundingClientRect(),d=deskContent.getBoundingClientRect(),t=$('desktop-titlebar').getBoundingClientRect();return {citySame:city===levelCity,cityVisible:!deskMap.hidden&&c.width>100&&c.height>40&&city.contains(document.elementFromPoint(c.x+c.width/2,c.y+c.height/2)),bodyOverflow:document.documentElement.scrollWidth>innerWidth+1,contentWidth:d.width,contentHeight:d.height,titleVisible:t.y>=0&&t.bottom<innerHeight,scrollTop:deskContent.scrollTop};});
 assert.ok(geometry.citySame&&geometry.cityVisible,JSON.stringify({stage,language,width,tab,geometry}));assert.ok(!geometry.bodyOverflow&&geometry.titleVisible&&geometry.contentWidth>100&&geometry.contentHeight>30,JSON.stringify({stage,language,width,tab,geometry}));
 assert.equal(await page.locator('#desktop-title').innerText(),await page.locator(`#desk-nav [data-desk="${tab}"]`).innerText());
 const end=await page.evaluate(()=>{deskContent.scrollTop=deskContent.scrollHeight;const buttons=[...deskContent.querySelectorAll('button')].filter(b=>!b.disabled&&b.getClientRects().length);return buttons.length?buttons.at(-1).outerHTML:null;});
 if(end){const last=page.locator('#desk-content button:visible:enabled').last();try{await last.scrollIntoViewIfNeeded();}catch(error){console.error("LEVEL_CONTEXT",JSON.stringify({stage,language,width,tab,end}));throw error;}assert.ok(await last.evaluate(el=>{const a=el.getBoundingClientRect(),r=deskContent.getBoundingClientRect();return a.bottom<=r.bottom+2&&a.top>=r.top-2;}),`${stage}/${language}/${width}/${tab} last action unreachable`);}
 if(tab==='manage')assert.ok(await page.evaluate(()=>{const button=$('sign-lease'),host=$('lease-controls');for(let i=0;i<10;i++)renderManage();return !!host&&host===$('lease-controls')&&(!button||button===$('sign-lease'));}),`${stage}/${language}/${width} lease controls replaced on refresh`);
 if(tab==='fleet'){assert.match(await page.locator('#fleet-count').innerText(),language==='ko'?/현재 상권.*회사 전체/:/この商圏.*会社全体/);}
 if(['fleet','manufacture','finance','journal'].includes(tab))await page.screenshot({path:`artifacts/level-audit/${stage}-${language}-${width}-${tab}.png`});
 results.push({stage,language,width,tab});
 }
 await page.locator('#desktop-minimize').click();assert.equal(await page.locator('#desk-side').isVisible(),false);await page.locator('#desktop-task').click();await page.locator('#desktop-close').click();assert.equal(await page.locator('#desktop-task').isVisible(),false);await page.locator('#desk-nav [data-desk="finance"]').click();await page.locator('#desktop-minimize').focus();await page.keyboard.press('Escape');await page.keyboard.press('Enter');assert.ok(await page.locator('#desk-side').isVisible());
 }
 }
}
assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/level-audit/results.json',JSON.stringify({routes:results,errors},null,2));console.log('PASS level audit '+results.length+' routes: early/full-map UI fixtures, KO/JA desktop/mobile, city retained, final controls scroll reachable, window keyboard lifecycle');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
