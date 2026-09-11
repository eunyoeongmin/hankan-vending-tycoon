/* Explicit company views share economic operations; the old primary save remains readable. */
function industryEnabled(){return !!state.enterprise?.industry;}
function industryEconomy(){return industryEnabled()&&state.day>=(state.enterprise.industry.activationDay||1);}
function companyMeta(id){return {id,bank:{principal:0,arrears:0,missed:0},credit:65,due:state.day+60,distress:0,lastFinance:0,research:{products:0,logistics:0,efficiency:0},tech:{quality:0,logistics:0},brand:[15,15,15,15],prices:[1500,1500,1500,1500],supplier:0,capital:0,history:[],exitDay:0,generation:1,contract:null};}
function emptyOperations(){return {version:1,machines:[],warehouse:PRODUCTS.map(()=>({qty:0,value:0})),orders:[],jobs:[],market:null,lastProfit:0,settledDay:0};}
function initializeIndustry(newRun=false){
 if(industryEnabled())return;
 if(!newRun){try{const raw=localStorage.getItem(KEY);if(raw&&!localStorage.getItem(KEY+'-backup-before-industry'))localStorage.setItem(KEY+'-backup-before-industry',raw);}catch{}}
 const primary=companyMeta('mono'),player=companyMeta('player');player.bank=undefined;primary.prices=state.enterprise.rivalPrices;
 const i={version:1,activationDay:!newRun&&state.live?state.day+1:state.day,primary,player,companies:[],lastDay:0,shareDays:0,maxShare:0,totalRevenue:0,exits:0,acquisitions:0,researchReports:[],buyout:null,sandbox:!!state.continued,entry:true};
 state.enterprise.industry=i;state.saveVersion=6;ensureOperations();
 if(newRun){const count=runRules().rivalCompanies??1;for(let n=1;n<count;n++){
  const id=['mono','atlas','nova'][n],meta=companyMeta(id),used=new Set([...state.machines.map(m=>m.loc),...rivalLocations()]);
  const sites=[...(n===1?[13,19,8,21,4,15]:[2,9,16,22,5,11]),...LOCATIONS.map(l=>l.id)].filter((x,k,a)=>a.indexOf(x)===k&&!used.has(x)).slice(0,runRules().rivalMachines);
  const operations=emptyOperations();operations.machines=sites.map(loc=>npcMachine(loc,60));
  i.companies.push({meta,npc:{cash:runRules().rivalFunds,owned:sites,acquired:0},operations,rivalry:rivalryFresh()});
 }}
}
function playerFirm(){return {id:'player',account:state,ops:state.enterprise,machines:state.machines,bank:state.bank,meta:state.enterprise.industry?.player,research:state.research,tech:state.enterprise.tech,brand:state.enterprise.brand,policy:null};}
function rivalFirms(){
 const i=state.enterprise?.industry;
 const list=[{id:'mono',account:state.npc,ops:state.enterprise.operations,machines:state.enterprise.operations?.machines||[],bank:i?.primary.bank,meta:i?.primary,research:i?.primary.research,tech:i?.primary.tech,brand:i?.primary.brand,policy:state.enterprise.rivalry}];
 for(const x of i?.companies||[])list.push({id:x.meta.id,account:x.npc,ops:x.operations,machines:x.operations.machines,bank:x.meta.bank,meta:x.meta,research:x.meta.research,tech:x.meta.tech,brand:x.meta.brand,policy:x.rivalry});return list;
}
function rivalLocations(){return rivalFirms().flatMap(f=>f.account.owned);}
function rivalOwner(loc){return rivalFirms().find(f=>f.account.owned.includes(loc));}
function rivalById(id='mono'){return rivalFirms().find(f=>f.id===id);}
function companyName(f){const id=typeof f==='string'?f:f.id;return tr(({player:B('한 칸 상회','ハンカン商店'),mono:B('모노벤드','モノベンド'),atlas:B('아틀라스 유통','アトラス流通'),nova:B('노바 드링크','ノヴァドリンク')})[id]);}
function companyLog(f,ko,ja){const text=B(`${companyNameFor(f.id,0)}: ${ko}`,`${companyNameFor(f.id,1)}：${ja}`);f.policy?.history.unshift({day:state.day,text});if(f.policy)f.policy.history=f.policy.history.slice(0,20);log(text);}
function companyNameFor(id,n){return ({player:B('한 칸 상회','ハンカン商店'),mono:B('모노벤드','モノベンド'),atlas:B('아틀라스 유통','アトラス流通'),nova:B('노바 드링크','ノヴァドリンク')})[id][n];}
function companyCapacity(f,m){return 80+(m.level-1)*40+f.research.logistics*20+(m.model===1?40:0);}
function companyStockAssets(f){return f.machines.reduce((n,m)=>n+stockValue(m)+m.vault+equipment(m)*.7,0)+f.ops.warehouse.reduce((n,w)=>n+w.value,0)+f.ops.orders.reduce((n,o)=>n+o.value,0)+(f.id==='player'?f.ops.capital:f.meta.capital)*.5;}
function companyEquity(f){return Math.round(f.account.cash+companyStockAssets(f)-f.bank.principal-f.bank.arrears);}
function companyValue(f){const reports=f.id==='player'?f.ops.reports:f.meta.history,avg=reports.slice(0,30).reduce((n,r)=>n+r.net,0)/Math.max(1,Math.min(30,reports.length));return Math.max(0,Math.round(companyEquity(f)+Math.max(0,avg)*30+f.brand.reduce((a,b)=>a+b,0)*100));}
function companyCreditLimit(f){return Math.max(0,Math.min(1000000,Math.round((150000+companyStockAssets(f)*.6)*f.meta.credit/65)));}
function companyBorrowRoom(f){return f.meta.credit<25||f.bank.missed>=3?0:Math.max(0,companyCreditLimit(f)-f.bank.principal);}
function companyRate(f){return .002+(100-f.meta.credit)*.00006;}
function borrowCompany(f,amount){amount=Math.floor(Math.min(amount,companyBorrowRoom(f)));if(amount<=0)return false;if(!f.bank.principal)f.meta.due=state.day+60;f.bank.principal+=amount;f.account.cash+=amount;return amount;}
function repayCompany(f,amount){let available=Math.max(0,Math.min(amount,f.account.cash)),paid=0;for(const key of ['arrears','principal']){const part=Math.min(available,f.bank[key]);f.bank[key]-=part;available-=part;paid+=part;}f.account.cash-=paid;if(!f.bank.arrears&&(!f.bank.principal||state.day<f.meta.due))f.bank.missed=0;return paid;}
function renewCompanyDebt(f){const fee=Math.round(f.bank.principal*.015);if(!f.bank.principal||f.meta.credit<45||f.bank.arrears||f.account.cash<fee||f.meta.due-state.day>10)return false;companyExpense(f,fee);f.meta.due=state.day+60;return true;}
function settleCompanyDebt(f){
 const interest=Math.round(f.bank.principal*companyRate(f));f.bank.arrears+=interest;
 const due=f.bank.arrears+(state.day>=f.meta.due?f.bank.principal:0);
 if(f.account.cash>=due){f.account.cash-=due;f.bank.arrears=0;if(state.day>=f.meta.due)f.bank.principal=0;f.bank.missed=0;}
 else if(due>0){const paid=Math.min(Math.max(0,f.account.cash),f.bank.arrears);f.account.cash-=paid;f.bank.arrears-=paid;f.bank.missed++;}
 return interest;
}
function companyFinanceReview(f){if(f.meta.lastFinance>=state.day)return;f.meta.lastFinance=state.day;const bad=f.account.cash<0||f.bank.missed>0;f.meta.credit=Math.max(0,Math.min(100,f.meta.credit+(bad?-6:1)));f.meta.distress=bad?f.meta.distress+1:0;}
function companyRecoverable(f){return f.account.cash+companyBorrowRoom(f)+f.machines.reduce((n,m)=>n+m.vault+stockValue(m)*(f.id==='player'?1:.5)+(f.machines.length>1?equipment(m)*(f.id==='player'?.7:.5):0),0)+f.ops.warehouse.reduce((n,w)=>n+w.value*.5,0)-f.bank.arrears-(state.day>=f.meta.due?f.bank.principal:0);}
function nextCompanyOrder(f){const id=f.ops.nextOrder||1;f.ops.nextOrder=id+1;return id;}
function companyOrder(f,p,qty,supplier){
 if(!int(p,0,PRODUCTS.length-1)||!int(qty,1,1000)||!int(supplier,0,2)||qty<SUPPLIERS[supplier].min||f.research.products<PRODUCTS[p].unlock)return false;
 const value=procurementPrice(p,supplier)*qty,used=f.ops.warehouse.reduce((n,w)=>n+w.qty,0)+f.ops.orders.reduce((n,o)=>n+o.qty,0);
 if(f.account.cash<value||used+qty>1000+f.tech.logistics*500)return false;
 let duration=DAY_MS*SUPPLIERS[supplier].days/(1+f.tech.logistics*.12);if(enterpriseRandom()<[0,.1,.35][runRules().supply])duration+=DAY_MS*(runRules().supply===1?.5:1);
 f.account.cash-=value;f.ops.orders.push({id:nextCompanyOrder(f),product:p,qty,value,remaining:duration,duration});return true;
}
function companyReceive(f,ms){for(const o of f.ops.orders)o.remaining-=ms;for(const o of f.ops.orders.filter(o=>o.remaining<=0)){f.ops.warehouse[o.product].qty+=o.qty;f.ops.warehouse[o.product].value+=o.value;if(f.id==='player')ledger('delivery',o.qty);}f.ops.orders=f.ops.orders.filter(o=>o.remaining>0);}
function companyRestock(f,m,emergency=false){let moved=0;for(const s of m.slots){let need=Math.max(0,Math.floor(companyCapacity(f,m)/4)-s.stock);const w=f.ops.warehouse[s.product],n=Math.min(need,w.qty),value=w.qty?n*w.value/w.qty:0;w.qty-=n;w.value=Math.max(0,w.value-value);s.stock+=n;s.value+=value;moved+=n;need-=n;
 if(emergency&&need){const unit=Math.round(PRODUCTS[s.product].cost*state.enterprise.index*inflationFactor()*1.25),q=Math.min(need,Math.max(0,Math.floor(f.account.cash/unit)));f.account.cash-=q*unit;s.stock+=q;s.value+=q*unit;moved+=q;if(q&&f.id==='player')ledger('emergency',-q*unit);}}
 syncMachine(m);return moved;
}
function companyRent(f,m){return Math.round(LOCATIONS[m.loc].rent*(1-f.research.efficiency*.1)*inflationFactor());}
function companyPayroll(f){const crew=f.id==='player'?state.staff:{collect:Math.ceil(f.machines.length/3),restock:Math.ceil(f.machines.length/3)};return Math.round((crew.collect*2000+crew.restock*3000)*(1+state.difficulty*.1)*inflationFactor());}
const industryOldOrder=orderGoods,industryOldReceive=receiveOrders,industryOldRestock=restockMachine;
orderGoods=function(p,qty,supplier=state.enterprise.supplier){if(!industryEconomy())return industryOldOrder(p,qty,supplier);if(!state.started||state.ended)return false;const ok=companyOrder(playerFirm(),p,qty,supplier);if(ok){ledger('purchase',-state.enterprise.orders.at(-1).value);save();}return ok;};
receiveOrders=function(ms){if(!industryEconomy())return industryOldReceive(ms);companyReceive(playerFirm(),ms);};
restockMachine=function(m){if(!industryEconomy())return industryOldRestock(m);return companyRestock(playerFirm(),m,state.enterprise.emergency);};

