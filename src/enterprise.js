/* Enterprise simulation: additive save schema, independent procurement and customer model. */
const SUPPLIERS=[
 {name:B('지역 도매','地域卸'),factor:.95,days:1,min:40},
 {name:B('공장 직거래','工場直販'),factor:.8,days:2,min:100},
 {name:B('특급 공급','特急供給'),factor:1.12,days:.25,min:20}
];
const enterpriseFresh=()=>({version:1,rng:731293,warehouse:PRODUCTS.map(()=>({qty:0,value:0})),orders:[],nextOrder:1,tech:{quality:0,logistics:0},brand:[15,15,15,15],ads:[0,0,0,0],rivalPrices:[1500,1500,1500,1500],index:1,forecast:3,emergency:true,autoOrder:false,supplier:0,expenseToday:0,expenseDay:1,capital:0,reports:[],ledger:[],lastClosed:0});
function ensureEnterprise(){
 if(!state.enterprise||state.enterprise.version!==1)state.enterprise=enterpriseFresh();
 const e=state.enterprise;
 if(!Array.isArray(e.warehouse)||e.warehouse.length!==PRODUCTS.length||e.warehouse.some(x=>!x||!int(x.qty,0,100000)||!finite(x.value)||x.value<0))e.warehouse=enterpriseFresh().warehouse;
 for(const m of state.machines)ensureSlots(m);
 return e;
}
function ensureSlots(m){
 if(!Array.isArray(m.slots)||m.slots.length!==4||m.slots[0]?.product!==m.product||m.slots.some(s=>!s||!int(s.product,0,PRODUCTS.length-1)||!int(s.stock,0,10000)||!int(s.price,800,4000)||!finite(s.value)||s.value<0)){
  const qty=m.stock;m.slots=Array.from({length:4},(_,i)=>({product:m.product,stock:Math.floor(qty/4)+(i<qty%4?1:0),price:m.price,value:0,label:false}));m.slots.forEach(s=>s.value=s.stock*PRODUCTS[s.product].cost);m.condition=100;
 }
 if(!finite(m.condition))m.condition=100;
 // Existing events may discard or replace inventory. Reconcile the affected machine only.
 const sum=m.slots.reduce((n,s)=>n+s.stock,0);
 if(sum!==m.stock){if(m.stock===0)m.slots.forEach(s=>{s.stock=0;s.value=0;});else{let delta=m.stock-sum;if(delta>0){m.slots[0].stock+=delta;m.slots[0].value+=delta*PRODUCTS[m.slots[0].product].cost;}else for(const s of m.slots){const take=Math.min(s.stock,-delta),unit=s.stock?s.value/s.stock:0;s.stock-=take;s.value-=take*unit;delta+=take;}}}
 return m.slots;
}
function syncMachine(m){m.stock=m.slots.reduce((n,s)=>n+s.stock,0);m.product=m.slots[0].product;m.price=m.slots[0].price;}
function enterpriseRandom(){const e=state.enterprise;e.rng=(Math.imul(e.rng,1664525)+1013904223)>>>0;return e.rng/4294967296;}
const oldFreshEnterprise=fresh;
fresh=()=>{const s=oldFreshEnterprise();s.enterprise=enterpriseFresh();return s;};
ensureEnterprise();
function stockValue(m){ensureSlots(m);return m.slots.reduce((n,s)=>n+s.value,0);}
assets=()=>Math.round(state.cash+totalVault()+state.machines.reduce((n,m)=>n+stockValue(m)+equipment(m)*.7,0)+(state.enterprise?state.enterprise.warehouse.reduce((n,w)=>n+w.value,0)+state.enterprise.orders.reduce((n,o)=>n+o.value,0)+state.enterprise.capital*.5:0)-state.bank.principal-state.bank.arrears);
function ledger(kind,amount){const e=state.enterprise;e.ledger.unshift({day:state.day,kind,amount:Math.round(amount)});e.ledger=e.ledger.slice(0,60);}
function warehouseCapacity(){return 1000+state.enterprise.tech.logistics*500;}
function procurementPrice(p,supplier){return Math.round(PRODUCTS[p].cost*SUPPLIERS[supplier].factor*state.enterprise.index);}
function orderGoods(p,qty,supplier=state.enterprise.supplier){
 const e=state.enterprise;if(!state.started||state.ended||!int(p,0,PRODUCTS.length-1)||!int(supplier,0,2)||!int(qty,1,1000)||qty<SUPPLIERS[supplier].min||state.research.products<PRODUCTS[p].unlock)return false;
 const value=procurementPrice(p,supplier)*qty,used=e.warehouse.reduce((n,w)=>n+w.qty,0)+e.orders.reduce((n,o)=>n+o.qty,0);
 if(state.cash<value||used+qty>warehouseCapacity())return false;
 const duration=DAY_MS*SUPPLIERS[supplier].days/(1+e.tech.logistics*.12);
 state.cash-=value;e.orders.push({id:e.nextOrder++,product:p,qty,value,remaining:duration,duration});ledger('purchase',-value);save();return true;
}
function receiveOrders(ms){const e=state.enterprise;for(const o of e.orders)o.remaining-=ms;for(const o of e.orders.filter(o=>o.remaining<=0)){e.warehouse[o.product].qty+=o.qty;e.warehouse[o.product].value+=o.value;ledger('delivery',o.qty);}e.orders=e.orders.filter(o=>o.remaining>0);}
function restockMachine(m){
 const e=state.enterprise;ensureSlots(m);let moved=0;
 for(const s of m.slots){let need=Math.max(0,Math.floor(capacity(m)/4)-s.stock),w=e.warehouse[s.product];const n=Math.min(need,w.qty),cost=w.qty?n*w.value/w.qty:0;
  w.qty-=n;w.value=Math.max(0,w.value-cost);s.stock+=n;s.value+=cost;need-=n;moved+=n;
  if(need&&e.emergency){const unit=Math.round(PRODUCTS[s.product].cost*e.index*inflationFactor()*1.25),q=Math.min(need,Math.max(0,Math.floor(state.cash/unit)));state.cash-=q*unit;s.stock+=q;s.value+=q*unit;moved+=q;if(q)ledger('emergency',-q*unit);}
 }syncMachine(m);return moved;
}
function hasRestock(m){ensureSlots(m);return m.slots.some(s=>s.stock<Math.floor(capacity(m)/4)&&(state.enterprise.warehouse[s.product].qty>0||(state.enterprise.emergency&&state.cash>=PRODUCTS[s.product].cost*state.enterprise.index*inflationFactor()*1.25)));}
const oldDispatchEnterprise=dispatch;
dispatch=function(type,loc,staff=false){
 const m=machine(loc);if(type!=='restock')return oldDispatchEnterprise(type,loc,staff);
 if(!m||!state.started||state.ended||!hasRestock(m)||state.jobs.some(j=>j.loc===loc&&j.type===type)||(!staff&&state.jobs.some(j=>!j.staff)))return false;
 const duration=((staff?4500:6000)+Math.abs(LOCATIONS[loc].map-(staff?0:state.playerMap))*1200)/(1+state.enterprise.tech.logistics*.25);
 state.jobs.push({type,loc,staff,duration,remaining:duration});if(!staff){save();render();}return true;
};
advanceJobs=function(ms){receiveOrders(ms);for(const j of state.jobs)j.remaining-=ms;const done=state.jobs.filter(j=>j.remaining<=0);state.jobs=state.jobs.filter(j=>j.remaining>0&&machine(j.loc));for(const j of done){const m=machine(j.loc);if(!m)continue;if(j.type==='collect'){ledger('collection',m.vault);state.cash+=m.vault;m.vault=0;}else restockMachine(m);if(!j.staff)state.playerMap=LOCATIONS[j.loc].map;}assignStaff();};
// Potential visits are independent of chosen prices; each customer makes a purchase decision.
demand=function(m){const l=LOCATIONS[m.loc],w=WEATHER[state.weather],ss=sceneSeason();let n=l.traffic*w.all*(l.kind==='park'?w.park:1)*(weekend()?({office:.55,campus:.65,park:1.3,home:1.15,station:.9}[l.kind]):1)*(1+(m.level-1)*.15);if(l.map===3)n*=[1.2,1.5,.9,.65][ss];for(const x of state.effects)if(x.type==='demand'&&(x.kind==='all'||x.kind===l.kind||x.kind==='target'&&x.loc===m.loc))n*=x.factor;return Math.min(4800,n);};
function customerPurchase(m,r,i){
 ensureSlots(m);const e=state.enterprise,map=LOCATIONS[m.loc].map,kind=LOCATIONS[m.loc].kind;
 r.lost??={stock:0,price:0,competition:0,condition:0};r.products??=PRODUCTS.map(()=>({sold:0,revenue:0,cost:0}));
 if(m.condition<25&&enterpriseRandom()<.5){r.lost.condition++;return;}
 const available=m.slots.filter(s=>s.stock>0);if(!available.length){r.lost.stock++;return;}
 const type=Math.floor(enterpriseRandom()*3),sensitivity=[2.3,1.5,.9][type],seasonIndex=sceneSeason();
 const scores=available.map(s=>{const p=PRODUCTS[s.product],ratio=campaignPrice(s,map)/p.price;let fit=(p.fit[kind]||1)*(type===0&&s.product===0?1.25:type===1&&s.product===1?1.35:type===2&&s.product===3?1.3:1);
  if(s.product===4)fit*=[1,2,.8,.35][seasonIndex];if(s.product===5)fit*=[1,.45,1.3,2][seasonIndex];
  return fit*Math.exp((1-ratio)*sensitivity)*(1+e.tech.quality*.09+(s.label?e.brand[map]/140:0))*(.65+state.reputation/200)*(.5+m.condition/200);
 });
 const total=scores.reduce((a,b)=>a+b,0),best=Math.max(...scores),rivals=state.npc.owned.filter(id=>LOCATIONS[id].map===map).length;
 const localOwn=state.machines.filter(x=>LOCATIONS[x.loc].map===map).length;
 const competitor=rivalCompetition(map)+(localOwn-1)*.04;
 const acceptance=Math.min(.96,.83*best/(1+competitor));
 if(enterpriseRandom()>acceptance){r.lost[competitor>.1&&enterpriseRandom()<.5?'competition':'price']++;return;}
 let pick=enterpriseRandom()*total,chosen=available[available.length-1];for(let k=0;k<available.length;k++){pick-=scores[k];if(pick<=0){chosen=available[k];break;}}
 const unit=chosen.value/chosen.stock;chosen.stock--;chosen.value=Math.max(0,chosen.value-unit);m.total++;const paid=campaignPrice(chosen,map);m.vault+=paid;m.condition=Math.max(0,m.condition-.045);state.totalSold++;r.served++;r.revenue+=paid;r.cost+=unit;r.bought.push({i,price:paid});const stat=r.products[chosen.product];stat.sold++;stat.revenue+=paid;stat.cost+=unit;syncMachine(m);
}
advanceBusiness=function(ms){if(!state.live||!finite(ms)||ms<0)return;ensureEnterprise();let left=Math.min(ms,DAY_MS-state.live.elapsed);while(left>0&&state.live){const step=Math.min(200,left),l=state.live;l.elapsed+=step;l.payroll=(l.payroll||0)+staffSalary()*step/DAY_MS;left-=step;for(const r of l.rows){const m=machine(r.loc);while(r.attempted<r.n&&saleTime(r,r.attempted)<=l.elapsed){const i=r.attempted++;if(m)customerPurchase(m,r,i);}}advanceJobs(step);if(l.elapsed>=DAY_MS){finishBusiness();return;}}save();refreshLiveNumbers();};
const oldStartEnterprise=startBusiness;
startBusiness=function(){ensureEnterprise();if(state.enterprise.expenseDay!==state.day){state.enterprise.expenseDay=state.day;state.enterprise.expenseToday=0;}oldStartEnterprise();};
function enterpriseDailyCost(){const e=state.enterprise;return e?1000+500*(e.tech.quality+e.tech.logistics):0;}
const oldWorldEventsEnterprise=worldEvents;
worldEvents=function(){const e=state.enterprise;state.weather=e.forecast??0;e.forecast=Math.floor(enterpriseRandom()*4);if(sceneSeason()===3&&e.forecast===1)e.forecast=3;e.index=Math.max(.75,Math.min(1.4,e.index+(enterpriseRandom()-.5)*.08));for(let map=0;map<4;map++){e.brand[map]=Math.max(5,e.brand[map]-.3);if(e.ads[map]>0){e.ads[map]--;e.brand[map]=Math.min(100,e.brand[map]+4);}const pressure=state.machines.filter(m=>LOCATIONS[m.loc].map===map).length;/* Rival prices are set by its funded strategy. */}oldWorldEventsEnterprise();if(e.autoOrder)for(let p=0;p<PRODUCTS.length;p++){if(!state.machines.some(m=>m.slots?.some(s=>s.product===p)))continue;if(e.warehouse[p].qty<40&&!e.orders.some(o=>o.product===p))orderGoods(p,Math.max(100,SUPPLIERS[e.supplier].min));}};
finishBusiness=function(){
 const l=state.live;if(!l||l.elapsed<DAY_MS||l.settled||l.day!==state.day)return;
 settleRivalOperations();l.settled=true;const e=state.enterprise,day=l.day,t=liveTotals();
 const snapshot=l.rows.map(r=>({loc:r.loc,sold:r.served,revenue:r.revenue,cost:r.cost,rent:r.rent,lost:r.lost||{},products:r.products||[]}));
 const rent=l.rows.reduce((n,r)=>n+r.rent,0),payroll=Math.round(l.payroll||0),interest=Math.round(state.bank.principal*interestRate()),overhead=enterpriseDailyCost();
 state.cash-=rent+payroll+overhead;
 if(state.cash>=interest+state.bank.arrears){state.cash-=interest+state.bank.arrears;state.bank.arrears=0;state.bank.missed=0;}else{state.bank.arrears+=interest;if(interest||state.bank.arrears)state.bank.missed++;}
 const failures=l.rows.reduce((n,r)=>n+(r.lost?.stock||0)+(r.lost?.condition||0),0),visits=l.rows.reduce((n,r)=>n+r.attempted,0);
 state.reputation=Math.max(0,Math.min(100,state.reputation+(visits?(failures/visits>.15?-1:1):0)));
 const beforeIncidents=assets();resolveComplaints();achievements();
 const extraExpense=e.expenseToday+beforeIncidents-assets(),net=t.revenue-t.cost-rent-payroll-interest-overhead-extraExpense;
 state.profit=net;state.totalProfit+=net;state.history.push(net);state.history=state.history.slice(-90);
 state.report={day,...t,rent,net,payroll,interest,overhead,extraExpense,rows:snapshot.map(r=>({loc:r.loc,n:r.sold,revenue:r.revenue,out:(r.lost.stock||0)>0}))};
 state.live=null;state.effects=state.effects.map(x=>({...x,remaining:x.remaining-1})).filter(x=>x.remaining>0);
 ensureRivalry().pendingProfit=state.enterprise.operations.lastProfit;e.lastClosed=day;e.reports.unshift({day,revenue:t.revenue,net,cash:state.cash,extra:extraExpense,overhead,rows:snapshot});e.reports=e.reports.slice(0,60);
 log(B(`${day}일 결산 · ${t.sold}개 판매 · 순이익 ${money(net)}`,`${day}日目決算・${t.sold}本販売・純利益 ${money(net)}`),day);
 if(checkEnding(true))return;
 state.day++;e.expenseDay=state.day;e.expenseToday=0;const beforeEvents=assets();worldEvents();e.expenseToday+=beforeEvents-assets();
 if(checkEnding())return;save();render();toast(B(`${day}일 결산 완료`,`${day}日目の決算完了`));
 if(!modalView&&!menuOpen&&!livePaused)startBusiness();
};
function enterpriseExpense(amount,kind,capital=false){state.cash-=amount;if(capital)state.enterprise.capital+=amount;else state.enterprise.expenseToday+=amount;ledger(kind,-amount);}
function enterpriseAction(action,p){const e=state.enterprise;if(!state.started||state.ended)return;const m=machine(selected);
 if(action==='order'){if(!orderGoods(Number(p),Number($('order-qty').value)))toast(B('자금·창고 용량·최소 발주 수량·연구 조건을 확인해 주세요.','資金・倉庫容量・最低発注数・研究条件を確認してください。'));}
 if(action==='tech'&&['quality','logistics'].includes(p)){const level=e.tech[p],cost=150000*(level+1);if(level<3&&state.cash>=cost){enterpriseExpense(cost,'investment',true);e.tech[p]++;}}
 if(action==='ad'){const map=Number(p);if(int(map,0,3)&&e.ads[map]===0&&state.cash>=25000){enterpriseExpense(25000,'advertising');e.ads[map]=5;e.brand[map]=Math.min(100,e.brand[map]+5);}}
 if(action==='repair'&&m&&m.condition<100&&state.cash>=15000){enterpriseExpense(15000,'maintenance');m.condition=100;}
 if(action==='label'&&m&&e.tech.quality>=2){const s=m.slots[Number(p)];if(s)s.label=!s.label;}
 if(action==='price'&&m){const [slot,delta]=p.split(':').map(Number);if(int(slot,0,3)&&[-100,100].includes(delta)){m.slots[slot].price=Math.max(800,Math.min(4000,m.slots[slot].price+delta));syncMachine(m);}}
 save();render();
}
switchProduct=function(id){enterpriseSlotProduct(0,id);};
function enterpriseSlotProduct(slot,id){const m=machine(selected);if(!m||state.ended||!state.started||!int(slot,0,3)||!int(id,0,PRODUCTS.length-1)||PRODUCTS[id].unlock>state.research.products)return;const s=m.slots[slot];if(s.product===id)return;const w=state.enterprise.warehouse[s.product];if(state.enterprise.warehouse.reduce((n,x)=>n+x.qty,0)+state.enterprise.orders.reduce((n,x)=>n+x.qty,0)+s.stock>warehouseCapacity()){toast(B('창고 공간을 확보해 주세요.','倉庫の空きを確保してください。'));renderEnterprise();return;}w.qty+=s.stock;w.value+=s.value;s.product=id;s.stock=0;s.value=0;s.price=PRODUCTS[id].price;s.label=false;syncMachine(m);save();render();}
let enterpriseTab='overview',enterpriseUiAt=0;
const ENTERPRISE_TABS=[['overview',B('경영 현황','経営状況')],['supply',B('발주 · 창고','発注・倉庫')],['market',B('시장 · 브랜드','市場・ブランド')],['research',B('운영 투자','運営投資')],['reports',B('손익 분석','損益分析')]];
const enterpriseRoot=document.createElement('section');enterpriseRoot.id='enterprise';enterpriseRoot.className='panel enterprise';document.querySelector('.layout').before(enterpriseRoot);
const oldRenderWorldEnterprise=renderWorld;renderWorld=function(){oldRenderWorldEnterprise();ensureEnterprise();renderEnterprise(false);};
const oldManageEnterprise=renderManage;
renderManage=function(){const m=machine(selected);if(!m){oldManageEnterprise();return;}ensureSlots(m);$('manage-title').textContent=tr(LOCATIONS[selected].name);$('manage-tag').textContent=T('4슬롯 자판기','4スロット自販機');const e=state.enterprise,locked=!state.started||state.ended;
 const html=`<p class="helper">${T('슬롯별 상품·가격을 설정하세요. 상품 교체 시 재고는 창고로 돌아갑니다.','スロットごとに商品と価格を設定。商品変更時の在庫は倉庫に戻ります。')}</p>${m.slots.map((s,i)=>`<div class="slot-card" data-slot-card="${i}"><label for="slot-${i}">${T('진열','陳列')} ${i+1} · ${s.stock}/${Math.floor(capacity(m)/4)}</label><select class="full" id="slot-${i}" data-slot="${i}" ${disabled(locked)}>${PRODUCTS.map((p,id)=>`<option value="${id}" ${s.product===id?'selected':''} ${disabled(state.research.products<p.unlock)}>${tr(p.name)}${state.research.products<p.unlock?' · Lv.'+p.unlock:''}</option>`).join('')}</select><div class="price-controls"><button data-enterprise="price" data-param="${i}:-100" ${disabled(locked||s.price<=800)}>−</button><strong>${money(s.price)}</strong><button data-enterprise="price" data-param="${i}:100" ${disabled(locked||s.price>=4000)}>＋</button></div><small>${T('현재 결제 가격','現在の支払価格')} ${money(campaignPrice(s,LOCATIONS[selected].map))}<br>${T('재고 평균 원가','在庫平均原価')} ${money(s.stock?s.value/s.stock:PRODUCTS[s.product].cost)} · ${T('창고','倉庫')} ${e.warehouse[s.product].qty}</small><button class="small full" data-enterprise="label" data-param="${i}" ${disabled(locked||e.tech.quality<2)}>${s.label?T('자체 브랜드 적용 중','自社ブランド適用中'):T('자체 브랜드 · 품질 Lv.2','自社ブランド・品質Lv.2')}</button></div>`).join('')}${row(T('기기 상태','機械の状態'),Math.round(m.condition)+'%')}<button class="small full" data-enterprise="repair" ${disabled(locked||m.condition>=100||state.cash<15000)}>${T('예방 정비 · $15','予防整備・$15')}</button><p class="helper">${T('상태 25% 미만이면 구매 실패가 늘어납니다.','状態25%未満では購入失敗が増えます。')}</p>${row(T('보관 매출','保管売上'),money(m.vault))}<button class="primary full" data-job="collect" data-loc="${m.loc}" ${disabled(locked||m.vault<=0||state.jobs.some(j=>!j.staff))}>${T('직접 회수하러 이동','自分で回収に向かう')}</button><button class="full" data-action="refill" id="refill-button" ${disabled(locked||!hasRestock(m)||state.jobs.some(j=>!j.staff))}>${T('창고에서 보충하러 이동','倉庫から補充に向かう')}</button><p class="helper">${e.emergency?T('창고 부족분은 25% 비싼 긴급 매입으로 보충합니다.','倉庫の不足分は25%割高の緊急仕入れで補充します。'):T('창고 재고만 사용합니다. 발주 후 입고를 기다리세요.','倉庫在庫のみ使用。発注後、入庫を待ちましょう。')}</p><button class="full" data-action="upgrade" ${disabled(locked||m.level>=3||state.cash<upgradeCost(m))}>${T('용량 확장','容量拡張')} Lv.${m.level}/3 · ${money(upgradeCost(m))}</button><button class="small full" data-action="sell" ${disabled(locked||state.machines.length<=1)}>${T('기기 매각','機械売却')}</button>`;patchPanel($('manage'),html);
};
function enterpriseTable(headers,rows){return `<div class="enterprise-scroll"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;}
function renderEnterprise(force=true){if(!state.enterprise||!$('enterprise'))return;if(!force&&$('enterprise').childElementCount&&performance.now()-enterpriseUiAt<400)return;enterpriseUiAt=performance.now();const e=state.enterprise,locked=!state.started||state.ended,last=e.reports[0],live=liveTotals();let body='';
 if(enterpriseTab==='overview'){
  const lost=state.live?.rows.reduce((n,r)=>n+Object.values(r.lost||{}).reduce((a,b)=>a+b,0),0)||0;
  body=`<div class="enterprise-metrics">${[[T('오늘 매출','本日売上'),money(live.revenue)],[T('오늘 매출총이익','本日売上総利益'),money(live.revenue-live.cost)],[T('최근 순이익','直近純利益'),money(last?.net||0)],[T('구매 이탈','購入離脱'),lost]].map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('')}</div><div class="enterprise-columns"><div><h3>${T('이번 경영의 흐름','経営の流れ')}</h3><p>${T('① 도매 발주 → ② 창고 입고 → ③ 기기 보충 → ④ 고객 구매 → ⑤ 매출 회수','①卸発注 → ②倉庫入庫 → ③機械補充 → ④顧客購入 → ⑤売上回収')}</p><p>${T('싼 공급처는 오래 걸립니다. 상품 연구로 품목을 열고, 상권에 맞춰 진열하세요. 창고·운송 중 재고도 자산입니다.','安い仕入先は納期が長くなります。商品研究で品目を解放し、商圏に合わせて陳列。倉庫・輸送中の在庫も資産です。')}</p></div><div><h3>${T('운영 알림','運営通知')}</h3><p>${T('내일 예보','明日の予報')}: ${tr(WEATHER[e.forecast??0].name)}<br>${T('품절 슬롯','品切れスロット')} ${state.machines.reduce((n,m)=>n+m.slots.filter(s=>!s.stock).length,0)} · ${T('입고 대기','入庫待ち')} ${e.orders.length}<br>${T('정비 필요 기기','整備が必要な機械')} ${state.machines.filter(m=>m.condition<40).length}<br>${T('본사 일 유지비','本社の一日維持費')} ${money(enterpriseDailyCost())}</p></div></div>`;
 }
 if(enterpriseTab==='supply'){
  const used=e.warehouse.reduce((n,w)=>n+w.qty,0);body=`<div class="enterprise-toolbar"><label>${T('공급 계약','仕入契約')} <select id="supplier">${SUPPLIERS.map((s,i)=>`<option value="${i}" ${e.supplier===i?'selected':''}>${tr(s.name)} · ${s.days}${T('일','日')} · ${T('최소','最低')}${s.min}</option>`).join('')}</select></label><label>${T('발주 수량','発注数量')} <select id="order-qty"><option>40</option><option selected>100</option><option>200</option><option>500</option></select></label><label><input id="emergency" type="checkbox" ${e.emergency?'checked':''}>${T('긴급 매입 허용 (+25%)','緊急仕入れを許可 (+25%)')}</label><label><input id="auto-order" type="checkbox" ${e.autoOrder?'checked':''}>${T('자동 발주: 하루 시작, 40개 미만 → 100개','自動発注：毎朝40本未満→100本')}</label></div><p>${T('창고 재고','倉庫在庫')} ${used}/${warehouseCapacity()} · ${T('발주 시 현금 지불, 입고 후 보충 가능','発注時に現金払い、入庫後に補充可能')} · ${T('원가 지수','原価指数')} ${Math.round(e.index*100)}</p>`+enterpriseTable([T('상품','商品'),T('창고','倉庫'),T('개당 매입가','仕入単価'),T('발주','発注')],PRODUCTS.map((p,i)=>`<tr><td>${tr(p.name)}</td><td>${e.warehouse[i].qty}</td><td>${money(procurementPrice(i,e.supplier))}</td><td><button class="small" data-enterprise="order" data-param="${i}" ${disabled(locked||state.research.products<p.unlock)}>${T('발주','発注')}${state.research.products<p.unlock?' · Lv.'+p.unlock:''}</button></td></tr>`))+`<h3>${T('운송 중','輸送中')}</h3><div class="order-list">${e.orders.length?e.orders.map(o=>`<p>${tr(PRODUCTS[o.product].name)} × ${o.qty} · ${T('도착까지','到着まで')} ${(o.remaining/DAY_MS).toFixed(2)}${T('영업일','営業日')} <progress max="${o.duration}" value="${o.duration-o.remaining}"></progress></p>`).join(''):T('대기 중인 발주가 없습니다.','発注待ちはありません。')}</div>`;
 }
 if(enterpriseTab==='market')body=`<p>${T('가격에 민감한 고객·편의를 찾는 고객·품질을 중시하는 고객이 상품을 비교합니다. 같은 상권의 경쟁사 가격과 자사 기기 간 경쟁도 구매에 영향을 줍니다.','価格重視・利便性重視・品質重視の顧客が商品を比較。同じ商圏の競合価格と自社店舗間の競争も購入に影響します。')}</p>`+enterpriseTable([T('상권','商圏'),T('자사 / 경쟁사','自社／競合'),T('경쟁 기준 가격','競合基準価格'),T('브랜드 인지도','ブランド認知度'),T('광고','広告')],MAPS.map((map,i)=>`<tr><td>${tr(map.name)}</td><td>${state.machines.filter(m=>LOCATIONS[m.loc].map===i).length} / ${state.npc.owned.filter(id=>LOCATIONS[id].map===i).length}</td><td>${money(e.rivalPrices[i])}</td><td>${Math.round(e.brand[i])}/100</td><td><button class="small" data-enterprise="ad" data-param="${i}" ${disabled(locked||e.ads[i]>0||state.cash<25000)}>${e.ads[i]?e.ads[i]+T('일 진행 중','日実施中'):T('5일 광고 · $25','5日広告・$25')}</button></td></tr>`))+`<p>${T('광고는 인지도를 높이고, 자체 브랜드를 사용하는 슬롯의 구매 확률을 개선합니다. 품질 투자 Lv.2에서 자체 브랜드를 사용할 수 있습니다.','広告は認知度を上げ、自社ブランドの購入確率を改善します。品質投資Lv.2で自社ブランドが使用できます。')}</p>`;
 if(enterpriseTab==='research')body=`<div class="enterprise-columns">${['quality','logistics'].map(k=>`<div><h3>${k==='quality'?T('품질 · 자체 브랜드','品質・自社ブランド'):T('물류 시스템','物流システム')} Lv.${e.tech[k]}/3</h3><p>${k==='quality'?T('단계마다 구매 매력 +9%. Lv.2부터 자체 브랜드 사용.','各段階で購買魅力+9%。Lv.2から自社ブランドを使用。'):T('단계마다 창고 +500개, 배송·보충 시간 단축.','各段階で倉庫+500本、配送・補充時間を短縮。')}</p><button data-enterprise="tech" data-param="${k}" ${disabled(locked||e.tech[k]>=3||state.cash<150000*(e.tech[k]+1))}>${e.tech[k]>=3?T('투자 완료','投資完了'):T('투자 · ','投資・')+money(150000*(e.tech[k]+1))}</button><p>${T('투자 단계당 본사 유지비 +$0.50/일. 투자금 50%를 자산으로 평가합니다.','投資1段階につき本社維持費+$0.50/日。投資額の50%を資産評価。')}</p></div>`).join('')}</div><p>${T('상품 해금은 기존 본사 · 연구 개발에서 진행합니다.','商品の解放は本社・研究開発で進めます。')}</p>`;
 if(enterpriseTab==='rivalry')body=competitionBody();
 if(enterpriseTab==='reports'){
  const rows=state.live?.rows||[],loss=r=>Object.entries(r.lost||{}).map(([k,v])=>( {stock:T('품절','品切れ'),price:T('가격·취향','価格・好み'),competition:T('경쟁','競争'),condition:T('기기 상태','機械状態')}[k])+': '+v).join(' · ');
  body=`<h3>${T('오늘 기기별 영업','本日の機械別営業')}</h3>`+enterpriseTable([T('입지','立地'),T('판매 / 방문','販売／訪問'),T('매출','売上'),T('매출총이익','売上総利益'),T('이탈 원인','離脱理由')],rows.map(r=>`<tr><td>${tr(LOCATIONS[r.loc].short)}</td><td>${r.served}/${r.attempted}</td><td>${money(r.revenue)}</td><td>${money(r.revenue-r.cost)}</td><td>${loss(r)||'—'}</td></tr>`))+`<h3>${T('오늘 상품별 수익성','本日の商品別収益')}</h3>`+enterpriseTable([T('상품','商品'),T('판매','販売'),T('매출','売上'),T('매출총이익','売上総利益')],PRODUCTS.map((p,id)=>{const totals=rows.reduce((a,r)=>{const x=r.products?.[id];if(x){a.sold+=x.sold;a.revenue+=x.revenue;a.cost+=x.cost;}return a;},{sold:0,revenue:0,cost:0});return `<tr><td>${tr(p.name)}</td><td>${totals.sold}</td><td>${money(totals.revenue)}</td><td>${money(totals.revenue-totals.cost)}</td></tr>`;}))+`<h3>${T('최근 결산 · 최대 60일','最近の決算・最大60日')}</h3>`+enterpriseTable(['DAY',T('매출','売上'),T('순이익','純利益'),T('결산 후 현금','決算後現金')],e.reports.slice(0,14).map(r=>`<tr><td>${r.day}</td><td>${money(r.revenue)}</td><td class="${r.net<0?'negative':''}">${money(r.net)}</td><td>${money(r.cash)}</td></tr>`))+`<p>${T('순이익 = 매출 − 실제 매입 원가 − 운영비 − 인건비 − 이자 − 본사 유지비 − 광고·정비·연구·이벤트 순비용. 발주·투자·대출은 현금과 이익에 다르게 반영됩니다.','純利益＝売上−実際の仕入原価−営業費−人件費−利息−本社維持費−広告・整備・研究・イベント純費用。発注・投資・借入は現金と利益に異なる影響があります。')}</p><h3>${T('최근 자금 이동','最近の資金移動')}</h3>`+enterpriseTable(['DAY',T('항목','項目'),T('금액 / 입고 수량','金額／入庫数量')],e.ledger.slice(0,10).map(x=>`<tr><td>${x.day}</td><td>${({purchase:T('도매 발주','卸発注'),delivery:T('창고 입고','倉庫入庫'),emergency:T('긴급 매입','緊急仕入れ'),collection:T('매출 회수','売上回収'),investment:T('운영 투자','運営投資'),advertising:T('광고','広告'),maintenance:T('정비','整備')}[x.kind]||x.kind)}</td><td>${x.kind==='delivery'?x.amount:money(x.amount)}</td></tr>`));
 }
 const html=`<div class="enterprise-head"><div><span class="eyebrow">HAN-KAN · ENTERPRISE</span><h2>${T('회사 경영실','会社経営室')}</h2></div><span class="tag">${T('시장 · 공급망 · 브랜드','市場・供給網・ブランド')}</span></div><nav class="enterprise-tabs" aria-label="${T('경영 메뉴','経営メニュー')}">${ENTERPRISE_TABS.map(([id,name])=>`<button class="${enterpriseTab===id?'primary':''}" data-enterprise-tab="${id}" aria-pressed="${enterpriseTab===id}">${tr(name)}</button>`).join('')}</nav><div class="enterprise-body">${body}</div>`;
 patchPanel($('enterprise'),html);
}
document.addEventListener('click',event=>{const tab=event.target.closest('[data-enterprise-tab]');if(tab){enterpriseTab=tab.dataset.enterpriseTab;renderEnterprise();}const button=event.target.closest('[data-enterprise]');if(button)enterpriseAction(button.dataset.enterprise,button.dataset.param);});
document.addEventListener('change',event=>{const el=event.target;if(el.dataset.slot!==undefined)enterpriseSlotProduct(Number(el.dataset.slot),Number(el.value));if(el.id==='supplier'){state.enterprise.supplier=Number(el.value);save();renderEnterprise();}if(el.id==='emergency'||el.id==='auto-order'){state.enterprise[el.id==='emergency'?'emergency':'autoOrder']=el.checked;save();render();}});
function validEnterprise(e,s){
 const nonnegative=x=>finite(x)&&x>=0;
 return e.version===1&&(!e.operations||validOperations(e.operations,s))&&(!e.rivalry||validRivalry(e.rivalry))&&int(e.rng,0,4294967295)&&Array.isArray(e.warehouse)&&e.warehouse.length===PRODUCTS.length&&e.warehouse.every(w=>w&&int(w.qty,0,100000)&&nonnegative(w.value))&&Array.isArray(e.orders)&&e.orders.length<=1000&&e.orders.every(o=>int(o.id,1,1e9)&&int(o.product,0,PRODUCTS.length-1)&&int(o.qty,1,1000)&&nonnegative(o.value)&&finite(o.remaining)&&o.remaining>0&&finite(o.duration)&&o.duration>0)&&int(e.nextOrder,1,1e9)&&e.tech&&['quality','logistics'].every(k=>int(e.tech[k],0,3))&&['brand','ads','rivalPrices'].every(k=>Array.isArray(e[k])&&e[k].length===4&&e[k].every(nonnegative))&&finite(e.index)&&e.index>=.75&&e.index<=1.4&&typeof e.emergency==='boolean'&&typeof e.autoOrder==='boolean'&&int(e.supplier,0,2)&&finite(e.expenseToday)&&int(e.expenseDay,1,1000000)&&nonnegative(e.capital)&&int(e.lastClosed,0,1000000)&&Array.isArray(e.reports)&&e.reports.length<=60&&e.reports.every(r=>int(r.day,1,1000000)&&finite(r.net)&&finite(r.cash)&&nonnegative(r.revenue)&&Array.isArray(r.rows))&&Array.isArray(e.ledger)&&e.ledger.length<=60&&e.ledger.every(x=>int(x.day,1,1000000)&&['purchase','delivery','emergency','collection','investment','advertising','maintenance'].includes(x.kind)&&finite(x.amount))&&s.machines.every(m=>!m.slots||(Array.isArray(m.slots)&&m.slots.length===4&&m.slots.every(x=>int(x.product,0,PRODUCTS.length-1)&&int(x.stock,0,10000)&&int(x.price,800,4000)&&nonnegative(x.value)&&typeof x.label==='boolean')&&m.slots.reduce((n,x)=>n+x.stock,0)===m.stock&&finite(m.condition)&&m.condition>=0&&m.condition<=100));
}
function rivalOpportunity(l){const price=state.enterprise.rivalPrices[l.map],visits=demand({loc:l.id,level:1});const share=1/(1+state.machines.filter(m=>LOCATIONS[m.loc].map===l.map).length*.18);return (visits*.7*share*(price-PRODUCTS[0].cost*state.enterprise.index)-l.rent)/l.cost;}
function rivalDailyProfit(){return Math.round(state.npc.owned.reduce((n,id)=>n+rivalOpportunity(LOCATIONS[id])*LOCATIONS[id].cost-2500,0)-15000*(1+state.difficulty*.15));}
assignStaff=function(){for(const type of ['collect','restock']){let free=state.staff[type]-state.jobs.filter(j=>j.staff&&j.type===type).length;const candidates=[...state.machines].sort((a,b)=>type==='collect'?b.vault-a.vault:a.stock/capacity(a)-b.stock/capacity(b));for(const m of candidates){if(free<=0)break;ensureSlots(m);const needs=type==='collect'?m.vault>=10000:m.stock<=capacity(m)*.35||m.slots.some(s=>s.stock===0);if(needs&&dispatch(type,m.loc,true))free--;}}};
const oldDrawModalEnterprise=drawModal;
drawModal=function(){oldDrawModalEnterprise();if(modalView==='help'){$('modal-body').innerHTML=`<div class="eyebrow">ENTERPRISE GUIDE</div><h2>${T('경영 전략의 기본','経営戦略の基本')}</h2><p>${T('자판기는 4개 슬롯으로 구성됩니다. 상품 연구로 음료를 해금하고, 슬롯마다 다른 상품과 가격을 설정하세요. 슬롯 변경 시 기존 재고는 창고로 반환됩니다.','自販機は4スロット構成。商品研究で飲料を解放し、各スロットの商品と価格を設定。商品変更時の在庫は倉庫に戻ります。')}</p><p>${T('발주·창고에서 공급처와 수량을 선택하세요. 공장 직거래는 저렴하지만 2일이 걸립니다. 입고 후 직접 또는 직원이 기기를 보충합니다. 긴급 매입을 켜면 부족분은 25% 비싸게 즉시 매입합니다.','発注・倉庫で仕入先と数量を選択。工場直販は安い代わりに2日かかります。入庫後、自分やスタッフが機械に補充。緊急仕入れが有効なら不足分を25%割高で即時購入します。')}</p><p>${T('품질 투자 Lv.2로 자체 브랜드를 열고 상권별 광고로 인지도를 높이세요. 물류 투자는 창고 용량과 배송 효율을 높입니다. 기기 상태가 나빠지면 정비가 필요합니다.','品質投資Lv.2で自社ブランドを解放し、商圏別広告で認知度を向上。物流投資は倉庫容量と配送効率を改善。機械の状態が悪化したら整備しましょう。')}</p><p>${T('손익 분석에서 상품별 마진과 품절·가격·경쟁에 의한 구매 이탈을 확인하세요. 매출은 기기에 보관되며 회수해야 현금이 됩니다. 창고와 운송 중 재고는 자산이고, 판매할 때 실제 매입 원가가 비용에 반영됩니다.','損益分析で商品別利益と品切れ・価格・競争による離脱を確認。売上は回収して初めて現金になります。倉庫・輸送中の在庫は資産で、販売時に実際の仕入原価を費用計上します。')}</p><p>${T('1배속에서 하루 3분. 일시정지·메뉴·다른 탭에서는 시간이 멈춥니다. 기존 저장의 날짜와 현금·재고는 유지됩니다.','1倍速で一日3分。一時停止・メニュー・他のタブでは時間が停止。既存セーブの日付・現金・在庫は引き継がれます。')}</p>`+buttons(closeButton());}};
// Existing decisions now enter the daily income statement as well as the cash balance.
function trackDecision(fn){return function(...args){const before=assets(),result=fn(...args);state.enterprise.expenseToday+=before-assets();save();return result;};}
respondComplaint=trackDecision(respondComplaint);
resolveEvent=trackDecision(resolveEvent);
worldPr=trackDecision(worldPr);
research=trackDecision(research);
