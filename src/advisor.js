/* Portrait and localized role belong to help only, not the simulation clock. */
const advisorDrawModal=drawModal;
drawModal=function(){
 advisorDrawModal();
 const body=$('modal-body'),visible=['tutorialOffer','tutorial','help'].includes(modalView);
 body.classList.toggle('with-advisor',visible);
 if(!visible||body.querySelector('.advisor-portrait'))return;
 const portrait=document.createElement('figure');portrait.className='advisor-portrait';
 const img=document.createElement('img');img.src='__ADVISOR_PORTRAIT__';img.alt=T('운영 안내를 맡는 비서','運営案内を担当する秘書');img.width=112;img.height=168;
 const caption=document.createElement('figcaption');caption.textContent=T('경영 비서','経営秘書');
 portrait.append(img,caption);body.prepend(portrait);
};