const industryOldBegin=beginMarket;
beginMarket=function(){industryOldBegin();if(!industryEconomy()||!state.live)return;const root=state.enterprise.operations.market;
 for(const f of rivalFirms()){if(f.id!=='mono'&&f.ops.market?.day!==state.live.day)f.ops.market={day:state.live.day,legacy:root.legacy,payroll:0,extra:0,rows:root.legacy?[]:f.machines.map(m=>({...marketRow(m,root.districts[LOCATIONS[m.loc].map].n),rent:companyRent(f,m)})),districts:root.districts};if(f.ops.market)f.ops.market.districts=root.districts;}
};
const industryOldCustomer=marketCustomer;
marketCustomer=function(map,index){
 if(!industryEconomy())return industryOldCustomer(map,index);
 const root=state.enterprise.operations.market,d=root.districts[map],type=Math.floor(enterpriseRandom()*3),season=sceneSeason(),origin=map*6+Math.floor(enterpriseRandom()*6),choices=[];
 for(const f of [playerFirm(),...rivalFirms().filter(f=>!f.policy.defeated)])for(const m of f.machines){
  if(LOCATIONS[m.loc].map!==map)continue;const rows=f.id==='player'?state.live.rows:f.ops.market.rows,r=rows.find(x=>x.loc===m.loc);if(!r)continue;
  r.attempted=d.attempted;ensureSlots(m);if(!m.stock){r.lost.stock++;continue;}if(m.condition<25&&enterpriseRandom()<.5){r.lost.condition++;continue;}
  for(const s of m.slots.filter(s=>s.stock>0)){const p=PRODUCTS[s.product],ours=f.id==='player',paid=ours?campaignPrice(s,map):Math.max(800,Math.round(s.price*f.meta.prices[map]/1500));
   let fit=(p.fit[LOCATIONS[origin].kind]||1)*(type===0&&s.product===0?1.25:type===1&&s.product===1?1.35:type===2&&s.product===3?1.3:1);if(s.product===4)fit*=[1,2,.8,.35][season];if(s.product===5)fit*=[1,.45,1.3,2][season];
   let score=fit*Math.exp((1-paid/p.price)*[2.3,1.5,.9][type])*(.5+m.condition/200)/(1+Math.abs(m.loc-origin)*.6)/4*(1+(chainEnabled()?(s.quality||0):f.tech.quality)*.09+(s.label?f.brand[map]/140:0));
   if(ours){score*=.65+state.reputation/200;if(activeCampaign(map)?.kind==='loyalty')score*=1.35;}
   else {score*=rivalSkillFactor();if(f.policy.target===map&&f.policy.until>=state.day){let boost=f.policy.mode==='advertise'?.65:f.policy.mode==='price'?.3:0;if(activeCampaign(map)?.kind==='defend')boost*=.3;score*=1+boost;}}
   choices.push({f,m,s,r,paid,score});
  }
 }
 let pick=enterpriseRandom()*(.45+choices.reduce((n,c)=>n+c.score,0)),chosen=null;for(const c of choices){pick-=c.score;if(pick<0){chosen=c;break;}}
 if(chosen){recordMarketSale(chosen.m,chosen.s,chosen.r,index,chosen.paid,chosen.f.id==='player');d[chosen.f.id==='player'?'player':'rival']++;}else d.none++;
 for(const r of state.live.rows.filter(r=>LOCATIONS[r.loc].map===map)){r.attempted=d.attempted;if(chosen?.r!==r&&machine(r.loc)?.stock>0)r.lost[chosen?'competition':'price']++;}
};
const industryOldAdvance=advanceRivalOperations;
advanceRivalOperations=function(ms){if(!industryEconomy())return industryOldAdvance(ms);for(const f of rivalFirms()){
 const o=f.ops,market=o.market;if(!market||market.legacy||f.policy.defeated)continue;market.payroll+=companyPayroll(f)*ms/DAY_MS;companyReceive(f,ms);
 for(const j of o.jobs)j.remaining-=ms;
 for(const j of o.jobs.filter(j=>j.remaining<=0)){const m=f.machines.find(m=>m.loc===j.loc);if(!m)continue;if(j.type==='collect'){f.account.cash+=m.vault;m.vault=0;}else companyRestock(f,m);}
 o.jobs=o.jobs.filter(j=>j.remaining>0&&f.account.owned.includes(j.loc));
 for(const type of ['collect','restock']){let free=Math.ceil(f.machines.length/3)-o.jobs.filter(j=>j.type===type).length;for(const m of [...f.machines].sort((a,b)=>type==='collect'?b.vault-a.vault:a.stock-b.stock)){if(free<=0)break;if(o.jobs.some(j=>j.type===type&&j.loc===m.loc))continue;if(type==='collect'?m.vault>=10000:m.stock<=companyCapacity(f,m)*.35&&m.slots.some(s=>o.warehouse[s.product].qty>0)){o.jobs.push({type,loc:m.loc,remaining:(4500+LOCATIONS[m.loc].map*1200)/(1+f.tech.logistics*.25)});free--;}}}
 for(let p=0;p<PRODUCTS.length;p++)if(f.machines.some(m=>m.slots.some(s=>s.product===p))&&o.warehouse[p].qty<40&&!o.orders.some(x=>x.product===p))companyOrder(f,p,Math.max(100,SUPPLIERS[f.meta.supplier].min),f.meta.supplier);
 for(const m of f.machines)if(m.condition<30&&f.account.cash>=15000){f.account.cash-=15000;market.extra+=15000;m.condition=100;}
 }};
