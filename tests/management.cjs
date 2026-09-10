const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(require('node:path').join(__dirname,'../dist/index.html'),'utf8');
function create(raw){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://hankan.test',virtualConsole:vc,beforeParse(w){w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.Math.random=()=>.5;if(raw)w.localStorage.setItem('hankan-tycoon-v1',raw);}});return {dom,errors,ev:s=>dom.window.eval(s)};}
const {dom,errors,ev}=create();
ev('profile.tutorialSeen=true;setupRules={...STANDARD_RULES,events:0,supply:0};launchNew();window.f=playerFirm();window.h=refHome(f);');
assert.ok(ev('mgEnabled()&&refWorld().management.free&&state.continued'));
assert.equal(ev('mgDateText()'),'2000-01-01');assert.equal(ev('mgDateText(60)'),'2000-02-29');assert.equal(ev('mgDateText(mgAddMonths(31,1))'),'2000-02-29');assert.equal(ev('mgDateText(mgAddMonths(31,2))'),'2000-03-31');assert.equal(ev('sceneSeason()'),3);
assert.ok(ev('valid(state)'));
ev('window.eq=companyEquity(f);window.bank=refWorld().bankCash;window.cash=state.cash');assert.ok(ev('mgBorrow(f,50000,"equipment")'));assert.equal(ev('companyEquity(f)'),ev('eq'));assert.equal(ev('refWorld().bankCash'),ev('bank-50000'));
ev('window.note=refFirm(f).notes.at(-1);window.rate=note.rate;mgDebtDay(f);window.after=state.cash');assert.equal(ev('state.cash'),ev('cash+50000'));assert.ok(Math.abs(ev('companyEquity(f)')-ev('eq-50000*rate'))<.51);
ev('mgDebtDay(f)');assert.equal(ev('state.cash'),ev('after'));assert.ok(ev('mgRepay(f,note.id,10000)'));assert.equal(ev('note.principal'),40000);
ev('mgFirm(f).enabled=false;state.live.payroll=1234;window.cash=state.cash;refAccruePayroll()');assert.equal(ev('state.cash'),ev('cash+1234'));assert.equal(ev('refFirm(f).bills.find(b=>b.kind==="wages").due'),31);
for(const lang of ['ko','ja']){ev(`changeLanguage('${lang}')`);for(const tab of ['finance','policies','reports','manufacture','research']){ev(`selectDesk('${tab}');renderReference()`);if(lang==='ja')assert.ok(!/[가-힣]/.test(dom.window.document.querySelector('#reference-panel').textContent),tab);}}
assert.deepEqual(errors,[]);dom.window.close();
// Default funding, untouched one-machine policy: no scripted money/stock/collection or purchases.
for(const seed of [7,19473,731293]){
 const g=create();g.ev(`profile.tutorialSeen=true;setupRules={...STANDARD_RULES,events:${seed===731293?3:0},supply:${seed===731293?2:0}};launchNew();state.enterprise.rng=${seed};render=()=>{};save=()=>{};refreshLiveNumbers=()=>{};toast=()=>{};`);
 const days=Number(process.env.MANAGEMENT_DAYS||731);
 for(let n=0;n<days&&!g.ev('state.ended');n++){
  g.ev('if(state.pending)resolveEvent(1);if(modalView)closeModal();livePaused=false;if(!state.live)startBusiness();advanceBusiness(DAY_MS);');
  if(!g.ev('valid(state)&&allFirms().every(f=>refCheckConservation(f))')){fs.writeFileSync(require('node:path').join(require('node:os').tmpdir(),'hankan-management-invalid.json'),g.ev('JSON.stringify(state)'));throw Error('invalid seed '+seed+' day '+g.ev('state.day'));}
  assert.ok(g.ev('allFirms().every(f=>refFirm(f).reports.filter(r=>r.final).every(r=>Math.abs(r.assets-r.liabilities-r.equity)<.01&&Math.abs(r.operating+r.investing+r.financing-r.cashChange)<.01))'));
 }
 const out={seed,day:g.ev('state.day'),ended:g.ev('state.ended'),cash:g.ev('state.cash'),sold:g.ev('state.totalSold'),months:g.ev('mgFirm(playerFirm()).month.length'),rivals:g.ev('rivalFirms().map(f=>({id:f.id,machines:f.machines.length,closed:f.policy.defeated,produced:refFirm(f).stats.manufactured}))')};console.log('MANAGEMENT',JSON.stringify(out));
 if(seed!==731293)assert.ok(out.day>days,'unattended operation reaches requested date');assert.ok(out.sold>100,'standing ordering/delivery produces sales');
 const re=create(g.ev('JSON.stringify(state)'));assert.equal(re.ev('loadWarning'),false);assert.ok(re.ev('mgEnabled()'));assert.equal(re.ev('state.day'),out.day);assert.deepEqual(re.errors,[]);re.dom.window.close();assert.deepEqual(g.errors,[]);g.dom.window.close();
}
console.log('PASS calendar/leap-month arithmetic, default free game, consolidated loan ledger, monthly wages, KO/JA, standing operation and saved state');
