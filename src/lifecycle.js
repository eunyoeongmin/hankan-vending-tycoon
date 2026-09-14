/* Modern management goals share daily assessment; free play never ends without a choice. */
const COMPANY_GOALS=[
 {id:'enterprise',name:B('도시의 대표 기업','街を代表する企業'),rule:B('자판기 8대 · 기업가치 $10,000 · 당일 흑자','自販機8台・企業価値$10,000・当日黒字')},
 {id:'market',name:B('시장의 선두 기업','市場を率いる企業'),rule:B('판매 점유율 60% 이상과 당일 흑자를 60일 연속 유지','販売シェア60%以上と当日黒字を60日連続で維持')},
 {id:'industry',name:B('제조와 유통의 완성','製造と流通の完成'),rule:B('음료·기기 공장 보유 · 누적 생산 3,000개 · 기기 10대 · 당일 흑자를 30일 연속 유지','飲料・機械工場保有・累計生産3,000個・自販機10台・当日黒字を30日連続で維持')}
];
function lifecycleValid(x){return x&&x.version===1&&int(x.lastDay,-1,1000000)&&Array.isArray(x.achievements)&&x.achievements.length<=3&&new Set(x.achievements.map(a=>a.id)).size===x.achievements.length&&x.achievements.every(a=>a&&COMPANY_GOALS.some(g=>g.id===a.id)&&int(a.day,1,1000000));}
function lifecycleState(){if(!lifecycleValid(state.lifecycle))state.lifecycle={version:1,lastDay:-1,achievements:[]};return state.lifecycle;}
const lifecycleValidBefore=valid;valid=function(s){return lifecycleValidBefore(s)&&(!s.lifecycle||lifecycleValid(s.lifecycle));};
function lifecycleProgress(){const f=playerFirm(),i=state.enterprise.industry,e=state.enterprise.expansion,x=expansionFirm(f);return [
 {complete:f.machines.length>=8&&companyValue(f)>=10000000&&state.profit>0,text:T(`기기 ${f.machines.length}/8 · 기업가치 ${money(companyValue(f))} / $10,000 · 전일 손익 ${money(state.profit)}`,`機械 ${f.machines.length}/8・企業価値 ${money(companyValue(f))} / $10,000・前日損益 ${money(state.profit)}`)},
 {complete:i.shareDays>=60,text:T(`연속 달성 ${i.shareDays}/60일`,`連続達成 ${i.shareDays}/60日`)},
 {complete:e.dominanceDays>=30,text:T(`음료 공장 ${x.plants.drink} · 기기 공장 ${x.plants.machine} · 생산 ${x.produced}/3,000 · 기기 ${f.machines.length}/10 · 연속 ${e.dominanceDays}/30일`,`飲料工場 ${x.plants.drink}・機械工場 ${x.plants.machine}・生産 ${x.produced}/3,000・自販機 ${f.machines.length}/10・連続 ${e.dominanceDays}/30日`)}
 ];}
function lifecycleFinish(type,reason){if(!mgEnabled()||state.ended)return false;state.ending={type,reason,day:state.day,assets:assets()};state.ended=true;state.live=null;livePaused=true;businessCarry=0;lastSceneFrame=null;
 if(type==='success'&&!state.runWinRecorded){state.runWinRecorded=true;profile.clears=Math.min(20,profile.clears+1);saveProfile();}save();render();openModal('end');return true;}
