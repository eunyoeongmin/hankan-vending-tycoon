/* Persistent, action-gated lessons. All transactions use the ordinary game engine. */
const GUIDE_LESSONS=[
 ['manage',B('내 자판기 선택','自分の自販機を選択'),B('지도에서 강조된 내 자판기를 누르세요. 이 창에서 재고와 기기 안 매출을 확인합니다.','地図の強調された自販機を押してください。在庫と機内売上を確認できます。')],
 ['manage',B('첫 판매 확인','最初の販売'),B('상단 ▶ 계속을 누르세요. 손님이 구매하면 재고가 줄고 매출이 기기 안에 쌓입니다. 첫 판매 후 멈춥니다.','上の▶続けるを押します。購入で在庫が減り、売上が機内に貯まります。最初の販売で停止します。')],
 ['manage',B('매출 회수 출발','売上回収へ出発'),B('기기 관리의 직접 회수하러 이동을 누르세요. 보관 매출은 회수해야 회사 현금이 됩니다.','機械管理の「自分で回収に向かう」を押します。機内売上は回収すると会社の現金になります。')],
 ['manage',B('회수 완료 기다리기','回収完了を待つ'),B('▶ 계속으로 이동 시간을 진행하세요. 도착해 실제 회수가 끝나야 다음 단계로 갑니다.','▶続けるで移動を進めます。到着し、回収が完了すると次へ進みます。')],
 ['supply',B('판매할 음료 발주','販売する飲料を発注'),B('발주에서 현재 판매 중인 탄산음료, 수량 200개, 첫 창고를 확인하고 발주를 누르세요. 돈을 내도 즉시 기기에 들어가지는 않습니다.','発注で販売中の炭酸飲料・数量200本・最初の倉庫を確認し、発注を押します。支払後すぐ機械に入るわけではありません。')],
 ['supply',B('창고 입고 확인','倉庫への入荷'),B('▶ 계속으로 배송을 기다리세요. 기다리는 동안 상단 배속을 16배로 올릴 수 있습니다. 입고 완료 후 자동 정지합니다.','▶続けるで配送を待ちます。待機中は上の速度を16倍にできます。入荷後に自動停止します。')],
 ['logistics',B('배송 경로 편성','配送ルートを編成'),B('물류에서 첫 차량의 담당 기기 경로 편성을 누르세요. 첫 거점의 두 대까지는 사장이 직접 배송할 수 있습니다.','物流で最初の車両の「担当機械のルート編成」を押します。最初の拠点の2台までは社長が配送できます。')],
 ['logistics',B('음료를 싣고 출발','飲料を積んで出発'),B('같은 차량의 출발을 누르세요. 창고 재고가 운송 중 재고로 이동하고 운송비가 나갑니다.','同じ車両の出発を押します。倉庫在庫が輸送中在庫に変わり、運送費を支払います。')],
 ['logistics',B('기기 보충 완료','自販機への補充完了'),B('▶ 계속으로 배송을 완료하세요. 실제 기기에 음료가 들어간 것을 확인한 뒤 확장으로 넘어갑니다.','▶続けるで配送を完了します。実際に機械へ補充されたことを確認してから拡張します。')],
 ['equipment',B('두 번째 입지 계약','2か所目の立地契約'),B('기기 조달에서 강조된 같은 상권의 빈 입지를 계약하세요. 장소 계약과 기기 구매는 별도입니다.','機械調達で強調された同じ商圏の空き立地を契約します。場所の契約と機械購入は別です。')],
 ['equipment',B('새 자판기 주문','新しい自販機を注文'),B('Koyo S80의 가격을 확인하고 구매를 누르세요. 주문 내역에 기기 배송이 생깁니다.','Koyo S80の価格を確認し購入を押します。注文一覧に機械配送が追加されます。')],
 ['equipment',B('기기 도착 기다리기','機械の到着を待つ'),B('▶ 계속으로 2일의 배송을 진행하세요. 설치 대기 기기가 1대 생겨야 설치할 수 있습니다.','▶続けるで2日間の配送を進めます。設置待ち機械が1台届くと設置できます。')],
 ['equipment',B('계약한 장소에 설치','契約した場所へ設置'),B('계약한 입지의 기기 설치를 누르세요. 외주 설치비와 작업 시간을 확인하세요.','契約した立地の機械設置を押します。外注設置費と作業時間を確認してください。')],
 ['equipment',B('설치 완료 확인','設置完了を確認'),B('▶ 계속으로 설치 작업을 끝내세요. 지도에 나타나도 음료를 보충하기 전에는 판매할 수 없습니다.','▶続けるで設置を完了します。地図に現れても飲料を補充するまでは販売できません。')],
 ['logistics',B('새 기기에 첫 보충','新しい機械へ初回補充'),B('창고에 탄산음료가 부족하면 추가 발주하고 입고를 기다리세요. 물류에서 경로를 다시 편성해 두 기기를 포함하고 출발하세요. 실제 보충까지 완료합니다.','炭酸飲料が足りなければ追加発注して入荷を待ちます。物流でルートを再編成して2台を含め、出発し補充を完了してください。')],
 ['manage',B('새 기기에서 첫 매출','新しい機械で初売上'),B('▶ 계속으로 새 기기의 첫 판매를 확인하세요. 이제 발주→입고→배송→판매→회수와 출점 과정을 직접 수행했습니다.','▶続けるで新しい機械の最初の販売を確認します。発注→入荷→配送→販売→回収と出店を実行できました。')]
];
const guidePanel=document.createElement('section');guidePanel.id='practical-guide';guidePanel.hidden=true;
guidePanel.innerHTML='<img alt=""><div><strong id="guide-title"></strong><p id="guide-text"></p><span id="guide-status" role="status"></span><div class="buttons"><button id="guide-focus"></button><button id="guide-exit"></button></div></div>';
officeRegister.prepend(guidePanel);
guidePanel.querySelector('img').src=ADVISOR_PORTRAIT;
function guideState(){const g=state.guide;return g?.version===1&&int(g.step,0,16)&&typeof g.active==='boolean'&&g.flags&&typeof g.flags==='object'&&!Array.isArray(g.flags)&&int(g.target,-1,LOCATIONS.length-1)&&int(g.first,0,LOCATIONS.length-1)?g:null;}
function guideActive(){return !!guideState()?.active&&guideState().step<16&&mgEnabled();}
function guideStart(){
 // Explicit practice start, offered only for a freshly created company.
 if(state.day!==1||state.totalSold>0)return;
 const rules=setupRules,preset=setupPreset,options=mgStartOptions;
 setupRules={...RULE_PRESETS.easy,playerFunds:5000000,events:0,supply:0};setupPreset='custom';mgStartOptions={automation:false,review:false,running:false};
 guideLaunchBase();setupRules=rules;setupPreset=preset;mgStartOptions=options;
 closeModal();menuOpen=false;livePaused=true;sceneSpeed=1;businessCarry=0;
 const f=playerFirm(),first=f.machines[0].loc,free=LOCATIONS.filter(l=>l.map===LOCATIONS[first].map&&!l.auction&&!machine(l.id)&&!rivalLocations().includes(l.id)&&!chainSiteOwner(l.id)&&canBuild(l.id)).sort((a,b)=>a.cost-b.cost);
 state.guide={version:1,active:true,step:0,first,target:free[0]?.id??-1,flags:{},sold:machine(first).total};
 refInputs.sku='aqua:0';refInputs.qty=200;refInputs['order-hub']=refHome(f).id;
 selected=first;selectedMap=LOCATIONS[first].map;setDesktopWindow('closed');save();render();
}
function guideAllowedTabs(){const s=guideState()?.step||0;return ['manage','fleet','finance','alerts','journal',...(s>=4?['supply']:[]),...(s>=6?['logistics']:[]),...(s>=9?['equipment']:[])];}
function guideTarget(){const g=guideState();if(!g)return '';const vehicle=refFirm(playerFirm()).vehicles[0]?.id;
 return ['#pins [data-select="'+g.first+'"]','#scene-pause','[data-job="collect"][data-loc="'+g.first+'"]','#scene-pause','[data-ref-action="order"]','#scene-pause','[data-ref-action="route-auto"][data-arg="'+vehicle+'"]','[data-ref-action="route-run"][data-arg="'+vehicle+'"]','#scene-pause','[data-chain="site"][data-arg="'+g.target+'"]','[data-chain="machine"][data-arg="koyo:0"]','#scene-pause','[data-chain="install"][data-arg="'+g.target+'"]','#scene-pause','[data-ref-action="route-auto"]','#scene-pause'][g.step]||'';
}
function guideFocus(){if(!guideActive())return;const g=guideState();if(g.step===0){setDesktopWindow('closed');}else{selected=g.step>=14?g.target:g.first;selectedMap=LOCATIONS[selected].map;selectDesk(GUIDE_LESSONS[g.step][0]);}render();const el=document.querySelector(guideTarget());el?.scrollIntoView({block:'nearest',inline:'nearest'});el?.focus();}
let guideUpdating=false;
function guideCheck(){if(!guideActive()||guideUpdating)return;guideUpdating=true;try{
 const g=guideState(),f=playerFirm(),r=refFirm(f),c=chainFirm(f),m=machine(g.first),n=machine(g.target),flags=g.flags;
 const complete=[flags.selected,m?.total>g.sold,flags.collectQueued,flags.collected,flags.order,flags.received,flags.route,flags.dispatch,flags.delivered,flags.site,flags.kitOrder,flags.kitReceived,flags.install,n?.ref&&n.stock===0,flags.newDelivery,n?.total>0][g.step];
 if(complete){g.step++;livePaused=true;sceneSpeed=1;businessCarry=0;lastSceneFrame=null;if(g.step===16){g.active=false;profile.tutorialSeen=true;saveProfile();log(B('비서 실습 완료 · 자유 경영으로 계속합니다.','秘書との実習完了・自由経営を続けられます。'));}save();render();}
 }finally{guideUpdating=false;}guidePaint();}
