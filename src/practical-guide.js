/* Persistent, action-gated lessons. All transactions use the ordinary game engine. */
const GUIDE_LESSONS=[
 ['manage',B('내 자판기 선택','自分の自販機を選択'),B('사장님, 제가 옆에서 하나씩 도와드릴게요. 먼저 지도에서 밝게 표시된 우리 자판기를 눌러 볼까요? 재고와 기기 안 매출부터 함께 살펴봐요.','社長、私が一つずつお手伝いしますね。まずは地図で明るくなっている自販機を押してみましょう。在庫と機内売上を一緒に確認しましょうね。')],
 ['manage',B('첫 판매 확인','最初の販売'),B('이제 문을 열어 볼까요? 위의 재개 버튼을 누르면 영업 시간이 흘러요. 지도와 아래 영업 상황을 보며 첫 손님을 기다려 봐요. 오래 걸리면 상단 배속을 올려도 괜찮아요. 판매가 생기면 제가 멈출게요.','それでは営業を始めましょうか。上の再開ボタンで時間が進みます。地図と下の営業状況を見ながら、最初のお客さまを待ちましょう。長いときは上の速度を上げても大丈夫。売れたら私が止めますね。')],
 ['manage',B('매출 회수 출발','売上回収へ出発'),B('첫 매출이 생겼어요! 다만 아직 돈은 자판기 안에 있어요. 기기 관리에서 직접 회수하러 이동을 눌러, 회사로 가져와 볼까요?','初めての売上ですね！でも、お金はまだ自販機の中です。機械管理の「自分で回収に向かう」で、会社へ持ち帰りましょうか。')],
 ['manage',B('회수 완료 기다리기','回収完了を待つ'),B('회수를 위해 이동 중이에요. 재개를 눌러 시간을 흘려 주세요. 도착해서 돈을 가져오면 회사 현금이 늘어나는 걸 확인할 수 있어요.','回収のために移動中です。再開を押して時間を進めてくださいね。到着して回収すると、会社の現金が増えますよ。')],
 ['supply',B('판매할 음료 발주','販売する飲料を発注'),B('잘하셨어요. 이번에는 팔 음료를 미리 준비해 볼까요? 탄산음료 200개와 첫 창고를 확인한 뒤 발주를 눌러 주세요. 음료는 먼저 창고로 도착해요.','できましたね。次は販売する飲料を用意しましょうか。炭酸飲料200本と最初の倉庫を確認して、発注を押してくださいね。飲料はまず倉庫に届きます。')],
 ['supply',B('창고 입고 확인','倉庫への入荷'),B('주문이 들어갔어요! 재개를 누르면 공급사가 창고로 보내 줘요. 아래에서 남은 시간을 볼 수 있어요. 기다림이 길면 배속을 올려도 괜찮아요.','注文できました！再開を押すと、仕入先が倉庫へ届けてくれます。残り時間は下に出ますよ。長いときは速度を上げても大丈夫です。')],
 ['logistics',B('배송 경로 편성','配送ルートを編成'),B('창고에 음료가 도착했어요. 이제 자판기로 옮길 차례예요. 첫 차량의 담당 기기 경로 편성을 눌러 볼까요? 첫 거점 두 대까지는 사장님이 직접 배송할 수 있어요.','倉庫に飲料が届きました。次は自販機へ運びましょう。最初の車両の「担当機械のルート編成」を押してくださいね。最初の拠点の2台までは社長が配送できますよ。')],
 ['logistics',B('음료를 싣고 출발','飲料を積んで出発'),B('경로가 준비됐어요. 같은 차량의 출발을 눌러 주세요. 음료를 차에 싣고 운송비를 지불하면 배송을 시작해요.','ルートができましたね。同じ車両の出発を押してください。飲料を積み込み、運送費を払って配送に出かけます。')],
 ['logistics',B('기기 보충 완료','自販機への補充完了'),B('음료를 싣고 가는 중이에요. 재개를 눌러 배송을 마쳐 볼까요? 도착하면 창고에서 가져온 음료가 기기 재고로 들어가요.','飲料を運んでいるところです。再開を押して配送を終えましょうか。到着すると、倉庫から運んだ飲料が機械の在庫になりますよ。')],
 ['equipment',B('두 번째 입지 계약','2か所目の立地契約'),B('보충까지 잘 마쳤어요! 이제 두 번째 자판기를 준비해 봐요. 밝게 표시된 빈 입지를 계약해 주세요. 먼저 자리를 확보하고 기기는 따로 주문할 거예요.','補充もできましたね！今度は2台目を準備しましょう。明るくなっている空き立地を契約してください。先に場所を確保して、機械は別に注文しますよ。')],
 ['equipment',B('새 자판기 주문','新しい自販機を注文'),B('자리를 확보했으니 기기를 골라 볼까요? 이번에는 Koyo S80을 써 봐요. 가격을 확인하고 구매를 누르면 배송 주문이 생겨요.','場所が決まったので、機械を選びましょうか。今回はKoyo S80を使ってみましょう。価格を確認して購入を押すと、配送が始まりますよ。')],
 ['equipment',B('기기 도착 기다리기','機械の到着を待つ'),B('기기 주문도 끝났어요. 배송에는 게임 시간으로 2일이 걸려요. 재개를 눌러 기다려 주세요. 도착하면 설치할 수 있도록 제가 알려드릴게요.','機械も注文できました。配送にはゲーム内で2日かかります。再開を押して待ってくださいね。届いたら設置できるようご案内します。')],
 ['equipment',B('계약한 장소에 설치','契約した場所へ設置'),B('새 자판기가 도착했어요! 계약한 입지의 기기 설치를 눌러 주세요. 외주 설치비와 작업 시간이 드니 함께 확인해 봐요.','新しい自販機が届きました！契約した立地の機械設置を押してください。外注設置費と作業時間も一緒に確認しましょうね。')],
 ['equipment',B('설치 완료 확인','設置完了を確認'),B('지금 설치 작업을 하고 있어요. 재개를 눌러 마무리를 기다려 봐요. 기기가 놓이면 다음에는 음료를 채워 줄 거예요.','いま設置作業をしています。再開を押して完成を待ちましょう。機械が置けたら、次は飲料を入れてあげましょうね。')],
 ['logistics',B('새 기기에 첫 보충','新しい機械へ初回補充'),B('이제 두 대가 됐네요! 경로를 다시 편성해 새 기기도 포함하고 출발해 주세요. 창고의 탄산음료가 모자라면 추가 발주부터 해요. 배송을 마치려면 재개도 눌러 주세요.','2台になりましたね！ルートを組み直して新しい機械も含め、出発してください。倉庫の炭酸飲料が足りなければ追加発注から始めましょう。配送には再開も押してくださいね。')],
 ['manage',B('새 기기에서 첫 매출','新しい機械で初売上'),B('새 기기도 영업 준비가 됐어요. 재개를 누르고 첫 손님을 기다려 볼까요? 여기서도 판매가 생기면 기본 실습은 끝이에요. 두 대의 자판기로 계속 경영하실 수 있어요.','新しい機械も営業の準備ができました。再開を押して最初のお客さまを待ちましょうか。こちらでも売れたら基本実習は終了です。この2台で経営を続けられますよ。')]
];
const guidePanel=document.createElement('section');guidePanel.id='practical-guide';guidePanel.hidden=true;
guidePanel.innerHTML='<img alt=""><div><strong id="guide-title"></strong><p id="guide-text"></p><span id="guide-status" role="status"></span><div class="buttons"><button id="guide-ready" hidden></button><button id="guide-question" hidden></button><button id="guide-time" hidden></button><button id="guide-focus"></button><button id="guide-exit"></button></div></div>';
officeRegister.prepend(guidePanel);
const guideSpot=document.createElementNS('http://www.w3.org/2000/svg','svg');guideSpot.id='guide-spotlight';guideSpot.setAttribute('aria-hidden','true');guideSpot.innerHTML='<defs><mask id="guide-mask" maskUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="white"/><g id="guide-holes"></g></mask></defs><rect width="100%" height="100%" fill="black" fill-opacity=".40" mask="url(#guide-mask)"/>';document.body.append(guideSpot);
const guideMeter=document.createElement('progress');guideMeter.id='guide-progress';guideMeter.max=100;guideMeter.hidden=true;guideMeter.setAttribute('aria-label',T('작업 진행','作業の進み具合'));$('guide-status').after(guideMeter);
function guideIntro(){return guideActive()&&['welcome','plan','reassure','time'].includes(guideState().intro);}
function guideWaiting(){return guideActive()&&[1,3,5,8,11,13,15].includes(guideState().step);}
let guideSpotKey='';
function guideSpotlight(){
 const visible=guideActive()&&!guideIntro()&&!modalView&&!menuOpen;guideSpot.style.display=visible?'block':'none';if(!visible)return;
 const els=[guidePanel,document.querySelector(guideTarget()),$('guide-focus'),$('game-menu')];
 if(guideWaiting()||guideState().step===14)els.push(document.querySelector('.map-wrap'),$('scene-speed'),$('scene-pause'));
 const holes=els.filter(Boolean).map(el=>{const r=el.getBoundingClientRect();if(!r.width||!r.height)return '';const x=Math.max(0,r.left-5),y=Math.max(0,r.top-5),right=Math.min(innerWidth,r.right+5),bottom=Math.min(innerHeight,r.bottom+5);return right>x&&bottom>y?`<rect x="${x}" y="${y}" width="${right-x}" height="${bottom-y}" fill="black"/>`:'';}).join('');
 const h=document.getElementById('guide-holes');if(guideSpotKey!==holes){h.innerHTML=holes;guideSpotKey=holes;}
}
document.addEventListener('scroll',guideSpotlight,true);window.addEventListener('resize',guideSpotlight);
function guideProgress(){
 const g=guideState(),f=playerFirm(),r=refFirm(f),c=chainFirm(f),s=g.step,paused=livePaused||!!modalView||menuOpen;
 const prefix=paused?T('잠깐 멈춰 있어요. 위의 재개 버튼을 눌러 주세요. ','いまは一時停止中です。上の再開ボタンを押してくださいね。 '):T('진행 중이에요. 끝나면 제가 시간을 멈출게요. ','進んでいます。終わったら私が時間を止めますね。 ');
 let j=s===3?state.jobs.find(j=>j.type==='collect'&&j.loc===g.first):s===5?r.work.find(j=>j.id===g.order):s===11?c.orders.find(j=>j.id===g.kit):s===13?c.orders.find(j=>j.kind==='installation'&&j.loc===g.target):[8,14].includes(s)?r.work.find(j=>j.kind==='route'):null;
 guideMeter.hidden=true;
 if([1,15].includes(s)){
  const m=machine(s===1?g.first:g.target),clock=$('scene-clock')?.textContent||'08:00';
  return prefix+T(`영업 ${clock} · 재고 ${m?.stock||0}개 · 첫 판매 대기 중. 손님이 구매하면 기기 매출이 늘어요. 구매 시점은 손님마다 달라요.`,`営業 ${clock}・在庫 ${m?.stock||0}本・最初の購入待ちです。買ってもらえると機内売上が増えます。購入のタイミングはお客さま次第です。`);
 }
 if(j){const days=Math.max(0,j.remaining)/DAY_MS;guideMeter.hidden=!j.duration;if(j.duration)guideMeter.value=Math.max(0,Math.min(100,(1-j.remaining/j.duration)*100));return prefix+T(`남은 작업 시간 ${days.toFixed(2)}일 · 오래 걸리면 상단 배속을 올려도 좋아요.`,`残り作業時間 ${days.toFixed(2)}日・長いときは上の速度を上げても大丈夫ですよ。`);}
 return guideWaiting()?prefix:T('밝게 표시된 곳을 눌러 보세요. 찾기 어려우면 아래 버튼으로 안내해 드릴게요.','明るくなっている場所を押してみましょう。見つからないときは下のボタンでご案内しますね。');
}
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
 state.guide={version:1,active:true,step:0,intro:'welcome',first,target:free[0]?.id??-1,flags:{},sold:machine(first).total};
 refInputs.sku='aqua:0';refInputs.qty=200;refInputs['order-hub']=refHome(f).id;
 selected=first;selectedMap=LOCATIONS[first].map;setDesktopWindow('closed');save();render();
}
function guideAllowedTabs(){const s=guideState()?.step||0;return ['manage','fleet','finance','alerts','journal',...(s>=4?['supply']:[]),...(s>=6?['logistics']:[]),...(s>=9?['equipment']:[])];}
function guideTarget(){const g=guideState();if(!g||guideIntro())return '';const vehicle=refFirm(playerFirm()).vehicles[0]?.id;
 if(g.step===14){const r=refFirm(playerFirm());if(r.work.some(j=>j.kind==='route'&&j.stops.some(s=>s.loc===g.target)))return '#scene-pause';if(r.routes.some(route=>route.vehicle===vehicle&&route.stops.includes(g.target)))return '[data-ref-action="route-run"][data-arg="'+vehicle+'"]';}
 return ['#pins [data-select="'+g.first+'"]','#scene-pause','[data-job="collect"][data-loc="'+g.first+'"]','#scene-pause','[data-ref-action="order"]','#scene-pause','[data-ref-action="route-auto"][data-arg="'+vehicle+'"]','[data-ref-action="route-run"][data-arg="'+vehicle+'"]','#scene-pause','[data-chain="site"][data-arg="'+g.target+'"]','[data-chain="machine"][data-arg="koyo:0"]','#scene-pause','[data-chain="install"][data-arg="'+g.target+'"]','#scene-pause','[data-ref-action="route-auto"]','#scene-pause'][g.step]||'';
}
function guideFocus(){if(!guideActive()||guideIntro())return;const g=guideState();if(g.step===0){setDesktopWindow('closed');}else{selected=g.step>=14?g.target:g.first;selectedMap=LOCATIONS[selected].map;selectDesk(GUIDE_LESSONS[g.step][0]);}render();const el=document.querySelector(guideTarget());el?.scrollIntoView({block:'nearest',inline:'nearest'});el?.focus();}
let guideUpdating=false;
function guideCheck(){if(guideIntro()){livePaused=true;businessCarry=0;guidePaint();return;}if(!guideActive()||guideUpdating)return;guideUpdating=true;try{
 const g=guideState(),f=playerFirm(),r=refFirm(f),c=chainFirm(f),m=machine(g.first),n=machine(g.target),flags=g.flags;
 const complete=[flags.selected,m?.total>g.sold,flags.collectQueued,flags.collected,flags.order,flags.received,flags.route,flags.dispatch,flags.delivered,flags.site,flags.kitOrder,flags.kitReceived,flags.install,n?.ref&&n.stock===0,flags.newDelivery,n?.total>0][g.step];
 if(complete){g.step++;livePaused=true;sceneSpeed=1;businessCarry=0;lastSceneFrame=null;if(g.step===16){g.active=false;profile.tutorialSeen=true;saveProfile();log(B('비서 실습 완료 · 자유 경영으로 계속합니다.','秘書との実習完了・自由経営を続けられます。'));}save();render();}
 }finally{guideUpdating=false;}guidePaint();}
