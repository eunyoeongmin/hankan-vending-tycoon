// Isolated fixture: never ship review.html with the public game.
const {spawn, spawnSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
process.chdir(path.resolve(__dirname, '..'));
const env = {...process.env, SCENE_TEST_URL: 'http://127.0.0.1:8766'};
function run(cmd, args) {
  const result = spawnSync(cmd, args, {env, stdio: 'inherit'});
  if (result.error || result.status !== 0) throw result.error || new Error(`${cmd}: ${result.status}`);
}
(async () => {
  let server;
  try {
    fs.mkdirSync('artifacts/scene-fix', {recursive: true});
    run('python', ['tests/make-scene-review.py']);
    server = spawn('python', ['-m', 'http.server', '8766', '--bind', '127.0.0.1', '--directory', 'dist'], {stdio: 'ignore'});
    await new Promise(resolve => setTimeout(resolve, 800));
    run(process.execPath, ['tests/browser-scene-flow.cjs']);
    run(process.execPath, ['tests/browser-scene-live.cjs']);
  } finally {
    if (server) server.kill();
    fs.rmSync('dist/review.html', {force: true});
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