let guideHighlight=null;
function guidePaint(){const active=guideActive(),g=guideState();guidePanel.hidden=!active;document.body.classList.toggle('guide-active',active);
 if(!active&&guideHighlight){guideHighlight.classList.remove('guide-target');guideHighlight=null;}
 for(const b of deskNav.querySelectorAll('[data-desk]')){const locked=active&&!guideAllowedTabs().includes(b.dataset.desk);if(b.disabled!==locked)b.disabled=locked;b.title=locked?T('기본 실습 후 사용할 수 있습니다.','基本実習後に利用できます。'):'';}
 guideLockControls(active);if(!active)return;
 const lesson=GUIDE_LESSONS[g.step];controlText('guide-title',T('경영 비서 · 실습 ','経営秘書・実習 ')+(g.step+1)+'/16 · '+tr(lesson[1]));controlText('guide-text',tr(lesson[2]));controlText('guide-focus',T('조작할 곳 보기','操作する場所を表示'));controlText('guide-exit',T('실습 종료 · 자유 경영','実習終了・自由経営'));
 controlText('guide-status',livePaused?T('시간 정지 · 안내된 조작을 직접 수행하세요.','時間停止・案内された操作を行ってください。'):T('진행 중 · 완료되면 자동으로 멈춥니다.','進行中・完了すると自動停止します。'));
 const selector=guideTarget(),target=selector?document.querySelector(selector):null;if(target!==guideHighlight||(target&&!target.classList.contains('guide-target'))){guideHighlight?.classList.remove('guide-target');guideHighlight=target;target?.classList.add('guide-target');}
}
function guideMark(flag,value=true){if(!guideActive())return;guideState().flags[flag]=value;guideCheck();}
const guideLaunchBase=launchNew;
const guideModalBefore=drawModal;drawModal=function(){guideModalBefore();if(modalView==='newrun'&&!$('guide-launch')){const b=document.createElement('button');b.id='guide-launch';b.textContent=T('비서와 실습 · 연습 회사 $5,000','秘書と実習・練習会社 $5,000');const info=document.createElement('p');info.textContent=T('실습 회사: 초기 현금 $5,000 · 안정 공급 · 사건 없음 · 자동 운영 끔. 실습 후 같은 회사로 계속할 수 있습니다.','練習会社：初期現金$5,000・安定供給・事件なし・自動運営オフ。実習後も同じ会社を続けられます。');const actions=$('launch-new')?.parentElement;if(actions){actions.before(info);actions.prepend(b);}else $('modal-body').append(info,b);controlText('launch-new',T('자유 경영으로 시작','自由経営で開始'));}if(modalView==='tutorialOffer'){
 const p=$('modal-body').querySelector('p');if(p)p.textContent=T('비서와 실제 조작을 배우는 연습 회사로 시작합니다. 초기 현금 $5,000, 안정 공급, 무작위 사건 없음. 완료 후 같은 회사로 계속할 수 있습니다. 자유 경영은 방금 선택한 설정을 유지합니다.','秘書と実際の操作を学ぶ練習会社を開始します。初期現金$5,000、安定供給、ランダム事件なし。終了後も同じ会社を続けられます。自由経営は選択した設定を維持します。');
 controlText('tutorial-start',T('비서와 실습 시작','秘書と実習を開始'));controlText('tutorial-skip',T('자유 경영','自由経営'));
 }};
