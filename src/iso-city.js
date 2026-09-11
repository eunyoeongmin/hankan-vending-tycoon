/* Visual projection only; saved locations and simulation distances stay in world coordinates. */
function isoPoint(x,y,z=0){return [400+(x-400)*.65-(y-170)*.75,260+(x-400)*.27+(y-170)*.40-z];}
function isoPoly(points,fill,stroke='#45545b'){return `<polygon points="${points.map(p=>isoPoint(...p).join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;}
function isoGround(x,y,w,h,fill){return isoPoly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],fill);}
function isoLine(points,color,width=1,dash=''){return `<polyline points="${points.map(p=>isoPoint(...p).join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;}
function isoBuilding(x,y,w,d,h,label,roof){
 let svg=isoPoly([[x,y,h],[x+w,y,h],[x+w,y+d,h],[x,y+d,h]],roof)+isoPoly([[x+w,y,0],[x+w,y+d,0],[x+w,y+d,h],[x+w,y,h]],'#788b96')+isoPoly([[x,y+d,0],[x+w,y+d,0],[x+w,y+d,h],[x,y+d,h]],'#b8c2bf');
 svg+=isoPoly([[x+6,y+6,h+2],[x+w-6,y+6,h+2],[x+w-6,y+d-6,h+2],[x+6,y+d-6,h+2]],'#cad0c5');
 for(let z=23;z<h-9;z+=13){for(let u=9;u<w-9;u+=16)svg+=isoPoly([[x+u,y+d,z],[x+u+8,y+d,z],[x+u+8,y+d,z+7],[x+u,y+d,z+7]],'var(--scene-windows,#cdd9c7)','#617784');for(let v=7;v<d-8;v+=15)svg+=isoPoly([[x+w,y+v,z],[x+w,y+v+8,z],[x+w,y+v+8,z+7],[x+w,y+v,z+7]],'#a7bdc4','#526979');}
 svg+=isoPoly([[x+9,y+d,0],[x+w-9,y+d,0],[x+w-9,y+d,16],[x+9,y+d,16]],'#385669')+isoPoly([[x-2,y+d+9,18],[x+w+2,y+d+9,18],[x+w+2,y+d,23],[x-2,y+d,23]],roof);
 const [tx,ty]=isoPoint(x+w/2,y+d,28);svg+=`<text x="${tx}" y="${ty}" text-anchor="middle" font-size="9" fill="#243743" paint-order="stroke" stroke="#e3e4d5" stroke-width="3">${label}</text>`;
 return {depth:isoPoint(x+w,y+d)[1],svg:`<g class="iso-building">${svg}</g>`};
}
let isoKey='',isoObjects=[];
function isoScenery(){const key=selectedMap+':'+sceneSeason()+':'+lang;if(key===isoKey)return;isoKey=key;const p=PALETTES[sceneSeason()],map=selectedMap;
 let ground=isoGround(0,0,800,340,p.land)+isoGround(685,0,115,340,p.water);
 for(let x=20;x<680;x+=28)ground+=isoLine([[x,0],[x,340]],p.park,.35);
 for(let y=12;y<340;y+=22)ground+=isoLine([[0,y],[680,y]],p.park,.35);
 for(const [x,y,w,h] of [[0,159,800,42],[259,0,42,340],[489,0,42,340]])ground+=isoGround(x,y,w,h,'#b6b9aa');
 for(const [x,y,w,h] of [[0,167,800,26],[267,0,26,340],[497,0,26,340]])ground+=isoGround(x,y,w,h,'#65717a');
 ground+=isoLine([[0,180],[800,180]],'#ece1ad',1,'9 9')+isoLine([[280,0],[280,340]],'#ece1ad',1,'9 9')+isoLine([[510,0],[510,340]],'#ece1ad',1,'9 9');
 for(const x of [280,510])for(let d=-10;d<=10;d+=5)ground+=isoLine([[x+d,153],[x+d,164]],'#e6e3d4',2)+isoLine([[x+d,196],[x+d,207]],'#e6e3d4',2);
 if(map===2){ground+=isoGround(0,5,665,25,'#847f71');for(let x=0;x<660;x+=12)ground+=isoLine([[x,7],[x,27]],'#c8c1a5',2);ground+=isoLine([[0,10],[665,10]],'#394c58',2)+isoLine([[0,23],[665,23]],'#394c58',2);}
 if(map===4)ground+=isoGround(0,0,800,50,p.water)+isoGround(15,46,640,12,'#aaa898');
 const labels=map===1?[T('오피스','オフィス'),T('본사','本社'),T('은행','銀行')]:map===2?[T('중앙역','中央駅'),T('백화점','百貨店'),T('호텔','ホテル')]:map===3?[T('공원','公園'),T('박물관','博物館'),T('호텔','ホテル')]:map===4?[T('창고','倉庫'),T('물류','物流'),T('공장','工場')]:[T('대학','大学'),T('주택','住宅'),T('상점','店舗')];
 const taller=map===1?22:map===2?12:0;isoObjects=[isoBuilding(70,55,124,66,map===4?36:59+taller,labels[0],'#637e86'),isoBuilding(334,42,103,77,68+taller,labels[1],'#847889'),isoBuilding(558,48,86,69,58+taller,labels[2],'#6c8790'),isoBuilding(122,227,81,51,42,labels[2],'#a16f5d'),isoBuilding(339,235,88,49,44,T('상점가','商店街'),'#628576'),isoBuilding(558,228,54,39,34,T('찻집','喫茶店'),'#997958')];
 if(map===0||map===3){isoObjects.shift();ground+=isoGround(42,48,182,93,p.park)+isoGround(65,72,75,32,p.water);ground+=isoLine([[56,130],[197,130],[197,65]],'#c5b995',7);}
 for(const [x,y]of [[35,122],[235,85],[310,70],[463,88],[650,110],[25,276],[230,304],[310,316],[652,305],[755,85],[755,273],...(map===0||map===3?[[55,65],[165,66],[175,106]]:[])]){const pt=isoPoint(x,y);isoObjects.push({depth:pt[1],svg:cityTree(...pt)});}
 if(map===2)isoObjects.push(isoBuilding(80,7,170,16,14,'','#527f77'));
 $('district-scenery').innerHTML=ground;for(const o of isoObjects){o.node=document.createElementNS('http://www.w3.org/2000/svg','g');o.node.dataset.isoDepth=o.depth;o.node.innerHTML=o.svg;}
}
const isoPersonBefore=personSvg;personSvg=function(x,y,...args){const pt=isoPoint(x,y);return `<g data-depth="${pt[1]}">${isoPersonBefore(...pt,...args)}</g>`;};
const isoMachineBefore=cityMachine;cityMachine=function(x,y,...args){const pt=isoPoint(x,y);return `<g data-depth="${pt[1]}">${isoMachineBefore(...pt,...args)}</g>`;};
const isoDepth=document.createElementNS('http://www.w3.org/2000/svg','g');isoDepth.id='iso-depth';$('scene-tint').before(isoDepth);
for(const id of ['scene-machines','scene-npc','scene-people','scene-workers'])$(id).style.display='none';
paintDistrict=isoScenery;
const isoPaintBefore=paintScene;paintScene=function(time){isoPaintBefore(time);isoScenery();const actors=[];for(const id of ['scene-machines','scene-npc','scene-people','scene-workers'])for(const node of $(id).children){const actor=node.matches('[data-depth]')?node:node.querySelector('[data-depth]'),depth=Number(actor?.dataset.depth||0);node.dataset.isoDepth=depth;actors.push({depth,node});}isoDepth.replaceChildren(...[...isoObjects,...actors].sort((a,b)=>a.depth-b.depth).map(o=>o.node));};
function isoPins(){for(const pin of $('pins').children){const pt=isoPoint(...STOPS[Number(pin.dataset.select)%6]);pin.dataset.number=String(Number(pin.dataset.select)%6+1);pin.title=pin.textContent;pin.setAttribute('aria-label',pin.textContent);pin.style.left=(pt[0]/8)+'%';pin.style.top=((pt[1]+18)/520*100)+'%';}}
const isoMapBefore=render;render=function(){isoMapBefore();isoPins();};
document.querySelector('.city').setAttribute('viewBox','0 0 800 520');$('scene-tint').setAttribute('height','520');
cityFit=function(){const scale=Math.min(cityViewport.clientWidth/800,cityViewport.clientHeight/520,1.5);cityStage.style.width=(800*scale)+'px';cityStage.style.height=(520*scale)+'px';cityStage.classList.toggle('compact-city',800*scale<500);};
cityFit();isoScenery();isoPins();
