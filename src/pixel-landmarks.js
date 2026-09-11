/* District-specific street furniture and ground markings; visual state only. */
function districtGround(){
 if(selectedMap!==1&&selectedMap!==2)return;
 const p=new Pixel(gc),line=(a,b,col)=>p.line(...point(...a),...point(...b),col);
 if(selectedMap===1){
  // Service parking behind the media block; no pedestrian corridor passes through it.
  plot(-3.4,3.7,5.2,1.8,'asphalt');
  for(let x=-3.3;x<1.5;x+=1.1){line([x,3.8],[x,5.3],'white');line([x,5.3],[x+.85,5.3],'white');}
  // Setback office gardens and the convention forecourt.
  for(const [x,y,w,d]of [[4,3.6,2.5,1.5],[10.4,3.6,3.8,1.5],[-4,-5,4,1.5]])plot(x,y,w,d,'grass');
  for(let x=9;x<15;x+=.65)line([x,7.3],[x,7.8],'white');
 }else{
  // Continuous concourse between station, arcade, cinema and transfer square.
  for(let x=-4;x<15;x+=.7)line([x,3.6],[x,5.2],'sand');
  // Bus bays sit beside the terminal, outside the through pedestrian routes.
  plot(12,-2.4,3.2,2.2,'asphalt');
  for(const y of [-2.2,-1.2]){line([12.2,y],[15,y],'yellow');line([15,y],[15,y+.65],'yellow');}
  // Platform access and safety fence along the track, leaving the station passage open.
  plot(-1.2,-2.1,1.2,1.2,'mist');
  for(let x=-18;x<26;x+=.6){if(x>-.8&&x<.4)continue;const a=point(x,-3.4);p.line(a[0],a[1],a[0],a[1]-6,'steel');}
  line([-18,-3.4],[26,-3.4],'steel');
 }
}
function districtDetails(kind,x,y){
 const at=(name,dx,dy)=>object(name,...point(x+dx,y+dy));
 if(selectedMap===1){
  if(kind==='tech-tower'){at('planter',.6,-.4);at('directory',-1,.3);}
  if(kind==='bank'){at('atm',-1.4,.45);at('planter',.65,-.5);}
  if(kind==='startup'){at('cafe-table',.5,-.65);at('bike',-1.4,.3);}
  if(kind==='media'){at('broadcast-van',1,-3.2);at('directory',-.9,.3);}
  if(kind==='night-office'){at('kiosk',.8,-1);at('bench',-1.1,.35);}
  if(kind==='convention'){at('poster',-1.7,.35);at('poster',.6,-.15);}
 }else if(selectedMap===2){
  if(kind==='central-station'){at('ticket',-1.7,.35);at('directory',.65,-.1);}
  if(kind==='arcade'){at('kiosk',.8,-.7);at('poster',-1.4,.3);}
  if(kind==='terminal'){at('bus',1,-1.8);at('bus-stop',.7,-.15);}
  if(kind==='cinema'){at('poster',-1.5,.4);at('poster',.65,-.1);}
  if(kind==='plaza'){at('fountain',-.4,-1.1);at('directory',.8,-.1);}
 }
}
function districtEdges(){
 if(selectedMap===1){for(const [name,x,y]of [['tower',-4.5,-3],['bank',7,-5.7],['startup',13,-4.5],['studio',-4.7,6],['kiosk',12.8,4.6]])object(name,...point(x,y));}
 if(selectedMap===2){for(const [name,x,y]of [['house',-3,-7],['arcade',4,-7],['store',11,-7],['kiosk',-4.5,5],['arcade',20.5,4.5]])object(name,...point(x,y));}
}

function buildingFootprint(name,sx,sy){const sizes={house:[43,38],store:[72,60],campus:[69,44],office:[63,42],bank:[74,48],startup:[62,43],studio:[72,45],hall:[88,50],station:[83,43],arcade:[75,43],terminal:[76,50],cinema:[67,45],inn:[64,43],warehouse:[87,54],tower:[53,39],'tech-tower':[60,38],media:[77,47],'night-office':[74,40],convention:[99,58],'central-station':[96,47]},d=sizes[name.replace('-snow','').replace('-night','')];if(!d)return null;const [x,y]=fromScreen(sx,sy);return [x-d[0]/24,y-d[1]/24,x,y];}
