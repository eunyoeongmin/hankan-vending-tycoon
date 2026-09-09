/* One finite district market. Only completed purchases create revenue for either firm. */
function npcMachine(loc,stock=0){const m={loc,stock,price:1500,level:1,total:0,product:0,vault:0};ensureSlots(m);return m;}
function ensureOperations(){
 const e=state.enterprise;
 if(!e.operations){try{const raw=localStorage.getItem(KEY);if(raw&&!localStorage.getItem(KEY+'-backup-before-market'))localStorage.setItem(KEY+'-backup-before-market',raw);}catch{}e.operations={version:1,machines:state.npc.owned.map(id=>npcMachine(id,60)),warehouse:PRODUCTS.map(()=>({qty:0,value:0})),orders:[],jobs:[],market:null,lastProfit:0,settledDay:0};}
 const o=e.operations;o.machines=o.machines.filter(m=>state.npc.owned.includes(m.loc));
 for(const id of state.npc.owned)if(!o.machines.some(m=>m.loc===id))o.machines.push(npcMachine(id));
 o.jobs=o.jobs.filter(j=>state.npc.owned.includes(j.loc));return o;
}
function marketRow(m,n){return {loc:m.loc,n,wanted:n,attempted:0,served:0,revenue:0,cost:0,rent:dailyRent(m),bought:[],lost:{stock:0,condition:0,price:0,competition:0},products:PRODUCTS.map(()=>({sold:0,revenue:0,cost:0}))};}
function beginMarket(){
 const l=state.live,o=ensureOperations();if(!l||o.market?.day===l.day)return;
 // Old in-progress saves finish their existing customer schedule once. Never replay past sales.
 if(l.elapsed>0){o.market={day:l.day,legacy:true,payroll:0,extra:0,rows:[],districts:[]};return;}
 const districts=MAPS.map((_,map)=>({n:Math.min(5000,Math.round(LOCATIONS.filter(x=>x.map===map).reduce((n,x)=>n+demand({loc:x.id,level:1}),0))),attempted:0,player:0,rival:0,none:0}));
 l.rows=state.machines.map(m=>marketRow(m,districts[LOCATIONS[m.loc].map].n));
 o.market={day:l.day,legacy:false,payroll:0,extra:0,districts,rows:o.machines.map(m=>marketRow(m,districts[LOCATIONS[m.loc].map].n))};
}
const startBeforeMarket=startBusiness;
startBusiness=function(){ensureOperations();startBeforeMarket();beginMarket();save();};
function recordMarketSale(m,s,r,i,paid,ours){
 const cost=s.value/s.stock;s.stock--;s.value=Math.max(0,s.value-cost);m.vault+=paid;m.total++;m.condition=Math.max(0,m.condition-.045);
 r.products??=PRODUCTS.map(()=>({sold:0,revenue:0,cost:0}));const p=r.products[s.product];p.sold++;p.revenue+=paid;p.cost+=cost;
 r.served++;r.revenue+=paid;r.cost+=cost;r.bought.push({i,price:paid});if(ours)state.totalSold++;syncMachine(m);
}
function marketCustomer(map,i){
 const o=ensureOperations(),market=o.market,d=market.districts[map],e=state.enterprise;
 const type=Math.floor(enterpriseRandom()*3),season=sceneSeason(),origin=map*6+Math.floor(enterpriseRandom()*6),options=[];
 for(const ours of [true,false])for(const m of (ours?state.machines:o.machines)){
  if(LOCATIONS[m.loc].map!==map)continue;
  const rows=ours?state.live.rows:market.rows,r=rows.find(x=>x.loc===m.loc);if(!r)continue;
  ensureSlots(m);r.attempted=d.attempted;r.lost??={stock:0,condition:0,price:0,competition:0};
  if(!m.stock){r.lost.stock++;continue;}if(m.condition<25&&enterpriseRandom()<.5){r.lost.condition++;continue;}
  for(const s of m.slots.filter(s=>s.stock>0)){
   const p=PRODUCTS[s.product],paid=ours?campaignPrice(s,map):e.rivalPrices[map];
   let fit=(p.fit[LOCATIONS[origin].kind]||1)*(type===0&&s.product===0?1.25:type===1&&s.product===1?1.35:type===2&&s.product===3?1.3:1);
   if(s.product===4)fit*=[1,2,.8,.35][season];if(s.product===5)fit*=[1,.45,1.3,2][season];
   let score=fit*Math.exp((1-paid/p.price)*[2.3,1.5,.9][type])*(.5+m.condition/200)/(1+Math.abs(m.loc-origin)*.6)/4;
   if(ours){score*= (1+e.tech.quality*.09+(s.label?e.brand[map]/140:0))*(.65+state.reputation/200);if(activeCampaign(map)?.kind==='loyalty')score*=1.35;}
   else{score*=rivalSkillFactor();const r=ensureRivalry();if(r.target===map&&r.until>=state.day){let boost=r.mode==='advertise'?.65:r.mode==='price'?.3:0;if(activeCampaign(map)?.kind==='defend')boost*=.3;score*=1+boost;}}
   options.push({m,s,r,paid,ours,score});
  }
 }
 // Outside option represents another shop or no purchase; no customer buys twice.
 let pick=enterpriseRandom()*(.45+options.reduce((n,x)=>n+x.score,0)),chosen=null;
 for(const x of options){pick-=x.score;if(pick<0){chosen=x;break;}}
 if(chosen){recordMarketSale(chosen.m,chosen.s,chosen.r,i,chosen.paid,chosen.ours);d[chosen.ours?'player':'rival']++;}else d.none++;
 for(const r of state.live.rows.filter(r=>LOCATIONS[r.loc].map===map)){
  r.attempted=d.attempted;
  if(chosen?.r!==r&&machine(r.loc)?.stock>0){r.lost??={stock:0,condition:0,price:0,competition:0};r.lost[chosen?'competition':'price']++;}
 }
}
function npcCrew(){return Math.ceil(state.npc.owned.length/3);}
function advanceRivalOperations(ms){
 const o=ensureOperations(),market=o.market;if(!market||market.legacy||ensureRivalry().defeated)return;
 market.payroll+=npcCrew()*5000*(1+state.difficulty*.1)*inflationFactor()*ms/DAY_MS;
 for(const order of o.orders)order.remaining-=ms;
 for(const order of o.orders.filter(x=>x.remaining<=0)){const w=o.warehouse[order.product];w.qty+=order.qty;w.value+=order.value;}
 o.orders=o.orders.filter(x=>x.remaining>0);
 for(const j of o.jobs)j.remaining-=ms;
 for(const j of o.jobs.filter(x=>x.remaining<=0)){
  const m=o.machines.find(m=>m.loc===j.loc);if(!m)continue;
  if(j.type==='collect'){state.npc.cash+=m.vault;m.vault=0;}
  else{for(const s of m.slots){const w=o.warehouse[s.product],n=Math.min(Math.max(0,Math.floor((80+(m.level-1)*40)/4)-s.stock),w.qty),value=w.qty?n*w.value/w.qty:0;w.qty-=n;w.value=Math.max(0,w.value-value);s.stock+=n;s.value+=value;}syncMachine(m);}
 }
 o.jobs=o.jobs.filter(x=>x.remaining>0);
 for(const type of ['collect','restock']){
  let free=npcCrew()-o.jobs.filter(j=>j.type===type).length;
  for(const m of [...o.machines].sort((a,b)=>type==='collect'?b.vault-a.vault:a.stock-b.stock)){
   if(free<=0)break;if(o.jobs.some(j=>j.type===type&&j.loc===m.loc))continue;
   const need=type==='collect'?m.vault>=10000:m.stock<=28&&m.slots.some(s=>o.warehouse[s.product].qty>0);
   if(need){o.jobs.push({type,loc:m.loc,remaining:4500+LOCATIONS[m.loc].map*1200});free--;}
  }
 }
 for(let p=0;p<PRODUCTS.length;p++){
  if(!o.machines.some(m=>m.slots.some(s=>s.product===p))||o.warehouse[p].qty>=40||o.orders.some(x=>x.product===p))continue;
  const qty=80,value=procurementPrice(p,0)*qty*rivalCostFactor();
  if(state.npc.cash<value||o.warehouse.reduce((n,w)=>n+w.qty,0)+o.orders.reduce((n,x)=>n+x.qty,0)+qty>1000)continue;
  let duration=DAY_MS;if(enterpriseRandom()<[0,.1,.35][runRules().supply])duration+=DAY_MS*(runRules().supply===1?.5:1);
  state.npc.cash-=value;o.orders.push({product:p,qty,value,remaining:duration});
 }
 for(const m of o.machines)if(m.condition<30&&state.npc.cash>=15000){state.npc.cash-=15000;market.extra+=15000;m.condition=100;}
}
function settleRivalOperations(){
 const o=ensureOperations(),l=state.live;if(!l||o.settledDay>=l.day)return;beginMarket();const market=o.market;
 const r=ensureRivalry();if(r.defeated){o.lastProfit=0;o.settledDay=l.day;return;}const campaign=r.until>=l.day?(r.mode==='price'?7000:r.mode==='advertise'?8000:0):0;
 const rent=market.rows.reduce((n,x)=>n+x.rent,0),payroll=Math.round(market.payroll),overhead=market.legacy?0:1000;
 state.npc.cash-=rent+payroll+overhead+campaign;
 o.lastProfit=market.rows.reduce((n,x)=>n+x.revenue-x.cost,0)-rent-payroll-overhead-campaign-market.extra;o.settledDay=l.day;
}
const advanceBeforeMarket=advanceBusiness;
advanceBusiness=function(ms){
 if(!state.live||!finite(ms)||ms<0)return;ensureEnterprise();beginMarket();const o=ensureOperations();
 if(o.market.legacy){advanceBeforeMarket(ms);return;}
 let left=Math.min(ms,DAY_MS-state.live.elapsed);
 while(left>0&&state.live){const step=Math.min(200,left),l=state.live;l.elapsed+=step;l.payroll=(l.payroll||0)+staffSalary()*step/DAY_MS;left-=step;
  advanceJobs(step);advanceRivalOperations(step);
  o.market.districts.forEach((d,map)=>{while(d.attempted<d.n&&saleTime({loc:map*6,n:d.n},d.attempted)<=l.elapsed){const i=d.attempted++;marketCustomer(map,i);}});
  if(l.elapsed>=DAY_MS){finishBusiness();return;}
 }save();refreshLiveNumbers();
};
// Transfers keep physical inventory, accumulated receipts and condition intact.
const acquireBeforeOperations=acquireNpc;
acquireNpc=function(loc){const o=ensureOperations(),m=o.machines.find(m=>m.loc===loc);acquireBeforeOperations(loc);const bought=machine(loc);if(m&&bought){Object.assign(bought,m);o.machines=o.machines.filter(x=>x!==m);o.jobs=o.jobs.filter(j=>j.loc!==loc);save();render();}};
const offerBeforeOperations=acceptOffer;
acceptOffer=function(){const o=ensureOperations(),m=state.offer&&machine(state.offer.loc);offerBeforeOperations();if(m&&!machine(m.loc)&&state.npc.owned.includes(m.loc)){o.machines=o.machines.filter(x=>x.loc!==m.loc);o.machines.push(m);save();render();}};
function validOperations(o,s){
 const nn=x=>finite(x)&&x>=0,arr=(x,n)=>Array.isArray(x)&&x.length<=n;
 if(!o||o.version!==1||!arr(o.machines,24)||new Set(o.machines.map(m=>m.loc)).size!==o.machines.length||!o.machines.every(m=>m&&int(m.loc,0,23)&&int(m.level,1,3)&&int(m.total,0,1e12)&&nn(m.vault)&&int(m.stock,0,10000)&&int(m.product,0,5)&&int(m.price,800,4000)&&nn(m.condition)&&m.condition<=100&&arr(m.slots,4)&&m.slots.length===4&&m.slots.every(x=>x&&int(x.product,0,5)&&int(x.stock,0,10000)&&int(x.price,800,4000)&&nn(x.value)&&typeof x.label==='boolean')&&m.slots.reduce((n,x)=>n+x.stock,0)===m.stock))return false;
 if(!arr(o.warehouse,6)||o.warehouse.length!==6||!o.warehouse.every(w=>w&&int(w.qty,0,100000)&&nn(w.value))||!arr(o.orders,1000)||!o.orders.every(x=>x&&int(x.product,0,5)&&int(x.qty,1,1000)&&nn(x.value)&&nn(x.remaining)&&x.remaining>0)||!arr(o.jobs,48)||!o.jobs.every(x=>x&&['collect','restock'].includes(x.type)&&int(x.loc,0,23)&&nn(x.remaining)&&x.remaining>0)||!finite(o.lastProfit)||!int(o.settledDay,0,1000000))return false;
 const m=o.market;if(!m)return true;
 return int(m.day,1,s.day)&&typeof m.legacy==='boolean'&&nn(m.payroll)&&nn(m.extra)&&arr(m.rows,24)&&m.rows.every(r=>validLive({day:s.day,elapsed:0,rows:[r]},{day:s.day,ended:false}))&&arr(m.districts,4)&&(m.legacy?m.districts.length===0:m.districts.length===4&&m.districts.every(d=>d&&int(d.n,0,5000)&&int(d.attempted,0,d.n)&&int(d.player,0,d.attempted)&&int(d.rival,0,d.attempted)&&int(d.none,0,d.attempted)&&d.player+d.rival+d.none===d.attempted));
}
// The old estimate remains useful only for location planning, never for cash settlement.
ensureOperations();

