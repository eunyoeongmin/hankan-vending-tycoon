/* Quotes are negotiated, saved and revalidated before a physical transfer. */
function validTrade(t){return t&&int(t.loc,0,23)&&int(t.day,1,1000000)&&int(t.round,0,3)&&int(t.quote,1000,1000000000)&&int(t.offer,0,1000000000)&&['open','rejected','counter','accepted'].includes(t.status)&&(t.status!=='accepted'||t.offer>=t.quote);}
function tradeAvailable(loc){return state.started&&!state.ended&&int(loc,0,23)&&state.npc.owned.includes(loc)&&canBuild(loc);}
acquireNpc=function(loc){
 if(!tradeAvailable(loc))return;const e=state.enterprise;
 if(!e.trade||e.trade.loc!==loc||e.trade.day!==state.day){
  const m=ensureOperations().machines.find(m=>m.loc===loc),base=acquisitionPrice(loc),last=state.npc.owned.length===1;
  const factor=last?1.4:state.npc.cash<80000?.85:ensureRivalry().mode==='price'?1.2:1.05;
  const quote=Math.ceil(Math.max(750000,base*factor+stockValue(m)+m.vault)/1000)*1000;
  e.trade={loc,day:state.day,round:0,quote,offer:0,status:'open'};
 }save();openModal('trade');
};
function proposeTrade(amount){
 const t=state.enterprise.trade;if(!t||t.day!==state.day||!tradeAvailable(t.loc)||t.round>=3||t.status==='accepted'||!int(amount,1000,1000000000)||amount>state.cash)return false;
 t.round++;t.offer=amount;t.status=amount>=t.quote?'accepted':amount<t.quote*.6?'rejected':'counter';save();drawModal();return true;
}
function completeTrade(){
 const t=state.enterprise.trade;if(!t||t.day!==state.day||t.status!=='accepted'||!tradeAvailable(t.loc)||state.cash<t.offer)return false;
 const o=ensureOperations(),m=o.machines.find(m=>m.loc===t.loc);if(!m)return false;
 state.cash-=t.offer;state.npc.cash+=t.offer;state.npc.owned=state.npc.owned.filter(id=>id!==t.loc);state.npc.acquired++;
 o.machines=o.machines.filter(x=>x!==m);o.jobs=o.jobs.filter(j=>j.loc!==m.loc);state.machines.push(m);
 log(B(`${LOCATIONS[m.loc].name[0]} 인수 계약 체결 · ${money(t.offer)}`,`${LOCATIONS[m.loc].name[1]}の買収契約成立・${money(t.offer)}`));
 state.enterprise.trade=null;closeModal();save();render();return true;
}
const manageBeforeTrade=renderManage;
renderManage=function(){if(machine(selected)||!state.npc.owned.includes(selected)){manageBeforeTrade();return;}
 const l=LOCATIONS[selected];$('manage-title').textContent=tr(l.name);$('manage-tag').textContent=T('경쟁사 소유','競合が所有');
 patchPanel($('manage'),`<p>${tr(l.desc)}</p>${row(T('인수 참고가','買収参考額'),money(acquisitionPrice(selected)))}<p class="helper">${T('매각 조건을 제안해 보세요. 상대의 출점 전략과 운영 상황에 따라 요구 금액이 달라집니다. 계약 후 다음 날부터 판매합니다.','買収条件を提案しましょう。相手の出店戦略と経営状況により希望額が変わります。契約の翌日から営業します。')}</p><button class="primary full" data-acquire="${selected}" ${disabled(!tradeAvailable(selected))}>${T('인수 협상','買収交渉')}</button>${!canBuild(selected)?`<p>${T('필요 평판','必要な評判')} ${minimumPermit(selected)}</p>`:''}`);
};
const modalBeforeTrade=drawModal;
drawModal=function(){modalBeforeTrade();if(modalView!=='trade')return;const t=state.enterprise.trade;
 if(!t||t.day!==state.day||!tradeAvailable(t.loc)){$('modal-body').insertAdjacentHTML('beforeend',`<p>${T('거래 조건이 만료되었습니다. 다시 협상해 주세요.','取引条件の期限が切れました。再度交渉してください。')}</p>`+buttons(closeButton()));return;}
 const messages={open:B('매각 조건을 검토하겠습니다. 인수 금액을 제안해 주세요.','売却条件を検討します。買収額をご提示ください。'),rejected:B('그 금액으로는 매각하기 어렵습니다.','その金額では売却できません。'),counter:B('제안은 검토했지만, 아래 금액을 희망합니다.','ご提案を検討しましたが、以下の金額を希望します。'),accepted:B('제안을 수락합니다. 계약을 체결하면 기기를 넘기겠습니다.','ご提案を承諾します。契約成立後に機械を譲渡します。')};
 const body=`<h2>${T('인수 협상','買収交渉')} · ${tr(LOCATIONS[t.loc].short)}</h2><p>${tr(messages[t.status])}</p>${row(T('상대 희망가','相手の希望額'),money(t.quote))}<p>${T('기기·현재 재고·보관 매출을 함께 인수합니다. 조건은 오늘까지 유효합니다.','機械・現在の在庫・保管売上をまとめて引き継ぎます。条件は本日限り有効です。')}</p>${t.status==='accepted'?`${row(T('합의 금액','合意額'),money(t.offer))}<button class="primary full" id="trade-confirm" ${disabled(state.cash<t.offer)}>${T('계약 체결','契約を締結')}</button>`:`<label for="trade-amount">${T('제안 금액 ($)','提示額 ($)')}</label><input class="full" type="number" id="trade-amount" min="1" max="1000000" step="1" value="${Math.round((t.offer||t.quote*.8)/1000)}"><p>${T('남은 제안','残りの提案')} ${3-t.round}</p><button class="primary full" id="trade-propose" ${disabled(t.round>=3)}>${T('금액 제안','金額を提示')}</button><p id="trade-error" role="status"></p>`}`;
 $('modal-body').insertAdjacentHTML('beforeend',body+buttons(closeButton()));
};
document.addEventListener('click',event=>{const id=event.target.closest('button')?.id;if(id==='trade-propose'){const amount=Number($('trade-amount').value)*1000;if(!proposeTrade(amount)&&$('trade-error'))$('trade-error').textContent=T('현금 범위 안에서 유효한 금액을 제안해 주세요.','手元資金の範囲内で有効な金額を提示してください。');}if(id==='trade-confirm')completeTrade();});
