/* Quotes are negotiated, saved and revalidated before a physical transfer. */
function validTrade(t){return t&&(!t.seller||['mono','atlas','nova'].includes(t.seller))&&int(t.loc,0,LOCATIONS.length-1)&&int(t.day,1,1000000)&&int(t.round,0,3)&&int(t.quote,1000,1000000000)&&int(t.offer,0,1000000000)&&['open','rejected','counter','accepted'].includes(t.status)&&(t.status!=='accepted'||t.offer>=t.quote);}
function tradeAvailable(loc){return state.started&&!state.ended&&int(loc,0,LOCATIONS.length-1)&&!!rivalOwner(loc)&&canBuild(loc);}
acquireNpc=function(loc){
 if(!tradeAvailable(loc))return;const e=state.enterprise;
 if(!e.trade||e.trade.loc!==loc||e.trade.day!==state.day){
  ensureOperations();const f=rivalOwner(loc),m=f.machines.find(m=>m.loc===loc),base=acquisitionPrice(loc),last=f.account.owned.length===1;
  const factor=last?1.4:f.account.cash<80000?.85:f.policy.mode==='price'?1.2:1.05;
  const quote=Math.ceil(Math.max(750000,base*factor+stockValue(m)+m.vault)/1000)*1000;
  e.trade={loc,seller:f.id,day:state.day,round:0,quote,offer:0,status:'open'};
 }save();openModal('trade');
};
function proposeTrade(amount){
 const t=state.enterprise.trade;if(!t||t.day!==state.day||!tradeAvailable(t.loc)||t.round>=3||t.status==='accepted'||!int(amount,1000,1000000000)||amount>state.cash)return false;
 t.round++;t.offer=amount;t.status=amount>=t.quote?'accepted':amount<t.quote*.6?'rejected':'counter';save();drawModal();return true;
}
function completeTrade(){
 const t=state.enterprise.trade;if(!t||t.day!==state.day||t.status!=='accepted'||!tradeAvailable(t.loc)||state.cash<t.offer)return false;
 const f=rivalOwner(t.loc);if(!f||f.id!==(t.seller||'mono'))return false;const o=f.ops,m=f.machines.find(m=>m.loc===t.loc);if(!m)return false;
 state.cash-=t.offer;f.account.cash+=t.offer;f.account.owned=f.account.owned.filter(id=>id!==t.loc);f.account.acquired++;
 o.machines=o.machines.filter(x=>x!==m);o.jobs=o.jobs.filter(j=>j.loc!==m.loc);state.machines.push(m);
 log(B(`${LOCATIONS[m.loc].name[0]} 인수 계약 체결 · ${money(t.offer)}`,`${LOCATIONS[m.loc].name[1]}の買収契約成立・${money(t.offer)}`));
 state.enterprise.trade=null;closeModal();save();render();return true;
}
const manageBeforeTrade=renderManage;
renderManage=function(){if(machine(selected)||!rivalOwner(selected)){manageBeforeTrade();return;}
 const l=LOCATIONS[selected];$('manage-title').textContent=tr(l.name);$('manage-tag').textContent=companyName(rivalOwner(selected));
 patchPanel($('manage'),`<p>${tr(l.desc)}</p>${row(T('인수 참고가','買収参考額'),money(acquisitionPrice(selected)))}<p class="helper">${T('가격: 개별 협상 / 영업 개시: 계약 다음 날','価格：個別交渉／営業開始：契約翌日')}</p><button class="primary full" data-acquire="${selected}" ${disabled(!tradeAvailable(selected))}>${T('인수 협상','買収交渉')}</button>${!canBuild(selected)?`<p>${T('필요 평판','必要な評判')} ${minimumPermit(selected)}</p>`:''}`);
};
const modalBeforeTrade=drawModal;
drawModal=function(){modalBeforeTrade();if(modalView!=='trade')return;const t=state.enterprise.trade;
 if(!t||t.day!==state.day||!tradeAvailable(t.loc)){$('modal-body').insertAdjacentHTML('beforeend',`<p>${T('거래 조건 만료','取引条件の期限切れ')}</p>`+buttons(closeButton()));return;}
 const messages={open:B('매입 제안 대기','買収提示待ち'),rejected:B('제안 거절','提示額を拒否'),counter:B('매도자 역제안','売主から再提示'),accepted:B('제안 수락 · 계약 체결 대기','提示額を承諾・契約待ち')};
 const body=`<h2>${T('인수 협상','買収交渉')} · ${tr(LOCATIONS[t.loc].short)}</h2><p>${tr(messages[t.status])}</p>${row(T('상대 희망가','相手の希望額'),money(t.quote))}<p>${T('이전 대상: 기기·재고·보관금 / 유효 기한: 당일','譲渡対象：機械・在庫・保管金／有効期限：本日')}</p>${t.status==='accepted'?`${row(T('합의 금액','合意額'),money(t.offer))}<button class="primary full" id="trade-confirm" ${disabled(state.cash<t.offer)}>${T('계약 체결','契約を締結')}</button>`:`<label for="trade-amount">${T('제안 금액 ($)','提示額 ($)')}</label><input class="full" type="number" id="trade-amount" min="1" max="1000000" step="1" value="${Math.round((t.offer||t.quote*.8)/1000)}"><p>${T('남은 제안','残りの提案')} ${3-t.round}</p><button class="primary full" id="trade-propose" ${disabled(t.round>=3)}>${T('금액 제안','金額を提示')}</button><p id="trade-error" role="status"></p>`}`;
 $('modal-body').insertAdjacentHTML('beforeend',body+buttons(closeButton()));
};
document.addEventListener('click',event=>{const id=event.target.closest('button')?.id;if(id==='trade-propose'){const amount=Number($('trade-amount').value)*1000;if(!proposeTrade(amount)&&$('trade-error'))$('trade-error').textContent=T('현금 범위 안에서 유효한 금액을 제안해 주세요.','手元資金の範囲内で有効な金額を提示してください。');}if(id==='trade-confirm')completeTrade();});

