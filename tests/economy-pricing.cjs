const assert=require('assert/strict'),path=require('path');
const make=require(path.join(process.env.GAME_ROOT||path.resolve(__dirname,'..'),'tests/management-harness.cjs'));
const g=make(),ev=g.ev;
ev('profile.tutorialSeen=true;setupRules={...STANDARD_RULES,events:0,supply:0};launchNew();window.f=playerFirm();window.r=refFirm(f);window.a=mgFirm(f);a.enabled=true;');
ev('a.pricing="margin";mgOperate(f);window.margin=f.machines[0].slots[0].price;a.pricing="share";mgOperate(f);window.share=f.machines[0].slots[0].price');
assert.ok(ev('margin>share'),'margin and share no longer collapse to the same floor for starting drink');
assert.ok(ev('margin>=PRODUCTS[0].price&&share>=PRODUCTS[0].price*.85'));
ev('a.pricing="manual";f.machines[0].slots[0].price=1777;mgOperate(f)');assert.equal(ev('f.machines[0].slots[0].price'),1777);
// A completed factory incurs a real daily cash expense even while idle.
ev('state.cash=30000000;chainFirm(f).licenses.quality=1;window.id=refBuildSite(f,"drink",0);companyReceive(f,DAY_MS*5);window.s=refSite(f,id);window.cash=state.cash;window.startOverhead=s.metrics.overhead;refOperationsDay(f)');
assert.equal(ev('cash-state.cash'),2750,'warehouse $0.75 plus factory $2.00 daily overhead');
assert.equal(ev('s.metrics.overhead-startOverhead'),2000);
assert.ok(ev('r.journal.some(j=>j.kind==="site-overhead"&&j.amount===-2000)'));
// Recruitment away from the player must remove the worker from the player's actual queue.
ev('window.h=refHome(f);window.workerId=refHireEmployee(f,"restock",h.id,2);window.worker=chainFirm(f).staff.find(w=>w.id===workerId);worker.notice=state.day+7;state.jobs.push({type:"collect",loc:0,employee:workerId,remaining:1000});window.npc=rivalFirms()[0];window.nr=refFirm(npc);nr.work.push({id:refId(),kind:"recruit",employee:workerId,from:"player",site:refHome(npc).id,salary:5000,remaining:0});refOperationsAdvance(npc,1)');
assert.ok(ev('!chainFirm(f).staff.some(w=>w.id===workerId)&&chainFirm(npc).staff.some(w=>w.id===workerId)'));
assert.ok(ev('!state.jobs.some(j=>j.employee===workerId)'));
assert.deepEqual(g.errors,[]);g.dom.window.close();
console.log('PASS economic tuning: distinct automatic prices, manual price preserved, idle factory real overhead, player employee recruitment queue');
