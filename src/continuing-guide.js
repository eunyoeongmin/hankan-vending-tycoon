/* Optional follow-up goals observe real company state; they never execute transactions. */
const CONTINUING_TOPICS={
 refill:{name:B('품절에서 다시 판매까지','品切れから販売再開まで'),steps:[['supply',B('같은 상품의 입고 준비','同じ商品の入荷準備')],['logistics',B('창고 도착 확인','倉庫到着を確認')],['logistics',B('대상 기기에 배송','対象機へ配送')],['fleet',B('판매 재개 확인','販売再開を確認')]]},
 finance:{name:B('차입금 상환 확인','借入金の返済を確認'),steps:[['finance',B('상환 계약과 지급일 확인','返済契約と支払日を確認')],['finance',B('실제 원금 상환 확인','実際の元金返済を確認')]]},
 expansion:{name:B('새 기기의 첫 매출','新しい機械の初売上'),steps:[['equipment',B('입지·기기·설치','立地・機械・設置')],['logistics',B('새 기기에 재고 배송','新しい機械へ在庫配送')],['fleet',B('첫 판매 확인','初売上を確認')]]},
 staff:{name:B('직원의 업무 배치','社員の業務配置'),steps:[['staff',B('직원 채용·배치','社員の採用・配置')],['reports',B('배치한 직원의 작업 진행','配置した社員の作業進行')]]},
 research:{name:B('투자에서 연구 성과까지','投資から研究成果まで'),steps:[['research',B('진행할 연구 과제','進める研究課題')],['research',B('검토·연구 완료','審査・研究完了')]]},
 manufacture:{name:B('생산 준비와 완제품','生産準備と完成品'),steps:[['manufacture',B('원재료·인력·생산 지시','原材料・人員・生産指示')],['manufacture',B('실제 완제품 생산','実際の完成品生産')]]}
};
function continuingState(){
 const object=x=>x&&typeof x==='object'&&!Array.isArray(x),number=x=>Number.isFinite(x)&&x>=0&&x<=1e12;
 if(!object(state.continuingGuide)||state.continuingGuide.version!==1)state.continuingGuide={version:1,enabled:true,snoozeUntil:0,active:null,done:{},welcomeSeen:false};
 const c=state.continuingGuide;c.enabled=c.enabled!==false;c.welcomeSeen=c.welcomeSeen===true;c.snoozeUntil=number(c.snoozeUntil)?c.snoozeUntil:0;
 if(!object(c.done))c.done={};for(const k of Object.keys(c.done))if(!Object.hasOwn(CONTINUING_TOPICS,k)||!object(c.done[k])||!number(c.done[k].day))delete c.done[k];
 if(!Object.hasOwn(CONTINUING_TOPICS,c.last))c.last=null;
 const x=c.active;
 if(x&&(!object(x)||!Object.hasOwn(CONTINUING_TOPICS,x.kind)||!Number.isInteger(x.step)||x.step<0||x.step>=CONTINUING_TOPICS[x.kind].steps.length||!Array.isArray(x.locations)||!x.locations.every(number)||!Array.isArray(x.principal)||!x.principal.every(n=>object(n)&&number(n.id)&&number(n.principal))||!number(x.baselineSales)||!number(x.manufactured)||!number(x.started)||!(x.loc===null||number(x.loc))||!(x.project===null||number(x.project))||!(x.worker===null||number(x.worker))))c.active=null;
 return c;
}
function continuingReady(){return refEnabled()&&!guideActive()&&!state.ended;}
function continuingStock(m){if(!m)return 0;return playerFirm().ops.warehouse.reduce((sum,b)=>sum+(b.batches||[]).filter(x=>x.hub===m.ref.hub&&m.slots.some(s=>s.product===x.product&&(s.sku===x.sku||s.sku.startsWith('legacy:')))).reduce((n,x)=>n+x.qty,0),0);}
function continuingCandidate(){
 const c=continuingState(),f=playerFirm(),r=refFirm(f);
 if(f.machines.some(m=>!m.stock)&&(!c.done.refill||state.day-c.done.refill.day>=7))return 'refill';
 if(r.notes.some(n=>n.principal>0)&&!c.done.finance)return 'finance';
 if(r.projects.some(p=>!p.complete)&&!c.done.research)return 'research';
 if(r.work.some(w=>w.kind==='production')&&!c.done.manufacture)return 'manufacture';
 if(chainFirm(f).staff.some(w=>['restock','drink','machine'].includes(w.role))&&!c.done.staff)return 'staff';
 if(chainFirm(f).orders.some(o=>o.kind==='machine'||o.kind==='installation')&&!c.done.expansion)return 'expansion';
 return null;
}
function continuingStart(kind){
 if(!continuingReady()||!CONTINUING_TOPICS[kind])return false;
 const c=continuingState(),f=playerFirm(),r=refFirm(f),m=f.machines.find(m=>!m.stock)||f.machines[0];
 if(kind==='finance'&&!r.notes.some(n=>n.principal>0)){toast(T('현재 상환할 차입 계약이 없어요.','今は返済する借入契約がありません。'));return false;}
 c.active={kind,step:0,loc:kind==='refill'?m?.loc:null,baselineSales:m?.total||0,locations:f.machines.map(m=>m.loc),project:null,worker:null,manufactured:r.stats.manufactured||0,principal:r.notes.filter(n=>n.principal>0).map(n=>({id:n.id,principal:n.principal})),started:state.day};
 c.enabled=true;c.welcomeSeen=true;c.snoozeUntil=0;continuingPicker=false;continuingCheck();save();return true;
}
function continuingCheck(){
 if(!continuingReady())return;const c=continuingState(),a=c.active;if(!a)return;
 const f=playerFirm(),r=refFirm(f);let changed=false,done=false;
 const next=()=>{a.step++;changed=true;};
 if(a.kind==='refill'){
  const m=f.machines.find(m=>m.loc===a.loc);if(m){
   if(a.step===0&&(continuingStock(m)>0||r.work.some(w=>w.kind==='purchase'&&w.site===m.ref.hub&&m.slots.some(s=>s.product===w.product&&(s.sku===w.sku||s.sku.startsWith('legacy:'))))))next();
   if(a.step===1&&(continuingStock(m)>0||m.stock>0||m.total>a.baselineSales))next();else if(a.step===1&&!r.work.some(w=>w.kind==='purchase'&&w.site===m.ref.hub)){a.step=0;changed=true;}
   if(a.step===2&&(m.stock>0||m.total>a.baselineSales))next();
   if(a.step===3&&m.total>a.baselineSales)done=true;
  }
 }
 if(a.kind==='finance'){
  if(a.step===0&&a.principal.length)next();
  if(a.step===1&&a.principal.some(p=>(r.notes.find(n=>n.id===p.id)?.principal||0)<p.principal))done=true;
 }
 if(a.kind==='expansion'){
  if(a.step===0){const m=f.machines.find(m=>!a.locations.includes(m.loc));if(m){a.loc=m.loc;a.baselineSales=0;next();}}
  const m=f.machines.find(m=>m.loc===a.loc);if(a.step===1&&m&&(m.stock>0||m.total>0))next();if(a.step===2&&m?.total>0)done=true;
 }
 if(a.kind==='research'){
  if(a.step===0){const p=r.projects.find(p=>!p.complete);if(p){a.project=p.id;next();}}
  if(a.step===1&&r.projects.some(p=>p.id===a.project&&p.complete))done=true;else if(a.step===1&&!r.projects.some(p=>p.id===a.project)){a.step=0;a.project=null;changed=true;}
 }
 if(a.kind==='staff'){
  if(a.step===0){const w=chainFirm(f).staff.find(w=>['restock','drink','machine'].includes(w.role)&&w.site&&refSite(f,w.site)&&!w.training&&!w.notice);if(w){a.worker=w.id;a.experience=w.experience||0;next();}}
  if(a.step===1){const w=chainFirm(f).staff.find(w=>w.id===a.worker),job=w&&r.work.find(j=>j.employee===w.id||(j.site===w.site&&j.kind==='production'&&refEmployeeEligible(w,w.site,refSite(f,w.site)?.kind)));if(job){const progress=job.progress||0,remaining=job.remaining||0;if(a.job===job.id&&(progress!==a.jobProgress||remaining!==a.jobRemaining))done=true;else if(a.job!==job.id){a.job=job.id;a.jobProgress=progress;a.jobRemaining=remaining;changed=true;}}}
 }
 if(a.kind==='manufacture'){
  if(a.step===0&&r.work.some(w=>w.kind==='production'))next();
  if(a.step===1&&(r.stats.manufactured||0)>a.manufactured)done=true;
 }
 if(done){c.done[a.kind]={day:state.day};c.last=a.kind;c.active=null;c.snoozeUntil=state.day+2;changed=true;}
 if(changed)save();
}
function continuingMessage(a){
 const r=refFirm(playerFirm()),m=playerFirm().machines.find(m=>m.loc===a.loc);
 if(a.kind==='refill')return [B('사장님, 이 기기가 품절이네요. 판매 상품과 같은 음료를 같은 거점으로 주문해 볼까요? 창고에 이미 있다면 발주는 건너뛸 수 있어요.','社長、この機械が品切れです。同じ飲料を同じ拠点へ注文しましょうか。倉庫にあれば発注は不要ですよ。'),B('주문은 들어갔어요. 입고 작업이 끝나면 다음은 차량 배송이에요. 기다리는 동안 경로에 이 기기가 있는지 확인해 주세요.','注文できました。入荷が終わったら車で配送します。待つ間に、この機械がルートにあるか確認してくださいね。'),B('이제 경로를 편성하고 차량을 출발시켜 주세요. 재고가 실려야 보충돼요. 배송이 안 되면 상품·거점·차량·인력을 함께 확인해요.','ルートを編成して車を出発させましょう。在庫を積んで初めて補充できます。商品・拠点・車両・人員も確認しましょう。'),B('재고가 도착했어요. 영업 시간을 진행하며 이 기기에서 다시 판매되는지 함께 지켜봐요.','在庫が届きました。営業を進めて、この機械で販売が再開するか一緒に見守りましょう。')][a.step];
 if(a.kind==='finance')return B('사장님, 기존 계약의 지급 예정과 만기를 확인해 볼까요? 발주와 급여에 쓸 돈도 남겨 주세요. 일부 상환 또는 예정된 상환으로 실제 원금이 줄면 제가 확인할게요. 새 대출을 받으실 필요는 없어요.','社長、既存契約の支払予定と満期を確認しましょうか。仕入れと給与の分も残してくださいね。一部返済や予定の返済で元金が減ったら確認します。新しく借りる必要はありませんよ。');
 if(a.kind==='expansion')return B('입지 계약과 기기 주문 뒤에는 도착을 기다려 설치해 주세요. 설치 후에는 음료를 배송하고 첫 매출까지 확인해요. 자금이 빠듯하면 다음에 해도 괜찮아요.','立地契約と機械発注の後は、到着を待って設置してくださいね。その後、飲料を配送して初売上まで確認します。資金が厳しければ後でも大丈夫ですよ。');
 if(a.kind==='staff')return B('배송 담당 또는 공장 생산 직원을 사업장에 배치해 주세요. 배치된 직원의 배송 또는 생산 작업이 실제로 진행되면 확인해 드릴게요. 교육·이직 대기·피로 때문에 쉬고 있다면 먼저 그 상태를 살펴봐요.','配送担当か工場の生産担当を事業所に配置してくださいね。配置した社員の配送・生産作業が実際に進んだら確認します。研修・転職待ち・疲労で休んでいるなら、その状態から確認しましょう。');
 if(a.kind==='research')return B('진행 중인 과제의 검토 요청을 봐 주세요. 승인이 필요하면 예산을 확인하고 결정해요. 이 과제의 실제 완료까지 함께 확인할게요. 중단했다면 다음에 하기를 눌러 다른 과제로 다시 시작할 수 있어요.','進行中の課題の審査依頼を見てくださいね。承認が必要なら予算を確認して決めましょう。この課題の完了まで見守ります。中止したら「また今度」で別の課題からやり直せますよ。');
 return B('공장의 원재료와 담당 인력을 준비하고 생산을 지시해 주세요. 작업이 생긴 뒤 실제 완제품 수가 늘어나는지 확인할게요. 생산 완료 후에도 판매용 음료는 기기까지 배송해야 매출이 돼요.','工場の原材料と担当人員を準備して生産を指示してくださいね。作業が始まり、実際の完成品が増えたら確認します。販売用の飲料は機械へ配送して初めて売上になりますよ。');
}
let continuingPicker=false,continuingCompany=null;
const continuingPanel=document.createElement('section');continuingPanel.id='continuing-guide';officeRegister.prepend(continuingPanel);
function continuingPaint(){
 if(continuingCompany!==state){continuingCompany=state;continuingPicker=false;document.querySelectorAll('.continuing-target').forEach(n=>n.classList.remove('continuing-target'));}continuingCheck();const c=continuingState();continuingPanel.hidden=!continuingReady()||!!modalView;if(continuingPanel.hidden){document.body.classList.remove('continuing-active');document.querySelectorAll('.continuing-target').forEach(n=>n.classList.remove('continuing-target'));return;}
 document.body.classList.toggle('continuing-active',!!c.active);const a=c.active,candidate=c.enabled&&state.day>=c.snoozeUntil?continuingCandidate():null;
 let html='';
 if(a){const t=CONTINUING_TOPICS[a.kind],s=t.steps[Math.min(a.step,t.steps.length-1)];html=`<strong>${esc(tr(t.name))} · ${a.step+1}/${t.steps.length}</strong><span>${esc(tr(continuingMessage(a)))}</span><button data-continuing="go" data-route="${s[0]}">${esc(tr(s[1]))}</button><small>${esc(continuingEvidence(a))} · ${livePaused?T('일시정지 중 · 대기는 상단 재개','一時停止中・待機は上の再開'):T('영업 진행 중','営業中')}</small><button data-continuing="later">${T('다음에 하기','また今度')}</button>`;}
 else if(!c.welcomeSeen&&c.enabled)html=`<span>${state.guide?.step>=16?T('기본 운영을 마쳤네요. 앞으로도 제가 곁에서 함께 확인할게요.','基本の運営を終えましたね。これからもそばで一緒に確認します。'):T('사장님, 필요할 때 실제 운영을 함께 확인해 드릴게요.','社長、必要なときに実際の運営を一緒に確認しますね。')} ${T('현재 자동 운영: ','現在の自動運営：')}${mgEnabled()&&mgFirm(playerFirm()).enabled?T('켜짐','オン'):T('꺼짐','オフ')}${T(' · 설정은 그대로 유지해요. 도움은 생략하거나 다시 열 수 있어요.','・設定はそのままです。案内は見送ったり開き直したりできますよ。')}</span><button data-continuing="welcome">${T('알겠어요','わかりました')}</button>`;
 else if(candidate)html=`<strong>${T('사장님, 함께 확인해 볼까요?','社長、一緒に確認しましょうか？')}</strong><button data-continuing="${candidate}">${esc(tr(CONTINUING_TOPICS[candidate].name))}</button><button data-continuing="later">${T('이틀 뒤에','2日後に')}</button>`;
 else if(c.last)html=`<span>${T('확인했어요: ','確認できました：')}${esc(tr(CONTINUING_TOPICS[c.last].name))}</span>`;
 if(continuingMarketAvailable())html+=`<span>${T('실습 회사는 현재 사업사건 없음·공급 안정으로 운영 중이에요. 원하시면 시장 변화를 더할 수 있어요.','実習会社は今、事業事件なし・供給安定で営業しています。よろしければ市場の変化を加えられますよ。')}</span><button data-continuing="market">${T('시장 변화와 함께 운영','市場の変化とともに経営')}</button>`;
 html+=`<button data-continuing="list">${T('비서와 함께하기','秘書と進める')}</button><button data-continuing="toggle">${c.enabled?T('제안 끄기','提案をオフ'):T('제안 켜기','提案をオン')}</button>`;
 if(continuingPicker)html+=`<div>${Object.entries(CONTINUING_TOPICS).map(([k,t])=>`<button data-continuing="${k}">${esc(tr(t.name))}${c.done[k]?' ✓':''}</button>`).join('')}</div>`;
 patchPanel(continuingPanel,html);
}
const continuingBeforeUpdate=updateDesk;updateDesk=function(){continuingBeforeUpdate();continuingPaint();};
const continuingBeforeClose=closeModal;closeModal=function(){continuingBeforeClose();continuingPaint();};
 document.addEventListener('click',e=>{const b=e.target.closest('[data-continuing]');if(!b||!continuingReady())return;const c=continuingState(),k=b.dataset.continuing;
 if(CONTINUING_TOPICS[k])continuingStart(k);if(k==='go'){selectDesk(b.dataset.route);continuingFocus(c.active);}
 if(k==='welcome')c.welcomeSeen=true;
 if(k==='market'&&continuingMarketAvailable())openModal('continuing-market');
 if(k==='later'){c.welcomeSeen=true;c.active=null;c.last=null;c.snoozeUntil=state.day+2;}
 if(k==='toggle'){c.welcomeSeen=true;c.enabled=!c.enabled;if(!c.enabled){c.active=null;c.last=null;}}
 if(k==='list'){c.welcomeSeen=true;continuingPicker=!continuingPicker;}save();continuingPaint();});
