/* Fixed management console: status strip, company tree, working area, message register. */
const officeMain=document.querySelector('main'),officeStatus=document.createElement('section');officeStatus.id='office-status';
officeStatus.append(document.querySelector('.day-control'),document.querySelector('.stats'));
const officeDebt=document.createElement('span');officeDebt.id='office-debt';officeStatus.append(officeDebt,document.querySelector('.scene-actions'));
officeMain.prepend(officeStatus);deskLayout.prepend(deskNav);
const officeRegister=document.createElement('section');officeRegister.id='office-register';
const officeRegisterTabs=document.createElement('nav');officeRegisterTabs.id='office-register-tabs';
const officeMessages=document.createElement('div');officeMessages.id='office-messages';
officeRegister.append(officeRegisterTabs,document.querySelector('.log'),officeMessages);officeMain.append(officeRegister);
let officeFeed='all',officeMessageKey='';
function officeUpdate(){
 document.body.classList.add('office');deskLayout.dataset.screen=deskTab;
 deskMap.hidden=!['manage','fleet','market'].includes(deskTab);
 deskNav.dataset.caption=T('회사 메뉴','会社メニュー');document.querySelectorAll('.stat-label')[0].textContent=T('현금','現金');document.querySelectorAll('.stat-label')[1].textContent=T('매출총이익','売上総利益');
 officeDebt.textContent=T('차입금 ','借入金 ')+money(state.bank.principal+state.bank.arrears);
 $('scene-speed-label').textContent=T('속도','速度');for(const option of $('scene-speed').options)option.textContent=option.value+'×';
 $('scene-pause').textContent=livePaused?T('재개','再開'):T('정지','停止');$('help').textContent=T('도움말','ヘルプ');
 officeRegisterTabs.setAttribute('aria-label',T('업무 기록','業務記録'));
 patchPanel(officeRegisterTabs,[['all',T('영업 기록','営業記録')],['rival',T('경쟁사 동향','競合動向')],['complaints',T('민원','相談')]].map(([id,name])=>`<button data-office-feed="${id}" aria-pressed="${officeFeed===id}">${name}</button>`).join(''));
 document.querySelector('.log').hidden=officeFeed!=='all';officeMessages.hidden=officeFeed==='all';
 const records=officeFeed==='rival'?ensureRivalry().history.map(x=>`<div><time>DAY ${x.day}</time><span>${esc(tr(x.text))}</span></div>`):state.complaints.map(c=>`<div><time>DAY ${c.deadline}</time><button data-desk="alerts">${esc(tr(LOCATIONS[c.loc].short))} · ${esc(tr(COMPLAINT_NAMES[c.kind]))}</button></div>`);
 const key=lang+officeFeed+records.join('');if(key!==officeMessageKey){officeMessageKey=key;patchPanel(officeMessages,records.join('')||`<div>${T('기록 없음','記録なし')}</div>`);}
 // Decorative symbols are excluded from console text; map/weather symbols retain their meaning.
 for(const host of [deskContent,officeRegister,$('modal-body')]){
  const walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){if(node.parentElement.closest('svg,select,option'))continue;const clean=node.textContent.replace(/[\u{1F300}-\u{1FAFF}\u{2605}\u{2728}\uFE0F]/gu,'');if(clean!==node.textContent)node.textContent=clean;}
 }
}
const updateBeforeOffice=updateDesk;updateDesk=function(){updateBeforeOffice();officeUpdate();};
const modalBeforeOffice=drawModal;drawModal=function(){modalBeforeOffice();if(modalView==='help'){
 const bar=$('modal-body').querySelector('.entry-languages');$('modal-body').replaceChildren();if(bar)$('modal-body').append(bar);
 const rules=[[T('영업 시간','営業時間'),T('1배속: 1일 3분 / 메뉴·다른 탭에서 정지','1倍速：1日3分／メニュー・他タブで停止')],[T('매출 회수','売上回収'),T('기기 보관금 → 직접 회수 또는 직원 배치','機械の保管金→手動回収またはスタッフ配置')],[T('발주·보충','発注・補充'),T('선결제 → 배송 → 창고 → 기기 보충','前払い→配送→倉庫→機械補充')],[T('가격·재고','価格・在庫'),T('슬롯별 설정 / 품목 변경 시 재고는 창고로 이동','スロット別設定／商品変更時は在庫を倉庫へ移動')],[T('손익','損益'),T('매출 − 판매 원가 − 운영비 − 이자','売上−売上原価−運営費−利息')],[T('민원','相談'),T('처리 기한 경과: 벌금·철거 위험','期限超過：罰金・撤去リスク')]];
 $('modal-body').insertAdjacentHTML('beforeend',`<h2>${T('운영 참고','運営資料')}</h2><table class="office-help">${rules.map(([k,v])=>`<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table>`+buttons(inGameSession&&menuOpen?`<button id="menu-back">${T('메뉴로','メニューへ')}</button>`:closeButton()));
 }officeUpdate();};
document.addEventListener('click',event=>{const button=event.target.closest('[data-office-feed]');if(button){officeFeed=button.dataset.officeFeed;officeUpdate();}});
officeUpdate();
const enterpriseBeforeOffice=renderEnterprise;
renderEnterprise=function(force=true){enterpriseBeforeOffice(force);if(enterpriseTab!=='overview')return;
 const e=state.enterprise,t=liveTotals();
 const rows=[[T('오늘 매출','本日売上'),money(t.revenue)],[T('매출 원가','売上原価'),money(t.cost)],[T('매출총이익','売上総利益'),money(t.revenue-t.cost)],[T('전일 순이익','前日純利益'),money(e.reports[0]?.net||0)],[T('품절 슬롯','品切れスロット'),state.machines.reduce((n,m)=>n+m.slots.filter(s=>!s.stock).length,0)],[T('운송 중 주문','輸送中の注文'),e.orders.length],[T('정비 필요','要整備'),state.machines.filter(m=>m.condition<40).length],[T('다음 날 예보','翌日予報'),tr(WEATHER[e.forecast??0].name)],[T('본사 일일 비용','本社日次費用'),money(enterpriseDailyCost())]];
 patchPanel($('enterprise').querySelector('.enterprise-body'),`<h3>${T('영업 집계','営業集計')}</h3>`+enterpriseTable([T('항목','項目'),T('현재 값','現在値')],rows.map(([name,value])=>`<tr><td>${name}</td><td>${value}</td></tr>`)));
};
