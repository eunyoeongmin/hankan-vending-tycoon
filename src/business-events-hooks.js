/* Effects are read by the real purchasing, logistics and accounting paths. */
function beMatch(a,f,m,slot){return (a.firm==='all'||a.firm===f.id)&&(a.scope==='sku'?slot?.sku===a.sku:a.scope==='product'?slot?.product===a.product:a.scope==='loc'?m.loc===a.loc:LOCATIONS[m.loc].map===a.map);}
function beChoiceFactor(f,m,slot){return beEffects('demand').filter(a=>beMatch(a,f,m,slot)).reduce((n,a)=>n*a.value,1);}
function bePrice(f,m,slot,price){return Math.max(800,Math.min(4000,Math.round(beEffects('price').filter(a=>beMatch(a,f,m,slot)).reduce((n,a)=>n*a.value,price))));}
function beSlotBlocked(f,m,slot){return beEffects('block').some(a=>a.scope==='sku'&&(a.firm==='all'||a.firm===f.id)&&a.sku===slot.sku);}
const beOldDemand=demand;demand=function(m){const n=beOldDemand(m);return n*beEffects('premium').filter(a=>a.map===LOCATIONS[m.loc].map).reduce((v,a)=>v*(1+a.value),1);};
const beOldSupports=refSupports;refSupports=function(m,p){if(!beOldSupports(m,p))return false;const f=machine(m.loc)===m?playerFirm():rivalOwner(m.loc);if(!f)return true;
 return !beEffects('block').some(a=>a.scope!=='sku'&&(a.firm==='all'||a.firm===f.id)&&a.loc===m.loc)&&!beEffects('cold',f.id).some(a=>a.loc===m.loc&&[4,5].includes(p));};
const beOldWorker=refWorkerFactor;refWorkerFactor=function(f,w){return beOldWorker(f,w)*beEffects('worker',f.id).filter(a=>a.worker===w.id||a.scope==='hub'&&a.hub===w.site).reduce((n,a)=>n*a.value,1);};
const beOldSupplierPrice=supplierPrice;supplierPrice=function(s,p,f){const base=beOldSupplierPrice(s,p,f);if(s.kind!=='drink'||!beEnabled())return base;
 if(f.meta.contract&&f.meta.contract.until>=state.day&&f.meta.contract.supplier===['aqua','sun','value'].indexOf(s.id))return base;
 const lock=beEffects('lock',f.id).find(a=>a.supplier===s.id&&a.product===p);if(lock)return Math.round(lock.value);
 return Math.round(beEffects('cost').filter(a=>(a.firm==='all'||a.firm===f.id)&&(a.scope==='product'?a.product===p:a.supplier===s.id)).reduce((n,a)=>n*a.value,base));};
const beOldRent=companyRent;companyRent=function(f,m){return beOldRent(f,m)*beEffects('rent',f.id).filter(a=>a.loc===m.loc).reduce((n,a)=>n*a.value,1);};
const beOldCompanyReceive=companyReceive;companyReceive=function(f,ms){if(beEnabled()&&ms>0){for(const a of beEffects('fee',f.id)){if(a.minimum&&refFirm(f).journal.some(j=>j.day===state.day&&j.kind==='inventory-purchase'&&j.other===a.supplier))continue;const amount=a.value*ms/DAY_MS;companyExpense(f,amount);refWorld().rawCash+=amount;refPost(f,'event-running-cost',-amount);const h=beRecord(a.serial);if(h)h.spent+=amount;}}return beOldCompanyReceive(f,ms);};
const beOldSale=recordMarketSale;recordMarketSale=function(m,s,row,i,paid,ours){const served=row.served,cost=row.cost;beOldSale(m,s,row,i,paid,ours);if(!beEnabled()||row.served===served)return;
 const f=ours?playerFirm():rivalOwner(m.loc),ids=new Set([...beEffects('demand'),...beEffects('price')].filter(a=>beMatch(a,f,m,s)).map(a=>a.serial));for(const id of ids){const h=beRecord(id);if(h&&ours){h.sold++;h.revenue+=paid;h.cost+=row.cost-cost;}}};
const beOldExtraAssets=refExtraAssets;refExtraAssets=function(f){return beOldExtraAssets(f)+(beEnabled()&&f.id==='player'?(state.businessEvents?.tasks||[]).reduce((n,t)=>n+(t.kind==='production'?t.cargo?.value||0:t.kind==='contract'?t.bid||0:0),0):0);};
const beOldOrder=refOrder;refOrder=function(f,sku,qty,hub,backup=null){const before=refFirm(f).work.length,ok=beOldOrder(f,sku,qty,hub,backup);if(ok&&beEnabled())for(const j of refFirm(f).work.slice(before))j.eventOrderedDay=state.day;return ok;};
const beOldLaunchProduct=refLaunchProduct;refLaunchProduct=function(...args){const id=beOldLaunchProduct(...args);if(id&&beEnabled()){const f=args[0],penalty=(refFirm(f).projects.filter(p=>p.complete&&p.key==='quality').sort((a,b)=>b.tier-a.tier||b.id-a.id)[0]?.eventQualityPenalty||0);const sku=refSKU(id);sku.quality=Math.max(0,sku.quality-penalty);}return id;};
const beOldRepair=chainRepair;chainRepair=function(f,loc){const ok=beOldRepair(f,loc);if(ok&&beEnabled()){const order=chainFirm(f).orders.find(o=>o.kind==='repair'&&o.loc===loc);for(const a of beEffects('block',f.id).filter(a=>a.repairable&&a.loc===loc))a.repairOrder=order.id;}return ok;};
const beOldContract=refContract;refContract=function(f,loc,kind){const ok=beOldContract(f,loc,kind);if(ok&&beEnabled())beState().active=beState().active.filter(a=>!(a.type==='block'&&a.contract&&a.loc===loc&&a.firm===f.id));return ok;};
const beOldQueue=queueEvent;queueEvent=function(){
 if(!beEnabled())return beOldQueue();beDay();const s=beState();if(state.pending||state.ended||state.day<s.nextOffer||runRules().events===0)return;
 const follow=s.followups.find(v=>v.due<=state.day);if(follow){s.followups=s.followups.filter(v=>v!==follow);if(beOffer(follow.key,follow.loc,follow.parent)){if(inGameSession&&!menuOpen&&!modalView)openModal('event');return;}}
 if(enterpriseRandom()>=.15*[0,.4,1,1.6][runRules().events])return;const seed=Math.floor(enterpriseRandom()*10000),eligible=BUSINESS_EVENTS.filter(d=>!['trend-end','sponsor-bid'].includes(d.id)&&(s.cooldown[d.id]||0)<=state.day).map(d=>({id:d.id,loc:state.machines.find(m=>beTarget(d.id,seed,m.loc))?.loc})).filter(d=>d.loc!==undefined);if(!eligible.length)return;
 const event=eligible[seed%eligible.length];if(beOffer(event.id,event.loc)&&inGameSession&&!menuOpen&&!modalView)openModal('event');
};
const beOldWorldEvents=worldEvents;worldEvents=function(){if(beEnabled())beDay();return beOldWorldEvents();};
const beOldResolve=resolveEvent;resolveEvent=function(i){if(beEnabled()&&state.businessEvents?.pending)return beResolve(i);return beOldResolve(i);};
// Imported saves finish their already selected legacy outcomes; new incidents use this engine.
if(beEnabled())beState();