function validSaleOffer(o){return o&&(!o.buyer||['mono','atlas','nova'].includes(o.buyer))&&int(o.loc,0,LOCATIONS.length-1)&&int(o.price,1,1000000000)&&int(o.deadline,1,1000000)&&(!o.negotiation||(int(o.negotiation.round,0,3)&&int(o.negotiation.ask,0,1000000000)&&['open','counter','agreed','refused'].includes(o.negotiation.status)));}
function saleAvailable(){const o=state.offer;return !!(o&&state.started&&!state.ended&&o.deadline>=state.day&&machine(o.loc)&&state.machines.length>1&&!rivalLocations().includes(o.loc)&&rivalById(o.buyer||'mono')&&!rivalById(o.buyer||'mono').policy.defeated);}
function saleNegotiation(){const o=state.offer;if(!o)return null;return o.negotiation||(o.negotiation={round:0,ask:0,status:'open'});}
const transferSale=acceptOffer;
acceptOffer=function(){if(!saleAvailable())return false;saleNegotiation();save();openModal('sale');return true;};
function counterSale(amount){
 if(!saleAvailable()||!int(amount,1000,1000000000))return false;
 const o=state.offer,n=saleNegotiation(),m=machine(o.loc);if(n.round>=3||n.status==='agreed')return false;
 const f=rivalById(o.buyer||'mono'),map=LOCATIONS[m.loc].map,r=f.policy,strategic=f.account.owned.some(id=>LOCATIONS[id].map===map),premium=strategic?1.25:1.1;
 const ceiling=Math.max(0,Math.min(f.account.cash-30000,Math.round(equipment(m)*premium+stockValue(m)+m.vault)));
 n.round++;n.ask=amount;
 if(amount<=ceiling){o.price=amount;n.status='agreed';}
 else if(ceiling>o.price&&r.mode!=='retreat'){o.price=Math.min(ceiling,Math.round(o.price+(ceiling-o.price)*.5));n.status='counter';}
 else n.status='refused';
 rivalryLog(`매각 역제안 ${money(amount)} · ${n.status==='agreed'?'합의':n.status==='counter'?'경쟁사 재제시 '+money(o.price):'거절'}`,`売却再提示 ${money(amount)}・${n.status==='agreed'?'合意':n.status==='counter'?'競合の再提示 '+money(o.price):'拒否'}`);
 save();drawModal();return true;
}
function completeSale(){if(!saleAvailable())return false;const o=state.offer,f=rivalById(o.buyer||'mono'),m=machine(o.loc);if(f.account.cash<o.price)return false;state.cash+=o.price;f.account.cash-=o.price;f.account.owned.push(m.loc);removeMachine(m.loc);f.ops.machines=f.ops.machines.filter(x=>x.loc!==m.loc);f.ops.machines.push(m);log(B(`${companyNameFor(f.id,0)}에 매각 · ${money(o.price)}`,`${companyNameFor(f.id,1)}へ売却・${money(o.price)}`));closeModal();save();render();return true;}
function declineSale(){if(!state.offer)return false;const loc=state.offer.loc;state.offer=null;rivalryLog(`${LOCATIONS[loc].short[0]} 매각 제안 거절`,`${LOCATIONS[loc].short[1]}の売却提案を辞退`);closeModal();save();render();return true;}
const modalBeforeSale=drawModal;
drawModal=function(){modalBeforeSale();if(modalView!=='sale')return;
 if(!saleAvailable()){$('modal-body').insertAdjacentHTML('beforeend',`<p>${T('매각 조건 만료','売却条件の期限切れ')}</p>`+buttons(closeButton()));return;}
 const o=state.offer,n=saleNegotiation(),m=machine(o.loc),f=rivalById(o.buyer||'mono'),messages={open:B('경쟁사 매입 제안','競合からの買収提案'),counter:B('경쟁사 재제시','競合からの再提示'),agreed:B('금액 합의 · 계약 대기','金額合意・契約待ち'),refused:B('역제안 거절 · 기존 제안 유지','再提示を拒否・従来の提案を維持')};
 $('modal-body').insertAdjacentHTML('beforeend',`<h2>${companyName(f)} · ${T('기기 매각 협상','機械売却交渉')} · ${tr(LOCATIONS[o.loc].short)}</h2><p>${tr(messages[n.status])}</p>${row(T('경쟁사 제시 금액','競合の提示額'),money(o.price))}${row(T('재고 / 보관금','在庫／保管金'),m.stock+' / '+money(m.vault))}<p>${T('이전 대상: 기기·재고·보관금','譲渡対象：機械・在庫・保管金')} · DAY ${o.deadline}${T('까지','まで')}</p>${n.status!=='agreed'?`<label for="sale-amount">${T('희망 매각가 ($)','希望売却額 ($)')}</label><input class="full" id="sale-amount" type="number" min="1" max="1000000" step="1" value="${Math.ceil((n.ask||o.price*1.15)/1000)}"><p>${T('남은 역제안','残りの再提示')} ${3-n.round}</p><button class="full" id="sale-counter" ${disabled(n.round>=3)}>${T('역제안','再提示')}</button>`:''}<p id="sale-error" role="status">${f.account.cash<o.price?T('상대 자금 부족 · 체결 불가','相手の資金不足・契約不可'):''}</p><button class="primary full" id="sale-confirm" ${disabled(f.account.cash<o.price)}>${T('제시 금액으로 매각 계약','提示額で売却契約')} · ${money(o.price)}</button><button class="full" id="sale-decline">${T('제안 거절','提案を辞退')}</button>`+buttons(closeButton()));
};
document.addEventListener('click',event=>{const id=event.target.closest('button')?.id;if(id==='sale-counter'&&!counterSale(Number($('sale-amount').value)*1000))$('sale-error').textContent=T('유효한 금액을 입력해 주세요.','有効な金額を入力してください。');if(id==='sale-confirm'&&!completeSale())drawModal();if(id==='sale-decline')declineSale();});
