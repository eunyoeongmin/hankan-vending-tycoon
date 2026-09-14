const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),make=require('./management-harness.cjs');
const g=make(),ev=s=>g.ev(s);
// Allows isolated review before the integration owner adds the module to build.py.
if(ev('typeof operatingAdvice')==='undefined'){const script=g.dom.window.document.createElement('script');script.textContent=fs.readFileSync(path.join(__dirname,'../src/operating-advisor.js'),'utf8');g.dom.window.document.body.append(script);}
ev('launchNew();closeModal();paintOperatingAdvisor()');
assert.equal(ev('operatingAdvisorButton.hidden'),false);
const cash=ev('state.cash'),day=ev('state.day'),paused=ev('livePaused');
ev('operatingAdvisorButton.click()');assert.equal(ev('operatingAdvisorPanel.hidden'),false);
for(const tab of ['manage','supply','logistics','equipment','staff','finance','research','manufacture','rivalry','alerts','journal']){
 ev(`selectDesk('${tab}')`);assert.equal(ev('deskTab'),tab);
 assert.ok(ev('operatingAdvisorPanel.textContent.length')>80);
 assert.ok(ev('operatingAdvisorPanel.querySelectorAll("[data-advisor-route]").length')>=2);
}
ev('selectDesk("finance")');assert.match(ev('operatingAdvisorPanel.textContent'),/연 이율/);
assert.match(ev('operatingAdvisorPanel.textContent'),/차입 잔액/);
const node=ev('operatingAdvisorPanel.querySelector("button")');ev('paintOperatingAdvisor()');
assert.equal(ev('operatingAdvisorPanel.querySelector("button")'),node,'stable controls on unchanged update');
ev('operatingAdvisorPanel.querySelector("[data-advisor-route=reports]").click()');assert.equal(ev('deskTab'),'reports');
ev('lang="ja";paintOperatingAdvisor()');assert.match(ev('operatingAdvisorPanel.textContent'),/社長/);
assert.equal(ev('state.cash'),cash);assert.equal(ev('state.day'),day);assert.equal(ev('livePaused'),paused);
ev('guideStart();paintOperatingAdvisor()');assert.equal(ev('operatingAdvisorButton.hidden'),true);
assert.equal(ev('operatingAdvisorPanel.hidden'),true);
assert.deepEqual(g.errors,[]);g.dom.window.close();console.log('PASS operating advisor: fullgame routes, KO/JA, stable controls, no clock/cash mutation, beginner guide isolation');

