/* Immutable new-game rules. Existing saves without scenario retain their previous mechanics. */
const STANDARD_RULES={playerFunds:350000,rivalFunds:500000,rivalMachines:2,aggression:1,expertise:1,events:2,supply:1,cycle:0,inflation:0};
const LEGACY_RULES={...STANDARD_RULES,supply:0};
const RULE_PRESETS={easy:{...STANDARD_RULES,playerFunds:750000,rivalFunds:150000,rivalMachines:1,aggression:0,expertise:0,events:1,supply:0},standard:{...STANDARD_RULES},hard:{...STANDARD_RULES,playerFunds:150000,rivalFunds:1500000,rivalMachines:4,aggression:2,expertise:2,events:3,supply:2,cycle:1,inflation:3},extreme:{...STANDARD_RULES,playerFunds:150000,rivalFunds:3000000,rivalMachines:6,aggression:2,expertise:2,events:3,supply:2,cycle:1,inflation:8}};
const PRESET_NAMES={easy:B('입문','入門'),standard:B('표준','標準'),hard:B('도전','挑戦'),extreme:B('극한','極限'),custom:B('사용자 설정','カスタム')};
const RULE_FIELDS=[
 ['playerFunds',B('플레이어 초기 현금','プレイヤー初期現金'),[[150000,'$150'],[350000,'$350'],[750000,'$750'],[1500000,'$1,500']],B('모든 조건에서 기본 자판기 1대와 재고 60개로 시작합니다.','どの条件でも基本自販機1台と在庫60本で開始。')],
 ['events',B('무작위 사건 빈도','ランダム事件の頻度'),[[0,B('없음','なし')],[1,B('드묾','少ない')],[2,B('보통','普通')],[3,B('빈번','頻繁')]],B('선택형 사건·도난·고장·민원의 발생 확률을 조절합니다.','選択式事件・盗難・故障・相談の発生確率を調整。')],
 ['cycle',B('경기 변동','景気変動'),[[0,B('꺼짐','オフ')],[1,B('켜짐','オン')]],B('켜면 45일 주기의 경기 변화로 양쪽 회사 방문 수요가 최대 ±12% 변합니다.','オンでは45日周期の景気変動で両社の来訪需要が最大±12%変化。')],
 ['inflation',B('연간 비용 상승률','年間コスト上昇率'),[[0,'0%'],[3,'3%'],[8,'8%']],B('경기 변동을 켰을 때 설정. 365영업일 기준으로 매입비·임금·운영비가 상승합니다. 원가 지수의 단기 등락은 별도입니다.','景気変動オン時に設定。365営業日を基準に仕入費・賃金・営業費が上昇。原価指数の短期変動とは別です。')],
 ['rivalFunds',B('경쟁사 초기 현금','競合の初期現金'),[[150000,'$150'],[500000,'$500'],[1500000,'$1,500'],[3000000,'$3,000']],B('상대가 버틸 수 있는 기간과 신규 출점 여력에 영향을 줍니다.','競合の持久力と新規出店余力に影響。')],
 ['rivalMachines',B('경쟁사 초기 자판기','競合の初期自販機'),[[1,B('1대','1台')],[2,B('2대','2台')],[4,B('4대','4台')],[6,B('6대','6台')]],B('경쟁 회사는 현재 1곳입니다. 초기 점유 입지를 늘리며, 4상권·24입지 규모는 유지합니다.','競合会社は現在1社。初期占有立地を増やします。4商圏・24立地の規模は共通。')],
 ['aggression',B('경쟁사 공격성','競合の攻撃性'),[[0,B('낮음','低い')],[1,B('보통','普通')],[2,B('높음','高い')]],B('공세 2/3/4일, 공세 사이 휴식 3/0/0일, 출점 검토 7/5/3일 간격. 공세는 항상 하루 전 예고합니다.','攻勢2/3/4日、攻勢間の休息3/0/0日、出店検討7/5/3日間隔。攻勢は必ず前日に予告。')],
 ['expertise',B('경쟁사 운영 능력','競合の運営能力'),[[0,B('낮음','低い')],[1,B('보통','普通')],[2,B('높음','高い')]],B('상대 선택 매력 80/100/125%, 매입 원가 110/100/88%. 자금과 비용은 실제로 소모합니다.','競合の選択魅力80/100/125%、仕入原価110/100/88%。資金と費用は実際に消費。')],
 ['supply',B('공급 안정성','供給安定性'),[[0,B('안정','安定')],[1,B('보통','普通')],[2,B('불안정','不安定')]],B('발주 지연 확률 0/10/35%. 지연 시 0.5/1영업일 추가, 이미 지불한 수량·가치는 보존합니다.','発注遅延率0/10/35%。遅延時0.5/1営業日追加。支払済み数量・価値は保持。')]
];
let setupRules={...STANDARD_RULES},setupPreset='standard';
try{const p=JSON.parse(localStorage.getItem('hankan-start-rules')||'null');if(p&&validScenario(p)){setupRules={...p.rules};setupPreset=p.preset;}}catch{}
function runRules(){return state.scenario?.rules||LEGACY_RULES;}
function scenarioChance(base){const factor=[0,.4,1,1.6][runRules().events];return factor>0&&Math.random()<Math.min(.95,base*factor);}
function scenarioAttackDays(){return [2,3,4][runRules().aggression];}
function scenarioAttackRest(){return [3,0,0][runRules().aggression];}
function scenarioExpansionInterval(){return [7,5,3][runRules().aggression];}
function rivalSkillFactor(){return [.8,1,1.25][runRules().expertise];}
function rivalCostFactor(){return [1.1,1,.88][runRules().expertise];}
function inflationFactor(){return state.scenario&&runRules().cycle?Math.pow(1+runRules().inflation/100,(state.day-1)/365):1;}
function cycleFactor(){return runRules().cycle?1+.12*Math.sin((state.day-1)*Math.PI/22.5):1;}
function rulesIndex(r){return Math.max(20,Math.round(100+(350000-r.playerFunds)/20000+(r.rivalFunds-500000)/50000+(r.rivalMachines-2)*8+(r.aggression-1)*15+(r.expertise-1)*15+(r.events-2)*8+(r.supply-1)*8+r.cycle*8+r.inflation));}
function validScenario(x){const r=x?.rules;return !!(x&&x.version===1&&['easy','standard','hard','extreme','custom'].includes(x.preset)&&r&&[150000,350000,750000,1500000].includes(r.playerFunds)&&[150000,500000,1500000,3000000].includes(r.rivalFunds)&&[1,2,4,6].includes(r.rivalMachines)&&[0,1,2].includes(r.aggression)&&[0,1,2].includes(r.expertise)&&[0,1,2,3].includes(r.events)&&[0,1,2].includes(r.supply)&&[0,1].includes(r.cycle)&&[0,3,8].includes(r.inflation)&&(r.cycle||r.inflation===0));}
const demandBeforeScenario=demand;demand=m=>demandBeforeScenario(m)*cycleFactor();
const rentBeforeScenario=dailyRent;dailyRent=m=>state.scenario?Math.round(dailyRentBase(m)*inflationFactor()):rentBeforeScenario(m);
const procurementBeforeScenario=procurementPrice;procurementPrice=(p,s)=>Math.round(procurementBeforeScenario(p,s)*inflationFactor());
const orderBeforeScenario=orderGoods;
orderGoods=function(p,qty,supplier=state.enterprise.supplier){const ok=orderBeforeScenario(p,qty,supplier);if(!ok)return false;const chance=[0,.1,.35][runRules().supply];if(chance&&enterpriseRandom()<chance){const order=state.enterprise.orders[state.enterprise.orders.length-1],delay=DAY_MS*(runRules().supply===1?.5:1);order.remaining+=delay;order.duration+=delay;log(B(`${PRODUCTS[p].name[0]} 공급 지연: ${delay/DAY_MS}영업일 추가. 수량과 대금은 유지됩니다.`,`${PRODUCTS[p].name[1]}の供給遅延：${delay/DAY_MS}営業日追加。数量・代金は保持。`));save();}return true;};
launchNew=function(){
 const scenario={version:1,preset:setupPreset,rules:{...setupRules}};if(!validScenario(scenario))return;
 state=fresh();state.scenario=scenario;state.started=true;inGameSession=true;state.duration=chosenDuration;state.difficulty=0;state.cash=scenario.rules.playerFunds;state.npc.cash=scenario.rules.rivalFunds;state.npc.owned=[7,14,3,20,10,17].slice(0,scenario.rules.rivalMachines);
 selected=0;selectedMap=0;menuOpen=false;livePaused=false;ensureEnterprise();
 log(B(`${PRESET_NAMES[setupPreset][0]} 경영 시작 · 설정 난도 지수 ${rulesIndex(setupRules)}`,`${PRESET_NAMES[setupPreset][1]}で経営開始・設定難度指数 ${rulesIndex(setupRules)}`));
 try{localStorage.setItem('hankan-start-rules',JSON.stringify(scenario));}catch{}
 save();render();if(!profile.tutorialSeen)openModal('tutorialOffer');else{closeModal();startBusiness();}
};
function ruleLabel(field,value){const item=field[2].find(x=>x[0]===value);return typeof item[1]==='string'?item[1]:tr(item[1]);}
function rulesSummary(r){return RULE_FIELDS.map(f=>`<div class="row"><span>${tr(f[1])}</span><strong>${ruleLabel(f,r[f[0]])}</strong></div>`).join('');}
const modalBeforeScenario=drawModal;
drawModal=function(){modalBeforeScenario();if(modalView==='help'&&inGameSession&&menuOpen){const back=$('modal-body').querySelector('[data-close]');if(back){back.removeAttribute('data-close');back.id='menu-back';}}if(modalView==='settings'&&!state.started){const exit=document.createElement('button');exit.id='settings-close';exit.className='small';exit.textContent=T('설정 닫기','設定を閉じる');$('modal-body').querySelector('.entry-languages')?.append(exit);}if(modalView==='newrun'){
 const box=document.createElement('section');box.id='scenario-setup';box.innerHTML=`<h3>${T('시작 난이도','開始難易度')}</h3><label for="scenario-preset">${T('프리셋','プリセット')}</label><select class="full" id="scenario-preset">${Object.entries(PRESET_NAMES).map(([k,n])=>`<option value="${k}" ${setupPreset===k?'selected':''}>${tr(n)}</option>`).join('')}</select><p class="scenario-index">${T('설정 난도 지수','設定難度指数')} <strong>${rulesIndex(setupRules)}</strong> · ${T('표준 100 · 자체 참고 지수','標準100・独自の参考指数')}</p><p class="helper">${T('시작 조건은 회사 설립 후 변경할 수 없습니다.','開始条件は会社設立後に変更できません。')}</p><div class="scenario-fields">${RULE_FIELDS.map(f=>`<label for="rule-${f[0]}"><strong>${tr(f[1])}</strong><select id="rule-${f[0]}" data-rule="${f[0]}" ${disabled(f[0]==='inflation'&&!setupRules.cycle)}>${f[2].map(([v,n])=>`<option value="${v}" ${setupRules[f[0]]===v?'selected':''}>${typeof n==='string'?n:tr(n)}</option>`).join('')}</select><small>${tr(f[3])}</small></label>`).join('')}</div>`;$('modal-body').querySelector('.buttons').before(box);
 }else if(modalView==='settings'&&state.started){const exit=document.createElement('button');exit.id='settings-close';exit.className='small';exit.textContent=T('설정 닫기','設定を閉じる');$('modal-body').querySelector('.entry-languages')?.append(exit);const box=document.createElement('details');box.className='scenario-current';box.innerHTML=`<summary>${T('현재 게임의 시작 조건','現在の開始条件')} · ${state.scenario?tr(PRESET_NAMES[state.scenario.preset]):T('이전 버전 규칙','旧バージョンのルール')}</summary>${state.scenario?rulesSummary(runRules()):`<p>${T('저장된 시작 조건이 없습니다.','開始条件の記録がありません。')}</p>`}<p>${T('이 화면은 조회용입니다. 조건 변경은 새 게임에서 적용됩니다.','この画面は閲覧用です。条件の変更は新規ゲームで適用されます。')}</p>`;$('modal-body').append(box);}
};
document.addEventListener('change',event=>{const el=event.target;if(modalView!=='newrun')return;if(el.id==='scenario-preset'){if(el.value!=='custom'){setupRules={...RULE_PRESETS[el.value]};setupPreset=el.value;}else setupPreset='custom';drawModal();}if(el.dataset.rule){const field=RULE_FIELDS.find(f=>f[0]===el.dataset.rule),value=Number(el.value);if(!field||!field[2].some(x=>x[0]===value))return;setupRules[field[0]]=value;if(!setupRules.cycle)setupRules.inflation=0;setupPreset='custom';drawModal();}});
const enterpriseBeforeScenario=renderEnterprise;
renderEnterprise=function(force=true){enterpriseBeforeScenario(force);if(enterpriseTab!=='overview'||!state.scenario)return;let line=$('scenario-run-status');if(!line){line=document.createElement('p');line.id='scenario-run-status';line.className='helper';$('enterprise').querySelector('.enterprise-body')?.append(line);}if(line)line.textContent=state.scenario?T(`설정: ${PRESET_NAMES[state.scenario.preset][0]} · 지수 ${rulesIndex(runRules())} · 경기 수요 ${Math.round(cycleFactor()*100)}% · 비용 물가 ${Math.round(inflationFactor()*100)}%`,`設定：${PRESET_NAMES[state.scenario.preset][1]}・指数 ${rulesIndex(runRules())}・景気需要 ${Math.round(cycleFactor()*100)}%・コスト物価 ${Math.round(inflationFactor()*100)}%`):T('기존 저장: 이전 버전의 시작 조건을 유지합니다.','既存セーブ：旧バージョンの開始条件を保持します。');};

document.addEventListener('click',event=>{if(!event.target.closest('#settings-close'))return;if(inGameSession&&state.started&&!state.ended){menuOpen=false;closeModal();if(!state.live&&!livePaused)startBusiness();render();}else{menuOpen=true;openModal('menu');}});

document.addEventListener('click',event=>{if(!event.target.closest('#game-menu-close')||!inGameSession||modalView!=='pause')return;menuOpen=false;closeModal();if(state.started&&!state.ended&&!state.live&&!livePaused)startBusiness();render();});

let inGameSession=false;
document.addEventListener('click',event=>{const id=event.target.closest('button')?.id;if(!inGameSession)return;if(id==='pause-save'){save();toast(B('저장했습니다.','保存しました。'));}if(id==='pause-help')openModal('help');if(id==='pause-title'){save();inGameSession=false;menuOpen=true;openModal('menu');}});
