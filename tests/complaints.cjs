const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const d=new JSDOM(fs.readFileSync(require('node:path').join(__dirname,'../dist/index.html'),'utf8'),{runScripts:'dangerously',url:'https://hankan.test',virtualConsole:vc,beforeParse(w){w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};}}),ev=s=>d.window.eval(s);
ev('profile.tutorialSeen=true;launchNew();closeModal();livePaused=true;');
for(const kind of ['request','pest','coin','expired']){
 ev(`state.day=1;state.reputation=70;state.complaints=[];complain('${kind}',state.machines[0].loc);window.c=state.complaints[0];window.m=state.machines[0];window.cashBefore=state.cash;window.inventoryBefore=JSON.stringify(m);state.day=c.deadline;resolveComplaints();`);
 assert.equal(ev('state.reputation'),70);assert.equal(ev('complaintDemandFactor(m.loc)'),.85);
 ev('state.day=c.deadline+1;resolveComplaints()');assert.equal(ev('state.reputation'),67);assert.equal(ev('state.cash===cashBefore'),true);
 assert.equal(ev('complaintDemandFactor(m.loc)'),kind==='request'?1:.7);
 ev('for(let i=0;i<40;i++){state.day++;resolveComplaints()}');assert.equal(ev('state.reputation'),67);assert.ok(ev('state.machines.includes(m)&&JSON.stringify(m)===inventoryBefore&&state.cash===cashBefore'));
}
ev("state.complaints=[{id:999,kind:'coin',loc:m.loc,deadline:1,stage:1,product:0}];resolveComplaints();save();");assert.ok(ev('state.machines.includes(m)&&state.cash===cashBefore'));
ev("respondComplaint(999)");assert.equal(ev('state.complaints.length'),0);assert.equal(ev('complaintDemandFactor(m.loc)'),1);
for(const lang of ['ko','ja']){ev(`changeLanguage('${lang}');selectDesk('alerts');`);assert.ok(!/철거|벌금|撤去|罰金/.test(d.window.document.querySelector('#complaints-panel').textContent));}
assert.deepEqual(errors,[]);d.window.close();console.log('PASS complaints: deadline boundary, no fines/removal or repeated reputation loss, inventory/vault retained, old escalated complaint, response and KO/JA');