function sceneCustomerRows(l){const m=state.enterprise.operations?.market;return m&&!m.legacy&&m.day===l.day?[...l.rows,...m.rows]:l.rows;}
function sceneCustomerDue(r,i){const m=state.enterprise.operations?.market;return m&&!m.legacy?saleTime({loc:LOCATIONS[r.loc].map*6,n:r.n},i):saleTime(r,i);}
const turnBeforeOperations=rivalTurn;
rivalTurn=function(){const o=ensureOperations(),before=[...o.machines];turnBeforeOperations();if(!ensureRivalry().defeated)for(const m of before.filter(m=>!state.npc.owned.includes(m.loc))){state.npc.cash+=m.vault;for(const s of m.slots){o.warehouse[s.product].qty+=s.stock;o.warehouse[s.product].value+=s.value;}}ensureOperations();};
const competitionBeforeMarket=competitionBody;
competitionBody=function(){return `<p class="permit-warning">${T('공통 고객 시장: 한 고객은 한 곳에서만 구매합니다. 경쟁사도 재고를 매입·배송·보충하고, 판매 대금을 회수하며 비용을 지불합니다. 아래 선택률은 추정치입니다.','共通顧客市場：一人の顧客が買うのは一か所のみ。競合も在庫の仕入れ・配送・補充、売上回収と費用支払いを行います。以下の選択率は推定値です。')}</p>`+competitionBeforeMarket();};