const industryOldSettle=settleRivalOperations;
settleRivalOperations=function(){if(!industryEconomy())return industryOldSettle();const l=state.live;if(!l)return;beginMarket();for(const f of rivalFirms()){
 if(f.ops.settledDay>=l.day)continue;const m=f.ops.market,r=f.policy;f.ops.settledDay=l.day;if(r.defeated){f.ops.lastProfit=0;continue;}
 const rent=m.rows.reduce((n,x)=>n+x.rent,0),payroll=Math.round(m.payroll),campaign=r.until>=l.day?(r.mode==='price'?7000:r.mode==='advertise'?8000:0):0,overhead=m.legacy?0:1000+500*(f.tech.quality+f.tech.logistics);
 f.account.cash-=rent+payroll+campaign+overhead;const interest=settleCompanyDebt(f),revenue=m.rows.reduce((n,x)=>n+x.revenue,0),cost=m.rows.reduce((n,x)=>n+x.cost,0);
 f.ops.lastProfit=revenue-cost-rent-payroll-campaign-overhead-interest-m.extra;f.meta.history.unshift({day:l.day,revenue,net:f.ops.lastProfit,sold:m.rows.reduce((n,x)=>n+x.served,0)});f.meta.history=f.meta.history.slice(0,60);r.pendingProfit=f.ops.lastProfit;companyFinanceReview(f);
 }};