continuingPaint();

function continuingEvidence(a){
 const f=playerFirm(),r=refFirm(f),m=f.machines.find(m=>m.loc===a.loc);
 if(a.kind==='finance')return T('현재 원금 ','現在元金 ')+money(r.notes.reduce((s,n)=>s+n.principal,0))+T(' · 현금 ','・現金 ')+money(f.account.cash);
 if(a.kind==='refill'&&m){const j=r.work.find(j=>j.kind==='purchase'&&j.site===m.ref.hub&&m.slots.some(s=>s.product===j.product&&(s.sku===j.sku||s.sku.startsWith('legacy:'))));return tr(LOCATIONS[m.loc].short)+T(' · 기기 재고 ','・機械在庫 ')+m.stock+T(' · 같은 상품 창고 재고 ','・同商品の倉庫在庫 ')+continuingStock(m)+(j?T(' · 입고 잔여 ','・入荷残り ')+chainDays(j.remaining)+T('일','日'):'');}
 if(a.kind==='research'){const p=r.projects.find(p=>p.id===a.project);return p?(p.review?T('검토 승인 대기','審査承認待ち'):T('연구 진행 중','研究進行中')):T('진행 과제 없음','進行課題なし');}
 const j=r.work.find(j=>a.kind==='manufacture'?j.kind==='production':j.id===a.job);return j?(j.kind==='production'?T('공정 ','工程 ')+(j.stage+1)+' / 3':T('작업 잔여 ','作業残り ')+chainDays(j.remaining)+T('일','日')):T('업무 화면에서 조건 확인','業務画面で条件を確認');
}
function continuingFocus(a){
 if(!a)return;const selectors={supply:'#ref-sku',logistics:'[data-ref-action="route-run"]',equipment:'[data-chain="machine"]',staff:'#ref-role',finance:'#ref-mg-amount',research:'[data-ref-action="research"]',manufacture:'#ref-factory'};
 document.querySelectorAll('.continuing-target').forEach(n=>n.classList.remove('continuing-target'));
 const n=document.querySelector(selectors[deskTab]||'#desktop-title');if(n){n.classList.add('continuing-target');n.scrollIntoView?.({block:'nearest'});n.focus?.({preventScroll:true});}
}

