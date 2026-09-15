/* A separate UI surface: no simulation state or main-grid size changes. */
const advisorLayer=document.createElement('aside');advisorLayer.id='advisor-layer';advisorLayer.hidden=true;
advisorLayer.innerHTML='<section id="advisor-window" role="region" aria-labelledby="advisor-window-title"><header id="advisor-window-bar"><strong id="advisor-window-title"></strong><button id="advisor-fold" type="button">_</button></header><div id="advisor-window-layout"><img id="advisor-window-portrait" alt=""><div id="advisor-window-content"></div></div></section><button id="advisor-restore" type="button" hidden><img alt=""><span></span></button>';
document.body.append(advisorLayer);
const advisorWindow=$('advisor-window'),advisorContent=$('advisor-window-content'),advisorRestore=$('advisor-restore');
advisorContent.append(guidePanel,continuingPanel,operatingAdvisorPanel);
$('advisor-window-portrait').src=ADVISOR_PORTRAIT;advisorRestore.querySelector('img').src=ADVISOR_PORTRAIT;
let advisorFolded=false,advisorCompany=null,advisorLesson='',advisorPosition=null,advisorDrag=null;
function advisorPlace(){
 const top=Math.min(innerHeight-60,Math.max(8,(document.getElementById('office-status')?.getBoundingClientRect().bottom||0)+8));
 advisorLayer.style.setProperty('--advisor-top',top+'px');
 if(advisorPosition){const r=advisorWindow.getBoundingClientRect();advisorPosition.x=Math.max(4,Math.min(innerWidth-r.width-4,advisorPosition.x));advisorPosition.y=Math.max(4,Math.min(innerHeight-r.height-4,advisorPosition.y));advisorWindow.style.left=advisorPosition.x+'px';advisorWindow.style.top=advisorPosition.y+'px';advisorWindow.style.right='auto';advisorWindow.style.bottom='auto';}
}
function advisorWindowSync(){
 if(advisorCompany!==state){advisorCompany=state;advisorFolded=false;advisorLesson='';advisorPosition=null;advisorWindow.removeAttribute('style');}
 const tutorial=guideActive(),available=tutorial||continuingReady();
 advisorLayer.hidden=!available||!!modalView||menuOpen;
 const lesson=tutorial?guideState().step+':'+(guideState().intro||''):'';
 if(lesson!==advisorLesson){advisorLesson=lesson;if(tutorial)advisorFolded=false;}
 const consultation=!tutorial&&operatingAdvisorOpen;
 guidePanel.hidden=!tutorial;continuingPanel.hidden=tutorial||consultation||!available;operatingAdvisorPanel.hidden=tutorial||!consultation;
 advisorWindow.hidden=advisorFolded;advisorRestore.hidden=!advisorFolded;
 operatingAdvisorButton.setAttribute('aria-expanded',String(consultation&&!advisorFolded&&!advisorLayer.hidden));
 $('advisor-window-title').textContent=T('경영 비서','経営秘書');
 $('advisor-window-portrait').alt=T('경영 비서','経営秘書');
 $('advisor-fold').setAttribute('aria-label',T('비서 창 접기','秘書ウィンドウを折りたたむ'));
 advisorRestore.querySelector('span').textContent=T('비서','秘書');
 advisorRestore.setAttribute('aria-label',T('비서 창 열기','秘書ウィンドウを開く'));
 advisorRestore.setAttribute('aria-expanded',String(!advisorFolded));
 advisorPlace();
}
function advisorSetFolded(value){advisorFolded=value;advisorWindowSync();if(value)advisorRestore.focus({preventScroll:true});else $('advisor-fold').focus({preventScroll:true});guideSpotlight();}
const advisorGuidePaint=guidePaint;guidePaint=function(){advisorGuidePaint();advisorWindowSync();};
const advisorContinuingPaint=continuingPaint;continuingPaint=function(){advisorContinuingPaint();advisorWindowSync();};
const advisorOperatingPaint=paintOperatingAdvisor;paintOperatingAdvisor=function(){advisorOperatingPaint();advisorWindowSync();};
const advisorWindowDraw=drawModal;drawModal=function(){advisorWindowDraw();advisorWindowSync();};
const advisorWindowClose=closeModal;closeModal=function(){advisorWindowClose();advisorWindowSync();};
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.id==='advisor-fold')advisorSetFolded(true);
 if(b.id==='advisor-restore'){if(!guideActive())operatingAdvisorOpen=false;advisorSetFolded(false);}
 if(b.id==='operating-advisor-toggle'&&operatingAdvisorOpen)advisorSetFolded(false);
 if((b.id==='guide-focus'&&!guideWaiting())||b.dataset.continuing==='go'||b.dataset.advisorRoute){advisorFolded=true;advisorWindowSync();guideSpotlight();}
});
$('advisor-window-bar').addEventListener('pointerdown',e=>{if(e.target.closest('button')||e.button!==0)return;const r=advisorWindow.getBoundingClientRect();advisorDrag={id:e.pointerId,x:e.clientX-r.left,y:e.clientY-r.top};e.currentTarget.setPointerCapture(e.pointerId);});
$('advisor-window-bar').addEventListener('pointermove',e=>{if(!advisorDrag||advisorDrag.id!==e.pointerId)return;advisorPosition={x:e.clientX-advisorDrag.x,y:e.clientY-advisorDrag.y};advisorPlace();guideSpotlight();});
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('advisor-window-bar').addEventListener(event,()=>advisorDrag=null);
window.addEventListener('resize',()=>{advisorPlace();guideSpotlight();});
advisorWindowSync();
