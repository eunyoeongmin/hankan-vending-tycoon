/* New district pieces use the approved art-lab raster primitives and palette. */
function block(name,w,d,h,style){
 sprite(name,w+d+18,h+(w+d)/2+22,p=>{
  const f=(side,u,z)=>side?[8+w+u*d,h+(w+d)/2-u*d/2-z]:[8+u*w,h+d/2+u*w/2-z];
  const panel=(side,u,v,z,hh,color,edge)=>p.poly([f(side,u,z),f(side,v,z),f(side,v,z+hh),f(side,u,z+hh)],color,edge);
  p.poly([[12,h+d/2+5],[12+w,h+(w+d)/2+5],[w+d+17,h+w/2+5],[d+17,h]],'shade');
  panel(0,0,1,0,h,style==='glass'?'shade':'cream','ink');panel(1,0,1,0,h,style==='brick'?'brick':'steel','ink');
  for(let z=22;z<h-3;z+=18)for(const side of [0,1]){p.line(...f(side,0,z-6),...f(side,1,z-6),'sand');for(let u=.1;u<.85;u+=.23){panel(side,u,u+.15,z-3,11,'ink');panel(side,u+.015,u+.13,z-2,9,side?'blue':'cyan');p.line(...f(side,u+.02,z+6),...f(side,u+.12,z+6),'glass');}}
  panel(0,.12,.84,1,16,'deep');for(let u=.16;u<.81;u+=.2)panel(0,u,u+.13,3,12,'glass');panel(0,.44,.58,0,17,'navy');
  p.poly([[8,h+d/2-h],[8+w,(w+d)/2],[8+w+d,w/2],[8+d,0]],'shade','ink');p.poly([[13,d/2],[8+w,(w+d)/2-5],[3+w+d,w/2],[8+d,5]],style==='brick'?'brick':'steel','mist');
  for(let u=8;u<w-8;u+=9)p.line(8+u,d/2+u/2,8+d+u,u/2,'shade');
  p.poly([[d+7,13],[d+20,19],[d+30,14],[d+17,8]],'white','shade');p.poly([[d+7,13],[d+20,19],[d+20,25],[d+7,19]],'steel','shade');p.poly([[d+20,19],[d+30,14],[d+30,20],[d+20,25]],'deep','shade');
  if(style==='bank'||style==='campus'){for(let u=.05;u<1;u+=.2){p.line(...f(0,u,1),...f(0,u,20),'white');p.line(...f(0,u+.035,1),...f(0,u+.035,20),'sand');}panel(0,.05,.95,22,6,'mist');}
  if(style==='shop'||style==='cinema'){for(let u=0;u<1;u+=.1){const a=f(0,u,20),b=f(0,u+.1,20);p.poly([a,b,[b[0]-4,b[1]+5],[a[0]-4,a[1]+5]],Math.round(u*10)%2?'white':'red','darkred');}}
  if(style==='cinema'){panel(0,.12,.8,30,18,'navy');panel(0,.16,.37,33,12,'gold');panel(0,.44,.72,33,12,'brick');}
  if(style==='glass'){p.line(8+d,0,8+d,-15,'ink');p.rect(8+d-2,0,5,8,'mist');}
  if(style==='studio'){p.poly([[d+35,9],[d+43,2],[d+56,7],[d+52,18],[d+43,19]],'white','shade');p.line(d+43,10,d+33,0,'deep');}
  if(style==='station'){panel(0,.1,.9,24,7,'navy');for(let u=.2;u<.9;u+=.2)panel(0,u,u+.07,26,3,'white');}
  p.line(...f(0,1,0),...f(0,1,h),'white');
 },8+w,h+(w+d)/2);
}
block('campus',69,44,57,'campus');block('office',63,42,112,'glass');block('bank',74,48,61,'bank');block('startup',62,43,46,'brick');block('studio',72,45,69,'studio');block('hall',88,50,38,'glass');block('station',83,43,43,'station');block('arcade',75,43,36,'shop');block('terminal',76,50,32,'station');block('cinema',67,45,65,'cinema');block('inn',64,43,41,'shop');block('warehouse',87,54,29,'brick');block('tower',53,39,111,'brick');
sprite('house',98,91,p=>{p.poly([[5,59],[51,83],[93,62],[47,38]],'shade');p.poly([[8,43],[51,65],[51,79],[8,57]],'cream','ink');p.poly([[51,65],[89,45],[89,59],[51,79]],'brick','ink');p.poly([[5,43],[47,20],[93,43],[51,66]],'darkred','ink');p.poly([[5,43],[29,14],[72,35],[51,66]],'brick','ink');p.poly([[29,14],[67,0],[93,43],[72,35]],'shade','ink');for(let i=0;i<5;i++)p.line(10+i*8,45+i*4,31+i*8,20+i*4,'red');p.poly([[14,51],[26,57],[26,66],[14,60]],'blue','ink');p.poly([[60,64],[74,57],[74,66],[60,73]],'blue','ink');p.line(18,53,23,55,'glass');p.line(61,65,72,59,'glass');p.poly([[35,62],[45,67],[45,75],[35,70]],'navy','ink');p.line(4,69,36,85,'white');for(let i=0;i<6;i++)p.line(4+i*6,64+i*3,4+i*6,73+i*3,'white');},51,79);
sprite('gate',79,54,p=>{for(const x of [5,60]){p.rect(x,10,7,36,'sand');p.rect(x,10,2,35,'white');p.rect(x-2,7,11,4,'mist');}p.poly([[3,5],[61,34],[71,29],[13,0]],'navy','ink');for(let x=11;x<60;x+=8)p.rect(x,7+(x-11)/2,4,3,'white');p.line(12,45,60,21,'deep');},35,47);
sprite('bus',70,44,p=>{p.poly([[2,23],[48,44],[68,34],[23,13]],'shade');p.poly([[3,9],[48,31],[48,40],[3,18]],'cream','ink');p.poly([[48,31],[66,22],[66,32],[48,40]],'steel','ink');p.poly([[3,9],[20,0],[66,22],[48,31]],'white','ink');p.poly([[6,11],[45,30],[45,35],[6,16]],'blue');p.poly([[51,30],[63,24],[63,29],[51,35]],'navy');for(let i=0;i<5;i++)p.line(9+i*8,12+i*4,9+i*8,17+i*4,'mist');p.line(4,22,46,42,'red');for(const x of [12,39]){p.rect(x,23+(x-12)/2,5,6,'ink');p.rect(x+1,25+(x-12)/2,2,2,'steel');}},36,37);
sprite('stall',44,42,p=>{p.line(8,18,8,35,'darkred');p.line(35,21,35,38,'darkred');p.poly([[3,15],[29,28],[43,20],[17,7]],'red','ink');for(let i=0;i<4;i++)p.poly([[3+i*6,15+i*3],[6+i*6,17+i*3],[20+i*6,9+i*3],[17+i*6,7+i*3]],'white');p.poly([[7,28],[29,39],[38,34],[16,23]],'gold','darkred');p.line(11,28,27,36,'yellow');},23,37);
sprite('gazebo',66,64,p=>{for(const [x,y]of [[10,31],[34,44],[57,32]]){p.rect(x,y,3,18,'darkred');p.rect(x,y,1,18,'gold');}p.poly([[4,32],[34,48],[64,33],[35,18]],'darkred','ink');p.poly([[4,32],[34,5],[64,33],[34,48]],'leaf','ink');p.line(34,6,34,45,'grass');p.line(10,31,34,37,'lime');p.poly([[9,53],[34,65],[60,52],[35,40]],'sand','darkred');},34,59);
sprite('tent',48,34,p=>{p.poly([[2,26],[29,34],[47,25],[21,16]],'shade');p.poly([[3,25],[17,3],[33,18],[28,32]],'gold','darkred');p.poly([[17,3],[35,0],[47,24],[33,18]],'red','darkred');p.poly([[8,25],[17,10],[24,29]],'deep');p.line(17,3,28,32,'yellow');p.line(17,3,3,25,'white');},25,29);
sprite('lookout',60,73,p=>{p.poly([[2,50],[31,65],[59,51],[30,36]],'sand','ink');for(let i=0;i<5;i++)p.poly([[10+i*2,52+i*3],[29+i*2,61+i*3],[34+i*2,58+i*3],[15+i*2,49+i*3]],'mist','shade');p.line(6,44,29,55,'deep');p.line(29,55,54,43,'deep');for(let x=6;x<30;x+=6)p.line(x,44+(x-6)/2,x,51+(x-6)/2,'deep');p.rect(29,28,3,18,'deep');p.line(25,26,41,18,'steel');p.line(25,27,41,19,'white');p.poly([[0,48],[0,35],[28,48],[28,61]],'brick','shade');},31,65);
sprite('wheel',89,108,p=>{const cx=44,cy=42,r=35;let pts=[];for(let i=0;i<16;i++){const a=i*Math.PI/8;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}for(let i=0;i<16;i++){p.line(cx,cy,...pts[i],'mist');p.line(...pts[i],...pts[(i+1)%16],'steel');if(i%2===0){p.rect(pts[i][0]-3,pts[i][1]-1,7,7,i%4?'red':'gold');p.rect(pts[i][0]-2,pts[i][1],5,3,'glass');}}p.line(44,42,25,98,'deep');p.line(45,42,64,98,'deep');p.line(25,98,64,98,'steel');p.rect(42,40,5,5,'white');},44,98);
sprite('bike',29,24,p=>{for(const x of [6,23]){p.poly([[x-4,18],[x-3,14],[x+2,13],[x+5,17],[x+3,21],[x-2,22]],'deep','ink');p.rect(x-1,16,3,3,'steel');}p.line(6,18,13,9,'red');p.line(13,9,23,18,'red');p.line(6,18,18,17,'red');p.line(18,17,20,8,'steel');p.line(10,7,16,7,'ink');p.line(20,8,24,6,'ink');},14,20);
sprite('sign',19,34,p=>{p.rect(8,14,2,18,'deep');p.rect(1,1,16,16,'ink');p.rect(2,2,14,14,'cream');p.rect(4,4,10,3,'navy');p.rect(4,9,7,1,'steel');p.rect(4,12,9,1,'steel');},9,31);
sprite('umbrella',27,22,p=>{p.line(13,5,13,21,'deep');p.poly([[1,10],[5,3],[13,0],[21,3],[26,10],[20,9],[13,12],[6,9]],'blue','ink');p.poly([[3,8],[6,4],[12,2],[10,9]],'cyan');},13,21);
sprite('steam',20,24,p=>{p.line(6,22,9,17,'mist');p.line(9,17,6,12,'mist');p.line(6,12,9,7,'white');p.line(14,16,16,10,'mist');p.line(16,10,13,5,'white');},10,22);
function paletteCopy(name,source,changes){const s=SPRITES[source];return sprite(name,s.w,s.h,p=>{p.c.drawImage(s.canvas,0,0);const img=p.c.getImageData(0,0,s.w,s.h),map=new Map(Object.entries(changes).map(([a,b])=>[parseInt(PAL[a].slice(1),16),PAL[b].slice(1).match(/../g).map(v=>parseInt(v,16))]));for(let i=0;i<img.data.length;i+=4){const rgb=map.get((img.data[i]<<16)|(img.data[i+1]<<8)|img.data[i+2]);if(rgb)img.data.set(rgb,i);}p.c.putImageData(img,0,0);},s.ax,s.ay);}
for(const [season,colors]of Object.entries({spring:{leaf:'sand',grass:'cream',lime:'white'},autumn:{leaf:'darkred',grass:'brick',lime:'gold'},winter:{leaf:'shade',grass:'steel',lime:'white'}}))paletteCopy('tree-'+season,'tree',colors);
for(const color of ['blue','leaf','gold'])for(const dir of ['ne','nw','se','sw'])for(let f=0;f<4;f++)paletteCopy('customer-'+color+'-'+dir+'-'+f,'customer-'+dir+'-'+f,{brick:color,red:color==='blue'?'cyan':color==='leaf'?'grass':'yellow'});
paletteCopy('machine-rival','machine',{red:'blue',brick:'navy'});paletteCopy('machine-rival-empty','machine-empty',{red:'blue',brick:'navy'});
sprite('machine-service',20,34,p=>{p.c.drawImage(SPRITES.machine.canvas,0,0);p.rect(3,10,12,14,'deep');p.line(4,11,14,22,'gold');p.line(14,11,4,22,'gold');},10,32);

