// Run after make-scene-review.py with the local review server on port 8765.
const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 const p=await b.newPage({viewport:{width:1440,height:1000},recordVideo:{dir:'artifacts/district-identity/video',size:{width:1440,height:1000}}});
 try{
  await p.goto('http://127.0.0.1:8765/review.html');
  for(const map of [1,2]){
   await p.locator('#review-map').selectOption(String(map));
   await p.locator('#review-crowd').click();
   await p.locator('#review-play').click();
   for(let i=1;i<=4;i++){
    await p.waitForTimeout(3000);
    await p.locator('#city-stage').screenshot({path:`artifacts/district-identity/motion-${map}-${i*3}.png`});
   }
   await p.locator('#review-play').click();
  }
 }finally{await p.close();await b.close();}
})().catch(e=>{console.error(e);process.exit(1);});
