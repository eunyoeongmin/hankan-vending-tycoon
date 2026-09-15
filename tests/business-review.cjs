const assert=require('node:assert/strict'),make=require('./management-harness.cjs');
for(const kind of ['working','equipment','bond']){
 const g=make(),ev=g.ev;
 ev(`profile.tutorialSeen=true;setupRules={...STANDARD_RULES,events:0,supply:0};launchNew();if(modalView)closeModal();state.day=30;state.cash=100000000;window.f=playerFirm();window.r=refFirm(f);mgFirm(f).month=Array.from({length:6},(_,i)=>({key:'1999-0'+(i+1),days:30,revenue:1,cost:0,profit:1,operating:1,investing:0,financing:0,payroll:0,tax:0,cash:1,closed:true}));`);
 assert.ok(ev(`mgBorrow(f,2100000,'${kind}')`));
 // Exercise two monthly payment dates in a 30-day horizon, maturity and overdue principal.
 for(const day of [60,150,ev('r.notes[0].due-10')]){
  ev(`window.snapshot=JSON.stringify(state);state.day=${day};state.cash=100000000;window.r=refFirm(playerFirm());r.bills.push({id:refId(),kind:'supplier',amount:37000,due:state.day+3,to:'aqua'});window.before=JSON.stringify(state);window.p=reviewPayments(playerFirm());`);
  assert.equal(ev('JSON.stringify(state)'),ev('before'),'forecast is read-only');
  const expected=ev('p.total'),end=ev('p.until'),startCash=ev('state.cash');
  for(let d=day;d<=end;d++)ev(`state.day=${d};mgDebtDay(playerFirm());refCommerceDay(playerFirm());`);
  assert.ok(Math.abs((startCash-ev('state.cash'))-expected)<.001,`${kind} day ${day}: forecast matches real contractual payments`);
  ev('state=JSON.parse(snapshot);');
 }
 assert.deepEqual(g.errors,[]);g.dom.window.close();
}
const g=make(),ev=g.ev;
ev('profile.tutorialSeen=true;launchNew();if(modalView)closeModal();window.f=playerFirm();window.a=mgFirm(f);a.month=[{key:"2000-02",days:29,revenue:2900000,cost:1000000,payroll:200000,tax:100000,profit:1200000,operating:900000,investing:-500000,financing:300000,cash:1000000,closed:true},{key:"2000-01",days:31,revenue:3100000,cost:1000000,payroll:200000,tax:100000,profit:1300000,operating:800000,investing:0,financing:0,cash:0,closed:true}];selectDesk("reports");');
assert.equal(ev('reviewMonthValues(a.month[0])[5]'),400000);
assert.ok(!ev('refPanel.textContent.includes("10% 이상 줄")'),'compare daily average, not shorter month total');
assert.equal(ev('reviewInvestment(1000000,20000,10000).days'),100);
assert.equal(ev('reviewInvestment(1000000,10000,20000).days'),null);
ev('window.originalState=JSON.stringify(state);window.button=refPanel.querySelector("[data-review-desk=finance]");button.focus();for(let i=0;i<5;i++)renderReference();');
assert.ok(ev('button===refPanel.querySelector("[data-review-desk=finance]")&&document.activeElement===button'));
assert.equal(ev('JSON.stringify(state)'),ev('originalState'));
for(const language of ['ko','ja']){
 ev(`lang='${language}';renderReference();`);
 assert.ok(ev(`refPanel.textContent.includes('${language==='ko'?'투자 비교 계산':'投資比較計算'}')`));
}
ev('refPanel.querySelector("[data-review-desk=finance]").click()');assert.equal(ev('deskTab'),'finance');
assert.deepEqual(g.errors,[]);g.dom.window.close();
console.log('PASS business review: actual loan schedules/bills vs read-only forecast, month length comparison, profit decomposition, investment break-even, KO/JA, stable focus and routing');
