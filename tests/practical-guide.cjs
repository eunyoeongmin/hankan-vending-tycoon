const assert=require('node:assert/strict'),make=require('./management-harness.cjs');
(async()=>{
let g=make(),ev=s=>g.ev(s);
function at(n){assert.equal(ev('state.guide.step'),n);}
function wait(n){ev('livePaused=false;if(!state.live)startBusiness()');for(let i=0;i<1500&&ev('state.guide.step')===n;i++)ev('if(!state.live)startBusiness();advanceBusiness(1000);guideCheck()');assert.ok(ev('state.guide.step')>n,`stuck at ${n}: `+ev('JSON.stringify({guide:state.guide,jobs:state.jobs,work:refFirm(playerFirm()).work})'));}
ev('launchNew();guideStart()');at(0);assert.equal(ev('state.cash'),5000000);assert.ok(ev('livePaused&&!mgFirm(playerFirm()).enabled&&valid(state)'));
ev('selectDesk("research")');assert.notEqual(ev('deskTab'),'research');at(0);
ev('document.querySelector("#pins button").click()');
// Browser click schedules the selection evaluation; evaluate explicitly in this synchronous harness.
await Promise.resolve();ev('guideCheck()');at(1);wait(1);at(2);
assert.ok(ev('dispatch("collect",state.guide.first)'));at(3);wait(3);at(4);
assert.ok(ev('refOrder(playerFirm(),"aqua:0",200,refHome(playerFirm()).id)'));at(5);
const raw=ev('save();localStorage.getItem(KEY)');g.dom.window.close();g=make(raw);ev('document.querySelector("#menu-load").click()');
assert.equal(ev('state.guide.step'),5);assert.ok(ev('valid(state)'));wait(5);at(6);
assert.ok(ev('refRoute(playerFirm(),refHome(playerFirm()).id,refFirm(playerFirm()).vehicles[0].id,[state.guide.first])'));at(7);
assert.ok(ev('refDispatchRoute(playerFirm(),refFirm(playerFirm()).routes[0].id)'));at(8);wait(8);at(9);
assert.ok(ev('reserveSite(playerFirm(),state.guide.target)'));at(10);
assert.ok(ev('chainOrderMachine(playerFirm(),"koyo",0)'));at(11);wait(11);at(12);
const cash=ev('state.cash');ev('state.cash=0');assert.equal(ev('installKit(playerFirm(),state.guide.target)'),false);at(12);ev(`state.cash=${cash}`);
assert.ok(ev('installKit(playerFirm(),state.guide.target)'));at(13);assert.equal(ev('installKit(playerFirm(),state.guide.target)'),false);wait(13);at(14);
assert.ok(ev('machine(state.guide.target).ref&&machine(state.guide.target).stock===0'));
assert.ok(ev('refRoute(playerFirm(),refHome(playerFirm()).id,refFirm(playerFirm()).vehicles[0].id,[state.guide.first,state.guide.target])'));
assert.ok(ev('refDispatchRoute(playerFirm(),refFirm(playerFirm()).routes[0].id)'));wait(14);at(15);wait(15);at(16);
assert.ok(ev('!guideActive()&&livePaused&&machine(state.guide.target).total>0&&valid(state)'));
ev('selectDesk("research")');assert.equal(ev('deskTab'),'research');
assert.deepEqual(g.errors,[]);g.dom.window.close();
console.log('PASS practical guide: actual sale/collection/order/receipt/route/site/machine/install/refill/new sale; locks, funds, save resume and duplicate/insufficient installation');

})().catch(e=>{console.error(e);process.exit(1)});
