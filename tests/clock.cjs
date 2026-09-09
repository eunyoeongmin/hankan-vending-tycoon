// Requires jsdom: NODE_PATH=<directory containing jsdom> node tests/clock.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync(require('node:path').join(__dirname, '../dist/index.html'), 'utf8');
const errors = [];
function setup(raw) {
  let now = 0, seq = 0;
  const frames = new Map();
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM(html, {runScripts: 'dangerously', url: 'https://hankan.test', virtualConsole: vc,
    beforeParse(w) {
      w.requestAnimationFrame = fn => { frames.set(++seq, fn); return seq; };
      w.HTMLDialogElement.prototype.showModal = function() { this.open = true; };
      w.HTMLDialogElement.prototype.close = function() { this.open = false; };
      Object.defineProperty(w.document, 'hidden', {value: false, writable: true});
      w.Math.random = () => .5;
      if (raw) w.localStorage.setItem('hankan-tycoon-v1', raw);
    }});
  const ev = code => dom.window.eval(code);
  const frame = (ms = 100) => { now += ms; const batch = [...frames.values()]; frames.clear(); batch.forEach(fn => fn(now)); };
  const run = ms => { for (let n = 0; n < ms; n += 100) frame(Math.min(100, ms - n)); };
  return {dom, ev, frame, run, frames};
}
const {dom, ev, frame, run, frames} = setup();
const doc = dom.window.document;
assert.equal(doc.querySelector('#scene-skip'), null);
assert.equal(doc.querySelector('#next'), null);
assert.equal(ev('typeof skipBusiness'), 'undefined');
assert.equal(ev('typeof nextDay'), 'undefined');
ev('initScene();initScene()');
assert.equal(frames.size, 1, 'only one animation loop');
ev('state=fresh();state.started=true;menuOpen=false;closeModal();startBusiness();');
// Keep real state transitions and economic actions; omit expensive repaints/storage for simulated minutes.
ev('window.realSave=save;render=()=>{};refreshLiveNumbers=()=>{};paintScene=()=>{};syncScene=()=>{};save=()=>{};');
frame(); run(30000);
assert.equal(ev('state.day'), 1);
assert.ok(Math.abs(ev('state.live.elapsed') - 4000) < 21, '30 seconds at 1x = one sixth day');
let elapsed = ev('state.live.elapsed');
doc.querySelector('#scene-pause').click(); frame(); run(60000);
assert.equal(ev('state.live.elapsed'), elapsed);
doc.querySelector('#scene-pause').click(); frame();
doc.querySelector('#game-menu').click(); frame(); run(60000);
assert.equal(ev('state.live.elapsed'), elapsed, 'menu cannot skip a day');
doc.querySelector('#game-menu-close').click(); frame();
dom.window.document.hidden = true;
dom.window.document.dispatchEvent(new dom.window.Event('visibilitychange'));
run(60000);
assert.equal(ev('state.live.elapsed'), elapsed);
dom.window.document.hidden = false;
dom.window.document.dispatchEvent(new dom.window.Event('visibilitychange'));
frame(600000);
assert.equal(ev('state.live.elapsed'), elapsed, 'no background catch-up');
run(150200);
assert.equal(ev('state.day'), 2);
assert.equal(ev('state.history.length'), 1, 'one settlement per day');
const cash = ev('state.cash');
ev('finishBusiness();finishBusiness()');
assert.equal(ev('state.cash'), cash, 'repeated settlement cannot charge next day');
for (const speed of [.5, 2, 4]) {
  const select = doc.querySelector('#scene-speed');
  select.value = String(speed); select.dispatchEvent(new dom.window.Event('change'));
  frame(); elapsed = ev('state.live.elapsed'); run(15000);
  assert.ok(Math.abs(ev('state.live.elapsed') - elapsed - 2000 * speed) < 21, `speed ${speed}`);
}
ev('realSave()');
const saved = JSON.parse(dom.window.localStorage.getItem('hankan-tycoon-v1'));
const reload = setup(JSON.stringify(saved));
assert.equal(reload.ev('state.live.elapsed'), saved.live.elapsed);
assert.equal(reload.ev('state.cash'), saved.cash);
assert.equal(reload.ev('totalVault()'), ev('totalVault()'));
reload.run(60000);
assert.equal(reload.ev('state.live.elapsed'), saved.live.elapsed, 'reload waits in menu');
assert.deepEqual(errors, []);
dom.window.close(); reload.dom.window.close();
console.log('PASS: 3-minute days, 0.5/2/4x, pause/menu/background, single loop/settlement, removed manual advance, save continuity.');
