// Production-server smoke checks. This does not replace authenticated browser E2E.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const base = 'http://127.0.0.1:3112';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3112'], { stdio: ['ignore', 'pipe', 'pipe'] });
let started = false;
const timeout = setTimeout(() => { console.error('FAIL: server or checks timed out'); process.exitCode = 1; server.kill(); }, 45000);
server.stderr.on('data', chunk => process.stderr.write(chunk));
server.stdout.on('data', async chunk => {
  if (started || !chunk.toString().includes('Ready')) return;
  started = true;
  try {
    for (const [path, next] of [['/', '/welcome'], ['/welcome', '/login'], ['/login', null]]) {
      const response = await fetch(base + path, { redirect: 'manual' });
      assert.equal(response.status, 200, path);
      const html = await response.text();
      assert.ok(html.includes('n-astro-logo.png'), `${path}: approved logo`);
      assert.ok(html.includes('lang="si"'), `${path}: Sinhala document`);
      if (next) assert.ok(html.includes(`href="${next}"`), `${path}: next step`);
      if (path === '/login') {
        assert.ok(html.includes('value="PERSONAL"'));
        assert.ok(html.includes('value="PROFESSIONAL"'));
      }
      console.log(`PASS ${path}: response, logo, language, next step`);
    }
    for (const path of ['/dashboard', '/chart/new', '/settings', '/profile', '/my-chart', '/predictions', '/forecast', '/admin']) {
      const response = await fetch(base + path, { redirect: 'manual' });
      assert.equal(response.status, 307, path);
      const location = new URL(response.headers.get('location'), base);
      assert.equal(location.pathname, '/login');
      assert.equal(location.searchParams.get('next'), path);
      console.log(`PASS ${path}: unauthenticated redirect preserves destination`);
    }
    const errorResponse = await fetch(base + '/login?error=oauth_failed&next=%2Fchart%2Fnew');
    const errorHtml = await errorResponse.text();
    assert.ok(errorHtml.includes('role="alert"'));
    assert.ok(errorHtml.includes('name="next" value="/chart/new"'));
    console.log('PASS login error and next-path form state');
    const unsafeHtml = await (await fetch(base + '/login?next=https%3A%2F%2Fexample.com')).text();
    assert.ok(unsafeHtml.includes('name="next" value="/dashboard"'));
    console.log('PASS external next-path rejected');
    const logo = await fetch(base + '/n-astro-logo.png');
    assert.equal(logo.status, 200);
    assert.equal(logo.headers.get('content-type'), 'image/png');
    console.log('PASS logo asset');
  } catch (error) {
    console.error('FAIL', error.message);
    process.exitCode = 1;
  } finally {
    clearTimeout(timeout);
    server.kill();
  }
});
server.on('exit', () => { clearTimeout(timeout); if (!started) process.exitCode = 1; });
