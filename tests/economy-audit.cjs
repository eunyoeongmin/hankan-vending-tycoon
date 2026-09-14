const assert=require('node:assert/strict'),make=require('./management-harness.cjs');
const g=make(),ev=g.ev;
ev('profile.tutorialSeen=true;setupRules={...STANDARD_RULES,events:0,supply:0};launchNew();window.f=playerFirm();window.r=refFirm(f);f.meta.credit=0;window.baseRecovery=companyRecoverable(f);');
// Modern bills change current recovery; future liabilities must not cause premature liquidation.
ev('r.bills.push({id:refId(),kind:"supplier",to:"aqua",amount:50000,due:state.day+1})');
assert.equal(ev('companyRecoverable(f)'),ev('baseRecovery'));
ev('r.bills[0].due=state.day');
assert.equal(ev('companyRecoverable(f)'),ev('baseRecovery-50000'));
ev('r.notes.push({id:refId(),kind:"loan",principal:200000,rate:.1/365,due:state.day+30,missed:1,duePrincipal:30000})');
assert.equal(ev('companyRecoverable(f)'),ev('baseRecovery-80000'));
ev('r.notes[0].due=state.day');
assert.equal(ev('companyRecoverable(f)'),ev('baseRecovery-250000'),'mature principal counted once, not again as installment');
ev('r.notes[0].principal=10000000');
assert.ok(ev('companyRecoverable(f)<0'),'large modern matured liability exhausts finite recovery assets');
const re=make(ev('JSON.stringify(state)'));
assert.equal(re.ev('loadWarning'),false);assert.equal(re.ev('mgPayableNow(playerFirm())'),10050000);re.dom.window.close();
// Shown recoverable credit must be obtainable from the finite bank pool.
ev('launchNew();window.f=playerFirm();state.cash=3000000;refWorld().bankCash=9999');
assert.equal(ev('companyBorrowRoom(f)'),0);assert.equal(ev('mgBorrow(f,10000,"working")'),false);
ev('refWorld().bankCash=12345');assert.equal(ev('companyBorrowRoom(f)'),12345);
assert.equal(ev('mgBorrow(f,companyBorrowRoom(f),"working")'),true);assert.equal(ev('refWorld().bankCash'),0);assert.equal(ev('companyBorrowRoom(f)'),0);
// Borrow -> inventory investment -> sold stock -> collect -> loan payoff (actual engine, no gifted repayment).
ev('launchNew();window.f=playerFirm();window.r=refFirm(f);state.cash=0;mgFirm(f).enabled=true;mgFirm(f).review=true;window.cashPool=refWorld().bankCash;');
assert.ok(ev('mgBorrow(f,50000,"working")'));ev('window.n=r.notes.at(-1);window.noteId=n.id;window.due=n.due;render=()=>{};save=()=>{};refreshLiveNumbers=()=>{};toast=()=>{};');
for(let day=0;day<100&&!ev('state.ended');day++)ev('if(state.pending)resolveEvent(1);if(modalView)closeModal();livePaused=false;if(!state.live)startBusiness();advanceBusiness(DAY_MS);');
assert.ok(ev('state.day>due'),'passes working loan maturity');
assert.ok(ev('state.totalSold>60'),'standing orders support sales beyond initial inventory');
assert.ok(ev('!r.notes.some(n=>n.id===noteId)'),'working loan paid using operating cash');
assert.ok(ev('!r.bills.some(b=>b.note===noteId)'),'interest paid');
assert.ok(ev('valid(state)&&allFirms().every(f=>refCheckConservation(f))'));
console.log('ECONOMY_OPERATING_LOAN',ev('JSON.stringify({day:state.day,cash:state.cash/1000,sold:state.totalSold,debt:mgDebt(f)/1000,payable:mgPayableNow(f)/1000})'));
assert.deepEqual(g.errors,[]);g.dom.window.close();
console.log('PASS economy audit: modern recovery obligations, future-debt exclusion, saved liabilities, finite bank/minimum loan, operating cash pays working loan');
