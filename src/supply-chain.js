/* Supplier companies, purchase orders and funded research share the business clock. */
function chainEnabled(){return !!state.enterprise?.chain&&industryEconomy();}
function chainFirm(f){return state.enterprise.chain.firms[f.id];}
function supplierAccount(s){return s.id==='aqua'?state.enterprise.expansion.maker:s;}
function chainSupplier(id){return state.enterprise.chain.suppliers.find(s=>s.id===id);}
function chainFreshFirm(f){return {staff:[],orders:[],sites:[],builds:[],projects:[],licenses:{products:f.research.products,quality:f.tech.quality,efficiency:f.research.efficiency,logistics:f.tech.logistics},materials:{drink:{qty:0,value:0},machine:{qty:0,value:0}},lastAI:0};}
function chainInitialize(){
 if(!industryEnabled()||state.enterprise.chain)return;
 try{const raw=localStorage.getItem(KEY);if(raw&&!localStorage.getItem(KEY+'-backup-before-supply-chain'))localStorage.setItem(KEY+'-backup-before-supply-chain',raw);}catch{}
 const suppliers=[['aqua','drink',.95,0,250],['sun','drink',1.08,1,180],['value','drink',.82,0,120],['koyo','machine',1,0,2],['hokuto','machine',1.3,1,1]].map(([id,kind,price,quality,capacity])=>({id,kind,price,quality,capacity,cash:1500000,profit:0,stock:kind==='drink'?PRODUCTS.map(()=>({qty:600,value:180000})):Array.from({length:2},()=>({qty:5,value:600000})),researchers:2,skill:1,technology:0}));
 state.enterprise.chain={version:1,next:1,lastDay:0,suppliers,firms:{},rawCash:1000000};
 for(const f of allFirms()){
  const c=chainFreshFirm(f);state.enterprise.chain.firms[f.id]=c;
  const counts=f.id==='player'?state.staff:{collect:Math.ceil(f.machines.length/3),restock:Math.ceil(f.machines.length/3)};
  for(const role of ['collect','restock'])for(let n=0;n<counts[role];n++)c.staff.push(chainEmployee(role));
  if(f.id!=='player')c.staff.push(chainEmployee('logistics'));
  const x=expansionFirm(f);for(const kind of ['drink','machine'])if(x.plants[kind]){c.licenses[kind==='drink'?'quality':'efficiency']=Math.max(1,c.licenses[kind==='drink'?'quality':'efficiency']);for(let n=0;n<x.plants[kind];n++)c.staff.push(chainEmployee(kind));}
  for(const m of f.machines){m.model??=0;m.energy??=1;for(const slot of m.slots)slot.quality??=f.tech.quality;}
  f.ops.warehouse.forEach(w=>w.quality??=f.tech.quality);f.ops.orders.forEach(o=>o.quality??=f.tech.quality);x.jobs.forEach(j=>j.quality??=f.tech.quality);
  if(f.id==='player')f.ops.emergency=false;
 }
 syncChainStaff();
}
function supplierPrice(s,p,f){if(s.kind==='machine')return Math.round((p===0?180000:260000)*s.price*(1+s.technology*.06));const contract=f.meta.contract;return contract&&contract.until>=state.day&&contract.supplier===['aqua','sun','value'].indexOf(s.id)?contract.prices[p]:Math.round(PRODUCTS[p].cost*s.price*state.enterprise.index*inflationFactor());}
function supplierQuality(s,f){return Math.min(3,s.quality+s.technology*.25+chainFirm(f).licenses.quality*.25);}
function chainOrderMachine(f,id,model){
 const s=chainSupplier(id),c=chainFirm(f);if(!s||s.kind!=='machine'||!int(model,0,1)||state.ended||c.orders.length>=100||s.stock[model].qty<1)return false;
 const value=supplierPrice(s,model,f);if(f.account.cash<value)return false;f.account.cash-=value;const stock=s.stock[model],cost=stock.value/stock.qty;stock.qty--;stock.value=Math.max(0,stock.value-cost);s.cash+=value;s.profit+=value-cost;
 c.orders.push({id:state.enterprise.chain.next++,kind:'machine',model,qty:1,value,supplier:id,remaining:DAY_MS*2,duration:DAY_MS*2,energy:Math.max(.65,1-.1*(s.quality+c.licenses.efficiency))});return true;
}
const chainOldOrder=companyOrder;
companyOrder=function(f,p,qty,supplier){
 if(!chainEnabled())return chainOldOrder(f,p,qty,supplier);
 if(!int(p,0,5)||!int(qty,20,1000)||!int(supplier,0,2)||PRODUCTS[p].unlock>f.research.products||state.ended||warehouseUsed(f)+qty>1000+f.tech.logistics*500)return false;
 const s=chainSupplier(['aqua','sun','value'][supplier]),w=s.stock[p],contract=f.meta.contract;
 if(contract&&contract.until>=state.day&&contract.supplier!==supplier||w.qty<qty)return false;
 const value=supplierPrice(s,p,f)*qty;if(f.account.cash<value)return false;
 const cost=w.value*qty/w.qty;w.qty-=qty;w.value=Math.max(0,w.value-cost);f.account.cash-=value;const acc=supplierAccount(s);acc.cash+=value;acc.profit+=value-cost;if(s.id==='aqua')acc.totalProfit+=value-cost;
 let duration=DAY_MS*(supplier===2?3:1)+DAY_MS*qty/(500*Math.max(.5,chainWorkers(f,'logistics')));
 if(enterpriseRandom()<[0,.1,.35][runRules().supply])duration+=DAY_MS;
 f.ops.orders.push({id:nextCompanyOrder(f),product:p,qty,value,remaining:duration,duration,expiresDay:state.day+expiryLife(p),quality:supplierQuality(s,f),supplier:s.id,handling:DAY_MS*qty/(500*Math.max(.5,chainWorkers(f,'logistics'))),handlingCapacity:Math.max(.5,chainWorkers(f,'logistics'))});return true;
};
function reserveSite(f,loc){const c=chainFirm(f),l=LOCATIONS[loc];if(!l||l.auction||state.ended||chainSiteOwner(loc)||machine(loc)||rivalLocations().includes(loc)||f.id==='player'&&!canBuild(loc))return false;const value=Math.round(l.cost*.35);if(f.account.cash<value)return false;f.account.cash-=value;c.sites.push({loc,value});return true;}
function chainSiteOwner(loc){return chainEnabled()?allFirms().find(f=>chainFirm(f).sites.some(s=>s.loc===loc)):null;}
const chainOldInstall=installKit;
installKit=function(f,loc){
 if(!chainEnabled())return chainOldInstall(f,loc);const c=chainFirm(f),x=expansionFirm(f),site=c.sites.find(s=>s.loc===loc);
 if(!site||!x.kits.length||machine(loc)||rivalLocations().includes(loc)||c.orders.some(o=>o.kind==='installation'&&o.loc===loc)||state.ended)return false;
 const fee=chainWorkers(f,'technician',LOCATIONS[loc].map)?0:5000;if(f.account.cash<fee)return false;companyExpense(f,fee);const kit=x.kits.shift();c.orders.push({id:state.enterprise.chain.next++,kind:'installation',loc,outsourced:!chainWorkers(f,'technician',LOCATIONS[loc].map),qty:1,value:kit.value,model:kit.model||0,energy:kit.energy||1,remaining:DAY_MS,duration:DAY_MS});return true;
};
function chainResearch(f,key,supplierId,exclusive=false){
 const c=chainFirm(f),s=chainSupplier(supplierId);if(!['products','quality','efficiency','logistics'].includes(key)||!s||c.licenses[key]>=3||c.projects.some(p=>p.key===key&&p.remaining>0)||c.projects.filter(p=>p.remaining>0).length>=2||state.ended)return false;
 if((key==='products'||key==='quality')&&s.kind!=='drink'||key==='efficiency'&&s.kind!=='machine')return false;
 const tier=c.licenses[key]+1,budget=60000*tier*(exclusive?1.5:1);if(f.account.cash<budget)return false;
 f.account.cash-=budget;const duration=DAY_MS*(5+3*tier);c.projects.push({id:state.enterprise.chain.next++,key,supplier:s.id,tier,budget,spent:0,remaining:duration,duration,exclusive,rightsUntil:0});return true;
}
const chainOldResearch=companyResearch;companyResearch=function(f,key){if(!chainEnabled())return chainOldResearch(f,key);return chainResearch(f,key,key==='efficiency'?'koyo':'aqua');};
function orderMaterials(f,kind,qty){const c=chainFirm(f);if(!['drink','machine'].includes(kind)||!int(qty,1,1000)||c.orders.length>=100||c.materials[kind].qty+c.orders.filter(o=>o.kind==='raw'&&o.material===kind).reduce((n,o)=>n+o.qty,0)+qty>(kind==='drink'?5000:20)||state.ended)return false;const value=qty*(kind==='drink'?330:150000);if(f.account.cash<value)return false;f.account.cash-=value;state.enterprise.chain.rawCash+=value;c.orders.push({id:state.enterprise.chain.next++,kind:'raw',material:kind,qty,value,remaining:DAY_MS*2,duration:DAY_MS*2});return true;}
const chainOldBuild=buildFactory;buildFactory=function(f,kind){if(!chainEnabled())return chainOldBuild(f,kind);const c=chainFirm(f),x=expansionFirm(f);if(!['drink','machine'].includes(kind)||c.licenses[kind==='drink'?'quality':'efficiency']<1||x.plants[kind]+c.builds.filter(b=>b.kind===kind).length>=3||state.ended)return false;const value=factoryCost(f,kind);if(f.account.cash<value)return false;f.account.cash-=value;c.builds.push({id:state.enterprise.chain.next++,kind,value,remaining:DAY_MS*5,duration:DAY_MS*5});return true;};
const chainOldProduce=produce;produce=function(f,kind,p,qty){
 if(!chainEnabled())return chainOldProduce(f,kind,p,qty);const c=chainFirm(f),x=expansionFirm(f);if(!['drink','machine'].includes(kind)||!int(p,0,5)||!int(qty,1,500)||kind==='machine'&&qty!==1||!x.plants[kind]||x.jobs.filter(j=>j.kind===kind).length>=x.plants[kind]||!chainWorkers(f,kind)||state.ended)return false;
 if(kind==='drink'&&(PRODUCTS[p].unlock>f.research.products||warehouseUsed(f)+qty>1000+f.tech.logistics*500))return false;const w=c.materials[kind];if(w.qty<qty)return false;
 const value=w.value*qty/w.qty;w.qty-=qty;w.value=Math.max(0,w.value-value);const duration=DAY_MS*(kind==='drink'?qty/100:3);x.jobs.push({id:state.enterprise.expansion.next++,kind,product:p,qty,value,remaining:duration,duration,quality:Math.min(3,c.licenses.quality),energy:Math.max(.65,1-c.licenses.efficiency*.1)});return true;
};
function chainMergeStock(w,qty,value,quality){const total=w.qty+qty;w.quality=total?((w.quality||0)*w.qty+quality*qty)/total:0;w.qty=total;w.value+=value;}
const chainOldReceive=companyReceive;companyReceive=function(f,ms){
 if(!chainEnabled())return chainOldReceive(f,ms);const c=chainFirm(f),x=expansionFirm(f);stampCompanyInventory(f);
 const inbound=f.ops.orders.filter(o=>o.handling&&o.remaining<=o.handling).length;for(const o of f.ops.orders){if(!o.handling){o.remaining-=ms;continue;}const travel=Math.min(ms,Math.max(0,o.remaining-o.handling));o.remaining-=travel;o.remaining-=(ms-travel)*Math.max(.5,chainWorkers(f,'logistics'))/o.handlingCapacity/Math.max(1,inbound);}
 for(const o of f.ops.orders.filter(o=>o.remaining<=0)){const w=f.ops.warehouse[o.product];chainMergeStock(w,o.qty,o.value,o.quality||0);expiryMerge(w,o.expiresDay,o.qty);}f.ops.orders=f.ops.orders.filter(o=>o.remaining>0);
 for(const o of c.orders){const work=['installation','repair'].includes(o.kind);o.remaining-=ms*(work&&!o.outsourced?chainTechnicalRate(f,o):1);}
 for(const o of c.orders.filter(o=>o.remaining<=0)){
  if(o.kind==='machine')x.kits.push({value:o.value,model:o.model,energy:o.energy});
  if(o.kind==='raw'){c.materials[o.material].qty+=o.qty;c.materials[o.material].value+=o.value;}
  if(o.kind==='installation'){const site=c.sites.find(s=>s.loc===o.loc);if(site&&!machine(o.loc)&&!rivalLocations().includes(o.loc)){const m=npcMachine(o.loc);m.bookCost=site.value+o.value;m.model=o.model;m.energy=o.energy;f.machines.push(m);if(f.id!=='player')f.account.owned.push(o.loc);c.sites=c.sites.filter(s=>s!==site);}else x.kits.push({value:o.value,model:o.model,energy:o.energy});}
  if(o.kind==='repair'){const m=f.machines.find(m=>m.loc===o.loc);if(m)m.condition=100;}
 }c.orders=c.orders.filter(o=>o.remaining>0);
 for(const b of c.builds)b.remaining-=ms;
 for(const b of c.builds.filter(b=>b.remaining<=0)){x.plants[b.kind]++;x.plantValue+=b.value;x.facilities.push({kind:b.kind,value:b.value});}c.builds=c.builds.filter(b=>b.remaining>0);
 for(const p of c.projects){if(p.remaining<=0)continue;const s=chainSupplier(p.supplier),all=allFirms().flatMap(v=>chainFirm(v).projects).filter(q=>q.supplier===s.id&&q.remaining>0),rate=(s.researchers*s.skill+chainWorkers(f,'research'))/Math.max(1,all.length),step=Math.min(p.remaining,ms*rate/2),spend=Math.min(p.budget-p.spent,p.budget*step/p.duration);p.remaining-=step;p.spent+=spend;const acc=supplierAccount(s);acc.cash+=spend;expenseBookLoss(f,spend);if(p.remaining<=0){c.licenses[p.key]=Math.max(c.licenses[p.key],p.tier);s.technology=Math.max(s.technology,p.tier);if(p.key==='products')f.research.products=c.licenses.products;if(p.key==='quality')f.tech.quality=c.licenses.quality;if(p.key==='logistics')f.tech.logistics=c.licenses.logistics;p.rightsUntil=state.day+(p.exclusive?60:0);if(f.id==='player')log(B(`협력 개발 완료 · ${chainResearchName(p.key)[0]} ${p.tier}`,`共同開発完了・${chainResearchName(p.key)[1]} ${p.tier}`));}}
 c.projects=c.projects.filter(p=>p.remaining>0||p.rightsUntil>=state.day);
 for(const kind of ['drink','machine']){const jobs=x.jobs.filter(j=>j.kind===kind),rate=chainWorkers(f,kind)/Math.max(1,jobs.length);for(const j of jobs)j.remaining-=ms*rate;}
 for(const j of x.jobs.filter(j=>j.remaining<=0)){if(j.kind==='drink'){chainMergeStock(f.ops.warehouse[j.product],j.qty,j.value,j.quality||0);expiryMerge(f.ops.warehouse[j.product],state.day+expiryLife(j.product),j.qty);x.produced+=j.qty;}else x.kits.push({value:j.value,model:0,energy:j.energy||1});}x.jobs=x.jobs.filter(j=>j.remaining>0);
};
const chainOldRestock=companyRestock;companyRestock=function(f,m,emergency=false){if(!chainEnabled())return chainOldRestock(f,m,emergency);const before=m.slots.map(s=>({stock:s.stock,quality:s.quality||0,incoming:f.ops.warehouse[s.product].quality||0}));const n=chainOldRestock(f,m,false);m.slots.forEach((s,k)=>{s.quality=s.stock?(before[k].quality*before[k].stock+before[k].incoming*(s.stock-before[k].stock))/s.stock:0;});return n;};
function supplierDaily(){const e=state.enterprise.chain;if(e.lastDay>=state.day)return;e.lastDay=state.day;for(const s of e.suppliers){const a=supplierAccount(s);let capacity=s.capacity;for(let p=0;p<s.stock.length&&capacity>0;p++){const w=s.stock[p],unit=s.kind==='drink'?Math.round(PRODUCTS[p].cost*.6):120000,n=Math.min(capacity,Math.max(0,(s.kind==='drink'?600:8)-w.qty),Math.floor(Math.max(0,a.cash)/unit));if(n){a.cash-=n*unit;w.qty+=n;w.value+=n*unit;capacity-=n;}}a.cash-=s.researchers*1000;a.profit-=s.researchers*1000;}}
function chainAssets(f){if(!chainEnabled())return 0;const c=chainFirm(f);return c.orders.reduce((n,o)=>n+o.value,0)+c.sites.reduce((n,s)=>n+s.value,0)+c.builds.reduce((n,b)=>n+b.value,0)+Object.values(c.materials).reduce((n,m)=>n+m.value,0)+c.projects.reduce((n,p)=>n+p.budget-p.spent,0);}
const chainStockAssets=companyStockAssets;companyStockAssets=function(f){return chainStockAssets(f)+chainAssets(f);};
const chainAssetsBefore=assets;assets=function(){return chainAssetsBefore()+(chainEnabled()?chainAssets(playerFirm()):0);};
const chainRent=companyRent;companyRent=function(f,m){return chainRent(f,m);};
const chainPlayerRent=dailyRent;dailyRent=function(m){return chainEnabled()?companyRent(playerFirm(),m):chainPlayerRent(m);};
const chainAct=act;act=function(action){if(chainEnabled()&&action==='buy'){if(LOCATIONS[selected].auction){selectDesk('development');return;}reserveSite(playerFirm(),selected);selectDesk('equipment');save();render();return;}if(chainEnabled()&&action==='upgrade'){selectDesk('equipment');return;}return chainAct(action);};
const chainAction=enterpriseAction;enterpriseAction=function(action,param){if(chainEnabled()&&action==='tech'){if(companyResearch(playerFirm(),param)){save();render();}return;}if(chainEnabled()&&action==='repair'){chainRepair(playerFirm(),selected);save();render();return;}return chainAction(action,param);};
const launchBeforeSupplyChain=launchNew;launchNew=function(){launchBeforeSupplyChain();chainInitialize();save();render();};
const chainBegin=beginMarket;beginMarket=function(){if(industryEconomy()&&state.started&&!state.enterprise.chain&&state.enterprise.enableChain)chainInitialize();return chainBegin();};
// Old saved economies can explicitly migrate from the pause menu; new companies use this ruleset.
function chainLiquidate(f){const c=chainFirm(f),value=chainAssets(f);if(!value||state.ended)return false;f.account.cash+=value*.5;expenseBookLoss(f,value*.5);c.orders=[];c.sites=[];c.builds=[];c.projects=c.projects.filter(p=>p.remaining<=0);c.materials={drink:{qty:0,value:0},machine:{qty:0,value:0}};return true;}
const chainRecovery=companyRecoverable;companyRecoverable=function(f){return chainRecovery(f)+chainAssets(f)*.5;};
const chainRecover= recoverCompanyCash;recoverCompanyCash=function(f){chainRecover(f);if(chainEnabled()&&f.account.cash<0)chainLiquidate(f);};
const chainSign=companySignSupply;companySignSupply=function(f,supplier){if(!chainEnabled())return chainSign(f,supplier);if(!int(supplier,0,2)||f.account.cash<15000||f.meta.contract&&f.meta.contract.until>=state.day||state.ended)return false;const s=chainSupplier(['aqua','sun','value'][supplier]),prices=PRODUCTS.map((_,p)=>supplierPrice(s,p,f));companyExpense(f,15000);f.meta.contract={supplier,until:state.day+29,prices};return true;};
const chainResearchGuard=chainResearch;chainResearch=function(f,key,supplier,exclusive=false){const contracts=allFirms().flatMap(v=>chainFirm(v).projects.map(p=>({p,owner:v.id})));if(contracts.some(({p,owner})=>owner!==f.id&&p.supplier===supplier&&p.key===key&&(p.remaining>0&&(p.exclusive||exclusive)||p.exclusive&&p.rightsUntil>=state.day)))return false;return chainResearchGuard(f,key,supplier,exclusive);};
const chainResearchButton=research;research=function(key){if(!chainEnabled())return chainResearchButton(key);if(companyResearch(playerFirm(),key)){save();render();}};
function availableSupplierTechnology(s,f){let tech=s.technology;for(const v of allFirms())if(v.id!==f.id)for(const p of chainFirm(v).projects)if(p.supplier===s.id&&p.exclusive&&p.remaining<=0&&p.rightsUntil>=state.day)tech=Math.min(tech,p.tier-1);return tech;}
supplierQuality=function(s,f){return Math.min(3,s.quality+availableSupplierTechnology(s,f)*.25+chainFirm(f).licenses.quality*.25);};
const chainSupplierDay=supplierDaily;supplierDaily=function(){if(state.enterprise.chain.lastDay>=state.day)return;for(const f of allFirms())if(!f.policy?.defeated)companyExpense(f,f.machines.reduce((n,m)=>n+400*(m.energy||1),0));return chainSupplierDay();};
