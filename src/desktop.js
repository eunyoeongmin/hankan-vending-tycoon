/* One persistent city viewport and one reusable business window. No simulation timer. */
document.body.classList.add('desktop95');
const desktopTitlebar=document.createElement('div');desktopTitlebar.id='desktop-titlebar';
desktopTitlebar.innerHTML='<span class="desktop-app-icon" aria-hidden="true"></span><strong id="desktop-title"></strong><button id="desktop-minimize" type="button">_</button><button id="desktop-close" type="button">×</button>';
deskSide.prepend(desktopTitlebar);deskSide.setAttribute('aria-labelledby','desktop-title');deskSide.setAttribute('role','region');
const desktopTaskbar=document.createElement('div');desktopTaskbar.id='desktop-taskbar';
desktopTaskbar.innerHTML='<span id="desktop-city-status"></span><button id="desktop-task" type="button"></button>';
officeRegister.append(desktopTaskbar);
let desktopWindowState='open';
function updateDesktop(){
 const tab=visibleDeskTabs().find(t=>t[0]===deskTab),title=tab?tr(tab[1]):T('회사','会社');
 controlText('desktop-title',title);controlText('desktop-task',title);
 controlText('desktop-city-status',T('도시 · 영업 현황','都市 · 営業状況'));
 $('desktop-minimize').setAttribute('aria-label',T('업무 창 최소화','業務ウィンドウを最小化'));
 $('desktop-close').setAttribute('aria-label',T('업무 창 닫기','業務ウィンドウを閉じる'));
 $('desktop-task').setAttribute('aria-label',T('업무 창 복원: ','業務ウィンドウを復元：')+title);
 $('desktop-task').setAttribute('aria-pressed',String(desktopWindowState==='open'));
 $('desktop-task').hidden=desktopWindowState==='closed';
 deskSide.hidden=desktopWindowState!=='open';deskLayout.dataset.window=desktopWindowState;
}
function setDesktopWindow(next){desktopWindowState=next;updateDesktop();}
const desktopBeforeSelect=selectDesk;
selectDesk=function(tab){desktopBeforeSelect(tab);setDesktopWindow('open');};
const desktopBeforeUpdate=updateDesk;
updateDesk=function(){desktopBeforeUpdate();updateDesktop();};
document.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b)return;
 if(b.id==='desktop-minimize'){setDesktopWindow('minimized');$('desktop-task').focus();}
 if(b.id==='desktop-close'){setDesktopWindow('closed');deskNav.querySelector('[aria-pressed="true"]')?.focus();}
 if(b.id==='desktop-task'){setDesktopWindow('open');$('desktop-minimize').focus();}
});
deskSide.addEventListener('keydown',event=>{if(event.key==='Escape'&&!modalView){event.preventDefault();setDesktopWindow('minimized');$('desktop-task').focus();}});
updateDesktop();