const guideRenderBefore=render;render=function(){guideRenderBefore();guidePaint();};
const guideRefreshBefore=refreshLiveNumbers;refreshLiveNumbers=function(){guideRefreshBefore();guideCheck();};
const guideDeskBefore=selectDesk;selectDesk=function(tab){if(guideActive()&&!guideAllowedTabs().includes(tab))return;guideDeskBefore(tab);guidePaint();};
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.id==='launch-new'){profile.tutorialSeen=true;saveProfile();}
 if(b.id==='guide-launch'){e.preventDefault();e.stopImmediatePropagation();guideLaunchBase();guideStart();return;}
 if(b.id==='tutorial-start'){e.preventDefault();e.stopImmediatePropagation();guideStart();return;}
 if(b.id==='guide-focus'){guideFocus();return;}
 if(b.id==='guide-exit'){state.guide.active=false;livePaused=true;save();render();return;}
 if(!guideActive())return;
 const g=guideState();if(b.dataset.select!==undefined&&g.step===0&&+b.dataset.select===g.first){g.flags.selected=true;queueMicrotask(guideCheck);}
 const nav=b.dataset.desk||(b.dataset.refDesk&&REF_ROUTES[b.dataset.refDesk]);
 if(nav&&!guideAllowedTabs().includes(nav)||b.dataset.research||b.id==='mg-toggle-automation'||b.dataset.action==='sell'){e.preventDefault();e.stopImmediatePropagation();return;}
 // Only curriculum-relevant transactions; navigation, help, save, pause and finance remain usable.
 if(b.dataset.refAction){const a=b.dataset.refAction,allowed=[...(g.step>=4?['order']:[]),...(g.step>=6?['route-auto','route-run']:[])];if(!allowed.includes(a)&&!['borrow','repay','partial-repay'].includes(a)){e.preventDefault();e.stopImmediatePropagation();return;}}
},true);
const guideDispatchBefore=dispatch;dispatch=function(type,loc,staff=false){const ok=guideDispatchBefore(type,loc,staff);if(ok&&guideActive()&&type==='collect'&&loc===guideState().first&&!staff)guideMark('collectQueued');return ok;};
const guideJobsBefore=advanceJobs;advanceJobs=function(ms){const g=guideState(),jobs=guideActive()?state.jobs.filter(j=>j.type==='collect'&&j.loc===g.first):[];guideJobsBefore(ms);if(jobs.some(j=>!state.jobs.includes(j))&&guideActive())g.flags.collected=true;};
const guideOrderBefore=refOrder;refOrder=function(f,...args){const ok=guideOrderBefore(f,...args);if(ok&&f.id==='player'&&guideActive()&&guideState().step===4){guideState().order=refFirm(f).work.at(-1).id;guideMark('order');}return ok;};
const guideReceiveBefore=companyReceive;companyReceive=function(f,ms){const g=guideState(),watch=f.id==='player'&&guideActive(),r=watch?refFirm(f):null,c=watch?chainFirm(f):null,order=watch&&r.work.find(j=>j.id===g.order),kit=watch&&c.orders.find(j=>j.id===g.kit),routes=watch?r.work.filter(j=>j.kind==='route'):[];guideReceiveBefore(f,ms);if(!watch)return;if(order&&!r.work.includes(order))g.flags.received=true;if(kit&&!c.orders.includes(kit))g.flags.kitReceived=true;for(const j of routes)if(!r.work.includes(j)&&!j.cancelled){if(j.stops.some(s=>s.loc===g.first&&s.cargo.length))g.flags.delivered=true;if(j.stops.some(s=>s.loc===g.target&&s.cargo.length))g.flags.newDelivery=true;}};
const guideRouteBefore=refRoute;refRoute=function(f,...args){const ok=guideRouteBefore(f,...args);if(ok&&f.id==='player'&&guideActive())guideMark('route');return ok;};
const guideRouteRunBefore=refDispatchRoute;refDispatchRoute=function(f,...args){const ok=guideRouteRunBefore(f,...args);if(ok&&f.id==='player'&&guideActive())guideMark('dispatch');return ok;};
const guideSiteBefore=reserveSite;reserveSite=function(f,loc){const ok=guideSiteBefore(f,loc);if(ok&&f.id==='player'&&guideActive()){guideState().target=loc;guideMark('site');}return ok;};
const guideMachineBefore=chainOrderMachine;chainOrderMachine=function(f,...args){const ok=guideMachineBefore(f,...args);if(ok&&f.id==='player'&&guideActive()){guideState().kit=chainFirm(f).orders.at(-1).id;guideMark('kitOrder');}return ok;};
const guideInstallBefore=installKit;installKit=function(f,loc){if(!chainEnabled())return guideInstallBefore(f,loc);const error=installationReason(f,loc);if(error){if(f.id==='player')toast(error);return false;}const ok=guideInstallBefore(f,loc);if(ok&&f.id==='player'&&guideActive())guideMark('install');return ok;};
function installationReason(f,loc){const c=chainFirm(f);if(!c.sites.some(s=>s.loc===loc))return B('입지 계약이 필요합니다.','立地契約が必要です。');if(machine(loc)||rivalLocations().includes(loc))return B('이미 기기가 설치된 장소입니다.','すでに機械がある場所です。');if(c.orders.some(o=>o.kind==='installation'&&o.loc===loc))return B('설치 작업이 진행 중입니다.','設置作業中です。');if(!expansionFirm(f).kits.length)return B('기기 도착을 기다리세요. 상단에서 시간을 진행할 수 있습니다.','機械の到着を待ってください。上部で時間を進められます。');if(!chainWorkers(f,'technician',LOCATIONS[loc].map)&&f.account.cash<5000)return B('외주 설치비 $5가 부족합니다.','外注設置費$5が不足しています。');return null;}
const guideChainBefore=renderChain;renderChain=function(){guideChainBefore();if(!chainEnabled()||deskTab!=='equipment')return;for(const b of chainPanel.querySelectorAll('[data-chain="install"]')){const reason=installationReason(playerFirm(),+b.dataset.arg);b.disabled=!!reason||state.ended;b.title=reason?tr(reason):'';let status=b.parentElement.querySelector('.installation-reason');if(!status){status=document.createElement('small');status.className='installation-reason';b.after(status);}status.textContent=reason?' '+tr(reason):'';}guidePaint();};
guidePaint();

function guideLockControls(active){const g=guideState();for(const b of document.querySelectorAll('[data-ref-action],[data-chain]')){
 const a=b.dataset.refAction,c=b.dataset.chain;
 const allowed=!active||(a?((a==='order'&&g.step>=4)||(['route-auto','route-run'].includes(a)&&g.step>=6)||['borrow','repay','partial-repay'].includes(a)):((c==='site'&&g.step===9&&+b.dataset.arg===g.target)||(c==='machine'&&g.step===10&&b.dataset.arg==='koyo:0')||(c==='install'&&g.step===12&&+b.dataset.arg===g.target)));
 if(!allowed){if(!b.dataset.guideLocked)b.dataset.guideDisabled=String(b.disabled);b.dataset.guideLocked='1';b.disabled=true;b.title=T('비서 실습에서 필요한 기능부터 사용할 수 있습니다.','秘書実習で必要な機能から利用できます。');}
 else if(b.dataset.guideLocked){b.disabled=b.dataset.guideDisabled==='true';delete b.dataset.guideLocked;delete b.dataset.guideDisabled;b.title='';}
}}