const industryOldSceneRows=sceneCustomerRows;
sceneCustomerRows=function(l){return industryEnabled()&&state.enterprise.operations.market?.day===l.day?[...l.rows,...rivalFirms().flatMap(f=>f.ops.market?.rows||[])]:industryOldSceneRows(l);};

function removeRivalMachine(f,loc){f.account.owned=f.account.owned.filter(x=>x!==loc);f.ops.machines=f.ops.machines.filter(m=>m.loc!==loc);f.ops.jobs=f.ops.jobs.filter(j=>j.loc!==loc);f.machines=f.ops.machines;}
function closeCompany(f,reason){if(f.policy.defeated)return;for(const m of [...f.machines]){f.account.cash+=m.vault+stockValue(m)*.5+equipment(m)*.5;removeRivalMachine(f,m.loc);}for(const w of f.ops.warehouse){f.account.cash+=w.value*.5;w.qty=0;w.value=0;}f.ops.orders=[];repayCompany(f,Math.max(0,f.account.cash));f.policy.defeated=true;f.policy.mode='closed';f.policy.plan=null;f.meta.exitDay=state.day;state.enterprise.industry.exits++;if((state.offer?.buyer||'mono')===f.id)state.offer=null;companyLog(f,reason+' · 사업 철수',reason==='인수 완료'?'買収完了・事業終了':'資金調達終了・事業撤退');}
function reviveCompany(f){const empty=LOCATIONS.filter(l=>!l.auction&&!machine(l.id)&&!rivalLocations().includes(l.id));if(!empty.length)return false;const l=empty.sort((a,b)=>demand({loc:b.id,level:1})/b.cost-demand({loc:a.id,level:1})/a.cost)[0];
 const generation=f.meta.generation+1,id=f.id,meta=companyMeta(id);meta.generation=generation;Object.assign(f.meta,meta);f.account.cash=Math.max(500000,runRules().rivalFunds);f.account.owned=[];f.ops.orders=[];f.ops.jobs=[];f.ops.warehouse=PRODUCTS.map(()=>({qty:0,value:0}));Object.assign(f.policy,rivalryFresh());f.account.cash-=l.cost;f.account.owned.push(l.id);f.ops.machines.push(npcMachine(l.id));companyLog(f,`${generation}기 신규 투자자 진입 · ${l.short[0]}`,`第${generation}期の新規投資家参入・${l.short[1]}`);return true;
}
const industryOldTurn=rivalTurn;
rivalTurn=function(){if(!industryEnabled())return industryOldTurn();for(const f of rivalFirms()){
 const r=f.policy;if(r.turnDay>=state.day)continue;r.turnDay=state.day;
 if(r.defeated){if(state.enterprise.industry.entry&&state.day-f.meta.exitDay>=30&&state.day%10===0)reviveCompany(f);continue;}
 if(r.until<state.day)f.meta.prices.fill(1500);for(let map=0;map<MAPS.length;map++)f.brand[map]=Math.max(5,Math.min(100,f.brand[map]+(r.mode==='advertise'&&r.target===map&&r.until>=state.day?4:-.3)));
 r.lastProfit=r.pendingProfit??f.ops.lastProfit;r.pendingProfit=null;r.losses=r.lastProfit<0?r.losses+1:0;
 if(f.account.cash<30000&&companyBorrowRoom(f)>0){const amount=borrowCompany(f,Math.max(0,100000-f.account.cash));if(amount)companyLog(f,'운영자금 대출','運転資金融資');}
 if(f.account.cash<0&&f.machines.length>1){const m=[...f.machines].sort((a,b)=>a.total-b.total)[0];f.account.cash+=equipment(m)*.5+m.vault+stockValue(m)*.5;removeRivalMachine(f,m.loc);companyLog(f,`${LOCATIONS[m.loc].short[0]} 자산 매각`,`${LOCATIONS[m.loc].short[1]}の資産売却`);}
 if(f.meta.distress>=7&&companyRecoverable(f)<=0){closeCompany(f,'자금조달 실패');continue;}
 if(!f.machines.length){closeCompany(f,'입지 철수');continue;}
 if(f.account.cash<80000){r.plan=null;r.mode='retreat';r.until=state.day+1;f.meta.prices.fill(1750);continue;}
 if(r.plan&&r.plan.start<=state.day){r.mode=r.plan.mode;r.target=r.plan.target;r.until=r.plan.until;r.plan=null;f.meta.prices.fill(1500);f.meta.prices[r.target]=r.mode==='price'?1050:1500;}
 if(r.until+scenarioAttackRest()<state.day&&!r.plan){const rivals=[playerFirm(),...rivalFirms().filter(x=>x.id!==f.id&&!x.policy.defeated)],targets=MAPS.map((_,map)=>({map,n:rivals.reduce((n,x)=>n+x.machines.filter(m=>LOCATIONS[m.loc].map===map).length,0)})).filter(x=>x.n&&f.machines.some(m=>LOCATIONS[m.loc].map===x.map)).sort((a,b)=>b.n-a.n);
  if(targets.length){const mode=f.id==='nova'?'advertise':f.id==='atlas'&&r.losses>1?'advertise':'price';r.plan={mode,target:targets[0].map,start:state.day+1,until:state.day+scenarioAttackDays()};r.mode='steady';r.until=state.day;companyLog(f,`DAY ${r.plan.start} ${MAPS[r.plan.target].name[0]} ${RIVAL_MODES[mode][0]} 예고`,`DAY ${r.plan.start} ${MAPS[r.plan.target].name[1]}で${RIVAL_MODES[mode][1]}予告`);}else{r.mode='steady';r.until=state.day+2;}}
 if(state.day%scenarioExpansionInterval()===0){const empty=LOCATIONS.filter(l=>!l.auction&&!machine(l.id)&&!rivalLocations().includes(l.id)).sort((a,b)=>demand({loc:b.id,level:1})/b.cost-demand({loc:a.id,level:1})/a.cost),l=empty[0];if(l&&f.account.cash>l.cost+150000){f.account.cash-=l.cost;f.account.owned.push(l.id);f.ops.machines.push(npcMachine(l.id));companyLog(f,`${l.short[0]} 신규 출점`,`${l.short[1]}に新規出店`);}}
 if(state.day%12===0&&f.account.cash>500000){const key=f.id==='nova'?'quality':'logistics',cost=150000*(f.tech[key]+1);if(f.tech[key]<3&&f.account.cash>cost+200000){f.account.cash-=cost;f.meta.capital+=cost;f.tech[key]++;companyLog(f,key==='quality'?'상품 품질 투자':'물류 투자',key==='quality'?'商品品質投資':'物流投資');}if(f.research.products<3&&f.account.cash>500000)companyResearch(f,'products');}
 for(const m of f.machines)for(const s of m.slots){if(s.stock===0){const productId=f.id==='nova'?Math.min(5,f.research.products+1):f.id==='atlas'?1:0;if(PRODUCTS[productId].unlock<=f.research.products)s.product=productId;}s.label=f.tech.quality>=2;s.price=PRODUCTS[s.product].price;}for(const m of f.machines)syncMachine(m);
 if(!state.offer&&state.day%6===0&&state.cash<80000&&state.machines.length>1){const m=[...state.machines].sort((a,b)=>b.total-a.total)[0],price=Math.round(equipment(m)*.9+stockValue(m)+m.vault);if(f.account.cash>=price+30000){state.offer={loc:m.loc,price,deadline:state.day+3,buyer:f.id};companyLog(f,`${LOCATIONS[m.loc].short[0]} 매입 제안`,`${LOCATIONS[m.loc].short[1]}の買収提案`);}}
 if(f.id==='mono')state.enterprise.rivalPrices=f.meta.prices;
 }};

