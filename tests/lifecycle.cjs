const assert=require('node:assert/strict'),make=require('./management-harness.cjs');
const g=make(),ev=s=>g.ev(s);
ev('profile.tutorialSeen=true;launchNew();closeModal()');
assert.ok(ev('mgEnabled()&&state.continued'));
ev('checkEnding(true)');assert.equal(ev('state.ended'),false);assert.equal(ev('lifecycleState().achievements.length'),0);
// State fixtures exercise ending boundaries; they do not claim an earned long-run victory.
ev('state.cash=20000000;state.profit=10000;while(state.machines.length<8){const loc=LOCATIONS.find(l=>!machine(l.id)&&!rivalLocations().includes(l.id));const m=npcMachine(loc.id);refInitializeMachine(playerFirm(),m,refHome(playerFirm()).id);state.machines.push(m);}state.day++;checkEnding(true)');
assert.equal(ev('state.ended'),false);assert.ok(ev('lifecycleState().achievements.some(a=>a.id==="enterprise")'));
ev('checkEnding(true)');assert.equal(ev('lifecycleState().achievements.length'),1);
ev('openModal("company-goals")');assert.match(ev('$("modal-body").textContent'),/도시의 대표 기업/);
assert.equal(ev('lifecycleClaim("market")'),false);
assert.equal(ev('lifecycleClaim("enterprise")'),true);assert.equal(ev('state.ending.reason'),'enterprise');assert.ok(ev('state.ended&&valid(state)'));
ev('continueGame()');assert.ok(ev('!state.ended&&livePaused&&lifecycleState().achievements.length===1'));
ev('state.enterprise.industry.shareDays=60;state.enterprise.industry.lastDay=state.day;lifecycleState().lastDay=-1;checkEnding(true)');assert.ok(ev('lifecycleState().achievements.some(a=>a.id==="market")'));
const raw=ev('save();localStorage.getItem(KEY)');g.dom.window.close();const loaded=make(raw);assert.equal(loaded.ev('lifecycleState().achievements.length'),2);assert.ok(loaded.ev('valid(state)'));loaded.dom.window.close();
for(const success of [false,true]){const h=make();h.ev('profile.tutorialSeen=true;chosenDuration=365;launchNew();closeModal();state.day=365;state.profit=0');if(success)h.ev('lifecycleState().achievements.push({id:"enterprise",day:100})');h.ev('checkEnding(true)');assert.equal(h.ev('state.ending.type'),success?'success':'time');assert.ok(h.ev('valid(state)'));h.dom.window.close();}
const lost=make();lost.ev('profile.tutorialSeen=true;launchNew();closeModal();const sh=refFirm(playerFirm()).share;sh.holders.atlas=sh.total;checkEnding()');assert.equal(lost.ev('state.ending.type'),'control');assert.match(lost.ev('$("modal-body").textContent'),/경영권 상실/);lost.dom.window.close();
const industrial=make();industrial.ev('profile.tutorialSeen=true;launchNew();closeModal();state.enterprise.expansion.dominanceDays=30;state.enterprise.expansion.lastAssessment=state.day;checkEnding(true)');assert.ok(industrial.ev('lifecycleState().achievements.some(a=>a.id==="industry")'));industrial.ev('lifecycleClaim("industry");continueGame();retireCompany()');assert.equal(industrial.ev('state.ending.reason'),'retired');assert.ok(industrial.ev('valid(state)'));industrial.dom.window.close();
const failure=make();failure.ev('profile.tutorialSeen=true;launchNew();closeModal();playerFirm().meta.distress=7;refFirm(playerFirm()).bills.push({id:refId(),kind:"wages",to:"workforce",amount:100000000,due:state.day});checkEnding()');assert.equal(failure.ev('state.ending.type'),'bankrupt');assert.match(failure.ev('$("modal-body").textContent'),/회복 가능한 자금/);assert.ok(failure.ev('valid(state)'));failure.dom.window.close();
console.log('PASS lifecycle: free play goals/claim/continue/persistence, duplicate guard, annual assessment, control loss; fixtures not earned victories');