sprite('stall-closed',44,42,p=>{p.poly([[7,28],[29,39],[38,34],[16,23]],'steel','ink');p.poly([[7,24],[29,35],[38,30],[16,19]],'mist','shade');p.line(10,25,28,34,'white');p.rect(21,15,3,17,'deep');},23,37);
function snowRoof(name,base){const s=SPRITES[base];sprite(name,s.w,s.h,p=>{p.c.drawImage(s.canvas,0,0);const img=p.c.getImageData(0,0,s.w,s.h);for(let y=0;y<s.h*.48;y++)for(let x=0;x<s.w;x++){const i=(y*s.w+x)*4;if(!img.data[i+3])continue;const col=(img.data[i]<<16)|(img.data[i+1]<<8)|img.data[i+2];if([PAL.steel,PAL.brick,PAL.mist].some(c=>parseInt(c.slice(1),16)===col)&&((x+y)%5!==0)){img.data[i]=226;img.data[i+1]=225;img.data[i+2]=199;}}p.c.putImageData(img,0,0);},s.ax,s.ay);}
sprite('train',95,48,p=>{p.poly([[2,14],[71,48],[92,37],[24,3]],'shade');p.poly([[3,7],[72,41],[72,46],[3,12]],'cream','ink');p.poly([[3,7],[23,0],[92,34],[72,41]],'white','ink');p.poly([[72,41],[92,34],[92,40],[72,46]],'steel','ink');p.line(4,14,70,46,'blue');for(let i=0;i<8;i++)p.poly([[8+i*8,10+i*4],[13+i*8,12+i*4],[13+i*8,17+i*4],[8+i*8,15+i*4]],'blue','ink');},48,42);
sprite('boat',100,56,p=>{p.poly([[1,22],[59,51],[97,34],[75,41],[14,11]],'deep','ink');p.poly([[9,19],[65,46],[90,34],[34,7]],'mist','ink');p.poly([[31,16],[61,31],[73,25],[43,10]],'white','shade');p.poly([[31,16],[61,31],[61,38],[31,23]],'steel','shade');p.poly([[34,19],[58,31],[58,35],[34,23]],'blue');p.rect(49,7,5,14,'brick');p.line(1,29,53,55,'glass');},49,48);