/* A deliberate player decision after the practice company. Existing operations are untouched. */
function continuingMarketAvailable(){return continuingReady()&&state.guide?.step>=16&&validScenario(state.scenario)&&state.scenario.rules.events===0&&state.scenario.rules.supply===0;}
function continuingApplyMarket(){
 if(modalView!=='continuing-market'||!continuingMarketAvailable())return false;
 const scenario={...state.scenario,preset:'custom',rules:{...state.scenario.rules,events:STANDARD_RULES.events,supply:STANDARD_RULES.supply}};
 if(!validScenario(scenario))return false;
 state.scenario.rules.events=scenario.rules.events;state.scenario.rules.supply=scenario.rules.supply;state.scenario.preset='custom';
 log(B('사장님이 사업사건·공급 안정성을 보통으로 변경했습니다. 이후 사건 추첨과 신규 발주에 적용됩니다.','社長が事業事件・供給安定性を普通に変更しました。以後の事件抽選と新規発注に適用されます。'));
 save();closeModal();continuingPaint();return true;
}
const continuingMarketDrawBefore=drawModal;drawModal=function(){
 continuingMarketDrawBefore();if(modalView!=='continuing-market')return;
 $('modal-body').innerHTML=`<h2>${T('시장 변화와 함께 운영할까요?','市場の変化とともに経営しますか？')}</h2><p>${T('사장님, 지금은 실습용으로 사업사건이 없고 공급도 안정적이에요. 아래 두 항목만 바꾸면 같은 회사에서 선택할 일이 더 생겨요. 지금 방식이 편하시면 그대로 두셔도 괜찮아요.','社長、今は実習用に事業事件がなく、供給も安定しています。下の2項目だけ変えると、同じ会社で判断する場面が増えます。今のままでも大丈夫ですよ。')}</p>${row(T('사업사건','事業事件'),T('없음 → 보통','なし → 普通'))}${row(T('공급 안정성','供給安定性'),T('안정 → 보통 (입고 지연 가능)','安定 → 普通（入荷遅延の可能性）'))}<p>${T('현재 자금·기기·직원·계약과 다른 난이도는 유지합니다. 자동 운영·자동 진행·배속도 바꾸지 않습니다.','現在の資金・機械・社員・契約と他の難易度は保持します。自動運営・自動進行・速度も変更しません。')}</p><p>${T('확인 후 다음 사건 추첨과 새 발주부터 적용해요. 즉시 사건을 만들거나 진행 중 배송을 지연시키지는 않아요.','確認後、次の事件抽選と新しい発注から適用します。すぐに事件を起こしたり、進行中の配送を遅らせたりはしません。')}</p>${buttons(`<button data-close>${T('지금 방식 유지','今のまま続ける')}</button><button id="continuing-market-confirm" ${disabled(!continuingMarketAvailable())}>${T('두 항목을 보통으로 변경','2項目を普通に変更')}</button>`+closeButton())}`;
};
document.addEventListener('click',e=>{if(e.target.closest('#continuing-market-confirm'))continuingApplyMarket();});