const industryOldBank=bankAction;
bankAction=function(action){if(!industryEconomy())return industryOldBank(action);if(!state.started||state.ended)return;const f=playerFirm();let amount=0;if(action==='borrow')amount=borrowCompany(f,250000);else if(action==='renew'){if(renewCompanyDebt(f))log(B('대출 만기 60일 연장','融資満期を60日延長'));}else amount=repayCompany(f,action==='repayAll'?Math.max(0,state.cash):100000);if(amount)log(B(`${action==='borrow'?'대출':'상환'} ${money(amount)}`,`${action==='borrow'?'借入':'返済'} ${money(amount)}`));save();render();};
const industryOldEnding=checkEnding;
checkEnding=function(timeCheck=false){if(!industryEconomy())return industryOldEnding(timeCheck);const i=state.enterprise.industry,f=playerFirm();if(state.ended)return true;
 if(timeCheck&&i.lastDay<state.day){i.lastDay=state.day;companyFinanceReview(f);const market=state.enterprise.operations.market,d=market?.districts||[],sold=d.reduce((n,x)=>n+x.player+x.rival,0),share=sold?d.reduce((n,x)=>n+x.player,0)/sold:0;i.maxShare=Math.max(i.maxShare,share);i.shareDays=share>=.6&&state.profit>0?i.shareDays+1:0;i.totalRevenue+=state.report?.revenue||0;}
 let type=null;if(f.meta.distress>=7&&companyRecoverable(f)<=0)type='bankrupt';else if(!i.sandbox&&!state.continued&&timeCheck&&(i.shareDays>=60||f.machines.length>=8&&companyValue(f)>=10000000&&state.profit>0))type='success';else if(!i.sandbox&&!state.continued&&timeCheck&&state.day>=state.duration)type='time';
 if(!type)return false;state.ending={type,day:state.day,assets:assets()};state.ended=true;state.live=null;livePaused=true;if(type==='success'&&!state.runWinRecorded){profile.clears=Math.min(20,profile.clears+1);state.runWinRecorded=true;saveProfile();}save();render();openModal('end');return true;
};
const industryOldLaunch=launchNew;
launchNew=function(){industryOldLaunch();initializeIndustry(true);if(state.live&&state.live.elapsed===0){for(const f of rivalFirms())f.ops.market=null;beginMarket();}save();render();};
function validIndustry(i,s){
 const nn=x=>finite(x)&&x>=0,meta=m=>m&&['player','mono','atlas','nova'].includes(m.id)&&int(m.credit,0,100)&&int(m.due,1,10000000)&&int(m.distress,0,1000000)&&int(m.lastFinance,0,1000000)&&int(m.exitDay,0,1000000)&&int(m.generation,1,1000000)&&nn(m.capital)&&int(m.supplier,0,2)&&m.tech&&['quality','logistics'].every(k=>int(m.tech[k],0,3))&&m.research&&['products','logistics','efficiency'].every(k=>int(m.research[k],0,3))&&Array.isArray(m.brand)&&m.brand.length===MAPS.length&&m.brand.every(nn)&&Array.isArray(m.prices)&&m.prices.length===MAPS.length&&m.prices.every(nn)&&Array.isArray(m.history)&&m.history.length<=60&&m.history.every(r=>int(r.day,1,1000000)&&finite(r.net)&&nn(r.revenue))&&(m.id==='player'||m.bank&&nn(m.bank.principal)&&m.bank.principal<=1000000&&nn(m.bank.arrears)&&int(m.bank.missed,0,1000000));
 if(!i||i.version!==1||!meta(i.primary)||i.primary.id!=='mono'||!meta(i.player)||i.player.id!=='player'||!Array.isArray(i.companies)||i.companies.length>2||!Array.isArray(i.researchReports)||i.researchReports.length>3||!int(i.lastDay,0,1000000)||!int(i.shareDays,0,1000000)||!nn(i.maxShare)||i.maxShare>1||!nn(i.totalRevenue)||!int(i.exits,0,1000000)||!int(i.acquisitions,0,1000000)||typeof i.sandbox!=='boolean'||typeof i.entry!=='boolean')return false;
 if(![6,7].includes(s.saveVersion)||!int(i.activationDay,1,1000000)||!i.researchReports.every(r=>r&&['mono','atlas','nova'].includes(r.id)&&int(r.day,1,1000000)&&['closed','weak','stable','watch'].includes(r.grade)&&['unknown','up','down','flat'].includes(r.trend)))return false;
 if(i.buyout&&(!['mono','atlas','nova'].includes(i.buyout.id)||!int(i.buyout.day,1,1000000)||!int(i.buyout.generation,1,1000000)||!int(i.buyout.price,250000,1000000000000)))return false;
 const extra=m=>(m.pendingExpense===undefined||finite(m.pendingExpense))&&(!m.contract||(int(m.contract.supplier,0,2)&&int(m.contract.until,1,1000000)&&Array.isArray(m.contract.prices)&&m.contract.prices.length===6&&m.contract.prices.every(x=>int(x,1,1000000000))));
 if(!extra(i.primary)||!extra(i.player))return false;
 const locations=[...s.machines.map(m=>m.loc),...s.npc.owned],ids=['mono'],machines=[...s.machines,...(s.enterprise.operations?.machines||[])];for(const x of i.companies){if(!meta(x.meta)||!extra(x.meta)||!['atlas','nova'].includes(x.meta.id)||ids.includes(x.meta.id)||!x.npc||!finite(x.npc.cash)||!int(x.npc.acquired,0,1000000000)||!Array.isArray(x.npc.owned)||!x.npc.owned.every(loc=>int(loc,0,LOCATIONS.length-1))||!validOperations(x.operations,s)||!validRivalry(x.rivalry)||x.operations.machines.length!==x.npc.owned.length||x.operations.machines.some(m=>!x.npc.owned.includes(m.loc)))return false;ids.push(x.meta.id);locations.push(...x.npc.owned);machines.push(...x.operations.machines);}return new Set(locations).size===locations.length&&machines.every(m=>!m.lease||(int(m.lease.until,1,1000000)&&int(m.lease.rate,0,1000000000)));
}
if(state.started)initializeIndustry(false);