// Distinct silhouettes for the business district, on the same native raster grid.
block('tech-base',60,38,103,'glass');
sprite('tech-tower',122,164,p=>{p.c.drawImage(SPRITES['tech-base'].canvas,0,8);p.poly([[39,8],[68,22],[91,10],[62,0]],'steel','ink');p.line(61,0,61,20,'white');p.line(29,42,29,109,'glass');p.line(33,44,33,112,'cyan');p.poly([[19,112],[47,126],[65,117],[38,104]],'glass','ink');},68,160);
block('night-office',74,40,80,'brick');
block('media-base',77,47,60,'studio');
sprite('media',150,139,p=>{p.c.drawImage(SPRITES['media-base'].canvas,0,15);p.line(64,27,64,7,'deep');p.poly([[44,5],[52,0],[77,10],[71,28],[56,23]],'white','shade');p.line(57,10,81,1,'deep');p.poly([[27,85],[64,103],[64,111],[27,93]],'navy','ink');for(let i=0;i<5;i++)p.rect(32+i*5,88+i*2.5,3,3,'white');},85,137);
sprite('convention',176,110,p=>{
 p.poly([[5,67],[109,119],[166,89],[62,37]],'shade');
 p.poly([[7,47],[106,97],[106,110],[7,60]],'glass','ink');p.poly([[106,97],[164,68],[164,82],[106,110]],'blue','ink');
 p.poly([[5,47],[25,17],[55,4],[163,58],[164,68],[106,97]],'steel','ink');
 for(let i=0;i<12;i++){const x=8+i*8;p.line(x,46+i*4,x+20,18+i*4,'white');p.line(x+20,18+i*4,x+48,5+i*4,'mist');}
 for(let i=0;i<9;i++)p.line(14+i*10,53+i*5,14+i*10,62+i*5,'white');
 },106,108);