let guideHighlight=null;
function guidePaint(){const active=guideActive(),g=guideState();guidePanel.hidden=!active;document.body.classList.toggle('guide-active',active);
 if(!active&&guideHighlight){guideHighlight.classList.remove('guide-target');guideHighlight=null;}
 for(const b of deskNav.querySelectorAll('[data-desk]')){const locked=active&&!guideAllowedTabs().includes(b.dataset.desk);if(b.disabled!==locked)b.disabled=locked;b.title=locked?T('기본 실습 후 사용할 수 있습니다.','基本実習後に利用できます。'):'';}
 guideLockControls(active);guideSpotlight();
 const intro=guideIntro();document.body.classList.toggle('guide-intro',!!intro);
 $('guide-ready').hidden=!intro;$('guide-question').hidden=!intro;$('guide-time').hidden=!intro;$('guide-focus').hidden=!!intro;
 if(!active)return;
 if(intro){
  livePaused=true;businessCarry=0;guideMeter.hidden=true;
  if(guideHighlight){guideHighlight.classList.remove('guide-target');guideHighlight=null;}
  controlText('guide-title',T('경영 비서 · 첫 출근','経営秘書・初めての出勤'));
  const lines={
   time:B('재개를 누르면 시간이 흘러요. 1배속에서는 게임 속 하루가 실제 3분이라, 손님이나 배송을 기다릴 때는 상단 배속을 16배로 올려도 괜찮아요. 각 실습이 끝나면 제가 멈추고 1배속으로 돌려 둘게요.','再開を押すと時間が進みます。1倍速ではゲーム内の1日が実際の3分なので、お客さまや配送を待つときは上の速度を16倍にしても大丈夫。各実習が終わったら、私が止めて1倍速に戻しますね。'),
   welcome:B('사장님, 어서 오세요! 앞으로 곁에서 일을 도와드릴 비서예요. 새 회사를 시작하니 조금 두근거리네요. 사장님은 어떠세요? 서두르지 않아도 괜찮아요. 저랑 이야기부터 나눠요.','社長、お待ちしていました！これからお仕事をお手伝いする秘書です。会社の初日って、少しどきどきしますね。社長はいかがですか？急がなくて大丈夫。まずは少しお話ししましょう。'),
   reassure:B('처음엔 메뉴가 많아 보여서 막막하죠. 오늘은 자판기 한 대부터 함께 돌봐요. 누를 곳은 제가 짚어 드리고, 한 가지가 끝나면 시간을 멈출게요. 모르는 게 있어도 천천히 해보면 돼요.','最初はメニューが多くて、戸惑いますよね。今日は自販機1台から一緒に見ていきましょう。押す場所は私がご案内して、一つ終わるたびに時間を止めます。わからなくても、ゆっくり試せば大丈夫ですよ。'),
   plan:B('먼저 우리 자판기에서 첫 음료가 팔리는 걸 지켜봐요. 그 돈을 회수하고 음료를 주문해 채워 본 다음, 두 번째 자판기도 열어 볼 거예요. 오늘 배운 그대로 이 회사를 계속 운영하실 수 있어요. 준비되셨나요?','まずはうちの自販機で、最初の1本が売れるのを見届けましょう。売上を回収し、飲料を注文して補充したら、2台目も開きます。実習のあとも、この会社で経営を続けられますよ。準備はよろしいですか？')
  };
  controlText('guide-text',tr(lines[g.intro]));
  controlText('guide-status',T('이야기하는 동안 영업 시간은 멈춰 있어요.','お話ししている間、営業の時間は止まっています。'));
  controlText('guide-time',T('시간은 어떻게 흘러가나요?','時間はどう進むんですか？'));
  controlText('guide-ready',T('좋아요, 함께 시작해요','はい、一緒に始めましょう'));
  controlText('guide-question',g.intro==='welcome'?T('처음이라 조금 막막해요','初めてで少し不安です'):['reassure','time'].includes(g.intro)?T('오늘은 어떤 일을 하나요?','今日は何をするんですか？'):T('천천히 알려 주세요','ゆっくり教えてください'));
  controlText('guide-exit',T('혼자 경영해 볼게요','自分で経営してみます'));return;
 }

 const lesson=GUIDE_LESSONS[g.step];controlText('guide-title',T('경영 비서 · 실습 ','経営秘書・実習 ')+(g.step+1)+'/16 · '+tr(lesson[1]));controlText('guide-text',tr(lesson[2]));controlText('guide-focus',T('조작할 곳 보기','操作する場所を表示'));controlText('guide-exit',T('실습 종료 · 자유 경영','実習終了・自由経営'));
 controlText('guide-status',guideProgress());
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
 if(b.id==='guide-ready'&&guideIntro()){e.preventDefault();e.stopImmediatePropagation();delete state.guide.intro;livePaused=true;businessCarry=0;lastSceneFrame=null;save();render();$('guide-focus').focus();return;}
 if(b.id==='guide-time'&&guideIntro()){e.preventDefault();e.stopImmediatePropagation();state.guide.intro='time';save();guidePaint();return;}
 if(b.id==='guide-question'&&guideIntro()){e.preventDefault();e.stopImmediatePropagation();state.guide.intro=['reassure','time'].includes(state.guide.intro)?'plan':'reassure';save();guidePaint();return;}
 if(b.id==='guide-focus'){guideFocus();return;}
 if(b.id==='guide-exit'){state.guide.active=false;livePaused=true;save();render();return;}
 if(!guideActive())return;
 if(guideIntro()&&!modalView&&!menuOpen&&!['game-menu','help'].includes(b.id)){e.preventDefault();e.stopImmediatePropagation();return;}
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
 const allowed=!active||(!guideIntro()&&(a?((a==='order'&&g.step>=4)||(['route-auto','route-run'].includes(a)&&g.step>=6)||['borrow','repay','partial-repay'].includes(a)):((c==='site'&&g.step===9&&+b.dataset.arg===g.target)||(c==='machine'&&g.step===10&&b.dataset.arg==='koyo:0')||(c==='install'&&g.step===12&&+b.dataset.arg===g.target))));
 if(!allowed){if(!b.dataset.guideLocked)b.dataset.guideDisabled=String(b.disabled);b.dataset.guideLocked='1';b.disabled=true;b.title=T('비서 실습에서 필요한 기능부터 사용할 수 있습니다.','秘書実習で必要な機能から利用できます。');}
 else if(b.dataset.guideLocked){b.disabled=b.dataset.guideDisabled==='true';delete b.dataset.guideLocked;delete b.dataset.guideDisabled;b.title='';}
}}
