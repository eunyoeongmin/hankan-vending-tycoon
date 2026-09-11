/* Read-only availability checks for the order forms; transactions remain authoritative. */
function refRequirement(ko,ja,desk=''){return {text:T(ko,ja),desk};}
function refRequirementUI(id,reason){const route=reason?.desk,tab=DESK_TABS.find(t=>t[0]===route);return `<p id="ref-${id}-status" class="ref-status" role="status">${reason?esc(reason.text):''}${tab?` <button data-desk="${route}">${tr(tab[1])} →</button>`:''}</p>`;}
function refOwnProducts(f){return refFirm(f).products.map(refSKU).filter(s=>s&&!s.retired);}
function refBuildRequirement(f,kind){
 if(refFirm(f).sites.filter(s=>!s.closed).length>=20)return refRequirement('사업장 한도 20곳','事業所の上限20か所');
 if(['drink','machine'].includes(kind)){
  const key=kind==='drink'?'quality':'efficiency';
  if(chainFirm(f).licenses[key]<1)return refRequirement(tr(chainResearchName(key))+' 1단계 기술 필요',tr(chainResearchName(key))+' 第1段階の技術が必要','research');
  if(expansionFirm(f).plants[kind]+chainFirm(f).builds.filter(b=>b.kind===kind).length>=3)return refRequirement('해당 공장 한도 3곳','当該工場の上限3か所');
 }
 const cost=kind==='warehouse'?150000:kind==='research'?250000:factoryCost(f,kind);
 if(f.account.cash<cost)return refRequirement('건설 자금 '+money(cost)+' 필요','建設資金 '+money(cost)+' が必要','finance');
 return null;
}
function refRelocationSites(f){return chainFirm(f).sites.filter(s=>!machine(s.loc)&&!rivalLocations().includes(s.loc)&&!chainFirm(f).orders.some(o=>o.kind==='installation'&&o.loc===s.loc)&&!refFirm(f).work.some(j=>j.kind==='relocation'&&j.to===s.loc));}
function refRelocationRequirement(f,loc,to){
 const m=f.machines.find(m=>m.loc===loc);
 if(!m)return refRequirement('이전할 기기 없음','移転する機械なし','equipment');
 if(!refRelocationSites(f).some(s=>s.loc===to))return refRequirement('계약한 빈 입지 필요','契約済みの空き立地が必要','equipment');
 if(refFirm(f).work.some(j=>j.loc===loc))return refRequirement('선택 기기 작업 중','選択機械は作業中');
 if(f.account.cash<20000)return refRequirement('이전 비용 $20 필요','移転費用 $20 が必要','finance');
 return null;
}
function refProductionRequirement(f,site,skuId,qty){
 const r=refFirm(f),s=refSite(f,site),sku=refSKU(skuId);
 if(!s||s.closed)return refRequirement('공장 건설 필요','工場建設が必要','sites');
 if(s.build)return refRequirement('공장 건설 중 · 남은 '+chainDays(s.build)+'일','工場建設中・残り '+chainDays(s.build)+'日','sites');
 if(s.kind==='drink'&&(!sku||sku.owner!==f.id||sku.retired))return refRequirement('자사 음료 출시 필요','自社飲料の発売が必要','products');
 if(!int(qty,1,500)||s.kind==='machine'&&qty!==1)return refRequirement(s.kind==='machine'?'기기 생산량은 1대':'생산량은 1~500개',s.kind==='machine'?'機械の生産数は1台':'生産数は1〜500本');
 if(s.kind==='drink'&&sku.trialUntil&&qty>100)return refRequirement('시험 상품은 1회 최대 100개','試験商品は1回100本まで','products');
 if(r.work.some(j=>j.kind==='production'&&j.site===site))return refRequirement('공장 생산 작업 중','工場は生産作業中');
 if(!refStaffPower(f,s.kind,site))return refRequirement('공장에 근무 가능한 생산 직원 배치 필요','工場に稼働可能な生産社員の配置が必要','staff');
 const hub=refHome(f);
 if(s.kind==='drink'&&refSiteUsed(f,hub.id)+qty>hub.capacity)return refRequirement('완제품 입고 거점 용량 부족','完成品の入荷拠点の容量不足','logistics');
 const recipe=s.kind==='drink'?['water','concentrate','package']:['steel','electronics'];
 const missing=recipe.filter(k=>r.materials.filter(b=>b.site===site&&b.material===k).reduce((n,b)=>n+b.qty,0)<(s.kind==='drink'&&k!=='package'?Math.ceil(qty*(sku.volume||350)/350):qty));
 if(missing.length)return refRequirement('공장 원재료 부족: '+missing.map(refLabel).join(', '),'工場の原材料不足：'+missing.map(refLabel).join(', '));
 return null;
}
function refOEMRequirement(f,skuId,hub,vendorId){
 const sku=refSKU(skuId),s=chainSupplier(vendorId),r=refFirm(f),h=refSite(f,hub),qty=100;
 if(!sku||sku.owner!==f.id||sku.retired)return refRequirement('자사 상품 출시 필요 · 직접 공장 불필요','自社商品の発売が必要・自社工場は不要','products');
 if(!s||s.kind!=='drink')return refRequirement('음료 공급사 선택 필요','飲料仕入先を選択');
 const source=refSKU(s.id+':'+sku.product);
 if(!source||sku.volume!==source.volume)return refRequirement('용량 불일치: 자사 '+sku.volume+' ml / 공급사 '+(source?.volume||'—')+' ml','容量不一致：自社 '+sku.volume+' ml／仕入先 '+(source?.volume||'—')+' ml');
 if(!h||h.build||h.kind!=='warehouse')return refRequirement('완공된 입고 거점 필요','完成した入荷拠点が必要','sites');
 if(PRODUCTS[sku.product].unlock>f.research.products)return refRequirement('상품 연구 필요','商品研究が必要','research');
 if(r.work.length>=250)return refRequirement('대기 작업 한도 도달','待機作業の上限に到達');
 if(refSiteUsed(f,hub)+qty>h.capacity)return refRequirement('입고 거점 용량 부족','入荷拠点の容量不足','logistics');
 const terms=r.purchaseTerms.find(t=>t.supplier===s.id&&t.until>=state.day);
 if((terms?.min||20)>qty)return refRequirement('최소 계약 수량이 OEM 100개를 초과 · 계약 변경 필요','契約最小数量がOEM100本を超過・契約変更が必要');
 if(f.meta.contract&&f.meta.contract.until>=state.day&&f.meta.contract.supplier!==['aqua','sun','value'].indexOf(s.id))return refRequirement('기존 공급 계약과 거래처 불일치','既存の供給契約と取引先が不一致');
 const reserved=allFirms().filter(v=>v.id!==f.id).flatMap(v=>refFirm(v).reservations).filter(x=>x.supplier===s.id&&x.until>=state.day).reduce((n,x)=>n+Math.max(0,x.qty-x.used),0);
 if(refWorld().suppliers[s.id].closedUntil>state.day||s.stock[sku.product].qty-qty<reserved)return refRequirement('공급 중단 또는 공급사 재고 부족','供給停止または仕入先の在庫不足');
 const price=supplierPrice(s,sku.product,f),value=Math.round(price*qty*source.volume/350*(1-(terms?.discount||0))),fee=qty*80;
 if(f.account.cash<fee+price*qty||!(terms?.days>0)&&f.account.cash<fee+value)return refRequirement('OEM 발주 자금 부족','OEM発注資金が不足','finance');
 if(terms?.days>0&&r.bills.reduce((n,b)=>n+b.amount,0)+value>Math.max(0,companyEquity(f)*.25))return refRequirement('외상 한도 부족','掛取引の限度額が不足','finance');
 return null;
}

