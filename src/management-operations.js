/* Standing orders operate the same finite inventory, staff, cargo and cash as manual orders. */
function mgOwner(f,route){if(!mgEnabled()||!mgFirm(f).owner||route.hub!==refHome(f).id||route.stops.length>2||refFirm(f).work.some(j=>j.employee===0)||f.id==='player'&&state.jobs.some(j=>!j.employee))return null;return {id:0,skill:1};}
const mgBeforeDispatch=dispatch;dispatch=function(type,loc,staff=false){if(mgEnabled()&&staff&&mgFirm(playerFirm()).enabled&&refFirm(playerFirm()).routes.some(t=>t.enabled&&t.stops.includes(loc)))return false;return mgBeforeDispatch(type,loc,staff);};
function mgManaged(f,site){return site.id===refHome(f).id||chainFirm(f).staff.some(w=>w.id===site.manager&&w.site===site.id&&!w.training&&!w.notice&&w.fatigue<90);}
function mgBlock(f,site,key){const a=mgFirm(f);if(!a.blocked.some(x=>x.site===site&&x.key===key))a.blocked.push({site,key});}
function mgPrincipalDue(f,until=state.day+7){return refFirm(f).notes.reduce((sum,n)=>sum+Math.min(n.principal,n.due<=until?n.principal:(n.duePrincipal||0)+(n.calendar&&n.product==='equipment'&&n.next<=until&&n.next>n.grace?n.installment:0)),0);}
function mgSpendable(f){const a=mgFirm(f),due=refFirm(f).bills.filter(b=>b.due<=state.day+7).reduce((n,b)=>n+b.amount,0);return Math.max(0,Math.min(a.dailyBudget-a.spent,f.account.cash-a.reserve-due-mgPrincipalDue(f)));}
function mgDo(f,estimate,action){if(estimate>mgSpendable(f))return false;const before=f.account.cash,ok=action();if(ok)mgFirm(f).spent+=Math.max(0,before-f.account.cash);return ok;}
function mgDemand(f,site,p){const a=mgFirm(f);a.sales??=[];const recent=a.sales.filter(x=>x.site===site&&x.product===p).slice(-14),slots=f.machines.filter(m=>m.ref.hub===site).flatMap(m=>m.slots).filter(s=>s.product===p).length;return Math.max(slots*2,recent.reduce((n,x)=>n+x.qty,0)/Math.max(1,recent.length));}
function mgPurchase(f,s){const r=refFirm(f),machines=f.machines.filter(m=>m.ref.hub===s.id),wanted=new Map();for(const m of machines)for(const slot of m.slots){const key=slot.sku.startsWith('legacy:')?'legacy:'+slot.product:slot.sku;if(!wanted.has(key))wanted.set(key,slot.product);}
 for(const [key,p]of wanted){const matches=b=>b.product===p&&(key.startsWith('legacy:')||b.sku===key),stock=refSiteInventory(f,s.id).filter(matches).reduce((n,b)=>n+b.qty,0)+machines.flatMap(m=>m.slots).filter(x=>x.product===p&&(key.startsWith('legacy:')||x.sku===key)).reduce((n,x)=>n+x.stock,0),pending=r.work.filter(j=>j.site===s.id&&j.kind==='purchase'&&matches(j)).reduce((n,j)=>n+j.qty,0)+r.work.filter(j=>j.kind==='route'&&j.site===s.id).flatMap(j=>j.stops.flatMap(t=>t.cargo.flatMap(c=>c.batches))).filter(matches).reduce((n,b)=>n+b.qty,0),daily=mgDemand(f,s.id,p),point=Math.max(20,Math.ceil(daily*4)),target=Math.min(s.capacity+machines.reduce((n,m)=>n+companyCapacity(f,m),0)*.5,Math.max(40,Math.ceil(daily*7))),qty=Math.min(200,target-stock-pending,s.capacity-refSiteUsed(f,s.id));
  if(stock+pending>=point||qty<20)continue;
  const vendors=key.startsWith('legacy:')?[['aqua','sun','value'][s.policy.supplier]+':'+p,['aqua','sun','value'][s.policy.backup]+':'+p]:[key];let ok=false;
  for(const id of vendors){const sku=refSKU(id),vendor=sku&&chainSupplier(sku.owner);if(!sku||sku.owner===f.id)continue;const terms=r.purchaseTerms.find(t=>t.supplier===sku.owner&&t.until>=state.day),orderQty=Math.max(Math.ceil(qty),terms?.min||20);const estimate=Math.round((vendor?supplierPrice(vendor,p,f)*(sku.volume||350)/350:sku.wholesale||PRODUCTS[p].cost*1.15)*orderQty);if(mgDo(f,estimate,()=>refOrder(f,id,orderQty,s.id))){ok=true;break;}}
  if(!ok&&!r.products.includes(key))mgBlock(f,s.id,'supply');
 }
}
function mgProduction(f){const a=mgFirm(f),r=refFirm(f);for(const plan of a.production.filter(p=>p.enabled)){
 const s=refSite(f,plan.site),sku=refSKU(plan.sku);if(!s||s.closed||s.build)continue;if(!mgManaged(f,s)){mgBlock(f,s.id,'manager');continue;}
 if(!refStaffPower(f,s.kind,s.id)){mgBlock(f,s.id,'staff');continue;}if(r.work.some(j=>j.kind==='production'&&j.site===s.id))continue;
 const stock=s.kind==='machine'?expansionFirm(f).kits.length:f.ops.warehouse[sku?.product||0].batches.filter(b=>b.sku===plan.sku).reduce((n,b)=>n+b.qty,0);
 if(stock>=plan.target)continue;const qty=s.kind==='machine'?1:Math.min(plan.batch,plan.target-stock,sku?.trialUntil?100:500);
 if(s.kind==='drink'&&(!sku||sku.retired)){mgBlock(f,s.id,'product');continue;}
 for(const material of s.kind==='machine'?['steel','electronics']:['water','concentrate','package']){const need=s.kind==='drink'&&material!=='package'?Math.ceil(qty*(sku.volume||350)/350):qty,available=r.materials.filter(b=>b.site===s.id&&b.material===material).reduce((n,b)=>n+b.qty,0)+r.work.filter(j=>j.kind==='material'&&j.site===s.id&&j.material===material).reduce((n,j)=>n+j.qty,0),order=Math.max(0,need-available);if(order)mgDo(f,order*({water:40,concentrate:160,package:120,steel:90000,electronics:50000}[material])*1.15*(s.kind==='machine'?12:1),()=>refRawOrder(f,material,order,1,s.id));}
 if(!refProduce(f,s.id,plan.sku,qty))mgBlock(f,s.id,'materials');
 }}