function commissionResearch(id){const f=rivalById(id),i=state.enterprise.industry;if(!i||!f||!state.started||state.ended||state.cash<20000)return false;state.cash-=20000;state.enterprise.expenseToday+=20000;
 const h=f.meta.history,recent=h.slice(0,7),prior=h.slice(7,14),avg=a=>a.reduce((n,r)=>n+r.revenue,0)/Math.max(1,a.length),a=avg(recent),b=avg(prior);
 const report={id,day:state.day,grade:f.policy.defeated?'closed':f.meta.credit<35||f.meta.distress>2?'weak':f.account.cash>150000&&f.bank.missed===0?'stable':'watch',trend:h.length<8?'unknown':a>b*1.1?'up':a<b*.9?'down':'flat'};
 i.researchReports=i.researchReports.filter(r=>r.id!==id);i.researchReports.push(report);save();render();return true;
}
function quoteCompany(id){const f=rivalById(id);if(!industryEnabled()||!f||f.policy.defeated||!state.started||state.ended)return false;const i=state.enterprise.industry;if(i.buyout?.id!==id||i.buyout.day!==state.day)i.buyout={id,day:state.day,generation:f.meta.generation,price:Math.max(250000,Math.round(companyValue(f)*1.25/1000)*1000)};save();openModal('company-buyout');return true;}
function companyBuyoutError(){const q=state.enterprise.industry?.buyout,f=q&&rivalById(q.id);if(!q||q.day!==state.day||!f||f.policy.defeated||f.meta.generation!==q.generation||!state.started||state.ended)return T('인수 조건 만료','買収条件の期限切れ');if(state.cash<q.price+(f.meta.contract&&f.meta.contract.until>=state.day?5000:0))return T('현금 부족','資金不足');if(state.bank.principal+f.bank.principal>1000000)return T('승계 후 대출 한도 초과','承継後の融資限度超過');const used=playerFirm().ops.warehouse.reduce((n,w)=>n+w.qty,0)+state.enterprise.orders.reduce((n,o)=>n+o.qty,0)+f.ops.warehouse.reduce((n,w)=>n+w.qty,0)+f.ops.orders.reduce((n,o)=>n+o.qty,0);if(used>warehouseCapacity())return T('승계 재고를 위한 창고 확장 필요','承継在庫のため倉庫拡張が必要');return '';}
function completeCompanyBuyout(){if(companyBuyoutError())return false;const i=state.enterprise.industry,q=i.buyout,f=rivalById(q.id),e=state.enterprise;
 state.cash+=f.account.cash-q.price;const termination=f.meta.contract&&f.meta.contract.until>=state.day?5000:0;state.cash-=termination;e.expenseToday+=termination;f.meta.contract=null;state.bank.principal+=f.bank.principal;state.bank.arrears+=f.bank.arrears;state.bank.missed=Math.max(state.bank.missed,f.bank.missed);if(f.bank.principal)i.player.due=Math.min(i.player.due,f.meta.due);
 for(let p=0;p<PRODUCTS.length;p++){if(chainEnabled())e.warehouse[p].quality=(e.warehouse[p].qty*(e.warehouse[p].quality||0)+f.ops.warehouse[p].qty*(f.ops.warehouse[p].quality||0))/Math.max(1,e.warehouse[p].qty+f.ops.warehouse[p].qty);e.warehouse[p].qty+=f.ops.warehouse[p].qty;e.warehouse[p].value+=f.ops.warehouse[p].value;f.ops.warehouse[p]={qty:0,value:0};}for(const o of f.ops.orders)e.orders.push({...o,id:e.nextOrder++,duration:o.duration||o.remaining});f.ops.orders=[];
 for(const m of [...f.machines]){state.machines.push(m);removeRivalMachine(f,m.loc);}for(const key of ['quality','logistics'])e.tech[key]=Math.max(e.tech[key],f.tech[key]);for(const key of ['products','logistics','efficiency'])state.research[key]=Math.max(state.research[key],f.research[key]);for(let map=0;map<MAPS.length;map++)e.brand[map]=Math.max(e.brand[map],f.brand[map]);e.capital+=f.meta.capital;
 f.account.cash=0;f.bank.principal=0;f.bank.arrears=0;f.bank.missed=0;f.meta.capital=0;f.policy.defeated=true;f.policy.mode='closed';f.policy.plan=null;f.meta.exitDay=state.day;i.acquisitions++;i.buyout=null;if((state.offer?.buyer||'mono')===f.id)state.offer=null;
 companyLog(f,'기업 인수 완료 · 자산과 부채 승계','企業買収完了・資産と負債を承継');closeModal();save();render();return true;
}

