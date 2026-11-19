import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
const auth = 'https://da-customer-auth-264218818430.europe-west2.run.app';
const trial = 'https://da-trial-67645337660.europe-west2.run.app';
test('only explicit login routes reach the login service before the DA catchall', () => {
  const paths = ['/da/login', '/da/auth/password', '/da/auth/reset', '/da/auth/session', '/da/auth/logout'];
  const catchall = config.rewrites.findIndex(r => r.source === '/da/:path*');
  assert.ok(catchall >= 0);
  assert.deepEqual(config.rewrites.filter(r => new URL(r.destination, 'https://www.axiomordo.com').origin === auth).map(r => r.source), paths);
  for (const path of paths) {
    const index = config.rewrites.findIndex(r => r.source === path);
    assert.ok(index >= 0 && index < catchall);
    assert.equal(config.rewrites[index].destination, auth + path);
  }
});
test('public builder, workspace and remaining DA routes retain the trial backend', () => {
  for (const path of ['/da', '/da/', '/da/workspace/', '/da/:path*']) {
    assert.equal(config.rewrites.find(r => r.source === path)?.destination, trial + path);
  }
  assert.ok(!config.rewrites.some(r => r.destination.includes('da-premium')));
});
test('account entry redirects to login without replacing the workspace entry', () => {
  for (const path of ['/da/account', '/da/account/', '/da/login/']) {
    const rule = config.redirects.find(r => r.source === path);
    assert.equal(rule?.destination, '/da/login');
    assert.equal(rule?.permanent, false);
  }
  assert.equal(config.redirects.find(r => r.source === '/da/workspace')?.destination, '/da/workspace/');
});
