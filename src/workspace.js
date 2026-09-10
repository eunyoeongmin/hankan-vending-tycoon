/* A persistent map and one switchable, internally scrolling management surface. */
const deskLayout=document.querySelector('.layout'),deskMap=deskLayout.firstElementChild,deskSide=deskLayout.querySelector('aside');
deskMap.id='desk-map';deskSide.id='desk-side';
const deskNav=document.createElement('nav');deskNav.id='desk-nav';
const deskContent=document.createElement('div');deskContent.id='desk-content';
const deskManage=$('manage').closest('.panel'),deskFleet=document.createElement('section');deskFleet.id='desk-fleet';
deskFleet.append(document.querySelector('.section-head'),$('machines'));
const deskJournal=document.createElement('section');deskJournal.id='desk-journal';deskJournal.append(document.querySelector('.log'),$('chart'),document.querySelector('.goal'));
const deskNodes={manage:deskManage,fleet:deskFleet,enterprise:$('enterprise'),operations:$('operations'),hq:$('hq'),bank:$('bank-panel'),complaints:$('complaints-panel'),events:$('event-panel'),rival:$('rival-panel'),journal:deskJournal,weather:$('weather')};
Object.values(deskNodes).forEach(node=>deskContent.append(node));deskSide.replaceChildren(deskNav,deskContent);
const deskAlerts=document.createElement('div');deskAlerts.id='desk-alerts';deskMap.append(deskAlerts);
const DESK_TABS=[['manage',B('기기 관리','機械管理')],['fleet',B('보유 기기','所有機械')],['supply',B('발주','発注')],['finance',B('재무','財務')],['staff',B('직원','スタッフ')],['research',B('연구','研究')],['market',B('시장','市場')],['rivalry',B('경쟁','競合')],['alerts',B('알림','通知')],['journal',B('일지·목표','日誌・目標')]];
let deskTab='manage';
function selectDesk(tab){if(!DESK_TABS.some(x=>x[0]===tab))return;deskTab=tab;
 const panels={manage:['manage'],fleet:['fleet'],supply:['enterprise'],finance:['bank','enterprise'],staff:['operations'],research:['hq','enterprise'],market:['enterprise','weather'],rivalry:['enterprise','rival'],alerts:['events','complaints'],journal:['enterprise','journal']}[tab]||['expansion'];
 for(const [key,node] of Object.entries(deskNodes))node.hidden=!panels.includes(key);
 if(panels.includes('enterprise')){enterpriseTab=tab==='finance'?'reports':tab==='journal'?'overview':tab;renderEnterprise();}
 deskContent.scrollTop=0;updateDesk();
}
function updateDesk(){
 const today=liveTotals();document.querySelectorAll('.stat-label')[1].textContent=T('오늘 매출총이익','本日の売上総利益');$('profit').textContent=money(today.revenue-today.cost);$('profit').classList.toggle('negative',today.revenue<today.cost);
 deskNav.setAttribute('aria-label',T('경영 패널','経営パネル'));
 patchPanel(deskNav,DESK_TABS.map(([id,name])=>`<button data-desk="${id}" aria-pressed="${deskTab===id}" class="${deskTab===id?'primary':''}">${tr(name)}</button>`).join(''));
 const out=state.machines.filter(m=>m.stock===0).length;
 patchPanel(deskAlerts,`<span>${tr(WEATHER[state.weather].name)} · ${tr(SEASONS[sceneSeason()].name)}</span><button data-desk="fleet">${T('품절','品切れ')} ${out}</button><button data-desk="alerts">${T('민원','相談')} ${state.complaints.length}</button><button id="desk-event" ${disabled(!state.pending)}>${T('사건','事件')} ${state.pending?1:0}</button>`);
}
document.addEventListener('click',event=>{
 const desk=event.target.closest('[data-desk]');if(desk)selectDesk(desk.dataset.desk);
 const selectedPin=event.target.closest('[data-select]');if(selectedPin)selectDesk('manage');
 const enterprise=event.target.closest('[data-enterprise-tab]');if(enterprise){const tab=enterprise.dataset.enterpriseTab;selectDesk(tab==='reports'?'finance':tab==='overview'?'journal':tab);}
 if(event.target.closest('#desk-event')&&state.pending)openModal('event');
});
const renderBeforeDesk=renderWorld;renderWorld=function(){renderBeforeDesk();updateDesk();};
const numbersBeforeDesk=refreshLiveNumbers;refreshLiveNumbers=function(){numbersBeforeDesk();updateDesk();};
document.body.classList.add('workspace');selectDesk('manage');

document.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)&&event.target.closest('[data-select]'))selectDesk('manage');});
