const assert=require('node:assert/strict'),make=require('./management-harness.cjs');
function boot(raw){return make(raw);}
let g=boot(),ev=s=>g.ev(s);
ev('launchNew();closeModal();state.cash=5000000;continuingPaint()');
const cash=ev('state.cash'),day=ev('state.day'),paused=ev('livePaused');
ev('continuingStart("expansion");continuingPaint()');assert.equal(ev('continuingState().active.step'),0);
ev('document.querySelector("[data-continuing=go]").click();continuingPaint()');assert.equal(ev('continuingState().active.step'),0,'navigation is not completion');
assert.equal(ev('state.cash'),cash);assert.equal(ev('state.day'),day);assert.equal(ev('livePaused'),paused);
ev('continuingState().active=null');assert.ok(ev('mgBorrow(playerFirm(),10000)'));
ev('continuingStart("finance")');assert.equal(ev('continuingState().active.step'),1);
assert.ok(ev('mgRepay(playerFirm(),refFirm(playerFirm()).notes[0].id,5000)'));ev('continuingCheck()');assert.ok(ev('continuingState().done.finance'));assert.ok(ev('continuingState().snoozeUntil>state.day'));
// An empty-machine fixture; completion must use actual purchasing, arrival, dispatch and sale.
ev('for(const s of state.machines[0].slots){s.batches=[];refSyncBucket(s,true)}syncMachine(state.machines[0]);for(const b of playerFirm().ops.warehouse){b.batches=[];refSyncBucket(b)}continuingStart("refill")');
assert.equal(ev('continuingState().active.step'),0);
assert.ok(ev('refOrder(playerFirm(),"aqua:0",100,refHome(playerFirm()).id)'));ev('continuingCheck()');assert.equal(ev('continuingState().active.step'),1);
assert.ok(ev('valid(state)'), 'fixture valid');let raw=ev('save();localStorage.getItem(KEY)');g.dom.window.close();g=boot(raw);ev('document.querySelector("#menu-load").click()');assert.equal(ev('continuingState().active.kind'),'refill');assert.equal(ev('continuingState().active.step'),1);
ev('refCommerceAdvance(playerFirm(),DAY_MS*20);continuingCheck()');assert.equal(ev('continuingState().active.step'),2);
assert.ok(ev('refRoute(playerFirm(),refHome(playerFirm()).id,refFirm(playerFirm()).vehicles[0].id,[state.machines[0].loc])'));
assert.ok(ev('refDispatchRoute(playerFirm(),refFirm(playerFirm()).routes[0].id)'));ev('refOperationsAdvance(playerFirm(),DAY_MS*20);continuingCheck()');assert.equal(ev('continuingState().active.step'),3);
ev('livePaused=false;if(!state.live)startBusiness()');for(let n=0;n<1200&&!ev('!!continuingState().done.refill');n++)ev('if(!state.live)startBusiness();advanceBusiness(1000);continuingCheck()');assert.ok(ev('continuingState().done.refill'));
ev('lang="ja";continuingPaint()');assert.match(ev('continuingPanel.textContent'),/秘書/);
ev('continuingState().enabled=false;continuingPaint();save()');raw=ev('localStorage.getItem(KEY)');g.dom.window.close();g=boot(raw);ev('document.querySelector("#menu-load").click()');assert.equal(ev('continuingState().enabled'),false);
ev('launchNew();closeModal();continuingPaint()');assert.equal(ev('continuingState().enabled'),true);assert.equal(ev('Object.keys(continuingState().done).length'),0);


