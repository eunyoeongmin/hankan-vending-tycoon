/* Calendar management is an explicit save boundary; signed legacy contracts survive migration. */
function mgEnabled(){return refEnabled()&&refWorld().management?.version===1;}
function mgValid(world){const m=world.management;if(!m||m.version!==1||!int(m.started,1,1000000)||typeof m.free!=='boolean'||typeof m.pauseMonth!=='boolean')return false;for(const r of Object.values(world.firms||{})){const a=r.management;if(a&&(!Array.isArray(a.month)||a.month.length>120||!a.month.every(x=>/^\d{4}-\d{2}$/.test(x.key)&&int(x.days,0,31)&&['revenue','cost','profit','operating','investing','financing','payroll','tax','cash'].every(k=>finite(x[k])))||!int(a.dailyBudget,1000,100000000)||!int(a.reserve,0,1000000000)||!finite(a.spent)||a.spent<0||typeof a.enabled!=='boolean'||typeof a.review!=='boolean'||typeof a.owner!=='boolean'||!['manual','margin','share'].includes(a.pricing)||!Array.isArray(a.blocked)||!a.blocked.every(b=>['manager','supply','staff','product','materials','delivery'].includes(b.key))||!Array.isArray(a.production)||a.production.length>100||!a.production.every(p=>int(p.site,1,world.next-1)&&typeof p.sku==='string'&&typeof p.enabled==='boolean'&&int(p.target,1,1000)&&int(p.batch,1,500))))return false;if(!Array.isArray(r.notes)||!r.notes.every(n=>!n.calendar||int(n.start,1,1000000)&&int(n.next,1,1000000)&&int(n.grace,1,1000000)&&finite(n.installment)&&n.installment>0&&finite(n.duePrincipal)&&n.duePrincipal>=0&&['working','equipment','bond'].includes(n.product)))return false;}return true;}
function mgDate(day=state.day){return new Date(Date.UTC(refWorld().startYear,0,day));}
function mgDay(date){return Math.round((date-Date.UTC(refWorld().startYear,0,1))/86400000)+1;}
function mgDateText(day=state.day){return mgDate(day).toISOString().slice(0,10);}
function mgMonth(day=state.day){return mgDateText(day).slice(0,7);}
function mgMonthEnd(day=state.day){const d=mgDate(day);return mgDay(new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)));}
function mgAddMonths(day,months){const d=mgDate(day),end=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+months+1,0)).getUTCDate();return mgDay(new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+months,Math.min(d.getUTCDate(),end))));}
function mgFirm(f){const r=refFirm(f);return r.management??=( {month:[],dailyBudget:100000,reserve:25000,spent:0,day:0,enabled:true,pricing:'manual',review:true,owner:true,production:[],blocked:[],lastPulse:-1} );}
function mgInitialize(migration=false){
 if(mgEnabled())return false;
 if(migration){const key=KEY+'-backup-before-management';try{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(state));}catch{return false;}}
 if(!refEnabled()){refInitialize();refSeedCatalog();}
 refWorld().management={version:1,started:state.day,free:state.duration===36500,pauseMonth:false};
 if(refWorld().management.free)state.continued=true;
 for(const f of allFirms()){
  const a=mgFirm(f);if(migration)a.enabled=false;
  for(const s of refFirm(f).sites)s.policy.enabled=!migration&&s.kind==='warehouse';
  if(f.bank.principal){refFirm(f).notes.push({id:refId(),kind:'loan',principal:f.bank.principal,rate:companyRate(f),due:Math.max(state.day,f.meta.due),missed:0,legacy:true});f.bank.principal=0;}
  if(f.bank.arrears){refFirm(f).bills.push({id:refId(),kind:'legacy-interest',to:'bank',amount:f.bank.arrears,due:state.day});f.bank.arrears=0;}
 }
 return true;
}
let mgStartOptions={automation:false,review:false,running:false};
function launchManagement(){launchReference();mgInitialize();Object.assign(mgFirm(playerFirm()),{enabled:mgStartOptions.automation,review:mgStartOptions.review});livePaused=!mgStartOptions.running;businessCarry=0;if(modalView==='tutorialOffer')drawModal();save();render();}
const mgTutorialBefore=completeTutorial;completeTutorial=function(){mgTutorialBefore();if(mgEnabled()){livePaused=!mgStartOptions.running;render();}};
launchNew=launchManagement;
chosenDuration=36500;

// Close each day once. Unprocessed time stays in the one RAF carry, never in another timer.
function mgConsumeClock(){let turns=0;while(businessCarry>=20&&turns++<4&&!livePaused&&!modalView&&!menuOpen&&!eventBlocksClock()&&!state.ended){if(!state.live)startBusiness();if(!state.live)break;const step=Math.min(businessCarry,DAY_MS-state.live.elapsed);if(step<=0)break;businessCarry-=step;advanceBusiness(step);}}
const mgOldPayroll=refAccruePayroll;
refAccruePayroll=function(){if(!mgEnabled())return mgOldPayroll();for(const f of allFirms().filter(f=>!f.policy?.defeated)){const amount=Math.round(f.id==='player'?state.live?.payroll||0:f.ops.market?.payroll||0);if(!amount)continue;f.account.cash+=amount;const r=refFirm(f),due=mgMonthEnd(),bill=r.bills.find(b=>b.kind==='wages'&&b.due===due);if(bill)bill.amount+=amount;else r.bills.push({id:refId(),kind:'wages',to:'workforce',amount,due});}};
const mgOldFinalize=refFinalizeReports;
refFinalizeReports=function(day){mgOldFinalize(day);if(!mgEnabled())return;for(const f of allFirms()){
 const r=refFirm(f),a=mgFirm(f),p=r.reports.find(p=>p.day===day&&p.final);if(!p||a.reportDay>=day)continue;a.reportDay=day;
 const key=mgMonth(day);let m=a.month.find(m=>m.key===key);if(!m){m={key,days:0,revenue:0,cost:0,profit:0,operating:0,investing:0,financing:0,payroll:0,tax:0,cash:0,closed:false};a.month.unshift(m);a.month=a.month.slice(0,120);}
 m.days++;for(const k of ['revenue','cost','profit','operating','investing','financing','payroll','tax'])m[k]+=p[k]||0;m.cash=p.cash;m.closed=day===mgMonthEnd(day);
 if(m.closed&&f.id==='player'){refNotice(f,`${key} 결산 · 순이익 ${money(m.profit)}`,`${key} 決算・純利益 ${money(m.profit)}`,'reports');if(refWorld().management.pauseMonth)livePaused=true;}
 }};
const mgOldResearch=refResearch;
refResearch=function(f,key,supplier,exclusive=false){if(mgEnabled()&&f.account.cash<600000*(chainFirm(f).licenses[key]+1)*(exclusive?1.5:1))return false;const ok=mgOldResearch(f,key,supplier,exclusive);if(ok&&mgEnabled()){const p=refFirm(f).projects.at(-1),extra=p.budget*9;f.account.cash-=extra;p.budget+=extra;refPost(f,'research-funding',-extra,'investing');p.duration=DAY_MS*30*p.tier;p.plannedDays=90*p.tier;}return ok;};
const mgSaveBefore=save;save=function(){if(mgEnabled())refWorld().management.carry=businessCarry;return mgSaveBefore();};
if(mgEnabled())businessCarry=Math.max(0,Math.min(DAY_MS*4,refWorld().management.carry||0));
