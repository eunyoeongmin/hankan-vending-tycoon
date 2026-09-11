function beState(){return state.businessEvents??={version:1,next:1,lastDay:0,nextOffer:state.day+3,pending:null,active:[],tasks:[],history:[],followups:[],cooldown:{}};}
function beFirm(id){return allFirms().find(f=>f.id===id&&!f.policy?.defeated);}
function beSelect(xs,seed){return xs.length?xs[seed%xs.length]:null;}
function beTarget(key,seed=0,forcedLoc=null){
 if(!beEnabled()||!state.machines.length)return null;
 const f=playerFirm(),r=refFirm(f),workers=chainFirm(f).staff,m=beSelect(f.machines.filter(m=>forcedLoc===null||m.loc===forcedLoc),seed);if(!m)return null;
 const hub=refSite(f,m.ref.hub),slots=m.slots.filter(s=>s.stock>0),slot=beSelect(slots,seed)||m.slots[0],product=slot.product;
 const q={key,loc:m.loc,map:LOCATIONS[m.loc].map,hub:hub.id,product,sku:refSKU(slot.sku)?slot.sku:'aqua:'+product,worker:null,job:null,project:null,contract:null,rival:null,supplier:null,batch:null,otherhub:null,note:null,to:null,price:0};
 const rivals=rivalFirms().filter(v=>!v.policy.defeated&&v.machines.some(n=>LOCATIONS[n.loc].map===q.map));q.rival=beSelect(rivals,seed)?.id||null;
 const supplier=chainSupplier(refSKU(q.sku)?.owner)||state.enterprise.chain.suppliers.find(s=>s.kind==='drink');q.supplier=supplier?.id||null;
 q.worker=beSelect(workers.filter(w=>w.site===hub.id&&!w.training&&!w.notice&&!r.work.some(j=>j.employee===w.id)&&!state.jobs.some(j=>j.employee===w.id)),seed)?.id||null;
 q.otherhub=r.sites.find(s=>s.id!==hub.id&&s.kind==='warehouse'&&!s.build&&!s.closed)?.id||null;
 q.to=chainFirm(f).sites.find(s=>!machine(s.loc)&&!rivalLocations().includes(s.loc)&&!r.work.some(j=>j.to===s.loc))?.loc??null;
 const match=(kind)=>LOCATIONS[q.loc].kind===kind;
 if(['festival','marathon'].includes(key)&&(!match('park')||key==='festival'&&sceneSeason()!==0))return null;
 if(key==='exam'&&!match('campus')||key==='station'&&!match('station')||key==='neighborhood'&&!match('home'))return null;
 if(key==='office'&&(!match('office')||r.contracts.some(c=>c.loc===m.loc)))return null;
 if(key==='breakdown'&&(m.condition>=75||r.work.some(j=>j.loc===m.loc)||m.ref.downtime))return null;
 if(key==='rival'&&(!q.rival||!beFirm(q.rival).machines.some(n=>LOCATIONS[n.loc].map===q.map&&n.ref.age<20)))return null;
 if(['power','cold-transport'].includes(key)&&state.weather!==1)return null;
 if(['staff-review','poaching'].includes(key)){const w=beSelect(workers.filter(w=>(key==='poaching'?w.skill>=2&&w.satisfaction<85:w.satisfaction<65||w.fatigue>60)&&!w.notice&&!w.training&&!r.work.some(j=>j.employee===w.id)&&!state.jobs.some(j=>j.employee===w.id)),seed);if(!w)return null;q.worker=w.id;q.hub=w.site;q.map=refSite(f,w.site).map;if(key==='poaching'){const v=rivalFirms().find(v=>!v.policy.defeated&&refFirm(v).sites.some(s=>!s.closed&&!s.build&&s.kind===refSite(f,w.site).kind)&&v.account.cash>=w.salary*20);if(!v)return null;q.rival=v.id;}}
 if(key==='supply-review'||key==='vendor-stop'){const j=beSelect(r.work.filter(j=>j.kind==='purchase'&&j.remaining>DAY_MS*.5),seed);if(!j)return null;q.job=j.id;q.product=j.product;q.sku=j.sku;q.hub=j.site;q.supplier=refSKU(j.sku)?.owner||q.supplier;if(!chainSupplier(q.supplier))return null;}
 if(key==='factory-delay'){const j=r.work.find(j=>j.kind==='production'&&!j.machine);if(!j)return null;q.job=j.id;q.hub=j.site;q.sku=j.sku;q.product=j.product;}
 if(['misdelivery','cold-transport'].includes(key)){const j=r.work.find(j=>j.kind==='route'&&(key!=='cold-transport'||!j.cold&&j.stops.some(s=>s.cargo.some(c=>c.batches.some(b=>b.product===4)))));if(!j||key==='misdelivery'&&!q.otherhub)return null;q.job=j.id;q.worker=j.employee||null;}
 if(['finance-review','rate-rise'].includes(key)){const n=r.notes.find(n=>n.principal>0&&(key!=='rate-rise'||n.variable&&!n.fixed));if(!n)return null;q.note=n.id;}
 if(['permit-renewal','rent-talk'].includes(key)){const c=r.contracts.find(c=>c.loc===m.loc&&c.kind!=='outsourced'&&(key==='rent-talk'||c.until<=state.day+14));if(!c)return null;q.contract=c.id;}
 if(key==='complaint'){const row=state.live?.rows.find(row=>row.loc===m.loc);if(!row?.bought.length)return null;q.price=row.bought.at(-1).price;q.transaction=state.live.day+':'+m.loc+':'+m.total;if(beState().history.some(h=>h.transaction===q.transaction&&h.choice>=0))return null;}
 if(['regulation-review','repeat-complaint'].includes(key)){const c=state.complaints.find(c=>c.loc===m.loc&&(key==='regulation-review'?['pest','expired'].includes(c.kind):c.stage===1));if(!c)return null;q.complaint=c.id;}
 if(['quality-recall','inventory-gap','trend-end'].includes(key)){let batches=f.ops.warehouse.flatMap(w=>w.batches);if(key==='quality-recall')batches=batches.filter(b=>refSKU(b.sku)?.owner==='player'&&b.quality<1);else if(key==='trend-end')batches=batches.filter(b=>b.product===product);const b=beSelect(batches.filter(b=>b.qty>=5),seed);if(!b)return null;q.batch=b.id;q.lot=b.lot||b.id;q.sku=b.sku;q.product=b.product;q.hub=b.hub;}
 if(key==='prototype-fail'){const p=r.projects.find(p=>p.key==='quality'&&!p.complete&&(p.paused||p.review));if(!p)return null;q.project=p.id;}
 if(['price-pact','sponsor-bid','buyout-offer'].includes(key)&&!q.rival)return null;
 if(key==='buyout-offer'){if(f.machines.length<=1||r.work.some(j=>j.loc===m.loc||j.stops?.some(s=>s.loc===m.loc)))return null;q.price=Math.round((m.ref.book+stockValue(m)+m.vault)*.9);if(beFirm(q.rival).account.cash<q.price||q.price<=0)return null;}
 if(key==='rival-factory'){const v=rivalFirms().find(v=>!v.policy.defeated&&refFirm(v).sites.some(s=>s.kind==='drink'&&!s.closed&&!s.build)&&refFirm(v).products.some(id=>refSKU(id)&&v.ops.warehouse[refSKU(id).product].batches.some(b=>b.sku===id&&b.qty>=20)));if(!v)return null;q.rival=v.id;q.sku=refFirm(v).products.find(id=>v.ops.warehouse[refSKU(id).product].batches.some(b=>b.sku===id&&b.qty>=20));q.product=refSKU(q.sku).product;}
 if(!['inspection','lost','exam','repeat-complaint','staff-review','poaching','cold-transport','misdelivery'].includes(key))q.worker=null;
 if(key==='exam')q.worker=workers.find(w=>w.role==='restock'&&w.site===hub.id&&!w.training&&!w.notice)?.id||null;
 if(beState().active.some(a=>a.key===key&&a.loc===q.loc&&a.until>=state.day))return null;
 return q;
}
function beOffer(key,loc=null,parent=null){
 if(!beEnabled()||state.pending||state.ended||beState().tasks.length>95||beState().active.length>150)return false;const s=beState(),seed=Math.floor(enterpriseRandom()*100000),q=beTarget(key,seed,loc);if(!q)return false;
 q.serial=s.next++;q.seed=seed;q.created=state.day;q.deadline=state.day+3;q.deferred=false;q.parent=parent;q.scale=Math.min(6,Math.max(1,Math.sqrt(playerFirm().machines.filter(m=>LOCATIONS[m.loc].map===q.map).length)));q.fees=beFees(q);
 s.pending=q;state.pending={id:key,loc:q.loc};s.cooldown[key]=state.day+45;
 beHistory(q,-1,B('판단 대기','判断待ち'));return true;
}
function beHistory(q,choice,label){const s=beState(),h={serial:q.serial,key:q.key,parent:q.parent||null,day:state.day,choice,label,transaction:q.transaction||null,spent:0,received:0,sold:0,revenue:0,cost:0,waste:0,rivalSpent:0,messages:[]};s.history.unshift(h);while(s.history.length>120){const protectedIds=new Set([...s.tasks,...s.active].map(t=>t.serial));const i=s.history.findLastIndex(x=>!protectedIds.has(x.serial));if(i<0)break;s.history.splice(i,1);}return h;}
function beRecord(serial){return beState().history.find(h=>h.serial===serial&&h.choice>=0)||beState().history.find(h=>h.serial===serial);}
function beMessage(h,ko,ja){const t=B(ko,ja);h.messages.push(t);h.messages=h.messages.slice(-12);log(t);}
function beActive(type,q,value,days,firm='player',extra={}){const s=beState();s.active.push({type,key:q.key,serial:q.serial,firm,loc:q.loc,map:q.map,product:q.product,sku:q.sku,supplier:q.supplier,hub:q.hub,worker:q.worker,value,from:state.day,until:state.day+days,...extra});}
function beEffects(type,firm=null){return beEnabled()?(state.businessEvents?.active||[]).filter(a=>a.type===type&&a.from<=state.day&&a.until>state.day&&(firm===null||a.firm===firm)):[];}
function bePay(f,amount,h,kind='event-service',capital=false){if(amount<0||!finite(amount)||f.account.cash<amount)return false;if(amount&&!refSpend(f,amount,kind,0,capital))return false;refWorld().rawCash+=amount;if(f.id==='player')h.spent+=amount;else h.rivalSpent+=amount;return true;}
function beTask(q,kind,days,extra={}){beState().tasks.push({serial:q.serial,key:q.key,kind,due:state.day+days,loc:q.loc,hub:q.hub,worker:q.worker,job:q.job,product:q.product,sku:q.sku,rival:q.rival,project:q.project,batch:q.batch,...extra});}
function beFollow(q,key,days){const s=beState();if(s.followups.length<40)s.followups.push({key,loc:q.loc,due:state.day+days,parent:q.serial,expires:state.day+days+14});}
function beContextValid(q){const f=playerFirm(),r=refFirm(f);return !!machine(q.loc)&&!!refSite(f,q.hub)&&(!q.worker||chainFirm(f).staff.some(w=>w.id===q.worker))&&(!q.job||r.work.some(j=>j.id===q.job))&&(!q.project||r.projects.some(p=>p.id===q.project&&!p.complete))&&(!q.note||r.notes.some(n=>n.id===q.note&&n.principal>0))&&(!q.contract||r.contracts.some(c=>c.id===q.contract))&&(!q.batch||f.ops.warehouse.some(w=>w.batches.some(b=>b.id===q.batch)))&&(!q.rival||!!beFirm(q.rival));}
function beResolve(index,expired=false){
 const s=beState(),q=s.pending;if(!q||!state.pending||state.pending.id!==q.key||![0,1].includes(index)||state.ended)return false;
 if(!beContextValid(q)){beCancel(q);return false;}const choice=beChoices(q)[index];if(!expired&&(choice.block||state.cash<choice.fee))return false;
 if(!expired){const fees=beFees(q);if(fees[index]!==q.fees[index]){q.fees=fees;toast(B('조건 변경 · 새 견적을 확인하십시오.','条件変更・新しい見積りを確認してください。'));save();render();if(modalView==='event')drawModal();return false;}}
 const h=beHistory(q,index,expired?B('기한 만료','期限満了'):choice.label),ok=beApply(q,index,h,expired);if(!ok){s.history.shift();return false;}
 state.eventsResolved++;s.pending=null;state.pending=null;s.nextOffer=Math.max(s.nextOffer,state.day+5);h.messages.unshift(B('선택 처리 완료','選択処理完了'));closeModal();save();render();if(!state.live&&!livePaused&&!menuOpen)startBusiness();return true;
}
function beCancel(q){const h=beHistory(q,2,B('대상 변경 · 취소','対象変更・取消'));beMessage(h,'사건 대상이 변경되어 제안이 취소되었습니다. 비용 없음.','事件の対象が変わり提案は取り消されました。費用なし。');beState().pending=null;state.pending=null;if(modalView==='event')closeModal();}
function beDay(){if(!beEnabled())return;const s=beState();if(s.lastDay===state.day)return;s.lastDay=state.day;
 for(const a of s.active.filter(a=>a.repairOrder)){const f=beFirm(a.firm);if(f&&!chainFirm(f).orders.some(o=>o.id===a.repairOrder)&&f.machines.find(m=>m.loc===a.loc)?.condition>=75)a.until=state.day;}
 for(const t of s.tasks.filter(t=>t.due<=state.day))beCompleteTask(t);s.tasks=s.tasks.filter(t=>t.due>state.day);
 for(const a of s.active.filter(a=>a.until<=state.day)){const h=beRecord(a.serial);if(h&&a.type==='demand'){h.messages.push(B('판매 효과 기간 종료','販売効果期間終了'));h.messages=h.messages.slice(-12);}}s.active=s.active.filter(a=>a.until>state.day);
 s.followups=s.followups.filter(x=>x.expires>=state.day);
 if(s.pending&&!beContextValid(s.pending))beCancel(s.pending);else if(s.pending&&state.day>s.pending.deadline)beResolve(1,true);
}
function validBusinessEvents(x,s){
 if(x===undefined)return true;const integer=n=>Number.isInteger(n)&&n>=0&&n<=1e9,arr=(a,n)=>Array.isArray(a)&&a.length<=n,nn=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
 const keys=businessEventCatalog().map(d=>d.id),text=b=>Array.isArray(b)&&b.length===2&&b.every(t=>typeof t==='string'&&t.length<1200),q=x?.pending;
 let nodes=0;function bounded(v,depth=0){if(++nodes>30000||depth>12)return false;if(typeof v==='number')return Number.isFinite(v)&&Math.abs(v)<=1e12;if(typeof v==='string')return v.length<=2000;if(v===null||typeof v==='boolean')return true;if(Array.isArray(v))return v.length<=1000&&v.every(n=>bounded(n,depth+1));if(typeof v==='object')return Object.keys(v).length<=160&&Object.values(v).every(n=>bounded(n,depth+1));return false;}if(!bounded(x))return false;
 if(!x||x.version!==1||!integer(x.next)||!integer(x.lastDay)||!integer(x.nextOffer)||!x.cooldown||Object.entries(x.cooldown).some(([k,v])=>!keys.includes(k)||!integer(v)))return false;
 if(q&&(!keys.includes(q.key)||!integer(q.serial)||!integer(q.loc)||q.loc>=LOCATIONS.length||!integer(q.deadline)||!integer(q.created)||q.deadline<q.created||!nn(q.scale)||q.scale<1||q.scale>6||!arr(q.fees,2)||q.fees.length!==2||!q.fees.every(nn)||typeof q.deferred!=='boolean'||!integer(q.seed)||!integer(q.hub)||['worker','job','project','contract','batch','note','otherhub','to'].some(k=>q[k]!==null&&!integer(q[k]))||!integer(q.product)||q.product>5||!integer(q.map)||q.map>=MAPS.length||typeof q.sku!=='string'||!nn(q.price)||!s.pending||s.pending.id!==q.key||s.pending.loc!==q.loc))return false;
 if(!arr(x.active,160)||!x.active.every(a=>a&&keys.includes(a.key)&&integer(a.serial)&&['demand','price','cost','rent','fee','worker','cold','block','supply','premium','interest','quality','lock','pact','research','audit','capacity'].includes(a.type)&&['all','player','mono','atlas','nova'].includes(a.firm)&&nn(a.value)&&a.value<=1e9&&integer(a.from)&&integer(a.until)&&a.until>=a.from&&integer(a.loc)&&a.loc<LOCATIONS.length&&integer(a.map)&&a.map<MAPS.length&&integer(a.product)&&a.product<6))return false;
 if(!arr(x.tasks,100)||!x.tasks.every(t=>t&&keys.includes(t.key)&&integer(t.serial)&&integer(t.due)&&integer(t.loc)&&t.loc<LOCATIONS.length&&integer(t.hub)&&integer(t.product)&&t.product<6&&['amount','qty','bid','refund'].every(k=>t[k]===undefined||nn(t[k]))&&(t.kind!=='repair'||nn(t.amount)&&typeof t.clear==='boolean')&&(t.kind!=='inventory'||integer(t.qty)&&integer(t.lot))&&(t.kind!=='production'||!!t.cargo)&&(!t.cargo||integer(t.cargo.qty)&&t.cargo.qty>0&&nn(t.cargo.value)&&nn(t.cargo.quality)&&t.cargo.quality<=3&&integer(t.cargo.product)&&t.cargo.product<6&&integer(t.cargo.hub)&&typeof t.cargo.sku==='string')&&['repair','depart','inventory','research','regulation','rent','pact','delivery','production','recall','contract','staff','supplier','rate'].includes(t.kind)))return false;
 return arr(x.followups,40)&&x.followups.every(f=>f&&keys.includes(f.key)&&integer(f.loc)&&integer(f.due)&&integer(f.expires))&&arr(x.history,120)&&x.history.every(h=>h&&integer(h.serial)&&keys.includes(h.key)&&integer(h.day)&&Number.isInteger(h.choice)&&h.choice>=-1&&h.choice<=2&&text(h.label)&&['spent','received','sold','revenue','cost','waste','rivalSpent'].every(k=>nn(h[k]))&&arr(h.messages,20)&&h.messages.every(text));
}
