const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(require('node:path').join(__dirname,'../dist/index.html'),'utf8');
function create(raw){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://hankan.test',virtualConsole:vc,beforeParse(w){w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};if(raw)w.localStorage.setItem('hankan-tycoon-v1',raw);}});return {dom,errors,ev:s=>dom.window.eval(s)};}
const {dom,errors,ev}=create();
ev(`profile.tutorialSeen=true;setupRules={...STANDARD_RULES,events:0,supply:0};launchNew();closeModal();livePaused=true;state.day=92;state.weather=1;state.cash=50000000;
 window.f=playerFirm();window.r=refFirm(f);window.hub=refHome(f);state.research.products=3;f.meta.credit=90;
 for(const loc of [1,2,3,4]){const owner=rivalOwner(loc);if(owner){owner.ops.machines=owner.ops.machines.filter(m=>m.loc!==loc);owner.account.owned=owner.account.owned.filter(l=>l!==loc);}const m=npcMachine(loc,0);state.machines.push(m);refInitializeMachine(f,m,hub.id);m.condition=65;}
 for(const m of f.machines){m.condition=65;for(const s of m.slots){s.batches=[refBatch(f,s.product,15,7500,.5,state.day+100,hub.id,'aqua:'+s.product)];refSyncBucket(s,true);}syncMachine(m);}
 const h2=refNewSite('warehouse',0);r.sites.push(h2);const plant=refNewSite('drink',0);r.sites.push(plant);
 refHireEmployee(f,'restock',hub.id,2);refHireEmployee(f,'logistics',hub.id,2);refHireEmployee(f,'technician',hub.id,2);refHireEmployee(f,'drink',plant.id,2);for(const w of chainFirm(f).staff){w.satisfaction=60;w.fatigue=65;}
 const sku=refLaunchProduct(f,0,'house',false);window.testSKU=sku;refAdd(f.ops.warehouse[0],[refBatch(f,0,100,50000,.5,state.day+100,hub.id,sku)]);
 refOrder(f,'aqua:0',80,hub.id);refResearch(f,'quality','aqua');r.projects[0].paused=true;r.projects[0].extra=10000;
 r.work.push({id:refId(),kind:'production',site:plant.id,hub:hub.id,sku,product:0,machine:false,qty:50,value:25000,quality:.5,stage:0,progress:0,duration:DAY_MS,remaining:1,labor:0,overhead:0});
 const cargo=refTake(f.ops.warehouse[0],10);refSyncBucket(f.ops.warehouse[0]);r.work.push({id:refId(),kind:'route',site:hub.id,vehicle:r.vehicles[0].id,employee:0,cold:false,remaining:DAY_MS*2,stops:[{loc:0,cargo:[{slot:0,batches:cargo}]}]});
 refContract(f,0,'fixed');r.contracts[0].until=state.day+3;mgBorrow(f,50000,'working');r.notes[0].variable=true;
 complain('expired',0);state.complaints[0].stage=1;state.complaints[0].deadline=state.day-1;
 state.live.rows=f.machines.map(m=>marketRow(m,100));recordMarketSale(f.machines[0],f.machines[0].slots[0],state.live.rows[0],0,1500,true);
 if(!rivalOwner(5)){const v=rivalFirms()[0],m=npcMachine(5,0);v.ops.machines.push(m);v.account.owned.push(5);refInitializeMachine(v,m,refHome(v).id);m.slots[0].batches=[refBatch(v,0,15,7500,.5,state.day+100,refHome(v).id)];refSyncBucket(m.slots[0],true);syncMachine(m);}for(const v of rivalFirms()){v.account.cash=10000000;const vr=refFirm(v);vr.sites.push(refNewSite('drink',refHome(v).map));const id=refLaunchProduct(v,0,'house',false);if(id)refAdd(v.ops.warehouse[0],[refBatch(v,0,50,25000,.5,state.day+100,refHome(v).id,id)]);for(const m of v.machines)m.ref.age=0;}
 state.live.day=state.day;state.live.rows[0].attempted=1;chainFirm(f).sites.push({loc:LOCATIONS.find(l=>!machine(l.id)&&!rivalOwner(l.id)&&!chainSiteOwner(l.id)).id,value:100000});beState();window.fixture=JSON.stringify(state);render=()=>{};toast=()=>{};`);
assert.ok(ev('valid(state)'), 'fixture validates '+ev('JSON.stringify({live:validLive(state.live,state),reference:validReference(refWorld(),state),enterprise:validEnterprise(state.enterprise,state),be:validBusinessEvents(state.businessEvents,state)})'));
const keys=ev('BUSINESS_EVENTS.map(e=>e.id)');assert.equal(keys.length,40);
const results=[];
for(const key of keys)for(const choice of [0,1]){
 ev(`state=JSON.parse(fixture);window.f=playerFirm();window.r=refFirm(f);window.hub=refHome(f);state.pending=null;state.businessEvents.pending=null;modalView=null;livePaused=true;`);
 // Put an eligible instance in the existing company, retaining real inventory and identities.
 if(key==='cold-transport')ev("refFirm(playerFirm()).work.find(j=>j.kind==='route').stops[0].cargo[0].batches[0].product=4;");
 if(key==='office')ev("refFirm(playerFirm()).contracts=[];");
 const loc=ev(`state.machines.map(m=>m.loc).find(loc=>beTarget('${key}',0,loc))`);
 assert.notEqual(loc,undefined,`eligible ${key}`);
 assert.ok(ev(`beOffer('${key}',${loc})`),`offer ${key}`);
 assert.ok(ev('valid(state)'),`pending valid ${key}`);
 const before=ev('JSON.stringify(state)'),pending=ev('JSON.stringify(state.businessEvents.pending)');
 const reload=create(before);assert.equal(reload.ev('loadWarning'),false,`pending reload ${key}`);assert.equal(reload.ev('JSON.stringify(state.businessEvents.pending)'),pending);reload.dom.window.close();
 const block=ev(`beChoices(beState().pending)[${choice}].block`);assert.equal(block,'',`choice available ${key}/${choice}`);
 assert.ok(ev(`beResolve(${choice})`),`resolve ${key}/${choice}`);
 assert.equal(ev('state.pending'),null);const cash=ev('state.cash');assert.equal(ev(`beResolve(${choice})`),false);assert.equal(ev('state.cash'),cash,'no duplicate charges');
 if(!ev('valid(state)')){fs.writeFileSync(require('node:path').join(require('node:os').tmpdir(),'hankan-event-invalid.json'),ev('JSON.stringify(state)'));throw Error(`invalid ${key}/${choice}`);}
 ev('for(let i=0;i<8;i++){state.day++;if(state.live)state.live.day=state.day;beDay();}');assert.ok(ev('valid(state)'),`delayed valid ${key}/${choice}`);
 assert.ok(ev('allFirms().every(f=>refCheckConservation(f))'),`batch conservation ${key}/${choice}`);
 results.push(key+'/'+choice);
}
// Player refusal cannot mint an unfunded competitor campaign.
ev(`state=JSON.parse(fixture);state.pending=null;beState().pending=null;beOffer('festival',0);for(const v of rivalFirms())v.account.cash=0;beResolve(1);`);assert.equal(ev("beState().active.filter(a=>a.firm!=='player'&&a.firm!=='all').length"),0);
// Declined / deferred offers expire without taking the quoted payment; old states without the extension still load.
ev(`state=JSON.parse(fixture);state.pending=null;beState().pending=null;beOffer('tv',0);beState().pending.deferred=true;window.cashBefore=state.cash;state.day+=4;beDay();`);assert.equal(ev('state.cash'),ev('cashBefore'));assert.equal(ev('state.pending'),null);
ev(`state=JSON.parse(fixture);state.pending=null;beState().pending=null;beOffer('tv',0);window.q=beState().pending;state.cash=0;`);assert.equal(ev('beResolve(0)'),false);assert.equal(ev('beState().pending===q'),true);

// Actual fixed/variable borrowing, delayed rate reset, and completed repair release.
ev(`state=JSON.parse(fixture);state.pending=null;beState().pending=null;refFirm(playerFirm()).notes=[];mgBorrow(playerFirm(),50000,'equipment','variable');window.n=refFirm(playerFirm()).notes[0];window.rate=n.rate;beOffer('rate-rise',0);beResolve(1);state.day+=8;state.live.day=state.day;beDay();`);
assert.ok(Math.abs(ev('n.rate-rate')-.02/365)<1e-12);
ev(`n.fixed=true;state.pending=null;beState().pending=null;`);assert.equal(ev("beTarget('rate-rise',0,0)"),null);
ev(`state=JSON.parse(fixture);state.pending=null;beState().pending=null;beOffer('breakdown',0);state.day+=4;beDay();chainRepair(playerFirm(),0);`);
assert.ok(ev("beEffects('block').some(a=>a.loc===0&&a.repairable)"),'scheduling alone cannot release stop');
ev(`chainFirm(playerFirm()).orders=chainFirm(playerFirm()).orders.filter(o=>o.kind!=='repair');machine(0).condition=100;state.day++;beDay();`);
assert.equal(ev("beEffects('block').some(a=>a.loc===0&&a.repairable)"),false);
// Wholesale retains the original lot in cargo; recall destroys and compensates that actual cargo.
ev(`state=JSON.parse(fixture);state.pending=null;beState().pending=null;window.f=playerFirm();window.v=rivalFirms()[0];window.sku=refFirm(f).products[0];window.lot=f.ops.warehouse[0].batches.find(b=>b.sku===sku).lot;window.quantity=beBuckets(f).flatMap(b=>b.batches).filter(b=>b.lot===lot).reduce((n,b)=>n+b.qty,0);refOrder(v,sku,20,refHome(v).id);window.cargo=refFirm(v).work.at(-1);window.cash=v.account.cash;`);
assert.equal(ev('cargo.batches[0].lot'),ev('lot'));
ev(`beOffer('quality-recall',0);beResolve(0);`);
assert.equal(ev('refFirm(v).work.some(j=>j.id===cargo.id)'),false);
assert.ok(ev('v.account.cash>cash'));
assert.equal(ev('allFirms().flatMap(f=>[...beBuckets(f),...beTransitBuckets(f)]).flatMap(b=>b.batches).filter(b=>b.lot===lot).length'),0);
assert.ok(ev('valid(state)'));
// A closed/filled receiving hub cannot take cargo or charge an unavailable decision.
ev(`state=JSON.parse(fixture);state.pending=null;beState().pending=null;beOffer('misdelivery',0);refSite(playerFirm(),beState().pending.otherhub).capacity=0;window.cash=state.cash;`);
assert.equal(ev('beResolve(1)'),false);assert.equal(ev('state.cash'),ev('cash'));
// Corrupt task payloads must be rejected before loading.
ev(`state=JSON.parse(fixture);state.businessEvents.tasks.push({kind:'production',key:'factory-delay',serial:1,due:100,loc:0,hub:1,product:0,cargo:{qty:1,value:-1,quality:0,sku:'x',product:0,hub:1}});`);
assert.equal(ev('valid(state)'),false);

ev('state.businessEvents.active.push({type:"demand",firm:"player",value:NaN})');assert.equal(ev('valid(state)'),false);
assert.deepEqual(errors,[]);dom.window.close();console.log('PASS business events: '+results.length+' choices, 40 pending reloads per branch, delayed outcomes, inventories, repeat prevention, insufficient cash, expiry, competitor funding and invalid save rejection');
