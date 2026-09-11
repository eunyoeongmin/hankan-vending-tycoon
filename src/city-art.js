/* Code-native city tiles share the existing stop coordinates and simulation layers. */
const CITY_COLORS=[
 {land:'#a8b878',park:'#709850',leaf:'#b86890',leafLight:'#e8a8c0',river:'#385878',water:'#5898b0',road:'#707878',roof:'#a85848',particle:'#e8a8c0'},
 {land:'#90a860',park:'#507838',leaf:'#386838',leafLight:'#709848',river:'#305878',water:'#4888a8',road:'#707878',roof:'#a85840',particle:'#e0c868'},
 {land:'#b0a068',park:'#908048',leaf:'#985030',leafLight:'#c89040',river:'#405870',water:'#608898',road:'#707878',roof:'#885040',particle:'#d09840'},
 {land:'#c8d0d0',park:'#a8b8b8',leaf:'#708888',leafLight:'#e0e8e8',river:'#486878',water:'#90b0c0',road:'#707878',roof:'#c0d0d0',particle:'#ffffff'}
];
CITY_COLORS.forEach((p,i)=>Object.assign(PALETTES[i],p));
function cityTree(x,y){return `<g transform="translate(${x} ${y})"><path d="M-12 8h28v5h-28z" fill="#384838"/><path d="M-2-3h5v17h-5z" fill="#685038"/><path d="M-6-28h12v5h7v7h5v13H-18v-13h5v-7h7z" fill="var(--scene-leaf)" stroke="#384838" stroke-width="2"/><path d="M-7-24h12v5h-10v10h-9v-7h7z" fill="var(--scene-leafLight)"/></g>`;}
function cityBuilding(x,y,w,h,roof,label,floors=2){
 let windows='';for(let row=0;row<floors;row++)for(let col=0;col<Math.floor((w-16)/14);col++)windows+=`<rect x="${8+col*14}" y="${18+row*14}" width="7" height="8" fill="var(--scene-windows,#d8e0c0)" stroke="#484848" stroke-width="2"/>`;
 return `<g transform="translate(${x} ${y})"><path d="M8 8h${w}v${h}H8z" fill="#384838"/><rect width="${w}" height="${h}" fill="#b8b0a0" stroke="#383838" stroke-width="2"/><path d="M${w-9} 1h8v${h-2}h-8z" fill="#808078"/><path d="M0 0h${w}v12H0z" fill="${roof}" stroke="#383838" stroke-width="2"/><path d="M3 3h${w-6}" stroke="#d0c8b0" stroke-width="2"/>${windows}<rect x="${w-25}" y="${h-20}" width="14" height="20" fill="#485868" stroke="#383838" stroke-width="2"/><rect x="5" y="${h-19}" width="${Math.max(24,w-35)}" height="13" fill="#c0c0c0" stroke="#484848"/><text x="9" y="${h-9}" font-size="9" fill="#000" font-family="Tahoma, sans-serif">${label}</text></g>`;
}
function cityRoads(){return `<path d="M0 180H800M280 0V340M510 0V340" stroke="#484848" stroke-width="40"/><path d="M0 180H800M280 0V340M510 0V340" stroke="#b8b8b0" stroke-width="36"/><path d="M0 180H800M280 0V340M510 0V340" stroke="var(--scene-road)" stroke-width="26"/><path d="M0 180H800M280 0V340M510 0V340" stroke="#e0d890" stroke-width="2" stroke-dasharray="10 10"/>${[280,510].map(x=>`<path d="M${x-26} 168v24m52-24v24" stroke="#e0e0d0" stroke-width="9" stroke-dasharray="3 3"/>`).join('')}`;}
function cityScenery(map){
 const p=PALETTES[sceneSeason()];let art=`<rect width="800" height="340" fill="${p.land}"/><defs><pattern id="city-grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M0 0h2v2H0z" fill="#485838" opacity=".25"/></pattern></defs><rect width="800" height="340" fill="url(#city-grid)"/>`;
 if(map===4)art+=`<rect width="800" height="65" fill="${p.water}"/><path d="M0 57h800" stroke="#484848" stroke-width="12"/><path d="M0 52h800" stroke="#c0c0b0" stroke-width="3"/><path d="M30 14h120m45 18h108m250-18h130" stroke="#b0c8c8" stroke-width="2"/>`;
 else art+=`<path d="M685 0v90h35v100h-30v150" fill="none" stroke="${p.river}" stroke-width="64"/><path d="M685 0v90h35v100h-30v150" fill="none" stroke="${p.water}" stroke-width="52"/><path d="M676 20v50m35 35v45m-30 85v55" stroke="#b0c8c8" stroke-width="2"/>`;
 art+=cityRoads();
 const titles=map===1?[T('사무소','事務所'),T('본사','本社'),T('상가','店舗')]:map===2?[T('역','駅'),T('시장','市場'),T('백화점','百貨店')]:map===3?[T('호텔','ホテル'),T('박물관','博物館'),T('매표소','切符売場')]:map===4?[T('창고','倉庫'),T('물류','物流'),T('공장','工場')]:[T('주택','住宅'),T('대학','大学'),T('사무소','事務所')];
 if(map===0||map===3){art+=`<rect x="40" y="26" width="192" height="124" fill="${p.park}" stroke="#485838" stroke-width="2"/><path d="M48 130h170V65h-90v57" stroke="#c8b888" stroke-width="10" fill="none"/><rect x="66" y="46" width="70" height="35" fill="${p.water}" stroke="#485838" stroke-width="2"/>`;for(const [x,y] of [[55,110],[170,55],[216,110],[155,141]])art+=cityTree(x,y);}
 else art+=cityBuilding(60,map===4?88:35,140,map===4?55:96,'#586880',titles[0],map===4?1:4);
 art+=cityBuilding(330,map===4?84:36,110,map===4?63:98,map===4?'#686868':'#805848',titles[1],map===4?2:4);
 art+=cityBuilding(550,map===4?84:45,84,map===4?63:91,'#586878',titles[2],map===4?2:4);
 art+=cityBuilding(112,222,94,72,'var(--scene-roof)',titles[0],2);
 art+=cityBuilding(340,224,100,66,'#587068',map===4?titles[2]:T('역','駅'),2);
 art+=cityBuilding(555,221,68,54,'var(--scene-roof)',titles[0],1);
 for(const [x,y] of [[38,275],[235,270],[320,305],[650,305],[757,85],[755,273]])art+=cityTree(x,y);
 if(map===2)art+=`<path d="M35 5h580m-580 7h580" stroke="#383838" stroke-width="3"/><path d="M35 0h580" stroke="#786850" stroke-width="20" stroke-dasharray="3 12"/><rect x="344" y="0" width="120" height="19" fill="#b8b8a8" stroke="#383838"/><path d="M354 6h95" stroke="#285878" stroke-width="6"/>`;
 if(map===4)art+=`<path d="M358 15h124l-16 25h-96z" fill="#485878" stroke="#282828" stroke-width="2"/><rect x="392" y="6" width="38" height="16" fill="#c0c0b0"/><path d="M620 54V8h58M624 12l42 40" fill="none" stroke="#a88838" stroke-width="5"/>`;
 return art;
}
let cityArtKey='';
paintDistrict=function(){const key=selectedMap+':'+sceneSeason()+':'+lang;if(cityArtKey===key)return;cityArtKey=key;document.querySelector('.city-base').style.display='none';$('district-scenery').innerHTML=cityScenery(selectedMap);};
personSvg=function(x,y,seed,time,drinking=false,umbrella=false,winter=false){
 const shirt=['#a83838','#305888','#688038','#784878','#b88828','#287870'][seed%6],step=sceneMotion&&!drinking?(Math.floor(time/160+seed)%2?2:-2):0;
 return `<g class="scene-person" transform="translate(${Math.round(x)} ${Math.round(y)})"><path d="M-5 1h12v3H-5z" fill="#484848"/><path d="M-4-5v${9+step}h3v-9h2v${9-step}h3V-5z" fill="#283040"/><path d="M-5-15h10v12H-5z" fill="${shirt}" stroke="#282828"/><path d="M-4-22h8v7H-4z" fill="#d8a878"/><path d="M-4-24h8v3H-4z" fill="#483828"/><path d="M-7-13v8m14-8v${drinking?-6:8}" stroke="#d8a878" stroke-width="3"/>${winter?'<path d="M-5-15h10v3H1v6h-3v-9z" fill="#d8c078"/>':''}${drinking?'<rect x="5" y="-23" width="5" height="7" fill="#e0c848" stroke="#fff"/>':''}${umbrella?`<path d="M0-28v16" stroke="#282828" stroke-width="2"/><path d="M-12-27v-5h5v-4H7v4h5v5z" fill="${shirt}" stroke="#282828"/>`:''}</g>`;
};
function cityMachine(x,y,color,stock){return `<g class="scene-vender" transform="translate(${x} ${y})"><path d="M-10 14h25v4h-25z" fill="#484848"/><rect x="-11" y="-23" width="23" height="38" fill="#c0c0c0" stroke="#282828" stroke-width="2"/><path d="M-9-21h16v4H-9z" fill="${color}"/><path d="M9-21v34" stroke="#808080" stroke-width="3"/><rect x="-8" y="-15" width="14" height="19" fill="#283848" stroke="#808080"/><path d="M-5-12v5m6-5v5m-6 3v5m6-5v5" stroke="${stock?'#e0c058':'#808080'}" stroke-width="3"/><rect x="-6" y="8" width="12" height="4" fill="#282828"/><rect x="8" y="3" width="2" height="3" fill="${stock===null?'#808080':stock?'#00a000':'#c00000'}"/>${stock!==null&&!stock?'<path d="M-6-10l10 10m0-10L-6 0" stroke="#c00000" stroke-width="2"/>':''}</g>`;}
const cityBeforePaint=paintScene;
paintScene=function(time){cityBeforePaint(time);paintDistrict();};
function cityWeather(clock,season,weather){
 const t=sceneMotion?clock:0,snow=weather===2&&season===3,rain=weather===2&&!snow;let art='';
 if(rain||snow||season===0||season===2){const count=rain?65:snow?55:22;for(let i=0;i<count;i++){const x=Math.round((i*149+t*.012)%850-25),y=Math.round((i*89+t*(rain?.3:snow?.035:.021))%570-25);art+=rain?`<path d="M${x} ${y}v6h-2v6" fill="none" stroke="#b0d0e0" stroke-width="2"/>`:`<rect x="${x}" y="${y}" width="${snow?2:4}" height="2" fill="${snow?'#fff':PALETTES[season].particle}"/>`;}}
 if(weather<2)art+=`<path d="M715 20h20v5h5v20h-5v5h-20v-5h-5V25h5z" fill="${weather===1?'#e8a828':'#e0c858'}" stroke="#907028" stroke-width="2"/><path d="M725 12v5m0 36v5m-23-23h5m36 0h5" stroke="#e0c858" stroke-width="2"/>`;
 else {const drift=sceneMotion?Math.round(Math.sin(clock/12000)*25):0;art+=`<g transform="translate(${drift} 0)" fill="${rain?'#788898':'#b0b8b8'}" stroke="#586870" stroke-width="2"><path d="M630 26h12V16h25V8h30v8h30v10h22v12H630z"/><path d="M60 24h15V14h28v6h30v8h18v10H60z"/></g>`;}
 return art;
}
// Keep map information out of the scene so small viewports retain usable city space.
const cityReadout=document.createElement('div');cityReadout.id='city-readout';
cityReadout.append(document.querySelector('.map-label'),document.querySelector('.scene-clock'));
document.querySelector('.map-wrap').before(cityReadout);
document.querySelector('.city').setAttribute('shape-rendering','crispEdges');
paintDistrict();

// One camera rectangle owns both SVG artwork and HTML hit targets; no independent stretching.
const cityViewport=document.querySelector('.map-wrap'),cityStage=document.createElement('div');cityStage.id='city-stage';
cityStage.append(document.querySelector('.city'),$('pins'));cityViewport.append(cityStage);
function cityFit(){const scale=Math.min(cityViewport.clientWidth/800,cityViewport.clientHeight/340,1.5);cityStage.style.width=(800*scale)+'px';cityStage.style.height=(340*scale)+'px';}
const cityResizeObserver=typeof ResizeObserver!=='undefined'?new ResizeObserver(()=>cityFit()):null;cityResizeObserver?.observe(cityViewport);cityFit();