function companyExpense(f,amount){f.account.cash-=amount;if(f.id==='player')f.ops.expenseToday+=amount;else if(f.ops.market&&f.ops.settledDay<state.day)f.ops.market.extra+=amount;else f.meta.pendingExpense=(f.meta.pendingExpense||0)+amount;}
function companySignSupply(f,supplier){if(!int(supplier,0,2)||f.account.cash<15000||f.meta.contract&&f.meta.contract.until>=state.day)return false;companyExpense(f,15000);f.meta.contract={supplier,until:state.day+29,prices:PRODUCTS.map((_,p)=>procurementPrice(p,supplier))};if(f.id==='player')f.ops.supplier=supplier;else f.meta.supplier=supplier;return true;}
function companyEndSupply(f){if(!f.meta.contract)return false;const fee=f.meta.contract.until>=state.day?5000:0;if(f.account.cash<fee)return false;companyExpense(f,fee);f.meta.contract=null;return true;}
const contractOrder=companyOrder;
companyOrder=function(f,p,qty,supplier){const c=f.meta.contract;if(c&&c.until>=state.day){if(supplier!==c.supplier||!int(p,0,PRODUCTS.length-1)||!int(qty,1,1000)||qty<SUPPLIERS[supplier].min||f.research.products<PRODUCTS[p].unlock)return false;
 const value=c.prices[p]*qty,used=f.ops.warehouse.reduce((n,w)=>n+w.qty,0)+f.ops.orders.reduce((n,o)=>n+o.qty,0);if(f.account.cash<value||used+qty>1000+f.tech.logistics*500)return false;
 let duration=DAY_MS*SUPPLIERS[supplier].days/(1+f.tech.logistics*.12);if(enterpriseRandom()<[0,.1,.35][runRules().supply])duration+=DAY_MS*(runRules().supply===1?.5:1);f.account.cash-=value;f.ops.orders.push({id:nextCompanyOrder(f),product:p,qty,value,remaining:duration,duration});return true;}
 return contractOrder(f,p,qty,supplier);};
