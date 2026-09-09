const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(require('node:path').join(__dirname,'../dist/index.html'),'utf8'),errors=[];
function setup(raw){const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));return new JSDOM(html,{runScripts:'dangerously',url:'https://hankan.test',virtualConsole:vc,beforeParse(w){w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.Math.random=()=>.5;if(raw)w.localStorage.setItem('hankan-tycoon-v1',raw);}});}
const d=setup(),w=d.window,ev=s=>w.eval(s),doc=w.document;
ev('state=fresh();state.started=true;state.research.products=3;menuOpen=false;closeModal();startBusiness();');
assert.ok(ev('valid(state)'));assert.equal(doc.querySelectorAll('[data-slot]').length,4);
// Preserve money and inventory value during procurement, delivery, refill and product changes.
ev('state.enterprise.emergency=false');const assets=ev('assets()'),cash=ev('state.cash');
assert.ok(ev('orderGoods(1,100,1)'));assert.equal(ev('state.cash'),cash-52000);assert.equal(ev('assets()'),assets);
assert.equal(ev('state.enterprise.warehouse[1].qty'),0);ev('receiveOrders(DAY_MS*2-1)');assert.equal(ev('state.enterprise.warehouse[1].qty'),0);ev('receiveOrders(1)');assert.equal(ev('state.enterprise.warehouse[1].qty'),100);assert.equal(ev('assets()'),assets);
ev('enterpriseSlotProduct(1,1)');assert.equal(ev('state.enterprise.warehouse[0].qty'),15);assert.equal(ev('assets()'),assets);ev('restockMachine(machine(0))');assert.equal(ev('machine(0).slots[1].stock'),20);assert.equal(ev('machine(0).slots[1].value'),10400);assert.equal(ev('assets()'),assets);
// Stable controls through live changes, including open product selects.
let button=doc.querySelector('[data-enterprise="price"][data-param="1:100"]');button.focus();ev('refreshLiveNumbers();syncScene()');assert.equal(doc.activeElement,button);const price=ev('machine(0).slots[1].price');button.click();assert.equal(ev('machine(0).slots[1].price'),price+100);
const select=doc.querySelector('#slot-1');select.focus();ev('refreshLiveNumbers()');assert.equal(doc.activeElement,select);
// Compare prices with the same customer random stream; hold stock constant between trials.
ev('window.realRender=render;window.realRefresh=refreshLiveNumbers;render=()=>{};refreshLiveNumbers=()=>{};');
function sales(price){ev(`state.enterprise.rng=731293;state.reputation=50;machine(0).condition=100;machine(0).slots.forEach(s=>{s.product=0;s.stock=1000;s.value=500000;s.price=${price};});syncMachine(machine(0));window.testRow={served:0,revenue:0,cost:0,bought:[]};for(let i=0;i<200;i++)customerPurchase(machine(0),testRow,i);`);return ev('testRow.served');}
assert.ok(sales(1000)>sales(4000)*2,'price sensitivity materially changes sales');
// Real day ledger identity and no double charging.
ev('state=fresh();state.started=true;state.research.products=3;state.cash=1000000;menuOpen=false;livePaused=false;ensureEnterprise();startBusiness();state.enterprise.expenseToday=25000;state.cash-=25000;window.realAchievements=achievements;achievements=()=>{};advanceBusiness(DAY_MS);');
assert.equal(ev('state.enterprise.reports.length'),1);assert.equal(ev('state.report.net'),ev('state.report.revenue-state.report.cost-state.report.rent-state.report.payroll-state.report.interest-state.report.overhead-state.report.extraExpense'));assert.equal(ev('state.report.extraExpense'),25000);ev('achievements=realAchievements');const settledCash=ev('state.cash');ev('finishBusiness()');assert.equal(ev('state.cash'),settledCash);
// Saving preserves slots, in-transit orders, costs and seeded customer state.
ev('orderGoods(0,100,1);save()');assert.ok(ev('valid(state)'));
let saved=w.localStorage.getItem('hankan-tycoon-v1'),reload=setup(saved);assert.equal(reload.window.eval('state.enterprise.orders.length'),1);assert.equal(reload.window.eval('state.enterprise.rng'),ev('state.enterprise.rng'));assert.equal(reload.window.eval('assets()'),ev('assets()'));reload.window.close();
// Legacy migration preserves old stock and cash; invalid extension is rejected.
let legacy=JSON.parse(saved);delete legacy.enterprise;legacy.machines.forEach(m=>{delete m.slots;delete m.condition;});reload=setup(JSON.stringify(legacy));assert.equal(reload.window.eval('state.cash'),legacy.cash);assert.equal(reload.window.eval('state.machines[0].slots.reduce((n,s)=>n+s.stock,0)'),legacy.machines[0].stock);reload.window.close();
ev('state.enterprise.orders[0].qty=-1');assert.equal(ev('valid(state)'),false);ev('state.enterprise.orders[0].qty=100');
// A 30-day operating campaign remains valid, with recurring supply and maintenance.
ev('state=fresh();state.started=true;state.duration=30;state.cash=10000000;state.enterprise.autoOrder=true;state.staff={collect:1,restock:1};menuOpen=false;livePaused=false;ensureEnterprise();startBusiness();');
for(let day=0;day<30;day++){ev('state.complaints=[];state.pending=null;machine(0).condition=100;advanceBusiness(DAY_MS);');assert.ok(ev('valid(state)'),`valid day ${day+1}`);}
assert.ok(ev('state.ended'));assert.equal(ev('state.enterprise.reports.length'),30);
// Japanese text for every new panel and machine controls.
ev('render=realRender;refreshLiveNumbers=realRefresh;lang="ja";closeModal();render();');
for(const tab of ['overview','supply','market','research','reports']){ev(`enterpriseTab='${tab}';renderEnterprise()`);assert.ok(!/[가-힣]/.test(doc.querySelector('#enterprise').textContent),tab);}
assert.ok(!/[가-힣]/.test(doc.querySelector('#manage').textContent));assert.deepEqual(errors,[]);d.window.close();
console.log('PASS: procurement value conservation, delivery lead time, four-slot controls, customer price sensitivity, daily accounting, legacy/reload validation, 30-day campaign, Japanese panels.');
