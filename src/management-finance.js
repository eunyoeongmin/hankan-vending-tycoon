/* Daily expense accrual, monthly cash service; principal is never an expense. */
function mgDebt(f){return refFirm(f).notes.reduce((n,x)=>n+x.principal,0);}
function mgCreditLimit(f){const reports=refFirm(f).reports.filter(p=>p.final).slice(0,90),daily=reports.reduce((n,p)=>n+p.operating,0)/Math.max(1,reports.length),equity=Math.max(0,companyEquity(f));return Math.floor((Math.max(100000,equity*.5)+Math.max(0,daily)*90)*refClamp(f.meta.credit/70,.25,1.2));}
function mgAnnualRate(f,kind){return refClamp((.045+(100-f.meta.credit)*.001+(kind==='working'?.015:kind==='bond'?.025:0))*refWorld().cities[refHome(f).map].interest,.04,.20);}
function mgBorrow(f,amount,kind='equipment'){
 const r=refFirm(f),w=refWorld(),pool=kind==='bond'?'investorCash':'bankCash';
 if(!mgEnabled()||!['working','equipment','bond'].includes(kind)||!int(amount,10000,1000000000)||state.ended||r.notes.length>=12||f.meta.credit<40||r.bills.some(b=>b.due<state.day)||r.notes.some(n=>n.missed)||amount+mgDebt(f)>mgCreditLimit(f)||w[pool]<amount)return false;
 if(kind==='bond'&&mgFirm(f).month.filter(m=>m.closed&&m.profit>0).length<6)return false;
 const months=kind==='working'?3:kind==='equipment'?24:36,grace=kind==='equipment'?3:months;
 w[pool]-=amount;f.account.cash+=amount;
 r.notes.push({id:refId(),kind:kind==='bond'?'bond':'loan',product:kind,principal:amount,original:amount,rate:mgAnnualRate(f,kind)/365,due:mgAddMonths(state.day,months),start:state.day,next:mgAddMonths(state.day,1),grace:mgAddMonths(state.day,grace),installment:kind==='equipment'?Math.ceil(amount/(months-grace)):amount,duePrincipal:0,missed:0,calendar:true});
 refPost(f,'loan-proceeds',amount,'financing');return true;
}
function mgRepay(f,id,amount=Infinity){const r=refFirm(f),n=r.notes.find(n=>n.id===id);if(!n||!(amount>0)||(!finite(amount)&&amount!==Infinity)||state.ended)return false;const value=Math.min(n.principal,Math.floor(amount),Math.max(0,Math.floor(f.account.cash)));if(value<=0)return false;f.account.cash-=value;n.principal-=value;n.duePrincipal=Math.max(0,(n.duePrincipal||0)-value);refWorld()[n.kind==='bond'&&n.calendar?'investorCash':'bankCash']+=value;refPost(f,'principal-payment',-value,'financing');if(!n.duePrincipal)n.missed=0;if(!n.principal)r.notes=r.notes.filter(x=>x!==n);return true;}
function mgPayInterest(f){const r=refFirm(f);for(const b of r.bills.filter(b=>b.kind==='interest'&&b.due<=state.day)){if(f.account.cash<b.amount)continue;f.account.cash-=b.amount;refWorld()[b.to==='investors'?'investorCash':'bankCash']+=b.amount;refPost(f,'interest-payment',-b.amount);b.paid=true;}r.bills=r.bills.filter(b=>!b.paid);}
function mgDebtDay(f){const r=refFirm(f);for(const n of [...r.notes]){
 if(n.accruedDay===state.day)continue;n.accruedDay=state.day;
 const amount=n.principal*n.rate,due=n.calendar?Math.min(n.next,n.due):state.day;
 if(amount){companyExpense(f,amount);f.account.cash+=amount;const bill=r.bills.find(b=>b.kind==='interest'&&b.note===n.id&&b.due===due);if(bill)bill.amount+=amount;else r.bills.push({id:refId(),note:n.id,kind:'interest',to:n.kind==='bond'&&n.calendar?'investors':'bank',amount,due});}
 if(n.calendar&&n.next<=state.day){if(state.day>n.grace&&n.product==='equipment')n.duePrincipal=Math.min(n.principal,(n.duePrincipal||0)+n.installment);n.next=mgAddMonths(n.start,Math.round((mgDate(n.next).getUTCFullYear()-mgDate(n.start).getUTCFullYear())*12+mgDate(n.next).getUTCMonth()-mgDate(n.start).getUTCMonth())+1);}
 if(n.due<=state.day)n.duePrincipal=n.principal;
 }
 mgPayInterest(f);
 for(const n of [...r.notes]){if(n.duePrincipal>0)mgRepay(f,n.id,n.duePrincipal);const lateInterest=r.bills.some(b=>b.note===n.id&&b.due<=state.day);if(n.duePrincipal>0||lateInterest){n.missed=(n.missed||0)+1;f.meta.credit=Math.max(0,f.meta.credit-1);if(n.missed===1)refNotice(f,'차입금 연체 · 자금 조달 필요','借入金延滞・資金調達が必要','finance',n.id);}else n.missed=0;}
}
const mgBeforeBorrow=refBorrow;refBorrow=function(f,amount,kind='loan'){return mgEnabled()?mgBorrow(f,amount,kind==='bond'?'bond':'equipment'):mgBeforeBorrow(f,amount,kind);};
const mgBeforeRepay=refRepay;refRepay=function(f,id){return mgEnabled()?mgRepay(f,id):mgBeforeRepay(f,id);};
const mgBeforeBankBorrow=borrowCompany;borrowCompany=function(f,amount){return mgEnabled()?mgBorrow(f,amount,'working'):mgBeforeBankBorrow(f,amount);};
const mgBeforeBankRepay=repayCompany;repayCompany=function(f,amount){if(!mgEnabled())return mgBeforeBankRepay(f,amount);let left=amount,paid=0;for(const n of [...refFirm(f).notes].sort((a,b)=>a.due-b.due)){const cash=f.account.cash;if(mgRepay(f,n.id,left)){paid+=cash-f.account.cash;left-=cash-f.account.cash;}if(left<=0)break;}return paid;};
const mgBeforeRoom=companyBorrowRoom;companyBorrowRoom=function(f){if(!mgEnabled())return mgBeforeRoom(f);const r=refFirm(f);return f.meta.credit<40||r.notes.length>=12||r.notes.some(n=>n.missed)||r.bills.some(b=>b.due<state.day)?0:Math.max(0,mgCreditLimit(f)-mgDebt(f));};
const mgBeforeReview=companyFinanceReview;companyFinanceReview=function(f){if(!mgEnabled())return mgBeforeReview(f);if(f.meta.lastFinance>=state.day)return;f.meta.lastFinance=state.day;const bad=f.account.cash<0||refFirm(f).notes.some(n=>n.missed)||refFirm(f).bills.some(b=>b.due<state.day);f.meta.credit=refClamp(f.meta.credit+(bad?-2:1),0,100);f.meta.distress=bad?f.meta.distress+1:0;};
const mgBeforeRestructure=refRestructure;refRestructure=function(f,id){if(!mgEnabled())return mgBeforeRestructure(f,id);const n=refFirm(f).notes.find(n=>n.id===id);if(!n?.calendar)return mgBeforeRestructure(f,id);if(!n.missed||n.restructured||f.account.cash<n.principal*.1)return false;mgRepay(f,id,Math.ceil(n.principal*.1));n.restructured=true;n.start=state.day;n.due=mgAddMonths(state.day,12);n.next=mgAddMonths(state.day,1);n.grace=state.day;n.installment=Math.ceil(n.principal/12);n.product='equipment';n.rate=Math.min(.25/365,n.rate*1.25);n.duePrincipal=0;n.missed=0;f.meta.credit=Math.max(0,f.meta.credit-10);return true;};