function lifecycleClaim(id){if(!mgEnabled()||!lifecycleState().achievements.some(a=>a.id===id))return false;return lifecycleFinish('success',id);}
const lifecycleCheckBefore=checkEnding;checkEnding=function(timeCheck=false){
 if(!mgEnabled())return lifecycleCheckBefore(timeCheck);
 // Retain finance reviews, creditor actions, real streaks and failure checks; replace only legacy success/time stops.
 const continued=state.continued;let stopped;state.continued=true;try{stopped=lifecycleCheckBefore(timeCheck);}finally{state.continued=continued;}
 if(stopped||state.ended)return true;
 const l=lifecycleState();if(timeCheck&&l.lastDay<state.day){l.lastDay=state.day;
  if(!state.enterprise.expansion.debug){const values=lifecycleProgress();COMPANY_GOALS.forEach((goal,index)=>{if(values[index].complete&&!l.achievements.some(a=>a.id===goal.id)){l.achievements.push({id:goal.id,day:state.day});log(B(`경영 성과 달성: ${goal.name[0]} · 회사 목표에서 결산할 수 있어요.`,`経営成果達成：${goal.name[1]}・会社目標で決算できます。`));toast(B('새 경영 성과를 달성했어요. 회사 목표를 확인해 주세요.','新しい経営成果を達成しました。会社目標をご覧ください。'));}});}
  if(!refWorld().management.free&&!continued&&state.day>=state.duration){const best=['industry','market','enterprise'].find(id=>l.achievements.some(a=>a.id===id));return lifecycleFinish(best?'success':'time',best||'assessment');}
  save();
 }
 lifecyclePaint();return false;
};
const lifecycleButton=document.createElement('button');lifecycleButton.id='company-goals-button';officeStatus.append(lifecycleButton);
function lifecyclePaint(){lifecycleButton.hidden=!mgEnabled();if(mgEnabled()){controlText('company-goals-button',T('회사 목표','会社目標')+' '+lifecycleState().achievements.length+'/3');lifecycleButton.disabled=!state.started;}}
function lifecycleGoalsHTML(){const l=lifecycleState(),values=lifecycleProgress();return `<h2>${T('회사 목표와 경영 기록','会社目標と経営記録')}</h2><p>${refWorld().management.free?T('기간 제한 없이 운영합니다. 성과를 달성하면 결산을 선택하거나 다음 목표에 도전할 수 있어요.','期限なしで経営できます。成果を達成したら決算を選ぶか、次の目標に挑戦できます。'):T('평가 예정일: ','評価予定日：')+mgDateText(state.duration)}</p>`+COMPANY_GOALS.map((goal,index)=>{const a=l.achievements.find(a=>a.id===goal.id);return `<section class="company-goal"><h3>${tr(goal.name)}</h3><p>${tr(goal.rule)}</p><p>${esc(values[index].text)}</p>${a?`<strong>${T('달성일 ','達成日 ')+mgDateText(a.day)}</strong> <button data-lifecycle-claim="${goal.id}" ${disabled(state.ended)}>${T('이 성과로 결산','この成果で決算')}</button>`:`<span>${T('도전 중 · 매일 결산 시 판정','挑戦中・日次決算時に判定')}</span>`}</section>`;}).join('')+`<p>${T('달성 기록은 계속 경영해도 남습니다. 파산과 경영권 상실은 성과와 별도로 판정됩니다.','達成記録は経営を続けても残ります。倒産と経営権喪失は成果と別に判定します。')}</p>`+buttons(closeButton()+`<button id="lifecycle-retire" ${disabled(state.ended)}>${T('사업 종료 검토','事業終了を検討')}</button>`);}
function lifecycleEndHTML(){const ending=state.ending||{},f=playerFirm(),goal=COMPANY_GOALS.find(g=>g.id===ending.reason),loss=['bankrupt','bank','control'].includes(ending.type),retired=ending.reason==='retired';
 const title=ending.type==='control'?T('경영권 상실','経営権喪失'):loss?T('회사를 더 운영하기 어렵게 됐습니다','会社の経営を続けることが難しくなりました'):retired?T('이번 경영을 마치며','今回の経営を終えて'):goal?tr(goal.name):T('평가 기간의 경영 기록','評価期間の経営記録');
 const message=ending.type==='control'?T('다른 주주가 과반 의결권을 확보했습니다.','他の株主が過半数の議決権を取得しました。'):loss?T('자금 경색이 이어지고 회복 가능한 자금이 소진되어 경영이 종료됐습니다.','資金難が続き、回復に使える資金が尽きたため経営が終了しました。'):retired?T('사장님이 선택한 시점의 기록이에요. 원하시면 이 회사로 다시 이어갈 수 있어요.','社長が選んだ時点での記録です。よろしければ、この会社で経営を続けられます。'):goal?T('함께 쌓아 온 성과가 회사의 기록이 됐어요. 결산 뒤에도 다른 목표에 도전할 수 있어요.','積み重ねた成果が会社の記録になりました。決算後も別の目標に挑戦できますよ。'):T('이번 평가 기간을 마쳤어요. 달성한 것과 다음에 보완할 점을 확인하고 계속할 수 있어요.','今回の評価期間が終わりました。成果と次に改善する点を確認して、経営を続けられます。');
 return `<h2>${title}</h2><p>${message}</p>${row(T('결산일','決算日'),mgDateText(ending.day||state.day))}${row(T('현금 / 순자산','現金／純資産'),money(f.account.cash)+' / '+money(companyEquity(f)))}${row(T('차입 원금 / 현재 지급액','借入元金／現在の支払額'),money(mgDebt(f))+' / '+money(typeof mgPayableNow==='function'?mgPayableNow(f):0))}${row(T('기기 / 누적 매출','自販機／累計売上'),f.machines.length+' / '+money(state.enterprise.industry.totalRevenue))}${ending.type==='control'?row(T('경영권 확보 주주','経営権を取得した株主'),esc(companyName(ending.controller))):loss?row(T('자금 경색 / 회복 여력','資金難／回復余力'),f.meta.distress+T('일','日')+' / '+money(companyRecoverable(f))):''}<h3>${T('달성한 경영 성과','達成した経営成果')}</h3><p>${lifecycleState().achievements.map(a=>esc(tr(COMPANY_GOALS.find(g=>g.id===a.id).name))+' · '+mgDateText(a.day)).join('<br>')||T('아직 기록된 성과가 없습니다.','まだ記録された成果はありません。')}</p>`+buttons(`<button id="menu-new">${T('새 회사 설립','新会社を設立')}</button>`+(!loss?`<button id="continue">${T('이 회사로 계속 경영','この会社で経営を続ける')}</button>`:''));
}
const lifecycleModalBefore=drawModal;drawModal=function(){lifecycleModalBefore();if(!mgEnabled())return;if(modalView==='company-goals')$('modal-body').innerHTML=lifecycleGoalsHTML();if(modalView==='end')$('modal-body').innerHTML=lifecycleEndHTML();};
const lifecycleRenderBefore=render;render=function(){lifecycleRenderBefore();lifecyclePaint();};
const lifecycleContinueBefore=continueGame;continueGame=function(){const modern=mgEnabled(),wasEnded=state.ended;lifecycleContinueBefore();if(modern&&wasEnded&&!state.ended){livePaused=true;businessCarry=0;sceneSpeed=1;save();render();}};
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='company-goals-button')openModal('company-goals');if(b.dataset.lifecycleClaim)lifecycleClaim(b.dataset.lifecycleClaim);if(b.id==='lifecycle-retire')openModal('retirement');});
lifecyclePaint();
