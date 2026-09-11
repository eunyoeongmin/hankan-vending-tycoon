const assert=require('node:assert/strict'),make=require('./management-harness.cjs');
function game(){const g=make();g.ev(`profile.tutorialSeen=true;setupRules={...STANDARD_RULES,events:0,supply:0};launchNew();closeModal();livePaused=true;window.f=playerFirm();window.r=refFirm(f);window.h=refHome(f);mgFirm(f).enabled=false;`);return g;}
{
 const g=game(),ev=g.ev;assert.equal(ev('state.research.products'),0);
 assert.equal(ev("refPurchaseRequirement(f,'aqua:1',20,h.id)"),null);assert.ok(ev("refOrder(f,'aqua:1',20,h.id)"));
 ev('companyReceive(f,DAY_MS*4);window.m=f.machines[0];window.s=m.slots[0];refAdd(f.ops.warehouse[s.product],s.batches);s.batches=[];refSyncBucket(s,true);syncMachine(m);');
 assert.ok(ev("refSetSKU(f,m.loc,0,'aqua:1')"));assert.ok(ev('companyRestock(f,m)>0'));
 assert.equal(ev('m.slots[0].product'),1);assert.ok(ev('m.slots[0].stock>0'));
 assert.equal(ev("refLaunchProduct(f,1,'house',true)"),false,'manufacturing development still requires research');
 ev('m.slots[1].batches=[];refSyncBucket(m.slots[1],true);m.ref.cold=false;m.ref.hot=false;syncMachine(m);');
 assert.equal(ev("refSetSKU(f,m.loc,1,'aqua:4')"),false);assert.ok(ev("refSlotRequirement(f,m.loc,1,'aqua:4')"));
 for(const lang of ['ko','ja']){ev(`changeLanguage('${lang}');selected=m.loc;renderManage();`);const option=g.dom.window.document.querySelector('#slot-0 option[value="1"]');assert.ok(option&&!option.disabled);assert.ok(g.dom.window.document.querySelector('#slot-0 option[value="4"]').disabled);}
 ev('window.second=refNewSite("warehouse",0);r.sites.push(second);');assert.ok(ev('refAssignMachine(f,m.loc,second.id)'));assert.ok(ev('m.slots.flatMap(s=>s.batches).every(b=>b.hub===second.id)'));assert.ok(ev('valid(state)'));
 assert.deepEqual(g.errors,[]);g.dom.window.close();
}
{
 const g=game(),ev=g.ev;ev('state.cash=100000;mgFirm(f).reserve=0;mgFirm(f).dailyBudget=100000;r.notes.push({id:refId(),principal:80000,rate:0,due:state.day+5,missed:0});');assert.equal(ev('mgSpendable(f)'),20000);
 ev('r.notes[0].due=state.day+8;');assert.equal(ev('mgSpendable(f)'),100000);
 ev('window.route=refRoute(f,h.id,r.vehicles[0].id,[f.machines[0].loc]);refAdd(f.ops.warehouse[0],[refBatch(f,0,100,50000,1,state.day+50,h.id)]);f.machines[0].vault=15000;window.before=state.cash;refOperationsDay(f);');assert.equal(ev("r.work.filter(j=>j.kind==='route').length"),0,'master automation off must not dispatch through daily legacy path');assert.ok(ev('refDispatchRoute(f,route)'),'explicit manual dispatch remains available');
 assert.deepEqual(g.errors,[]);g.dom.window.close();
}
{
 const g=game(),ev=g.ev;ev(`state.cash=10000000;chainFirm(f).licenses.quality=1;window.plant=refNewSite('drink',0);r.sites.push(plant);refHireEmployee(f,'drink',plant.id,1);window.sku=refLaunchProduct(f,0,'house',false);refSKU(sku).eventQualityPenalty=.25;for(const material of ['water','concentrate','package'])r.materials.push({id:refId(),site:plant.id,material,qty:100,value:1000,quality:1});`);
 assert.ok(ev('refProduce(f,plant.id,sku,20)'));assert.equal(ev("r.work.find(j=>j.kind==='production').quality"),1,'quality downgrade reaches physical production');
 assert.equal(ev("refServiceDiagnostics(f).some(d=>d.site===h.id&&d.cause[0].includes('관리자 없음'))"),false);
 assert.deepEqual(g.errors,[]);g.dom.window.close();
}
{
 const g=game(),ev=g.ev;ev(`window.q={serial:99,key:'complaint',loc:0,hub:h.id,product:0,sku:'aqua:0'};window.record=beHistory(q,1,B('검사','検査'));state.cash=0;window.expense=f.ops.expenseToday;beCompleteTask({...q,kind:'regulation',refund:1500,error:true});`);assert.equal(ev('f.ops.expenseToday-expense'),1500);assert.equal(ev("r.bills.find(b=>b.kind==='refund').amount"),1500);assert.equal(ev('state.cash'),0);
 ev(`complain('request',0);window.requestId=state.complaints.find(c=>c.kind==='request').id;beCompleteTask({...q,kind:'repair',amount:100,clear:true});`);assert.ok(ev('state.complaints.some(c=>c.id===requestId)'));assert.deepEqual(g.errors,[]);g.dom.window.close();
}
{
 const g=game(),ev=g.ev;ev(`state.cash=10000000;window.quote=refReplacementQuote(f);window.cash=state.cash;`);assert.equal(ev('quote.used'),ev("Math.round(supplierPrice(chainSupplier('koyo'),0,f)*.5)"));assert.ok(ev('refReplace(f,0,false,true)'));assert.equal(ev('cash-state.cash'),ev('quote.lease+15000'));ev('refEquipmentAdvance(f,DAY_MS*3)');assert.equal(ev('machine(0).ref.lease.fee'),ev('quote.daily'));assert.equal(ev('machine(0).ref.lease.renewalFee'),ev('quote.lease'));ev('machine(0).ref.lease={until:state.day+1,fee:2000};window.cash=state.cash;refRenewMachineLease(f,0);');assert.equal(ev('cash-state.cash'),30000,'signed old lease renewal retained');assert.deepEqual(g.errors,[]);g.dom.window.close();
}
{
 const g=game(),ev=g.ev;ev(`state.cash=1000000;refTerms(f,'aqua',100,0);for(const m of f.machines){for(const s of m.slots){s.batches=[];refSyncBucket(s,true);}syncMachine(m);}for(const w of f.ops.warehouse){w.batches=[];refSyncBucket(w);}mgPurchase(f,h);`);assert.ok(ev("r.work.some(j=>j.kind==='purchase'&&j.qty>=100)"),'standing orders respect signed minimum');ev(`window.v=rivalFirms()[0];state.cash=1000000;window.sku=refLaunchProduct(f,0,'house',false);refAdd(f.ops.warehouse[0],[refBatch(f,0,100,10000,1,state.day+40,h.id,sku)]);v.account.cash=1000000;refWholesaleTerms(v,'player',7);`);assert.equal(ev('refOrder(v,sku,20,refHome(v).id)'),false);assert.ok(ev('refOrder(v,sku,50,refHome(v).id)'));assert.deepEqual(g.errors,[]);g.dom.window.close();
}
{
 const g=game(),ev=g.ev;ev(`state.cash=1000000;window.worker=refHireEmployee(f,'restock',h.id,1);window.route=refRoute(f,h.id,r.vehicles[0].id,[0]);machine(0).vault=15000;refDispatchRoute(f,route);window.original=r.work.find(j=>j.kind==='route').duration;r.work=r.work.filter(j=>j.kind!=='route');r.vehicles[0].busy=0;window.q={key:'exam',serial:1,loc:0,map:0,hub:h.id,worker,product:0,sku:'aqua:0'};beActive('worker',q,1.25,7);refDispatchRoute(f,route);`);assert.ok(Math.abs(ev("r.work.find(j=>j.kind==='route').duration/original")-.8)<1e-9,'event work multiplier reaches actual route duration');assert.deepEqual(g.errors,[]);g.dom.window.close();
}
console.log('PASS system audit: research-free retail, actual delivery/stock, manufacturing gate, equipment/UI conditions KO/JA, hub lot identity, principal reserve, automation pause/manual dispatch, physical quality downgrade and diagnostics');
