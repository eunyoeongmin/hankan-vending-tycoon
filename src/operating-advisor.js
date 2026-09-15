/* Optional, state-aware conversations. No simulated lesson completion or new clock. */
const operatingAdvisorButton=document.createElement('button');
operatingAdvisorButton.id='operating-advisor-toggle';operatingAdvisorButton.type='button';
operatingAdvisorButton.setAttribute('aria-controls','operating-advisor');
desktopTitlebar.insertBefore(operatingAdvisorButton,$('desktop-minimize'));
const operatingAdvisorPanel=document.createElement('section');
operatingAdvisorPanel.id='operating-advisor';operatingAdvisorPanel.hidden=true;
operatingAdvisorPanel.setAttribute('aria-label',T('비서와 업무 상담','秘書と業務相談'));
desktopTitlebar.after(operatingAdvisorPanel);
let operatingAdvisorOpen=false;
function operatingAdvice(tab=deskTab){
 const f=playerFirm(),r=refFirm(f),out=f.machines.filter(m=>m.stock===0).length;
 const topic=(tabs,ko,ja,steps)=>tabs.includes(tab)?{text:T(ko,ja),steps}:null;
 const step=(desk,ko,ja)=>({desk,label:T(ko,ja)});
 const fact=T(`운영 기기 ${f.machines.length}대 · 품절 ${out}대`,`稼働機 ${f.machines.length}台・品切れ ${out}台`);
 return topic(['manage','fleet','supply','products','logistics'],
  out?'사장님, 품절된 기기가 있네요. 발주는 창고 입고까지예요. 같은 상품이 창고에 도착하면 경로에 기기를 넣고 차량을 출발시켜 주세요.':'사장님, 판매할 상품과 보충 경로를 함께 살펴볼까요? 주문한 음료는 먼저 창고로 와요. 입고 뒤 차량으로 기기까지 보내야 판매할 수 있어요.',
  out?'社長、品切れの機械がありますね。発注だけでは倉庫への入荷までです。同じ商品が届いたら、ルートに機械を入れて車を出発させましょう。':'社長、販売する商品と補充ルートを一緒に確認しましょうか。注文した飲料はまず倉庫へ届きます。その後、車で機械へ届けると販売できますよ。',
  [step('supply','1. 상품·입고 확인','1. 商品・入荷を確認'),step('logistics','2. 경로·출발 확인','2. ルート・出発を確認'),step('fleet','3. 기기 재고 확인','3. 機械在庫を確認')]) ||
 topic(['equipment','maintenance','sites','contracts'],
  '출점은 입지 계약, 기기 도착, 설치, 음료 배송 순서예요. 설치만 끝난 기기는 비어 있어요. 버튼을 누를 수 없다면 바로 옆 사유와 진행 중 작업부터 확인해 볼까요?',
  '出店は立地契約、機械の到着、設置、飲料配送の順です。設置直後の機械は空ですよ。押せないボタンは、そばの理由と進行中の作業を確認しましょうか。',
  [step('equipment','1. 계약·기기·설치','1. 契約・機械・設置'),step('logistics','2. 새 기기에 배송','2. 新しい機械へ配送'),step('maintenance','3. 정비·수명 확인','3. 整備・寿命を確認')]) ||
 topic(['finance'],
  '빌릴 수 있는 금액과 갚을 수 있는 금액은 달라요. 계약의 연 이율, 다음 지급일, 만기를 먼저 봐 주세요. 운전자금은 만기에 원금을 한꺼번에 갚으니 그 돈을 남겨 두어야 해요. 연체가 있다면 확장 전에 상환·재조정 조건부터 살펴봐요.',
  '借りられる額と返せる額は違います。契約の年利、次回支払日、満期を先に確認してくださいね。運転資金は満期に元金をまとめて返すので、その分を残しましょう。延滞中なら、拡張より先に返済・再調整の条件を確認しましょう。',
  [step('finance','1. 지급 일정·상환','1. 支払予定・返済'),step('reports','2. 손익·현금흐름','2. 損益・資金繰り'),step('policies','3. 자동 지출·유보','3. 自動支出・留保')]) ||
 topic(['staff'],
  '채용 뒤에는 일할 사업장과 직무도 정해 주세요. 직원이 있어도 배치·교육·피로 상태에 따라 작업이 멈출 수 있어요. 새 인원을 늘리기 전에 대기 원인과 월말 급여를 함께 볼까요?',
  '採用したら、働く事業所と職種も決めてくださいね。人がいても配置・研修・疲労によって作業が止まることがあります。増員の前に、待機の原因と月末の給与を一緒に見ましょうか。',
  [step('staff','1. 채용·직무·배치','1. 採用・職種・配置'),step('reports','2. 작업 대기 원인','2. 作業待機の原因'),step('finance','3. 급여 지급 예정','3. 給与の支払予定')]) ||
 topic(['research'],
  '연구는 투자 즉시 완성되는 상품이 아니에요. 협력사와 예산을 정하고, 진행 중 과제의 검토 요청을 확인해 주세요. 완성 뒤에도 직접 제조하려면 공장과 생산 준비가 필요해요. 타사 음료는 자체 상품 연구 없이 발주할 수 있어요.',
  '研究は投資した瞬間に完成するものではありません。提携先と予算を決め、進行中の課題の審査依頼を確認してくださいね。完成後も自社製造には工場と生産準備が必要です。他社の飲料は自社商品研究なしで仕入れられますよ。',
  [step('research','1. 과제·검토·사용권','1. 課題・審査・利用権'),step('staff','2. 연구 인력 확인','2. 研究人員を確認'),step('manufacture','3. 제조 준비 확인','3. 製造準備を確認')]) ||
 topic(['manufacture'],
  '공장이 있어도 바로 음료가 나오지는 않아요. 생산 상품, 원재료, 담당 인력부터 갖춰 주세요. 생산이 멈췄다면 부족한 조건을 확인하고, 완제품은 판매 기기까지 배송해야 매출이 돼요.',
  '工場があっても、すぐに飲料はできません。製品、原材料、担当人員をそろえましょう。止まったら不足条件を確認し、完成品は販売機まで配送して初めて売上になりますよ。',
  [step('manufacture','1. 상품·자재·생산','1. 製品・資材・生産'),step('staff','2. 생산 인력 배치','2. 生産人員を配置'),step('logistics','3. 완제품 배송','3. 完成品を配送')]) ||
 topic(['market','rivalry','securities','group','development'],
  '경쟁사 가격을 따라 내리기 전에 우리 원가와 현금을 확인해 볼까요? 가격을 낮춰도 이익이 줄 수 있어요. 주식과 기업 인수는 자금을 묶고, 신주 발행은 내 지분을 낮출 수 있으니 의결권도 살펴봐 주세요.',
  '競合に合わせて値下げする前に、自社の原価と現金を確認しましょうか。安くしても利益が減ることがあります。株式や企業買収は資金を拘束し、新株発行は持分を下げる場合があるので議決権も見てくださいね。',
  [step('market','1. 시장·가격 비교','1. 市場・価格を比較'),step('reports','2. 우리 회사 수익 확인','2. 自社の利益を確認'),step('group','3. 지분·경영권 확인','3. 持分・経営権を確認')]) ||
 topic(['alerts'],
  '사건마다 지금 내는 비용과 나중에 생길 효과가 달라요. 선택지의 비용·기간을 비교해 보세요. 민원은 해당 기기의 재고와 정비부터 살펴보고, 처리 후 기록에서 실제 결과를 함께 확인해요.',
  '事件ごとに今払う費用と後の効果が違います。選択肢の費用・期間を比べてくださいね。相談は対象の機械の在庫と整備から調べ、対応後は記録で実際の結果も確認しましょう。',
  [step('alerts','1. 사건·민원 확인','1. 事件・相談を確認'),step('fleet','2. 대상 기기 확인','2. 対象の機械を確認'),step('journal','3. 처리 결과 확인','3. 対応結果を確認')]) ||
 {text:T('사장님, 다음 투자 전에 지금 회사가 잘 돌아가는지 살펴볼까요? 손익이 좋아도 상환과 발주 때문에 현금이 부족할 수 있어요. 장기 목표와 달성 조건도 언제든 다시 확인하실 수 있어요.','社長、次の投資の前に会社の状態を確認しましょうか。黒字でも返済や仕入れで現金が足りなくなる場合があります。長期目標と達成条件も、いつでも確認できますよ。'),steps:[step('reports','손익·대기 원인','損益・待機の原因'),step('finance','지급 예정·회복 수단','支払予定・回復手段'),step('company-goals','회사 목표·계속 경영','会社目標・経営継続')],fact};
}
function operatingAdvisorFacts(){
 const f=playerFirm(),r=refFirm(f),out=f.machines.filter(m=>m.stock===0).length;
 if(deskTab==='finance')return T(`현금 ${money(f.account.cash)} · 차입 잔액 ${money(r.notes.reduce((s,n)=>s+n.principal,0))} · 연체 계약 ${r.notes.filter(n=>n.missed>0).length}건`,`現金 ${money(f.account.cash)}・借入残高 ${money(r.notes.reduce((s,n)=>s+n.principal,0))}・延滞契約 ${r.notes.filter(n=>n.missed>0).length}件`);
 if(deskTab==='research')return T(`진행 과제 ${r.projects.filter(p=>!p.complete).length}건 · 검토 대기 ${r.projects.filter(p=>!p.complete&&p.review).length}건`,`進行課題 ${r.projects.filter(p=>!p.complete).length}件・審査待ち ${r.projects.filter(p=>!p.complete&&p.review).length}件`);
 if(deskTab==='staff')return T(`직원 ${chainFirm(f).staff.length}명 · 진행 작업 ${r.work.length}건`,`従業員 ${chainFirm(f).staff.length}人・進行作業 ${r.work.length}件`);
 if(deskTab==='manufacture')return T(`공장 ${r.sites.filter(s=>!s.closed&&['drink','machine'].includes(s.kind)).length}개 · 생산 작업 ${r.work.filter(w=>w.kind==='production').length}건`,`工場 ${r.sites.filter(s=>!s.closed&&['drink','machine'].includes(s.kind)).length}か所・生産作業 ${r.work.filter(w=>w.kind==='production').length}件`);
 return T(`운영 기기 ${f.machines.length}대 · 품절 ${out}대 · 진행 작업 ${r.work.length}건`,`稼働機 ${f.machines.length}台・品切れ ${out}台・進行作業 ${r.work.length}件`);
}
function paintOperatingAdvisor(){
 const available=refEnabled()&&!guideActive();operatingAdvisorButton.hidden=!available;
 operatingAdvisorButton.textContent=T('비서에게 질문','秘書に相談');
 operatingAdvisorButton.setAttribute('aria-expanded',String(available&&operatingAdvisorOpen));
 operatingAdvisorPanel.hidden=!available||!operatingAdvisorOpen;
 if(operatingAdvisorPanel.hidden)return;
 const advice=operatingAdvice(),routes=visibleDeskTabs().map(t=>t[0]);
 patchPanel(operatingAdvisorPanel,`<p class="operating-advisor-message">${esc(advice.text)}</p><p class="operating-advisor-facts">${esc(operatingAdvisorFacts())}</p><div>${advice.steps.filter(s=>s.desk==='company-goals'||routes.includes(s.desk)).map(s=>`<button type="button" data-advisor-route="${s.desk}">${esc(s.label)}</button>`).join('')}</div><small>${T('상담 중에도 영업은 계속돼요. 천천히 보려면 상단에서 일시정지해 주세요.','相談中も営業は続きます。ゆっくり読むときは上の一時停止を使ってくださいね。')}</small>`);
}
const operatingAdvisorUpdate=updateDesk;updateDesk=function(){operatingAdvisorUpdate();paintOperatingAdvisor();};
const operatingAdvisorSelect=selectDesk;selectDesk=function(tab){operatingAdvisorSelect(tab);paintOperatingAdvisor();};
document.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b)return;
 if(b.id==='operating-advisor-toggle'){operatingAdvisorOpen=!operatingAdvisorOpen||(typeof advisorFolded!=='undefined'&&advisorFolded);paintOperatingAdvisor();}
 if(b.dataset.advisorRoute){if(b.dataset.advisorRoute==='company-goals')openModal('company-goals');else selectDesk(b.dataset.advisorRoute);}
});
paintOperatingAdvisor();
