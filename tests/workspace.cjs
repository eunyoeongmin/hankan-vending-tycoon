const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const d=new JSDOM(fs.readFileSync(require('node:path').join(__dirname,'../dist/index.html'),'utf8'),{runScripts:'dangerously',url:'https://hankan.test',virtualConsole:vc,beforeParse(w){w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};}}),doc=d.window.document,ev=s=>d.window.eval(s);
assert.equal(doc.querySelector('#game-menu-close'),null);assert.ok(doc.querySelector('#scenario-setup')===null);
ev('state=fresh();state.started=true;menuOpen=false;closeModal();startBusiness();livePaused=true');
const map=doc.querySelector('.map-wrap'),price=doc.querySelector('[data-enterprise="price"]');
for(const tab of ['manage','fleet','supply','finance','staff','research','market','rivalry','alerts','journal']){doc.querySelector(`#desk-nav [data-desk="${tab}"]`).click();assert.equal(ev('deskTab'),tab);assert.equal(doc.querySelector('.map-wrap'),map);assert.ok(doc.querySelector('#desk-content').children.length>5);assert.ok([...doc.querySelector('#desk-content').children].some(n=>!n.hidden));}
doc.querySelector('[data-select="0"]').click();assert.equal(ev('deskTab'),'manage');assert.equal(doc.querySelector('[data-enterprise="price"]'),price);
price.focus();ev('refreshLiveNumbers()');assert.equal(doc.activeElement,price);assert.equal(doc.querySelector('[data-enterprise="price"]'),price);
doc.querySelector('#desk-nav [data-desk="finance"]').click();assert.equal(ev('enterpriseTab'),'reports');assert.equal(doc.querySelector('#bank-panel').hidden,false);
doc.querySelector('#desk-nav [data-desk="research"]').click();assert.equal(doc.querySelector('#hq').hidden,false);
doc.querySelector('#desk-nav [data-desk="staff"]').click();assert.equal(doc.querySelector('#operations').hidden,false);
ev('changeLanguage("ja")');assert.ok(!/[가-힣]/.test(doc.querySelector('#desk-nav').textContent));
doc.querySelector('#game-menu').click();assert.equal(ev('modalView'),'pause');doc.querySelector('#game-menu-close').click();assert.equal(ev('livePaused'),true);
assert.deepEqual(errors,[]);d.window.close();console.log('PASS: single management surface, all tabs reachable, persistent map/control identity, map-to-management routing, language and pause menus.');
