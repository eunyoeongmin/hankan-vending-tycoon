// Regression coverage for explicitly retained pre-supply-chain saves.
const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(require('node:path').join(__dirname,'../dist/index.html'),'utf8'),errors=[];
function setup(raw){const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));return new JSDOM(html,{runScripts:'dangerously',url:'https://hankan.test',virtualConsole:vc,beforeParse(w){w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.Math.random=()=>.5;if(raw)w.localStorage.setItem('hankan-tycoon-v1',raw);}});}
const dom=setup(),w=dom.window,doc=w.document,ev=s=>w.eval(s);
ev('profile.tutorialSeen=true;setupRules={...STANDARD_RULES,events:0,supply:0};chosenDuration=36500;launchBeforeSupplyChain()');
assert.equal(ev('rivalFirms().length'),3);assert.equal(ev('new Set(rivalLocations()).size'),6);assert.ok(ev('valid(state)'));
const npcCash=ev('state.npc.cash');ev('rivalById("atlas").account.cash+=1000');assert.equal(ev('state.npc.cash'),npcCash,'company accounts are independent');
// One customer chooses at most one of four companies; rows exactly account for the market.
ev('advanceBusiness(12000)');assert.ok(ev('state.enterprise.operations.market.districts.every(d=>d.player+d.rival+d.none===d.attempted)'));
assert.ok(ev('rivalFirms().every(f=>f.ops.market.rows.reduce((n,r)=>n+r.served,0)>0)'));
const replay=ev('JSON.stringify(state)');const reload=setup(replay);assert.ok(reload.window.eval('valid(state)'));assert.equal(reload.window.eval('rivalFirms().length'),3);
ev('advanceBusiness(2000)');reload.window.eval('advanceBusiness(2000)');assert.equal(ev('JSON.stringify(state.enterprise.operations)'),reload.window.eval('JSON.stringify(state.enterprise.operations)'));assert.equal(ev('JSON.stringify(state.enterprise.industry.companies)'),reload.window.eval('JSON.stringify(state.enterprise.industry.companies)'));reload.window.close();
// Both companies pay the same procurement price and lead time, with actual inventory value.
ev('state.cash=2000000;const pf=playerFirm(),af=rivalById("atlas");af.account.cash=2000000;pf.ops.orders=[];af.ops.orders=[];pf.ops.warehouse.forEach(w=>{w.qty=0;w.value=0});af.ops.warehouse.forEach(w=>{w.qty=0;w.value=0});');
const equity=ev('companyEquity(playerFirm())');assert.ok(ev('companyOrder(playerFirm(),0,100,0)'));assert.ok(ev('companyOrder(rivalById("atlas"),0,100,0)'));assert.equal(ev('playerFirm().ops.orders[0].value'),ev('rivalById("atlas").ops.orders[0].value'));assert.equal(ev('companyEquity(playerFirm())'),equity);
ev('companyReceive(playerFirm(),DAY_MS);companyReceive(rivalById("atlas"),DAY_MS)');assert.equal(ev('playerFirm().ops.warehouse[0].qty'),100);assert.equal(ev('rivalById("atlas").ops.warehouse[0].qty'),100);
// Price lock, exclusivity, cancellation and lease cost are actual cash expenses.
ev('companySignSupply(playerFirm(),0)');const locked=ev('playerFirm().meta.contract.prices[0]');ev('state.enterprise.index=1.4');assert.ok(ev('companyOrder(playerFirm(),0,100,0)'));assert.equal(ev('playerFirm().ops.orders.at(-1).value'),locked*100);assert.equal(ev('companyOrder(playerFirm(),0,100,1)'),false);ev('companyEndSupply(playerFirm())');assert.ok(ev('companyOrder(playerFirm(),0,100,1)'));
assert.ok(ev('companySignLease(playerFirm(),machine(0))'));const rent=ev('dailyRent(machine(0))');ev('state.enterprise.index=.8');assert.equal(ev('dailyRent(machine(0))'),rent);
// Debt creates cash and an equal liability. Maturity collects principal; insufficient cash harms credit.
ev('state.bank={principal:0,arrears:0,missed:0};playerFirm().meta.credit=65');const before=ev('companyEquity(playerFirm())');assert.ok(ev('borrowCompany(playerFirm(),100000)'));assert.equal(ev('companyEquity(playerFirm())'),before);ev('playerFirm().meta.due=state.day;settleCompanyDebt(playerFirm())');assert.equal(ev('state.bank.principal'),0);
ev('borrowCompany(playerFirm(),100000);state.cash=0;settleCompanyDebt(playerFirm())');assert.equal(ev('state.bank.missed'),1);assert.ok(ev('state.bank.arrears>0'));
// The seller identity is bound to a quoted location; only that company's cash changes.
ev('state.cash=10000000;state.reputation=100;acquireNpc(rivalById("atlas").account.owned[0]);proposeTrade(state.enterprise.trade.quote)');const original=ev('state.npc.cash'),atlas=ev('rivalById("atlas").account.cash'),price=ev('state.enterprise.trade.offer');assert.ok(ev('completeTrade()'));assert.equal(ev('state.npc.cash'),original);assert.equal(ev('rivalById("atlas").account.cash'),atlas+price);
// Full company takeover: cash, debt, stock, orders, machines and technology are transferred once.
ev('const target=rivalById("nova");target.bank.principal=50000;target.bank.arrears=1000;target.meta.tech.quality=2;target.ops.warehouse[1]={qty:20,value:12000};quoteCompany("nova")');
const count=ev('state.machines.length+rivalById("nova").machines.length'),combinedCash=ev('state.cash+rivalById("nova").account.cash'),buyPrice=ev('state.enterprise.industry.buyout.price'),debt=ev('state.bank.principal+rivalById("nova").bank.principal');assert.ok(ev('completeCompanyBuyout()'));assert.equal(ev('state.machines.length'),count);assert.equal(ev('state.cash'),combinedCash-buyPrice);assert.equal(ev('state.bank.principal'),debt);assert.equal(ev('state.enterprise.tech.quality'),2);assert.equal(ev('completeCompanyBuyout()'),false);assert.ok(ev('valid(state)'));
// A funded new investor can enter after the cooling-off period, without ending the player run.
ev('state.day+=30;reviveCompany(rivalById("nova"))');assert.equal(ev('rivalById("nova").meta.generation'),2);assert.equal(ev('rivalById("nova").policy.defeated'),false);assert.equal(ev('state.ended'),false);
// All work surfaces and Japanese decision UI are reachable without revealing general NPC financials.
ev('changeLanguage("ja");selectDesk("rivalry")');assert.ok(doc.querySelector('[data-company-buyout="atlas"]'));assert.ok(!/[가-힣]/.test(doc.querySelector('#enterprise').textContent));
ev('selectDesk("finance")');assert.ok(doc.querySelector('[data-bank="renew"]'));ev('selectDesk("supply")');assert.ok(doc.querySelector('#sign-supply'));ev('selectDesk("journal")');assert.ok(!/[가-힣]/.test(doc.querySelector('#enterprise').textContent));
// Modern company panels preserve the status controls while refreshing every working surface.
ev('syncScene();refreshLiveNumbers();officeUpdate()');const controls=['scene-pause','scene-speed','scene-speed-label','office-debt'].map(id=>doc.getElementById(id));const changes=[];const observer=new w.MutationObserver(r=>changes.push(...r));controls.forEach(el=>observer.observe(el,{childList:true,subtree:true,characterData:true}));
ev('for(let n=0;n<20;n++){syncScene();refreshLiveNumbers();officeUpdate();}');assert.equal(observer.takeRecords().length,0);assert.ok(controls.every(el=>doc.getElementById(el.id)===el));observer.disconnect();
ev('state.pending={id:"festival",loc:0};openModal("event");closeModal()');assert.equal(ev('modalView'),'event');assert.equal(doc.querySelector('#modal-body [data-close]'),null);ev('state.cash=-1;resolveEvent(1)');assert.equal(ev('state.pending'),null,'free event choice remains available in distress');
// A bankrupt company exits only itself; the other companies and the player remain in play.
ev('const failing=rivalById("atlas");failing.account.cash=-2000000;failing.bank.principal=1000000;failing.bank.arrears=100000;failing.meta.credit=0;failing.meta.distress=7;failing.policy.turnDay=0;for(const m of failing.machines){m.vault=0;m.slots.forEach(s=>{s.stock=0;s.value=0});syncMachine(m);}failing.ops.orders=[];failing.ops.warehouse.forEach(w=>{w.qty=0;w.value=0});rivalTurn()');
assert.equal(ev('rivalById("atlas").policy.defeated'),true);assert.equal(ev('rivalById("atlas").machines.length'),0);assert.equal(ev('rivalById("nova").policy.defeated'),false);assert.equal(ev('state.ended'),false);
ev('state.cash=-1;playerFirm().meta.distress=7;state.bank.arrears=0;state.bank.principal=0;machine(0).vault=200000');assert.equal(ev('checkEnding()'),false,'recoverable receipts prevent bankruptcy');
ev('state.enterprise.industry.buyout={id:"missing",day:state.day,generation:1,price:250000}');assert.equal(ev('valid(state)'),false);ev('state.enterprise.industry.buyout=null');
ev('state.enterprise.industry.companies[0].npc.owned.push(state.machines[0].loc)');assert.equal(ev('valid(state)'),false,'duplicate ownership rejected');
dom.window.close();
// Frequent events, complaints, period assessment and continue-playing form one playable run.
const run=setup(),re=s=>run.window.eval(s);
re('profile.tutorialSeen=true;setupRules={...STANDARD_RULES,events:3};chosenDuration=30;launchBeforeSupplyChain();state.cash=3000000;state.staff={collect:1,restock:1};state.enterprise.autoOrder=true;');
for(let day=0;day<30&&!re('state.ended');day++){
 re('if(state.pending){const e=EVENTS.find(e=>e.id===state.pending.id);resolveEvent(e.options.findIndex(o=>o.fee===0));}for(const c of [...state.complaints])respondComplaint(c.id);if(!state.live){livePaused=false;closeModal();startBusiness();}advanceBusiness(DAY_MS);');
 if(re('state.pending&&!state.ended'))assert.equal(re('modalView'),'event');assert.ok(re('valid(state)'));
}
assert.equal(re('state.ended'),true);assert.equal(re('state.ending.type'),'time');assert.ok(re('state.eventsResolved>0'));re('continueGame()');assert.equal(re('state.ended'),false);assert.equal(re('state.continued'),true);assert.ok(re('state.live||state.pending'));
re('state.pending={id:"festival",loc:state.machines[0].loc};openModal("event");livePaused=true');const cancel=new run.window.Event('cancel',{cancelable:true});run.window.document.getElementById('modal').dispatchEvent(cancel);assert.equal(cancel.defaultPrevented,true);assert.equal(re('modalView'),'event');re('resolveEvent(1)');assert.equal(re('livePaused'),true,'decisions retain manual pause');
re('state.pending={id:"festival",loc:state.machines[0].loc};save()');const entry=setup(run.window.localStorage.getItem('hankan-tycoon-v1'));assert.equal(entry.window.eval('modalView'),'menu');entry.window.document.getElementById('modal').dispatchEvent(new entry.window.Event('cancel',{cancelable:true}));assert.equal(entry.window.eval('modalView'),'menu','pending decision cannot bypass title screen');entry.window.close();run.window.close();
assert.deepEqual(errors,[]);console.log('PASS: 3 independent companies, shared finite customers and procurement, deterministic reload, contracts, debt, seller-bound negotiation, whole-company transfer, new entry, KO/JA UI, 30-day event run, continuation and mandatory decisions.');
