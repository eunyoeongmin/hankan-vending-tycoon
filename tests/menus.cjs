const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(require('node:path').join(__dirname,'../dist/index.html'),'utf8'),errors=[];
function setup(raw){const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));return new JSDOM(html,{runScripts:'dangerously',url:'https://hankan.test',virtualConsole:vc,beforeParse(w){w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};if(raw)w.localStorage.setItem('hankan-tycoon-v1',raw);}});}
const d=setup(),doc=d.window.document,ev=s=>d.window.eval(s);
assert.equal(doc.querySelector('#game-menu-close'),null);
assert.ok(doc.querySelector('#menu-new'));assert.ok(doc.querySelector('[data-entry-language="ja"]'));
doc.querySelector('#menu-settings').click();doc.querySelector('#settings-close').click();assert.equal(ev('modalView'),'menu');
ev('profile.tutorialSeen=true');doc.querySelector('#menu-new').click();assert.ok(doc.querySelector('#scenario-setup'));doc.querySelector('#launch-new').click();
ev('advanceBusiness(1000);livePaused=true');const elapsed=ev('state.live.elapsed');doc.querySelector('#game-menu').click();assert.equal(ev('modalView'),'pause');assert.equal(doc.querySelector('#menu-new'),null);assert.equal(doc.querySelector('#scenario-setup'),null);
doc.querySelector('#pause-help').click();doc.querySelector('#menu-back').click();assert.equal(ev('modalView'),'pause');
doc.querySelector('#game-menu-close').click();assert.equal(ev('livePaused'),true);assert.equal(ev('state.live.elapsed'),elapsed);
doc.querySelector('#game-menu').click();doc.querySelector('#pause-save').click();const raw=d.window.localStorage.getItem('hankan-tycoon-v1');assert.ok(raw);
doc.querySelector('#pause-title').click();assert.equal(ev('modalView'),'menu');assert.equal(doc.querySelector('#game-menu-close'),null);
doc.querySelector('#menu-settings').click();doc.querySelector('#settings-close').click();assert.equal(ev('modalView'),'menu','saved state does not imply gameplay entry');
doc.querySelector('#menu-load').click();assert.equal(ev('inGameSession'),true);assert.equal(ev('state.live.elapsed'),elapsed);
const reload=setup(raw);assert.equal(reload.window.eval('inGameSession'),false);assert.equal(reload.window.document.querySelector('#game-menu-close'),null);assert.equal(reload.window.eval('modalView'),'menu');reload.window.close();
for(const lang of ['ko','ja']){ev(`changeLanguage('${lang}');enterpriseTab='rivalry';renderEnterprise();renderRivalPanel()`);const text=doc.querySelector('#enterprise').textContent+doc.querySelector('#rival-panel').textContent;assert.ok(!/비공개|非公開|공통 고객 시장:|共通顧客市場：/.test(text));}
assert.deepEqual(errors,[]);d.window.close();console.log('PASS: distinct title/pause menus, no title close even with save, help/settings return paths, saved progress, and removed development notices in KO/JA.');