sprite('central-station',163,113,p=>{
 p.poly([[6,61],[104,110],[156,84],[58,35]],'shade');
 p.poly([[8,41],[104,89],[104,104],[8,56]],'cream','ink');p.poly([[104,89],[151,65],[151,81],[104,104]],'steel','ink');
 p.poly([[5,41],[53,17],[155,64],[104,89]],'steel','ink');
 for(let i=0;i<10;i++)p.line(12+i*9,41+i*4.5,53+i*9,21+i*4.5,'mist');
 p.poly([[26,49],[53,62],[53,28],[26,15]],'mist','ink');p.poly([[53,62],[77,50],[77,16],[53,28]],'shade','ink');
 p.poly([[26,15],[49,3],[77,16],[53,28]],'navy','ink');
 p.rect(36,27,13,16,'ink');p.rect(37,28,11,14,'white');p.line(42,30,42,35,'ink');p.line(42,35,46,37,'ink');
 for(let i=0;i<4;i++)p.poly([[59+i*10,69+i*5],[67+i*10,73+i*5],[67+i*10,89+i*5],[59+i*10,85+i*5]],'navy','ink');
 p.poly([[8,54],[100,100],[107,95],[15,49]],'navy','ink');
 },104,104);
sprite('platform-roof',97,65,p=>{for(const [x,y]of [[10,28],[76,61]]){p.line(x,y,x,y-21,'deep');p.line(x+1,y,x+1,y-21,'mist');}p.poly([[3,8],[70,42],[94,30],[27,0]],'mist','ink');p.line(3,8,70,42,'white');p.line(70,42,94,30,'steel');},72,62);
sprite('commuter-train',94,72,p=>{
 p.poly([[3,23],[69,56],[91,45],[25,12]],'white','ink');
 p.poly([[3,23],[69,56],[69,70],[3,37]],'mist','ink');p.poly([[69,56],[91,45],[91,59],[69,70]],'steel','ink');
 p.line(4,35,67,67,'blue');p.line(4,36,67,68,'blue');
 for(let i=0;i<6;i++){let x=7+i*10,y=26+i*5;p.poly([[x,y],[x+7,y+3],[x+7,y+10],[x,y+7]],'navy','ink');p.line(x+1,y+1,x+6,y+3,'glass');}
 p.poly([[73,56],[87,49],[87,57],[73,64]],'navy','ink');p.dot(75,65,'yellow');p.dot(86,60,'yellow');
 for(const x of [13,54]){p.rect(x,42+(x-13)/2,6,4,'ink');}
 },47,58);