function refRetailMachineReason(m,p){if(!retailProductAllowed(playerFirm(),p))return T('상품 연구 필요','商品研究が必要');if(refEnabled()&&!refSupports(m,p))return p===4&&!m.ref.cold?T('저온 판매 설비 필요','低温販売設備が必要'):p===5&&!m.ref.hot?T('온장 판매 설비 필요','保温販売設備が必要'):T('정비·가동 상태 확인','整備・稼働状態を確認');return '';}
function refSlotRequirement(f,loc,slot,id){const m=f.machines.find(m=>m.loc===loc),sku=refSKU(id),s=m?.slots[slot];if(!s||!sku||sku.retired)return refRequirement('기기·판매 상품 선택 필요','機械・販売商品を選択');if(s.stock)return refRequirement('남은 재고를 먼저 소진하거나 회수하십시오','残在庫を先に販売または回収してください','manage');const reason=refRetailMachineReason(m,sku.product);return reason?{text:reason,desk:'equipment'}:null;}
function refPurchaseRequirement(f,id,qty,hub){const sku=refSKU(id),r=refFirm(f),h=refSite(f,hub);if(!sku||sku.retired)return refRequirement('판매 중인 상품 선택 필요','販売中の商品を選択');if(!h||h.kind!=='warehouse'||h.build)return refRequirement('완공된 입고 거점 필요','完成した入荷拠点が必要','logistics');if(!retailProductAllowed(f,sku.product))return refRequirement('상품 연구 필요','商品研究が必要','research');if(!int(qty,20,1000))return refRequirement('발주 수량 20~1,000개','発注数量20〜1,000本');if(r.work.length>=250)return refRequirement('대기 작업 한도 도달','待機作業の上限に到達');if(refSiteUsed(f,hub)+qty>h.capacity)return refRequirement('입고 거점 용량 부족','入荷拠点の容量不足','logistics');
 const vendor=chainSupplier(sku.owner),seller=allFirms().find(v=>v.id===sku.owner),terms=r.purchaseTerms.find(t=>t.supplier===sku.owner&&t.until>=state.day);if(qty<(terms?.min||20))return refRequirement('최소 발주 '+terms.min+'개','最低発注'+terms.min+'本');if(!vendor&&(!seller||seller.id===f.id))return refRequirement('자사 상품은 제조·위탁 생산에서 조달','自社商品は製造・委託生産で調達','manufacture');
 if(vendor){if(f.meta.contract&&f.meta.contract.until>=state.day&&f.meta.contract.supplier!==['aqua','sun','value'].indexOf(vendor.id))return refRequirement('기존 공급 계약과 거래처 불일치','既存の供給契約と取引先が不一致');const held=allFirms().filter(v=>v.id!==f.id).flatMap(v=>refFirm(v).reservations).filter(t=>t.supplier===vendor.id&&t.until>=state.day).reduce((n,t)=>n+Math.max(0,t.qty-t.used),0);if(refWorld().suppliers[vendor.id].closedUntil>state.day||vendor.stock[sku.product].qty-qty<held)return refRequirement('공급 중단 또는 공급 재고 부족','供給停止または供給在庫不足');}else if(seller.ops.warehouse[sku.product].batches.filter(b=>b.sku===id).reduce((n,b)=>n+b.qty,0)<qty)return refRequirement('거래처 판매 재고 부족','取引先の販売在庫不足');
 const value=Math.round((vendor?supplierPrice(vendor,sku.product,f)*(sku.volume||350)/350*(1-(terms?.discount||0)):sku.wholesale||PRODUCTS[sku.product].cost*1.15)*qty);if(terms?.days>0?r.bills.reduce((n,b)=>n+b.amount,0)+value>Math.max(0,companyEquity(f)*.25):f.account.cash<value)return refRequirement(terms?.days?'외상 한도 부족':'발주 자금 부족',terms?.days?'掛取引の限度額不足':'発注資金不足','finance');return null;
}
