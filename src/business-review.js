/* Decision support reads the real books. Forecasts never execute payments or advance time. */
function reviewPayments(f, days=30){
 const r=refFirm(f),until=state.day+days,items=r.bills.filter(b=>b.due<=until).map(b=>({day:b.due,kind:'bill',amount:b.amount}));
 for(const original of r.notes){
  const n={...original};let accrued=0;
  for(let day=state.day;day<=until&&n.principal>0;day++){
   if((n.accruedDay||0)<day){accrued+=n.principal*n.rate;n.accruedDay=day;}
   const interestDue=n.calendar?Math.min(n.next,n.due):day;
   if(interestDue<=day&&accrued>0){items.push({day,kind:'interest',amount:accrued});accrued=0;}
   if(n.calendar&&n.next<=day){
    if(day>n.grace&&n.product==='equipment')n.duePrincipal=Math.min(n.principal,(n.duePrincipal||0)+n.installment);
    const start=mgDate(n.start),next=mgDate(n.next),months=(next.getUTCFullYear()-start.getUTCFullYear())*12+next.getUTCMonth()-start.getUTCMonth();
    n.next=mgAddMonths(n.start,months+1);
   }
   if(n.due<=day)n.duePrincipal=n.principal;
   const payment=Math.min(n.principal,n.duePrincipal||0);
   if(payment>0){items.push({day,kind:'principal',amount:payment});n.principal-=payment;n.duePrincipal=0;}
  }
 }
 const total=kind=>items.filter(x=>x.kind===kind).reduce((sum,x)=>sum+x.amount,0);
 return {until,bills:total('bill'),principal:total('principal'),interest:total('interest'),total:items.reduce((sum,x)=>sum+x.amount,0),items};
}
function reviewInvestment(cost,dailyGross,dailyExpense){
 const net=dailyGross-dailyExpense;
 return {net,days:cost>=0&&net>0?Math.ceil(cost/net):null};
}
function reviewRoute(desk,ko,ja){return `<button type="button" data-review-desk="${desk}">${T(ko,ja)}</button>`;}
function reviewTable(headers,rows){return `<div class="review-ledger"><table class="review-table"><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(cells=>`<tr>${cells.map((value,i)=>`<td data-label="${esc(headers[i])}">${value}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
function reviewMonthValues(month){
 return [month.revenue,month.cost,month.revenue-month.cost,month.payroll,month.tax,month.revenue-month.cost-month.payroll-month.tax-month.profit,month.profit,month.operating,month.investing,month.financing];
}
function reviewAnalysis(f,month,previous){
 const r=refFirm(f),actions=[];
 if(r.bills.some(b=>b.due<=state.day)||r.notes.some(n=>n.missed||n.duePrincipal>0))actions.push([T('지급일이 된 채무가 있습니다. 다음 투자 전에 지급 일정을 확인하세요.','期日を迎えた債務があります。次の投資の前に支払日程を確認しましょう。'),'finance','지급·상환','支払・返済']);
 const empty=f.machines.filter(m=>!m.stock).length;
 if(empty)actions.push([T(`현재 ${empty}대가 품절입니다. 창고 재고와 배송 대기를 확인하세요.`,`現在${empty}台が品切れです。倉庫在庫と配送待ちを確認しましょう。`),'logistics','재고·배송','在庫・配送']);
 if(month?.revenue>0&&month.cost>=month.revenue)actions.push([T('선택한 달의 상품 원가가 매출 이상입니다. 판매 가격과 매입 단가를 확인하세요.','選択月の商品原価が売上以上です。売価と仕入単価を確認しましょう。'),'manage','상품·가격','商品・価格']);
 if(month?.profit<0)actions.push([T('선택한 달은 적자입니다. 아래 비용 내역과 작업 대기를 함께 확인하세요.','選択月は赤字です。下の費用内訳と作業待ちを確認しましょう。'),'policies','운영·예산','運営・予算']);
 if(previous&&month?.days&&previous.days&&month.revenue/month.days<previous.revenue/previous.days*.9)actions.push([T('하루 평균 매출이 비교 월보다 10% 이상 줄었습니다. 가격·경쟁·품절을 확인하세요.','日平均売上が比較月より10%以上減っています。価格・競合・品切れを確認しましょう。'),'market','상권·경쟁','商圏・競合']);
 if(!actions.length)actions.push([T('다음 투자에서는 지출 뒤 남는 현금과 회수 기간을 비교해 보세요.','次の投資では支出後の手元資金と回収期間を比べてみましょう。'),'equipment','출점 견적','出店見積']);
 return `<div class="review-actions">${actions.slice(0,3).map(([text,desk,ko,ja])=>`<p>${esc(text)} ${reviewRoute(desk,ko,ja)}</p>`).join('')}</div>`;
}
const reviewReportsBefore=mgReportsUI;
mgReportsUI=function(f){
 if(!mgEnabled())return reviewReportsBefore(f);
 const a=mgFirm(f),r=refFirm(f),months=a.month,closed=months.filter(m=>m.closed),options=[['latest',T('최근 마감월','直近の確定月')],...months.map(m=>[m.key,m.key+(m.closed?'':T(' · 집계 중','・集計中'))])];
 const selector=refField('review-month',T('분석 월','分析月'),options),key=refValue('review-month','latest'),month=key==='latest'?closed[0]:months.find(m=>m.key===key),previous=month&&months.find(m=>m.key<month.key&&m.closed),due=reviewPayments(f),reserve=a.reserve,free=f.account.cash-due.total-reserve;
 const labels=[T('매출','売上'),T('상품 원가','商品原価'),T('매출총이익','売上総利益'),T('급여','給与'),T('세금','税金'),T('기타 순비용','その他純費用'),T('순이익','純利益'),T('영업 현금흐름','営業キャッシュフロー'),T('투자 현금흐름','投資キャッシュフロー'),T('재무 현금흐름','財務キャッシュフロー')];
 const values=month&&reviewMonthValues(month),prev=previous&&reviewMonthValues(previous);
 const rawCost=Number(refValue('review-investment',0)),rawGross=Number(refValue('review-gross',0)),rawExpense=Number(refValue('review-expense',0)),inputs=[rawCost,rawGross,rawExpense].every(x=>Number.isFinite(x)&&x>=0&&x<=1000000),cost=rawCost*1000,estimate=reviewInvestment(cost,rawGross*1000,rawExpense*1000);
 return `<h3>${T('월 결산 · 다음 투자 검토','月次決算・次の投資検討')}</h3><div class="expansion-form">${selector}${reviewRoute('finance','지급 일정','支払日程')}${reviewRoute('company-goals','회사 목표','会社目標')}</div>`+
 (month?`<p>${esc(month.key)} · ${month.days}${T('일 집계','日集計')} · ${month.closed?T('마감','確定'):T('집계 중','集計中')} / ${T('비교','比較')}: ${previous?previous.key:'—'}</p>`+row(T('하루 평균 매출 / 비교 월','日平均売上／比較月'),money(month.revenue/Math.max(1,month.days))+' / '+(previous?money(previous.revenue/Math.max(1,previous.days)):'—'))+row(T('순이익률','純利益率'),month.revenue>0?(month.profit/month.revenue*100).toFixed(1)+'%':'—'):
 `<p>${T('아직 마감한 달이 없습니다. 분석 월에서 이번 달의 진행 상황을 확인할 수 있어요.','まだ確定した月がありません。分析月から今月の途中経過を確認できますよ。')}</p>`)+reviewAnalysis(f,month,previous)+
 (month?reviewTable([T('내역','内訳'),month.key,previous?previous.key:'—',T('증감','増減')],labels.map((label,i)=>[label,money(values[i]),prev?money(prev[i]):'—',prev?money(values[i]-prev[i]):'—']))+`<p class="helper">${T('기타 순비용은 임대·이자·정비 등과 영업 외 손익을 포함한 잔액입니다. 원금 상환은 비용이 아니라 재무 현금흐름입니다. 금액 증감은 월 합계이며 집계일수가 다를 수 있습니다.','その他純費用は賃料・利息・整備などと営業外損益を含む残額です。元金返済は費用ではなく財務キャッシュフローです。増減は月合計で、集計日数が異なる場合があります。')}</p>`:'')+
 `<h4>${T('현재부터 30일 자금 계획','現在から30日間の資金計画')}</h4>`+row(T('현금','現金'),money(f.account.cash))+row(T('등록된 청구서','登録済み請求書'),money(due.bills))+row(T('상환 예정 원금','返済予定元金'),money(due.principal))+row(T('추가 발생 이자 예상','追加発生利息の見込み'),money(due.interest))+row(T('운영 규정의 현금 유보','運営規定の現金留保'),money(reserve))+row(T('위 지급·유보 차감 후','上記支払・留保の差引後'),money(free))+
 `<p class="helper">${T('이자는 현재 금리와 정상 상환을 가정합니다. 앞으로 발생할 발주·급여·세금·운영비와 매출은 포함하지 않습니다. 전액을 투자 가능액으로 보지 마세요.','利息は現在の金利と予定どおりの返済を仮定。今後の仕入れ・給与・税金・運営費と売上は含みません。全額を投資可能額と考えないでください。')}</p>`+
 `<h4>${T('투자 비교 계산','投資比較計算')}</h4><div class="expansion-form">${refNumber('review-investment',T('초기 투자 ($)','初期投資 ($)'),0,0,1000000)}${refNumber('review-gross',T('추가 일 매출총이익 ($)','追加の日次売上総利益 ($)'),0,0,1000000)}${refNumber('review-expense',T('추가 일 운영비 ($)','追加の日次運営費 ($)'),0,0,1000000)}</div>`+
 (inputs?row(T('일 추가 손익 / 단순 회수 기간','日次追加損益／単純回収期間'),money(estimate.net)+' / '+(cost>0&&estimate.days!==null?estimate.days+T('일','日'):T('—','—')))+row(T('투자 후 위 자금 잔액','投資後の上記資金残高'),money(free-cost)):`<p>${T('0~1,000,000 사이의 금액을 입력하세요.','0〜1,000,000の金額を入力してください。')}</p>`)+
 `<p class="helper">${T('견적과 기존 점포 실적을 참고해 직접 입력합니다. 매출총이익은 매출에서 상품 원가를 뺀 금액입니다. 회수 기간은 입력한 손익이 유지될 때의 단순 계산이며, 대출·세금·계절 변화는 별도입니다. 입력만으로 투자하지 않습니다.','見積もりと既存店舗の実績を参考に入力。売上総利益は売上から商品原価を引いた額です。回収期間は入力した損益が続く場合の単純計算で、借入・税金・季節変動は別途考慮します。入力だけで投資は実行されません。')}</p>`+
 `<h4>${T('월별 기록','月別記録')}</h4>`+reviewTable([T('월','月'),T('매출','売上'),T('순이익','純利益'),T('영업 현금흐름','営業キャッシュフロー')],months.map(m=>[m.key+(m.closed?'':T(' 집계 중',' 集計中')),money(m.revenue),money(m.profit),money(m.operating)]))+
 `<h4>${T('현재 작업 대기','現在の作業待ち')}</h4>`+refTable([T('원인','原因'),T('사업장','事業所'),T('확인','確認')],a.blocked.map(x=>[mgReason(x.key),'#'+x.site,reviewRoute(x.key==='staff'||x.key==='manager'?'staff':x.key==='delivery'?'logistics':x.key==='supply'?'supply':'manufacture','업무 열기','業務を開く')]));
};
document.addEventListener('click',event=>{const b=event.target.closest('[data-review-desk]');if(!b||b.disabled)return;if(b.dataset.reviewDesk==='company-goals')openModal('company-goals');else selectDesk(b.dataset.reviewDesk);});