sprite('planter',35,27,p=>{p.poly([[2,13],[20,22],[33,15],[15,6]],'grass','ink');p.poly([[2,13],[20,22],[20,27],[2,18]],'steel','ink');p.poly([[20,22],[33,15],[33,20],[20,27]],'shade','ink');for(let i=0;i<7;i++)p.rect(7+i*3,8+(i%3)*2,4,4,'leaf');},20,26);
sprite('directory',21,43,p=>{p.rect(4,4,14,36,'steel','ink');p.rect(5,5,12,18,'navy');for(let y=8;y<21;y+=4)p.rect(7,y,8,1,'white');p.rect(6,27,10,8,'glass');},11,40);
sprite('poster',21,33,p=>{p.rect(2,0,17,26,'ink');p.rect(3,1,15,24,'mist');p.rect(5,3,11,12,'brick');p.rect(7,5,5,6,'gold');for(let y=18;y<23;y+=3)p.rect(5,y,11,1,'navy');p.line(5,26,2,32,'deep');p.line(16,26,19,32,'deep');},10,31);
sprite('ticket',24,32,p=>{p.rect(3,4,17,26,'navy');p.rect(4,5,15,7,'blue');p.rect(6,7,10,3,'white');p.rect(5,15,8,7,'glass');p.rect(15,17,3,3,'gold');p.rect(7,25,10,2,'ink');},12,30);
paletteCopy('atm','ticket',{navy:'leaf',blue:'grass'});
sprite('kiosk',46,44,p=>{p.poly([[4,21],[27,33],[27,43],[4,31]],'cream','ink');p.poly([[27,33],[43,25],[43,35],[27,43]],'brick','ink');p.poly([[1,20],[25,32],[45,22],[21,10]],'leaf','ink');p.poly([[6,26],[23,34],[23,39],[6,31]],'glass');p.poly([[5,14],[21,22],[21,28],[5,20]],'navy','ink');},25,42);
sprite('cafe-table',36,35,p=>{p.line(17,19,17,32,'deep');p.poly([[3,16],[19,24],[33,17],[17,9]],'white','ink');p.rect(15,13,4,6,'red');p.line(3,22,3,31,'deep');p.line(28,24,28,33,'deep');},18,32);
sprite('bus-stop',25,47,p=>{p.rect(11,5,2,40,'deep');p.rect(3,2,20,15,'white');p.rect(5,4,16,7,'blue');p.rect(6,13,12,2,'navy');p.rect(7,21,12,16,'cream');for(let y=24;y<35;y+=3)p.rect(9,y,8,1,'deep');},12,44);
sprite('fountain',63,44,p=>{p.poly([[3,22],[30,36],[60,21],[32,7]],'mist','ink');p.poly([[7,21],[30,32],[55,20],[32,10]],'blue','shade');p.line(30,26,30,8,'white');p.line(30,8,22,18,'glass');p.line(30,8,40,18,'glass');p.poly([[3,22],[30,36],[30,42],[3,28]],'steel','ink');p.poly([[30,36],[60,21],[60,27],[30,42]],'shade','ink');},30,40);
sprite('broadcast-van',77,57,p=>{p.c.drawImage(SPRITES.bus.canvas,0,13);p.poly([[26,7],[33,2],[47,8],[41,20],[32,18]],'mist','ink');p.line(35,12,52,0,'deep');},36,50);
for(const dir of ['ne','nw','se','sw'])for(let f=0;f<4;f++)paletteCopy('customer-suit-'+dir+'-'+f,'customer-'+dir+'-'+f,{brick:'navy',red:'steel'});
