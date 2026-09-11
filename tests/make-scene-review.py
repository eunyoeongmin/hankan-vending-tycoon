from pathlib import Path
import sys
out=Path('dist/review.html')
html=Path('dist/index.html').read_text(encoding='utf-8')
fixture=r'''<style>#review-tools{position:fixed;z-index:999999;bottom:0;left:0;right:0;background:#ffffcc;padding:3px;display:flex;gap:5px;align-items:center;font:12px sans-serif}#review-tools button{font:12px sans-serif;padding:2px 7px}#review-info{margin:0;font-size:11px}</style><div id="review-tools"><b>검사용 장면</b><button id="review-step">0.5초 진행</button><button id="review-play">재생/정지</button><button id="review-crowd">집중 판매 300건</button><button id="review-clear">보행만</button><select id="review-map"><option value="0">주택가</option><option value="1">오피스</option><option value="2">역</option><option value="3">관광지</option><option value="4">항만</option></select><pre id="review-info"></pre></div><script>
launchNew();menuOpen=false;closeModal();registerExpansionCity();setDesktopWindow('closed');livePaused=true;sceneMotion=true;state.day=183;state.weather=0;startBusiness();let reviewTime=0,reviewRun=false,reviewRows=[];
sceneCustomerRows=()=>reviewRows;sceneCustomerDue=(r,i)=>1000+i;state.live.elapsed=1350;businessCarry=0;
function reviewPaint(){ambientClock=reviewTime;paintScene(reviewTime);const ss=pixelCity.snapshot();document.getElementById('review-info').textContent=JSON.stringify({people:ss.actors.filter(a=>a.kind==='customer').length,workers:ss.actors.filter(a=>a.kind==='worker').length,sales:ss.sales.length,visual:ss.motion?.stats});}
document.getElementById('review-step').onclick=()=>{reviewTime+=500;reviewPaint();};document.getElementById('review-play').onclick=()=>{reviewRun=!reviewRun;};document.getElementById('review-crowd').onclick=()=>{reviewRows=[{loc:selectedMap*6,n:300,bought:Array.from({length:300},(_,i)=>({i,price:1500}))}];reviewPaint();};document.getElementById('review-clear').onclick=()=>{reviewRows=[];reviewPaint();};document.getElementById('review-map').onchange=e=>{selectedMap=+e.target.value;selected=selectedMap*6;render();reviewPaint();};setInterval(()=>{if(reviewRun){reviewTime+=50;reviewPaint();}},50);render();reviewPaint();
</script>'''
out.write_text(html+fixture,encoding='utf-8')
print(out)