function companySignLease(f,m){const base=Math.round(LOCATIONS[m.loc].rent*(1-f.research.efficiency*.1)*inflationFactor()),fee=base*3;if(f.account.cash<fee||m.lease&&m.lease.until>=state.day)return false;companyExpense(f,fee);m.lease={until:state.day+29,rate:Math.round(base*.85)};return true;}
const contractRent=companyRent;
companyRent=function(f,m){return m.lease&&m.lease.until>=state.day?m.lease.rate:contractRent(f,m);};
const contractPlayerRent=dailyRent;
dailyRent=function(m){return industryEnabled()&&m.lease&&m.lease.until>=state.day?m.lease.rate:contractPlayerRent(m);};
function companyResearch(f,key){const r=RESEARCH.find(r=>r.id===key);if(!r||f.research[key]>=3)return false;const cost=r.base*(f.research[key]+1);if(f.account.cash<cost)return false;companyExpense(f,cost);f.research[key]++;return true;}
const sharedResearch=research;
research=function(id){if(!industryEnabled())return sharedResearch(id);if(!state.started||state.ended)return;if(companyResearch(playerFirm(),id)){log(B('상품·운영 연구 완료','商品・運営研究完了'));commit();}};
 const contractsTurn=rivalTurn;
rivalTurn=function(){if(!industryEnabled())return contractsTurn();const eligible=rivalFirms().filter(f=>f.policy.turnDay<state.day&&!f.policy.defeated).map(f=>f.id);contractsTurn();for(const id of eligible){const f=rivalById(id);if(f.policy.defeated)continue;if(f.meta.contract&&f.meta.contract.until<state.day)f.meta.contract=null;
 if(f.account.cash>100000&&f.meta.due-state.day<=10)renewCompanyDebt(f);
 if(f.account.cash>300000){if(!f.meta.contract)companySignSupply(f,f.id==='atlas'?1:0);for(const m of f.machines)if(f.account.cash>200000&&(!m.lease||m.lease.until<state.day))companySignLease(f,m);}
 }};
const contractsBegin=beginMarket;
beginMarket=function(){contractsBegin();if(!industryEconomy()||!state.live)return;for(const f of rivalFirms()){const m=f.ops.market;if(!m||m.companyRules)continue;m.companyRules=true;for(const row of m.rows){const machine=f.machines.find(x=>x.loc===row.loc);if(machine)row.rent=companyRent(f,machine);}m.extra+=f.meta.pendingExpense||0;f.meta.pendingExpense=0;}};

const industryOldQueue=queueEvent;
queueEvent=function(){industryOldQueue();if(industryEnabled()&&state.pending&&inGameSession&&!modalView&&!menuOpen)openModal('event');};
const industryOldStart=startBusiness;
startBusiness=function(){if(industryEnabled()&&eventBlocksClock()&&inGameSession&&!menuOpen){if(!modalView)openModal('event');return;}return industryOldStart();};
// Closing or Escape cannot bypass an unresolved business decision. Manual pause remains unchanged.
const industryOldClose=closeModal;
closeModal=function(){if(industryEnabled()&&modalView==='event'&&eventBlocksClock()&&!state.ended)return;industryOldClose();};
$('modal').addEventListener('cancel',event=>{if(industryEnabled()&&inGameSession&&modalView==='event'&&eventBlocksClock()){event.preventDefault();event.stopImmediatePropagation();}},true);
const industryOldResolve=resolveEvent;
resolveEvent=function(index){industryOldResolve(index);if(industryEnabled()&&!state.pending&&!state.ended&&!state.live&&!livePaused&&!menuOpen)startBusiness();};
