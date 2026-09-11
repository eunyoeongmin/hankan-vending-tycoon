const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 const p=await b.newPage({viewport:{width:1440,height:1000}});
 try{
  await p.goto((process.env.SCENE_TEST_URL||'http://127.0.0.1:8765')+'/review.html');
  fs.mkdirSync('artifacts/district-identity',{recursive:true});
  const results=[];
  for(const map of [1,2]){
   await p.locator('#review-map').selectOption(String(map));
   const result=await p.evaluate(map=>{
    const sizes=map===1?[[60,38],[74,48],[62,43],[77,47],[74,40],[99,58]]:[[96,47],[75,43],[76,50],[67,45],[0,0],[0,0]];
    const buildings=pixelCity.lots.map(([x,y],i)=>({x,y,w:sizes[i][0]/24,d:sizes[i][1]/24}));
    let intersections=0,trainJumps=0,prior=[];
    const before=JSON.stringify(state);
    for(let tick=0;tick<900;tick++){
     reviewTime+=100;reviewPaint();
     const s=pixelCity.snapshot();
     for(const a of s.motion.agents){const [x,y]=pixelCity.fromScreen(...a.p);for(const r of buildings)if(r.w&&x>r.x-r.w+.1&&x<r.x-.1&&y>r.y-r.d+.1&&y<r.y-.1)intersections++;}
     const trains=s.actors.filter(a=>a.kind==='train');
     trains.forEach((a,i)=>{if(prior[i]&&Math.abs(a.x-prior[i].x)>10&&((a.x>-50&&a.x<754)||(prior[i].x>-50&&prior[i].x<754)))trainJumps++;});prior=trains;
    }
    return {map,intersections,trainJumps,unchanged:before===JSON.stringify(state)};
   },map);
   assert.equal(result.intersections,0,'pedestrian feet cannot cut through primary buildings');
   assert.equal(result.trainJumps,0,'train does not reset while visible');
   assert.ok(result.unchanged);results.push(result);
   for(const [label,day]of [['day',183],['night',183],['winter',1]]){
    await p.evaluate(({day,night})=>{state.day=day;state.live.elapsed=night?DAY_MS*.9:100;render();reviewPaint();},{day,night:label==='night'});
    await p.locator('#city-stage').screenshot({path:`artifacts/district-identity/${map}-${label}.png`});
   }
  }
  console.log('PASS district identity',results);
  fs.writeFileSync('artifacts/district-identity/results.json',JSON.stringify(results,null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1);});