ev('state.cash=50000000;continuingStart("expansion");window.nextLoc=LOCATIONS.find(l=>l.map===LOCATIONS[state.machines[0].loc].map&&!chainSiteOwner(l.id)&&!machine(l.id)&&!rivalOwner(l.id)).id');assert.ok(ev('reserveSite(playerFirm(),nextLoc)'));assert.ok(ev('chainOrderMachine(playerFirm(),"koyo",0)'));ev('companyReceive(playerFirm(),DAY_MS*3)');assert.ok(ev('installKit(playerFirm(),nextLoc)'));ev('companyReceive(playerFirm(),DAY_MS*2);continuingCheck()');assert.equal(ev('continuingState().active.step'),1);
assert.ok(ev('refOrder(playerFirm(),"aqua:0",100,refHome(playerFirm()).id)'));ev('refCommerceAdvance(playerFirm(),DAY_MS*20)');assert.ok(ev('refRoute(playerFirm(),refHome(playerFirm()).id,refFirm(playerFirm()).vehicles[0].id,[nextLoc])'));assert.ok(ev('refDispatchRoute(playerFirm(),refFirm(playerFirm()).routes[0].id)'));ev('refOperationsAdvance(playerFirm(),DAY_MS*20);continuingCheck()');assert.equal(ev('continuingState().active.step'),2);
ev('livePaused=false;if(!state.live)startBusiness()');for(let n=0;n<1200&&!ev('!!continuingState().done.expansion');n++)ev('if(!state.live)startBusiness();advanceBusiness(1000);continuingCheck()');assert.ok(ev('continuingState().done.expansion'));
ev('state.cash=50000000;continuingStart("research")');assert.ok(ev('refResearch(playerFirm(),"quality","aqua")'));ev('continuingCheck()');assert.equal(ev('continuingState().active.step'),1);
for(let n=0;n<30&&!ev('!!continuingState().done.research');n++)ev('companyReceive(playerFirm(),DAY_MS*20);for(const p of refFirm(playerFirm()).projects){if(p.paused)refResearchTopUp(playerFirm(),p.id);if(p.review)refResearchReview(playerFirm(),p.id,"continue")}continuingCheck()');
assert.ok(ev('continuingState().done.research'));
ev('continuingStart("manufacture");window.factory=refBuildSite(playerFirm(),"drink",0);companyReceive(playerFirm(),DAY_MS*6);refHireEmployee(playerFirm(),"drink",factory,2);window.ownsku=refLaunchProduct(playerFirm(),0,"house",false);');
assert.ok(ev('factory'));assert.ok(ev('ownsku'));
ev('refRawOrder(playerFirm(),"water",100,0,factory);refRawOrder(playerFirm(),"concentrate",100,0,factory);refRawOrder(playerFirm(),"package",100,0,factory);companyReceive(playerFirm(),DAY_MS*3)');
assert.ok(ev('refProduce(playerFirm(),factory,ownsku,100)'));ev('continuingCheck()');assert.equal(ev('continuingState().active.step'),1);
ev('continuingStart("staff");continuingCheck();companyReceive(playerFirm(),1000);continuingCheck()');assert.ok(ev('continuingState().done.staff'));
ev('continuingStart("manufacture");continuingCheck()');
for(let n=0;n<40&&!ev('!!continuingState().done.manufacture');n++)ev('companyReceive(playerFirm(),DAY_MS);continuingCheck()');assert.ok(ev('continuingState().done.manufacture'));

ev('state.continuingGuide={version:1,enabled:"bad",last:"__proto__",done:{bad:{day:1},refill:{day:"bad"}},active:{kind:"refill",step:1},snoozeUntil:"bad"};continuingPaint()');assert.equal(ev('continuingState().active'),null);assert.equal(ev('continuingState().last'),null);assert.equal(ev('Object.keys(continuingState().done).length'),0);
ev('document.querySelector("[data-continuing=list]").click()');assert.equal(ev('continuingPicker'),true);ev('launchNew();closeModal();continuingPaint()');assert.equal(ev('continuingPicker'),false);assert.match(ev('continuingPanel.textContent'),/自動運営|자동 운영/);
ev('guideStart();continuingPaint()');assert.equal(ev('continuingPanel.hidden'),true);

// Explicit market choice after practice; no other business settings or pending contracts mutate.
ev('lang="ko";state.guide.active=false;state.guide.step=16;continuingPaint()');assert.equal(ev('continuingMarketAvailable()'),true);
const rulesBefore=JSON.parse(ev('JSON.stringify(state.scenario.rules)')),operationsBefore=ev('JSON.stringify({cash:state.cash,machines:state.machines,staff:chainFirm(playerFirm()).staff,orders:chainFirm(playerFirm()).orders,notes:refFirm(playerFirm()).notes,terms:refFirm(playerFirm()).purchaseTerms,auto:mgFirm(playerFirm()),paused:livePaused,speed:sceneSpeed})');
ev('document.querySelector("[data-continuing=market]").click()');assert.equal(ev('modalView'),'continuing-market');assert.match(ev('document.querySelector("#modal-body").textContent'),/普通|보통/);
ev('document.querySelector("#modal-body [data-close]").click()');assert.deepEqual(JSON.parse(ev('JSON.stringify(state.scenario.rules)')),rulesBefore);
ev('lang="ja";openModal("continuing-market")');assert.match(ev('document.querySelector("#modal-body").textContent'),/自動運営/);ev('document.querySelector("#continuing-market-confirm").click()');
assert.equal(ev('state.scenario.rules.events'),ev('STANDARD_RULES.events'));assert.equal(ev('state.scenario.rules.supply'),ev('STANDARD_RULES.supply'));assert.equal(ev('state.scenario.preset'),'custom');assert.ok(ev('validScenario(state.scenario)'));assert.equal(ev('continuingMarketAvailable()'),false);
const afterRules=JSON.parse(ev('JSON.stringify(state.scenario.rules)'));delete rulesBefore.events;delete rulesBefore.supply;delete afterRules.events;delete afterRules.supply;assert.deepEqual(afterRules,rulesBefore);
assert.equal(ev('JSON.stringify({cash:state.cash,machines:state.machines,staff:chainFirm(playerFirm()).staff,orders:chainFirm(playerFirm()).orders,notes:refFirm(playerFirm()).notes,terms:refFirm(playerFirm()).purchaseTerms,auto:mgFirm(playerFirm()),paused:livePaused,speed:sceneSpeed})'),operationsBefore);
assert.deepEqual(g.errors,[]);g.dom.window.close();console.log('PASS continuing guide real purchase/delivery/sale, repayment, research, factory output, assigned staff work; resume/off/reset/malformed state/KO-JA/guide isolation');