function mgOperate(f){if(!mgEnabled()||f.policy?.defeated)return;const a=mgFirm(f),r=refFirm(f);if(a.day!==state.day){a.day=state.day;a.spent=0;a.blocked=[];}
 if(!a.enabled)return;
 for(const s of r.sites.filter(s=>s.kind==='warehouse'&&!s.closed&&!s.build&&s.policy.enabled)){
  if(!mgManaged(f,s)){mgBlock(f,s.id,'manager');continue;}mgPurchase(f,s);
  const machines=f.machines.filter(m=>m.ref.hub===s.id);
  for(const m of machines){if(m.condition<s.policy.repair)mgDo(f,15000,()=>chainRepair(f,m.loc));if(a.pricing!=='manual')for(const slot of m.slots){const cost=slot.stock?slot.value/slot.stock:PRODUCTS[slot.product].cost;slot.price=refClamp(Math.round(cost*(a.pricing==='share'?1.7:2.2)),800,4000);}}
  if(s.maintenance<40)mgDo(f,15000,()=>refRepairSite(f,s.id));
  if(!r.routes.some(t=>t.hub===s.id)){const vehicle=r.vehicles.find(v=>v.hub===s.id&&!v.busy),staff=chainFirm(f).staff.some(w=>refEmployeeEligible(w,s.id,'restock'));if(vehicle&&machines.length){const id=refRoute(f,s.id,vehicle.id,machines.slice(0,staff?12:2).map(m=>m.loc));const route=r.routes.find(t=>t.id===id);if(route)route.managed=true;}}
  for(const route of r.routes.filter(t=>t.hub===s.id&&t.managed)){const staffed=chainFirm(f).staff.some(w=>refEmployeeEligible(w,s.id,'restock'));route.stops=machines.slice(0,staffed?12:2).map(m=>m.loc);}if(machines.some(m=>!r.routes.some(t=>t.enabled&&t.stops.includes(m.loc))))mgBlock(f,s.id,'delivery');
  for(const route of r.routes.filter(t=>t.hub===s.id&&t.enabled)){const needs=route.stops.some(loc=>{const m=f.machines.find(m=>m.loc===loc);return m&&(m.stock<companyCapacity(f,m)*.55||m.vault>=15000);});if(needs){if(!mgDo(f,route.stops.length*1000,()=>refDispatchRoute(f,route.id)))mgBlock(f,s.id,'delivery');}}
 }
 mgProduction(f);
 if(a.review)for(const p of r.projects.filter(p=>p.review&&!p.paused))refResearchReview(f,p.id,'continue');
}
const mgOldDelegate=refDelegate;refDelegate=function(f){return mgEnabled()?mgOperate(f):mgOldDelegate(f);};
const mgOldReceive=companyReceive;companyReceive=function(f,ms){if(mgEnabled()){const a=mgFirm(f),pulse=Math.floor(((state.day-1)*DAY_MS+(state.live?.elapsed||0))/(DAY_MS/4));if(a.lastPulse!==pulse){a.lastPulse=pulse;mgOperate(f);}}return mgOldReceive(f,ms);};
const mgOldSale=recordMarketSale;recordMarketSale=function(m,s,row,index,paid,ours){const before=m.total;mgOldSale(m,s,row,index,paid,ours);if(mgEnabled()&&m.total>before){const f=ours?playerFirm():rivalOwner(m.loc),a=mgFirm(f);a.sales??=[];let d=a.sales.find(x=>x.day===state.day&&x.site===m.ref.hub&&x.product===s.product);if(!d){d={day:state.day,site:m.ref.hub,product:s.product,qty:0};a.sales.push(d);a.sales=a.sales.filter(x=>x.day>state.day-14);}d.qty++;}};
const mgOldAI=chainAI;chainAI=function(){if(!mgEnabled())return mgOldAI();for(const f of rivalFirms().filter(f=>!f.policy.defeated)){
 const a=mgFirm(f),r=refFirm(f),h=refHome(f);if(!h||!f.machines.length&&!chainFirm(f).sites.length&&!chainFirm(f).orders.length&&!expansionFirm(f).kits.length&&!r.sites.some(s=>['drink','machine'].includes(s.kind)&&!s.closed)){closeCompany(f,'영업 자산 없음');continue;}a.enabled=true;for(const s of r.sites)s.policy.enabled=s.kind==='warehouse';
 if(a.aiMonth!==mgMonth()){a.aiMonth=mgMonth();const m=a.month.find(m=>m.closed),defensive=f.account.cash<100000||m?.profit<0;a.pricing=!defensive&&f.account.cash>5000000&&r.strategy.kind==='density'&&m?.profit>m?.revenue*.2?'share':'margin';a.dailyBudget=Math.floor(Math.max(25000,Math.min(500000,f.account.cash*.2)));a.reserve=Math.ceil(Math.max(25000,chainPayroll(f)*30));refAI(f);
  if(f.account.cash>a.reserve+50000&&f.machines.length>2&&!chainFirm(f).staff.some(w=>w.role==='restock'))refHireEmployee(f,'restock',h.id,2);
  for(const s of r.sites.filter(s=>!s.build&&!s.closed&&s.id!==h.id)){let w=chainFirm(f).staff.find(w=>w.site===s.id&&w.skill>=2);if(!w&&f.account.cash>a.reserve+100000){const id=refHireEmployee(f,s.kind==='warehouse'?'restock':s.kind,s.id,2);w=chainFirm(f).staff.find(w=>w.id===id);}if(w)refAppointManager(f,w.id,s.id);}
  if(f.account.cash>a.reserve+750000&&(chainFirm(f).licenses.quality<1||r.sites.some(s=>s.kind==='drink')&&chainFirm(f).licenses.quality<3))refResearch(f,'quality','aqua');
  const c=chainFirm(f),x=expansionFirm(f);
  if(f.machines.length>2&&r.vehicles.every(v=>v.capacity<500)&&f.account.cash>a.reserve+300000){const id=refVehicle(f,h.id,'truck');if(id){for(const t of r.routes)t.enabled=false;const route=refRoute(f,h.id,id,f.machines.slice(0,12).map(m=>m.loc));const t=r.routes.find(t=>t.id===route);if(t)t.managed=true;}}
  if(f.account.cash<0){const available=Math.min(companyBorrowRoom(f),Math.ceil(a.reserve-f.account.cash));if(available>=10000)mgBorrow(f,available,'working');}

  if(!defensive&&f.machines.length<6&&f.account.cash>a.reserve+supplierPrice(chainSupplier('koyo'),0,f)+300000){const site=LOCATIONS.filter(l=>!l.auction&&!machine(l.id)&&!rivalLocations().includes(l.id)&&!chainSiteOwner(l.id)).sort((a,b)=>Number(b.map===r.strategy.target)-Number(a.map===r.strategy.target))[0];if(site&&!c.sites.length)reserveSite(f,site.id);if(c.sites.length&&!x.kits.length&&!c.orders.some(o=>o.kind==='machine'))chainOrderMachine(f,'koyo',0);}
  if(!defensive&&c.licenses.quality&&f.account.cash>a.reserve+factoryCost(f,'drink')+1000000&&!r.sites.some(s=>s.kind==='drink'&&!s.closed))refBuildSite(f,'drink',h.map);
  for(const s of r.sites.filter(s=>s.kind==='drink'&&!s.closed&&!s.build)){if(!a.production.some(p=>p.site===s.id)){let sku=refOwnProducts(f).find(s=>s.product===0);if(!sku&&f.account.cash>a.reserve+100000){const id=refLaunchProduct(f,0,'house',false);sku=refSKU(id);}if(sku)a.production.push({site:s.id,sku:sku.id,target:300,batch:100,enabled:true});}const plan=a.production.find(p=>p.site===s.id);if(plan)for(const m of f.machines)for(const slot of m.slots)if(slot.product===0&&!slot.stock)slot.sku=plan.sku;}
  for(const w of c.staff)if(w.satisfaction<60&&f.account.cash>a.reserve+50000)refRaise(f,w.id,10);
  if(!defensive&&f.account.cash>a.reserve+5000000&&r.sites.some(s=>s.kind==='drink')){const target=rivalFirms().find(v=>v.id!==f.id&&!v.policy.defeated&&v.meta.distress>=3);if(target)mergeCompanies(f,target);}
 }
 if(!f.machines.length&&chainFirm(f).sites.length&&!expansionFirm(f).kits.length&&!chainFirm(f).orders.some(o=>['machine','installation'].includes(o.kind))&&f.account.cash>supplierPrice(chainSupplier('koyo'),0,f)+50000)chainOrderMachine(f,'koyo',0);
 for(const site of chainFirm(f).sites)if(expansionFirm(f).kits.length)installKit(f,site.loc);
 if(f.meta.distress>=7&&companyRecoverable(f)<=0)closeCompany(f,'자금조달 실패');
 for(const p of r.projects.filter(p=>p.paused))mgDo(f,p.extra,()=>refResearchTopUp(f,p.id));mgOperate(f);
 }for(const f of rivalFirms().filter(f=>f.policy.defeated))if(state.enterprise.industry.entry&&state.day-f.meta.exitDay>=30&&state.day%30===0)reviveCompany(f);};
const mgOldExpansionAI=expansionAI;expansionAI=function(){if(!mgEnabled())return mgOldExpansionAI();};
// Keep capital purchases meaningful relative to now-continuous beverage revenue.
const mgOldSupplierPrice=supplierPrice;supplierPrice=function(s,p,f){const price=mgOldSupplierPrice(s,p,f);return mgEnabled()&&s.kind==='machine'?price*12:price;};
const mgOldFactoryCost=factoryCost;factoryCost=function(f,kind){return mgOldFactoryCost(f,kind)*(mgEnabled()?12:1);};
