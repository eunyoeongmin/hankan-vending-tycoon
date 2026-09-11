function beBuckets(f){return [...f.ops.warehouse,...f.machines.flatMap(m=>m.slots)];}
function beTransitBuckets(f){const r=refFirm(f);return [...r.transfers,...r.work.filter(j=>j.kind==='purchase'&&j.batches),...r.work.filter(j=>j.kind==='route').flatMap(j=>j.stops.flatMap(s=>s.cargo))];}
function beRerouteRoom(q){const f=playerFirm(),j=refFirm(f).work.find(j=>j.id===q.job),hub=refSite(f,q.otherhub);return !!hub&&hub.kind==='warehouse'&&!hub.build&&j?.kind==='route'&&refSiteUsed(f,hub.id)+j.stops.flatMap(s=>s.cargo).flatMap(c=>c.batches).reduce((n,b)=>n+b.qty,0)<=hub.capacity;}

function beAvailable(q){return beBuckets(playerFirm()).reduce((n,b)=>n+(b.batches||[]).filter(b=>b.product===q.product&&b.hub===q.hub).reduce((n,b)=>n+b.qty,0),0);}
function beConsume(q,qty,h,lot=null){let left=qty,loss=0,count=0;for(const b of beBuckets(playerFirm())){const got=refTake(b,left,v=>lot!==null?(v.lot||v.id)===lot:v.product===q.product&&v.hub===q.hub);for(const v of got){left-=v.qty;loss+=v.value;count+=v.qty;}refSyncBucket(b,'stock'in b);}for(const m of playerFirm().machines)syncMachine(m);expenseBookLoss(playerFirm(),loss);h.waste+=count;h.cost+=loss;return count;}
function beTrust(q,n){const r=refFirm(playerFirm());r.trust[q.loc]=refClamp((r.trust[q.loc]??50)+n,0,100);}
function beRep(n){state.reputation=refClamp(state.reputation+n,0,100);}
function beCampaign(q,h,factor,days,rep=0,scope='map',visits=0){beActive('demand',q,factor,days,'player',{scope});if(visits)beActive('premium',q,visits,days,'player',{scope:'map'});beRep(rep);beMessage(h,`판매 기회 ${days}일 · 재고·가격·운영 상태에 따라 실제 판매 결정`,`販売機会${days}日・実販売は在庫・価格・稼働状況で決定`);}
function beRivalCampaign(q,h,fee=20000,factor=1.3,days=7){const v=beFirm(q.rival);if(!v||!v.machines.some(m=>LOCATIONS[m.loc].map===q.map&&m.stock>0)||v.account.cash<fee+10000){beMessage(h,'경쟁사 참여 없음 · 자금 또는 판매 준비 부족','競合の参加なし・資金または販売準備不足');return false;}if(!bePay(v,fee,h,'event-sponsorship'))return false;beActive('demand',q,factor,days,v.id,{scope:'map'});beMessage(h,`${companyNameFor(v.id,0)}: ${money(fee)} 지출·행사 참여`,`${companyNameFor(v.id,1)}：${money(fee)}支出・行事参加`);return true;}
function beWorker(q,days,factor=0){if(q.worker)beActive('worker',q,factor,days);}
function beRepair(q,days,amount=100,clear=true){beActive('block',q,1,days,'player',{scope:'loc'});beTask(q,'repair',days,{amount,clear});}
function beBackup(q){const r=refFirm(playerFirm()),next=['aqua','sun','value'].find(id=>id!==q.supplier&&refWorld().suppliers[id]?.closedUntil<=state.day);if(!next)return false;for(const s of r.sites.filter(s=>s.kind==='warehouse'&&!s.closed)){s.policy.supplier=['aqua','sun','value'].indexOf(next);s.policy.backup=['aqua','sun','value'].indexOf(q.supplier);}state.enterprise.supplier=['aqua','sun','value'].indexOf(next);return true;}
function beResaleBuyer(q){const seller=playerFirm(),b=seller.ops.warehouse[q.product].batches.find(b=>b.id===q.batch);if(!b)return null;return rivalFirms().find(v=>!v.policy.defeated&&refHome(v)&&v.account.cash>=b.value*.6&&refSiteUsed(v,refHome(v).id)+b.qty<=refHome(v).capacity)||null;}
function beSaleMachine(q,h){const seller=playerFirm(),buyer=beFirm(q.rival),m=machine(q.loc);if(!buyer||!m||seller.machines.length<=1||buyer.account.cash<q.price||refFirm(seller).work.some(j=>j.loc===q.loc||j.stops?.some(s=>s.loc===q.loc)))return false;const book=equipment(m)+stockValue(m)+m.vault;
 buyer.account.cash-=q.price;state.cash+=q.price;refPost(buyer,'event-machine-purchase',-q.price,'investing');refPost(seller,'event-machine-sale',q.price,'investing');expenseBookLoss(seller,book-q.price);
 removeMachine(q.loc);buyer.ops.machines.push(m);buyer.account.owned.push(q.loc);const hub=refHome(buyer);m.ref.hub=hub.id;for(const s of m.slots)for(const b of s.batches)b.hub=hub.id;
 for(const c of refFirm(seller).contracts.filter(c=>c.loc===q.loc))refFirm(buyer).contracts.push(c);refFirm(seller).contracts=refFirm(seller).contracts.filter(c=>c.loc!==q.loc);for(const route of refFirm(seller).routes)route.stops=route.stops.filter(l=>l!==q.loc);
 h.received+=q.price;h.rivalSpent+=q.price;beMessage(h,'기기·재고·보관금·입지 계약 이전 완료','機械・在庫・保管金・立地契約の移管完了');return true;
}
function beRecall(q,h){const lot=q.lot||q.batch;for(const f of allFirms()){let loss=0,qty=0;for(const b of [...beBuckets(f),...beTransitBuckets(f)]){const take=refTake(b,1e9,x=>(x.lot||x.id)===lot);qty+=take.reduce((n,x)=>n+x.qty,0);loss+=take.reduce((n,x)=>n+x.value,0);refSyncBucket(b,'stock'in b);}refFirm(f).work=refFirm(f).work.filter(j=>j.kind!=='purchase'||!j.batches||j.qty>0);for(const m of f.machines)syncMachine(m);if(qty){expenseBookLoss(f,loss);h.waste+=qty;h.cost+=loss;if(f.id!=='player'){const payment=Math.min(Math.max(0,state.cash),Math.ceil(loss));if(payment>0){state.cash-=payment;refIncome(f,payment,'recall-compensation');refPost(playerFirm(),'recall-compensation',-payment);expenseBookLoss(playerFirm(),payment);h.spent+=payment;}if(payment<loss){refFirm(playerFirm()).bills.push({id:refId(),to:f.id,amount:loss-payment,due:state.day+7,kind:'recall'});refFirm(f).receivables.push({id:refId(),invoice:refFirm(playerFirm()).bills.at(-1).id,from:'player',amount:loss-payment,due:state.day+7});}}beMessage(h,`${companyNameFor(f.id,0)}: 대상 배치 ${qty}개 회수·폐기`,`${companyNameFor(f.id,1)}：対象ロット${qty}本回収・廃棄`);}}
}
function beApply(q,index,h,expired=false){
 const f=playerFirm(),r=refFirm(f),m=machine(q.loc),w=chainFirm(f).staff.find(w=>w.id===q.worker),j=r.work.find(j=>j.id===q.job),p=r.projects.find(p=>p.id===q.project),c=r.contracts.find(c=>c.id===q.contract),n=r.notes.find(n=>n.id===q.note),yes=index===0;
 const native=['station','product-trend'].includes(q.key)||yes&&['office','construction','finance-review','rival-factory','prototype-fail','buyout-offer'].includes(q.key);
 // Expired proposals cost nothing. An existing incident still has its documented consequence.
 if(expired){return beExpire(q,h);}
 if(!native&&!bePay(f,q.fees[index],h,q.key==='sponsor-bid'&&yes?'event-bid-deposit':'event-service',q.key==='sponsor-bid'&&yes))return false;
 const nativeCall=fn=>{const cash=state.cash,ok=fn();if(!ok)return false;h.spent+=Math.max(0,cash-state.cash);return true;};
 switch(q.key){
 case 'festival':if(yes)beCampaign(q,h,1.35,7,3,'map',.2);else{beRivalCampaign(q,h);beFollow(q,'sponsor-bid',2);}break;
 case 'influencer':if(yes){beConsume(q,5,h);beCampaign(q,h,1.4,10,2,'product');}else beRep(m.condition>=75&&m.stock?1:-2);break;
 case 'breakdown':beRepair(q,yes?1:3);break;
 case 'rival':if(yes){beActive('price',q,.9,7);const v=beFirm(q.rival);if(v&&beRivalCampaign(q,h,10000,1.05,5))beActive('price',q,.95,5,v.id);}else{m.condition=Math.min(100,m.condition+20);beTrust(q,5);}break;
 case 'inspection':beRepair(q,yes?1:2,15);if(!yes)beWorker(q,2);break;
 case 'power':if(yes)beActive('cold',q,0,5);else beActive('fee',q,2000,5);break;
 case 'marathon':if(yes){beConsume(q,10,h);beCampaign(q,h,1.5,3,3,'map',.3);}else beRivalCampaign(q,h,25000,1.5,3);break;
 case 'exam':beActive('premium',q,.15,7);if(yes){beWorker(q,7,1.25);w.fatigue=refClamp(w.fatigue+15,0,100);beCampaign(q,h,1.2,7);}break;
 case 'office':if(yes){if(!nativeCall(()=>refContract(f,q.loc,'service')))return false;beCampaign(q,h,1.2,60,0,'loc');beActive('price',q,.95,60,'player',{scope:'loc'});}else beRivalCampaign(q,h,20000,1.2,30);break;
 case 'lost':if(yes)beWorker(q,1);beRep(yes?2:1);break;
 case 'tv':if(yes)beCampaign(q,h,1.3,10,3);else beRep(m.condition>=75&&m.stock?1:-2);break;
 case 'construction':if(yes&&!nativeCall(()=>refRelocate(f,q.loc,q.to)))return false;beActive('demand',q,.55,7,'player',{scope:'loc'});break;
 case 'eco':if(yes){beRep(5);beCampaign(q,h,1.1,30);beActive('fee',q,1000,30);for(const c of r.contracts.filter(c=>c.loc===q.loc))c.score=Math.min(100,c.score+5);}break;
 case 'complaint':if(yes)beTrust(q,2);else{beCampaign(q,h,.85,2,0,'loc');beTask(q,'regulation',2,{refund:q.price,error:m.condition<75});}break;
 case 'station':case 'product-trend':{const spec=beOrderSpec(q,index);if(!nativeCall(()=>refOrder(f,q.sku,spec.qty,q.hub)))return false;if(q.key==='station')beActive('premium',q,.2,5);else{beCampaign(q,h,1.6,10,0,'product');beFollow(q,'trend-end',10);}}break;
 case 'neighborhood':if(yes){beActive('price',q,.9,10);beTrust(q,4);}else beCampaign(q,h,1.2,10);break;
 case 'supply-review':j.remaining= yes?Math.max(200,j.remaining*.75):j.remaining+DAY_MS*2;j.duration=Math.max(j.duration||j.remaining,j.remaining);beMessage(h,`주문 #${j.id} 남은 배송 ${Math.ceil(j.remaining/DAY_MS*10)/10}일`,`注文#${j.id}残り配送${Math.ceil(j.remaining/DAY_MS*10)/10}日`);break;
 case 'regulation-review':if(yes){const report=state.complaints.find(c=>c.id===q.complaint);if(report?.kind==='expired'){for(const b of m.slots){h.waste+=b.stock;h.cost+=b.value;expenseBookLoss(f,b.value);b.batches=[];refSyncBucket(b,true);}syncMachine(m);}beRepair(q,1,20);}else beTask(q,'regulation',2,{complaint:q.complaint,error:m.condition<60});break;
 case 'staff-review':case 'poaching':if(yes){refRaise(f,w.id,20);beTask(q,'staff',3,{retain:true,poach:q.key==='poaching'});}else{beWorker(q,3,.5);beTask(q,'depart',3,{replace:q.key==='staff-review',role:w.role,salary:w.salary});}break;
 case 'finance-review':if(yes){if(!nativeCall(()=>mgRepay(f,n.id,q.fees[0])))return false;f.meta.credit=Math.min(100,f.meta.credit+3);}else if(r.notes.some(n=>n.missed)||r.bills.some(b=>b.due<state.day))f.meta.credit=Math.max(0,f.meta.credit-3);break;
 case 'vendor-price':{const previousPrice=supplierPrice(chainSupplier(q.supplier),q.product,f);beActive('cost',q,1.15,14,'all',{scope:'supplier'});if(yes){beActive('lock',q,previousPrice,30,'player',{scope:'supplier-product'});r.purchaseTerms=r.purchaseTerms.filter(t=>t.supplier!==q.supplier);r.purchaseTerms.push({supplier:q.supplier,min:100,days:0,discount:0,until:state.day+30});beActive('fee',q,1000,30,'player',{minimum:true});}else beBackup(q);break;}
 case 'cost-surge':beActive('cost',q,1.2,14,'all',{scope:'product'});if(yes)beActive('price',q,1.15,14,'player',{scope:'product'});break;
 case 'vendor-stop':refWorld().suppliers[q.supplier].closedUntil=Math.max(refWorld().suppliers[q.supplier].closedUntil,state.day+7);if(yes)beBackup(q);else{j.remaining+=DAY_MS*3;j.duration=Math.max(j.duration||j.remaining,j.remaining);}beTask(q,'supplier',7);break;
 case 'quality-recall':if(yes){beRecall(q,h);beTrust(q,3);}else{beActive('block',q,1,3,'all',{scope:'sku'});beTask(q,'recall',3,{lot:q.lot||q.batch});}break;
 case 'factory-delay':if(yes){beActive('worker',q,1.25,3,'player',{scope:'hub',worker:null});for(const w of chainFirm(f).staff.filter(w=>w.site===q.hub))w.fatigue=refClamp(w.fatigue+15,0,100);}else{const vendor=chainSupplier('sun');const capacity=vendor?.capacity||0;if(capacity<j.qty||beState().tasks.some(t=>t.kind==='production'&&t.due>state.day&&t.supplier===vendor.id)){return false;}beTask(q,'production',3,{supplier:vendor.id,cargo:{qty:j.qty,value:j.value,quality:j.quality,sku:j.sku,product:j.product,hub:j.hub}});r.work=r.work.filter(x=>x!==j);}break;
 case 'permit-renewal':if(yes){c.until=state.day+60;c.renew=true;beActive('rent',q,1.1,60);}else{c.renew=false;beTask(q,'contract',Math.max(1,c.until-state.day),{contract:c.id});}break;
 case 'misdelivery':if(yes){j.remaining+=DAY_MS*.5;}else{for(const stop of j.stops)for(const cargo of stop.cargo){for(const batch of cargo.batches){batch.hub=q.otherhub;refAdd(f.ops.warehouse[batch.product],[batch]);}cargo.batches=[];}j.remaining+=DAY_MS;beFollow(q,'repeat-complaint',4);beMessage(h,`화물이 거점 #${q.otherhub}에 보관되었습니다. 거점 간 운송 필요.`,`貨物は拠点#${q.otherhub}に保管。拠点間輸送が必要。`);}break;
 case 'inventory-gap':beActive('worker',q,yes?.5:.8,yes?2:1,'player',{scope:'hub',worker:null});beTask(q,'inventory',yes?2:1,{lot:q.lot||q.batch,qty:yes?2:1});if(!yes)beTask(q,'inventory',7,{lot:q.lot||q.batch,qty:1});break;
 case 'rate-rise':if(yes)n.fixed=true;else beTask(q,'rate',7,{note:n.id});break;
 case 'rent-talk':c.until=state.day+60;c.renew=true;c.kind=yes?'fixed':'share';c.share=yes?0:.15;if(yes)beActive('rent',q,1.15,60);break;
 case 'buyout-offer':if(yes&&!beSaleMachine(q,h))return false;break;
 case 'price-pact':if(yes){const v=beFirm(q.rival);beActive('price',q,1.1,14);beActive('price',q,1.1,14,v.id);beTask(q,'pact',5,{investigate:q.seed%4===0,betray:q.seed%3===0});beMessage(h,'조사 가능성 25% · 상대 이탈 가능성 약 33%','調査可能性25%・競合離脱可能性約33%');}else if(beRivalCampaign(q,h,10000,1.05,5))beActive('price',q,.95,5,q.rival);break;
 case 'rival-factory':if(yes&&!nativeCall(()=>refOrder(f,q.sku,beOrderSpec(q,1).qty,q.hub)))return false;break;
 case 'trend-end':if(yes)beActive('price',q,.75,7,'player',{scope:'sku'});else{const buyer=beResaleBuyer(q),batch=f.ops.warehouse[q.product].batches.find(b=>b.id===q.batch);if(!buyer||!batch)return false;const qty=batch.qty,value=batch.value,price=Math.floor(value*.6),cargo=refTake(f.ops.warehouse[q.product],qty,b=>b.id===batch.id);refSyncBucket(f.ops.warehouse[q.product]);buyer.account.cash-=price;state.cash+=price;refPost(buyer,'event-stock-purchase',-price);refPost(f,'event-stock-sale',price);expenseBookLoss(f,value-price);for(const b of cargo){b.hub=refHome(buyer).id;b.value=price*b.qty/qty;}refAdd(buyer.ops.warehouse[q.product],cargo);h.received+=price;h.rivalSpent+=price;beMessage(h,`${qty}개 도매 처분 · ${money(price)} 회수`,`${qty}本卸処分・${money(price)}回収`);}break;
 case 'repeat-complaint':beRepair(q,yes?2:1,20);if(yes)beWorker(q,2);else beActive('fee',q,2000,30);for(const c of r.contracts.filter(c=>c.loc===q.loc))c.score=Math.min(100,c.score+5);break;
 case 'sponsor-bid':if(yes)beTask(q,'contract',2,{bid:q.fees[0]});else beRivalCampaign(q,h,30000,1.4,7);break;
 case 'prototype-fail':if(yes){if(state.cash<q.fees[0])return false;state.cash-=q.fees[0];refPost(f,'research-event-budget',-q.fees[0],'investing');h.spent+=q.fees[0];p.budget+=q.fees[0];p.extra=0;p.paused=false;p.review=false;p.duration*=1.25;}else{p.paused=true;beTask(q,'research',7);p.eventQualityPenalty=.25;}break;
 case 'cold-transport':j.cold=true;if(!yes)j.remaining+=DAY_MS;break;
 default:return false;
 }
 if(w)syncChainStaff();return true;
}
function beExpire(q,h){
 const r=refFirm(playerFirm()),j=r.work.find(j=>j.id===q.job);beMessage(h,'응답 기한 만료 · 제안 비용은 지출하지 않았습니다.','回答期限満了・提案費用は支出していません。');
 if(['festival','marathon','office','sponsor-bid'].includes(q.key))beRivalCampaign(q,h);
 if(q.key==='breakdown')beActive('block',q,1,36500,'player',{scope:'loc',repairable:true});
 if(q.key==='construction')beActive('demand',q,.55,7,'player',{scope:'loc'});
 if(q.key==='power')beActive('fee',q,2000,5);
 if(q.key==='supply-review'&&j){j.remaining+=DAY_MS*2;j.duration=Math.max(j.duration||0,j.remaining);}
 if(q.key==='vendor-stop'){refWorld().suppliers[q.supplier].closedUntil=state.day+7;if(j){j.remaining+=DAY_MS*3;j.duration=Math.max(j.duration||0,j.remaining);}}
 if(q.key==='cost-surge'||q.key==='vendor-price')beActive('cost',q,q.key==='cost-surge'?1.2:1.15,14,'all',{scope:q.key==='cost-surge'?'product':'supplier'});
 if(q.key==='permit-renewal')beTask(q,'contract',1,{contract:q.contract});
 if(q.key==='regulation-review')beTask(q,'regulation',1,{error:machine(q.loc).condition<60,complaint:q.complaint});
 if(['poaching','staff-review'].includes(q.key))beTask(q,'depart',3,{replace:false});
 if(q.key==='rate-rise')beTask(q,'rate',7,{note:q.note});
 if(q.key==='quality-recall'){beActive('block',q,1,3,'all',{scope:'sku'});beTask(q,'recall',3,{lot:q.lot||q.batch});}
 return true;
}
function beCompleteTask(t){const f=playerFirm(),r=refFirm(f),m=machine(t.loc),w=chainFirm(f).staff.find(w=>w.id===t.worker),h=beRecord(t.serial);if(!h){t.due=state.day+1;return;}
 const q={...t,serial:t.serial,map:LOCATIONS[t.loc]?.map||0,supplier:t.supplier||'aqua'};
 if(t.kind==='repair'&&m){m.condition=t.amount===100?100:Math.min(100,m.condition+t.amount);if(t.clear)state.complaints=state.complaints.filter(c=>c.loc!==t.loc);beTrust(q,2);beMessage(h,'정비 완료 · 영업 재개','整備完了・営業再開');}
 if(t.kind==='supplier')beMessage(h,'공급 중단 기간 종료 · 공급사 실제 재고 확인','供給停止期間終了・仕入先の実在庫を確認');
 if(t.kind==='inventory'){const qty=beConsume(q,t.qty,h,t.lot);beMessage(h,`실사 완료 · 누락 수량 ${qty}개·장부 정정`,`棚卸し完了・不足${qty}本・帳簿修正`);}
 if(t.kind==='research'){const p=r.projects.find(p=>p.id===t.project&&!p.complete);if(p){p.paused=false;p.review=false;p.extra=0;p.uncertainty=false;beMessage(h,'재검증 완료 · 사양 조정 후 개발 재개','再検証完了・仕様調整後に開発再開');}}
 if(t.kind==='rate'){const n=r.notes.find(n=>n.id===t.note);if(n&&n.variable&&!n.fixed){n.rate+=.02/365;beMessage(h,'변동 계약 연 이율 +2%p 적용','変動契約の年利+2ポイント適用');}else beMessage(h,'고정 계약 유지 · 기존 금리 변경 없음','固定契約維持・既存金利変更なし');}
 if(t.kind==='regulation'){if(t.refund&&t.error){const paid=Math.min(Math.max(0,state.cash),t.refund);if(paid>0)bePay(f,paid,h,'customer-refund');if(paid<t.refund)r.bills.push({id:refId(),to:'customers',kind:'refund',amount:t.refund-paid,due:state.day+3});beMessage(h,'기록 확인 · 고객 환불 처리','履歴確認・顧客返金処理');}else if(t.complaint){if(t.error&&m){beActive('block',q,1,36500,'player',{scope:'loc',repairable:true});beMessage(h,'확인된 위생 문제 · 정비할 때까지 대상 기기 판매 중지','確認済み衛生問題・整備まで対象機の販売停止');}else{state.complaints=state.complaints.filter(c=>c.id!==t.complaint);beMessage(h,'재확인 완료 · 문제 신고 해소','再確認完了・問題報告解消');}}}
 if(t.kind==='pact'){if(t.betray){beState().active=beState().active.filter(a=>!(a.serial===t.serial&&a.firm===t.rival&&a.type==='price'));beMessage(h,'경쟁사 가격 공조 이탈','競合が価格協調から離脱');}if(t.investigate){const amount=30000,paid=Math.min(Math.max(0,state.cash),amount);if(paid>0)bePay(f,paid,h,'competition-investigation');if(paid<amount)r.bills.push({id:refId(),to:'authority',kind:'competition',amount:amount-paid,due:state.day+7});beRep(-5);beState().active=beState().active.filter(a=>a.serial!==t.serial);beMessage(h,'가격 약정 조사 · 약정 해제·평판 -5','価格協定調査・協定解除・評判−5');}}
 if(t.kind==='recall')beRecall({...q,lot:t.lot},h);
 if(t.kind==='production'&&t.cargo){const c=t.cargo,hub=refSite(f,c.hub)||refHome(f);if(!hub||refSiteUsed(f,hub.id)+c.qty>hub.capacity){t.due=state.day+1;return;}if(hub){refAdd(f.ops.warehouse[c.product],[refBatch(f,c.product,c.qty,c.value,c.quality,state.day+expiryLife(c.product),hub.id,c.sku)]);r.stats.manufactured+=c.qty;beMessage(h,`외주 생산 입고 ${c.qty}개`,`外注生産入荷${c.qty}本`);}}
 if((t.kind==='depart'||t.kind==='staff'&&t.retain)&&w){if(t.retain&&w.satisfaction>=85){beMessage(h,'직원 잔류 확정','社員の残留確定');return;}const v=beFirm(t.rival),destination=v&&refFirm(v).sites.find(s=>!s.closed&&!s.build&&s.kind===refSite(f,w.site)?.kind);if(t.key==='poaching'){if(!v||!destination||v.account.cash<w.salary*20||chainFirm(v).staff.length>=30){beMessage(h,'경쟁사 영입 불성립 · 직원 재직 유지','競合の採用不成立・社員は在籍維持');return;}}
 if(r.work.some(j=>j.employee===w.id)||state.jobs.some(j=>j.employee===w.id)){t.due=state.day+1;return;}
 if(t.key==='poaching'&&!bePay(v,w.salary*20,h,'headhunting'))return;
 chainFirm(f).staff=chainFirm(f).staff.filter(x=>x!==w);for(const s of r.sites)if(s.manager===w.id)s.manager=null;
 if(t.key==='poaching'){Object.assign(w,{site:destination.id,map:destination.map,salary:Math.round(w.salary*1.3),satisfaction:80,notice:0,manager:false});chainFirm(v).staff.push(w);}else if(t.replace){const before=state.cash;refHireEmployee(f,t.role,t.hub);h.spent+=Math.max(0,before-state.cash);}syncChainStaff();beMessage(h,'직원 인수인계·퇴사 처리 완료','社員の引継ぎ・退職処理完了');}
 if(t.kind==='contract'){if(t.bid){const v=beFirm(t.rival),bid=v&&v.account.cash>t.bid+10000?Math.round(t.bid*(.8+(t.serial%5)*.1)):0;if(bid>t.bid&&bePay(v,bid,h,'event-bid')){refWorld().rawCash-=t.bid;refIncome(f,t.bid,'event-bid-refund',0,false);h.received+=t.bid;beActive('demand',q,1.4,7,v.id,{scope:'map'});beMessage(h,'후원권 패찰 · 예치금 전액 반환','協賛権落札失敗・預託金全額返還');}else{expenseBookLoss(f,t.bid);beActive('demand',q,1.4,7,'player',{scope:'map'});beMessage(h,'후원권 낙찰 · 7일 지역 홍보','協賛権落札・7日間地域広報');}}
 else if(m){const c=r.contracts.find(c=>c.id===t.contract);if(!c||c.until<=state.day){beActive('block',q,1,36500,'player',{scope:'loc',contract:true});beMessage(h,'설치 계약 만료 · 기기·재고 유지, 이전 또는 재계약 필요','設置契約満了・機械と在庫は保持、移転または再契約が必要');}}}
}
