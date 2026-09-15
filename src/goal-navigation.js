/* Goal-to-operation links: display/navigation only; no new progression or clock. Load after lifecycle.js. */
const GOAL_WORKFLOWS={
 enterprise:[['equipment',B('기기 조달·설치','機械調達・設置')],['reports',B('손익·현금흐름 점검','損益・資金繰りを確認')]],
 market:[['market',B('시장·가격 비교','市場・価格を比較')],['reports',B('흑자 유지 점검','黒字の維持を確認')]],
 industry:[['manufacture',B('공장·생산 운영','工場・生産を運営')],['research',B('기술·개발 투자','技術・開発へ投資')]]
};
function goalMarketSnapshot(){
 const market=state.enterprise.operations.market,rows=market&&!market.legacy?market.districts:[],player=rows.reduce((n,d)=>n+d.player,0),total=rows.reduce((n,d)=>n+d.player+d.rival,0);
 const share=total?player/total:null,report=state.report;
 return {share,day:market?.day||null,inProgress:!!(state.live&&market?.day===state.live.day),profit:report?state.profit:null,profitDay:report?.day||null};
}
const goalNavigationBefore=lifecycleGoalsHTML;
lifecycleGoalsHTML=function(){
 const host=document.createElement('div');host.innerHTML=goalNavigationBefore();
 const visible=new Set(visibleDeskTabs().map(t=>t[0]));
 host.querySelectorAll('.company-goal').forEach((section,index)=>{
  const goal=COMPANY_GOALS[index];if(!goal)return;
  if(goal.id==='market'){
   const value=goalMarketSnapshot(),status=document.createElement('p');status.className='goal-market-status';
   const period=value.day?mgDateText(value.day):'';
   status.textContent=(value.share===null?T('판매 집계 대기 중','販売集計待ち'):T('판매 집계 ','販売集計 ')+period+(value.inProgress?T(' (진행 중)','（途中経過）'):T(' (최근 집계)','（直近集計）'))+' · '+(value.share*100).toFixed(2)+'% / 60% · '+(value.share>=.6?T('점유율 충족','シェア達成'):T('점유율 미달','シェア未達')))+' / '+(value.profit===null?T('첫 일 결산 전','初回の日次決算前'):T('최근 일 결산 ','直近日次決算 ')+mgDateText(value.profitDay)+' · '+money(value.profit)+' · '+(value.profit>0?T('흑자','黒字'):T('흑자 미충족','黒字未達')));
   section.append(status);
  }
  const nav=document.createElement('div');nav.className='goal-workflows buttons';nav.setAttribute('aria-label',T('관련 업무','関連業務'));
  for(const [desk,label] of GOAL_WORKFLOWS[goal.id]||[]){if(!visible.has(desk))continue;const b=document.createElement('button');b.type='button';b.dataset.goalDesk=desk;b.textContent=tr(label);b.disabled=state.ended||(guideActive()&&!guideAllowedTabs().includes(desk));if(b.disabled&&!state.ended)b.title=T('기본 실습을 마치면 함께 살펴봐요.','基本実習のあとで一緒に見てみましょう。');nav.append(b);}
  section.append(nav);
 });
 return host.innerHTML;
};
document.addEventListener('click',event=>{
 const b=event.target.closest('button[data-goal-desk]');if(!b||b.disabled)return;
 const tab=b.dataset.goalDesk;if(!visibleDeskTabs().some(t=>t[0]===tab)||(guideActive()&&!guideAllowedTabs().includes(tab)))return;
 closeModal();selectDesk(tab);deskNav.querySelector('[data-desk="'+tab+'"]')?.focus();
});
