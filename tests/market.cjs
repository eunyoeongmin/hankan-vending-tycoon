const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(require('node:path').join(__dirname,'../dist/index.html'),'utf8'),errors=[];
function setup(raw){const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const d=new JSDOM(html,{runScripts:'dangerously',url:'https://hankan.test',virtualConsole:vc,beforeParse(w){w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.Math.random=()=>.5;if(raw)w.localStorage.setItem('hankan-tycoon-v1',raw);}});return {d,ev:s=>d.window.eval(s)};}
const {d,ev}=setup(),doc=d.window.document;
// Actual requested menu button, before start and while running/paused/ended, including Japanese.
doc.getElementById('game-menu-close').click();assert.equal(ev('modalView'),null);assert.equal(ev('state.started'),false);assert.equal(ev('state.live'),null);
doc.getElementById('game-menu').click();assert.equal(ev('modalView'),'menu');
ev('state=fresh();state.started=true;menuOpen=false;closeModal();startBusiness();advanceBusiness(5000)');
const elapsed=ev('state.live.elapsed'),cash=ev('state.cash');
for(const paused of [false,true]){ev(`livePaused=${paused}`);doc.getElementById('game-menu').click();doc.getElementById('game-menu-close').click();assert.equal(ev('livePaused'),paused);assert.equal(ev('state.live.elapsed'),elapsed);assert.equal(ev('state.cash'),cash);assert.equal(ev('menuOpen'),false);}
ev('state.ended=true;state.live=null;openModal("menu");menuOpen=true;changeLanguage("ja")');assert.equal(doc.getElementById('game-menu-close').textContent,'メニューを閉じる');doc.getElementById('game-menu-close').click();assert.equal(ev('state.live'),null);doc.getElementById('game-menu').click();assert.ok(doc.getElementById('game-menu-close'));
// A finite market does not grow just because another machine is installed.
ev('state=fresh();state.started=true;state.machines[0].loc=6;selected=6;menuOpen=false;livePaused=true;closeModal();startBusiness();window.pool=state.enterprise.operations.market.districts[1].n');
ev('state.machines.push(npcMachine(8,60));state.live=null;state.enterprise.operations.market=null;startBusiness()');assert.equal(ev('state.enterprise.operations.market.districts[1].n'),ev('pool'));
// Real purchases consume the exact inventory and generate receipts; buying stock conserves assets.
ev('window.initialStock=state.enterprise.operations.machines.reduce((n,m)=>n+m.stock,0);advanceBusiness(12000)');
assert.ok(ev('state.enterprise.operations.market.rows.reduce((n,r)=>n+r.served,0)')>0);
assert.equal(ev('state.enterprise.operations.machines.reduce((n,m)=>n+m.stock,0)+state.enterprise.operations.market.rows.reduce((n,r)=>n+r.served,0)'),ev('initialStock'));
assert.ok(ev('state.enterprise.operations.orders.length')>0);assert.equal(ev('state.npc.cash+state.enterprise.operations.machines.reduce((n,m)=>n+m.vault,0)+state.enterprise.operations.orders.reduce((n,o)=>n+o.value,0)-state.enterprise.operations.market.rows.reduce((n,r)=>n+r.revenue,0)'),500000,'purchases paid upfront; sales collected separately');
assert.ok(ev('state.enterprise.operations.market.districts.every(d=>d.player+d.rival+d.none===d.attempted)'));
assert.equal(ev('sceneCustomerRows(state.live).length'),ev('state.live.rows.length+state.enterprise.operations.market.rows.length'));
assert.ok(ev('valid(state)'));ev('save()');const raw=d.window.localStorage.getItem('hankan-tycoon-v1'),reload=setup(raw);
// Saved RNG, customers, pending deliveries and jobs resume to identical outcomes.
for(const e of [ev,reload.ev])e('render=()=>{};refreshLiveNumbers=()=>{};menuOpen=false;livePaused=true;closeModal();advanceBusiness(7000)');
assert.equal(ev('JSON.stringify(state.enterprise.operations)'),reload.ev('JSON.stringify(state.enterprise.operations)'));
assert.equal(ev('state.npc.cash'),reload.ev('state.npc.cash'));reload.d.window.close();
// Settlement pays expenses once; strategy evaluation creates no forecast cash.
ev('advanceBusiness(5000)');assert.equal(ev('state.day'),2);const after=ev('state.npc.cash');ev('settleRivalOperations();rivalTurn();rivalTurn()');assert.equal(ev('state.npc.cash'),after);assert.equal(ev('state.enterprise.rivalry.lastProfit'),ev('state.enterprise.operations.lastProfit'));
// Empty machines cannot sell even with very large price appeal; no cash means no orders.
ev('state=fresh();state.started=true;state.npc.cash=0;menuOpen=false;closeModal();ensureOperations();for(const m of state.enterprise.operations.machines){m.slots.forEach(s=>{s.stock=0;s.value=0});syncMachine(m)}startBusiness();advanceBusiness(20000)');assert.equal(ev('state.enterprise.operations.market.rows.reduce((n,r)=>n+r.revenue,0)'),0);assert.equal(ev('state.enterprise.operations.orders.length'),0);
// Acquisition keeps stock, condition and uncollected money rather than generating stock40.
ev('state.cash=3000000;window.target=state.enterprise.operations.machines.find(m=>m.loc===7);target.condition=42;target.vault=7654;target.slots[0].stock=3;target.slots[0].value=1500;syncMachine(target);acquireNpc(7)');assert.equal(ev('machine(7).stock'),3);assert.equal(ev('machine(7).vault'),7654);assert.equal(ev('machine(7).condition'),42);
// Existing partial-day saves retain sales and finish once, then enter the new market.
ev('state=fresh();state.started=true;menuOpen=false;closeModal();startBusiness();advanceBusiness(7000);delete state.enterprise.operations;save()');const old=d.window.localStorage.getItem('hankan-tycoon-v1'),legacy=setup(old);assert.equal(legacy.d.window.localStorage.getItem('hankan-tycoon-v1-backup-before-market'),old);legacy.ev('menuOpen=false;livePaused=true;closeModal();render=()=>{};refreshLiveNumbers=()=>{};advanceBusiness(17000)');assert.equal(legacy.ev('state.day'),2);legacy.ev('startBusiness()');assert.equal(legacy.ev('state.enterprise.operations.market.legacy'),false);assert.ok(legacy.ev('valid(state)'));legacy.d.window.close();
// Thirty days of actual NPC logistics and settlements remain valid.
ev('state=fresh();state.started=true;state.cash=100000000;state.duration=365;state.scenario={version:1,preset:"custom",rules:{...STANDARD_RULES,events:0}};menuOpen=false;livePaused=true;closeModal();render=()=>{};refreshLiveNumbers=()=>{};save=()=>{};startBusiness()');
for(let day=1;day<=30;day++){ev('advanceBusiness(DAY_MS)');assert.equal(ev('state.enterprise.operations.settledDay'),day);assert.ok(ev('valid(state)'),`valid after day ${day}`);ev('startBusiness()');}
assert.ok(ev('state.enterprise.operations.machines.some(m=>m.total>60)'), 'replenishment supports sales beyond opening inventory');
// Reject corrupt extension values rather than silently restoring invented assets.
ev('ensureOperations();state.enterprise.operations.orders.push({product:0,qty:80,value:-1,remaining:100})');assert.equal(ev('valid(state)'),false);
assert.deepEqual(errors,[]);d.window.close();console.log('PASS: game-menu close in all states/JA, finite shared customers, actual NPC stock/orders/cash, save replay, single settlement, starvation, inventory transfer, legacy backup and validation.');
