import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const tick = () => new Promise(resolve => setImmediate(resolve));
const config = {"worker": "../src/lib/serviceWorkerRegistration.js", "prefix": "hk-designs-cache-", "selfStarting": false};
test('offline caching waits for a choice and withdrawal preserves unrelated downloads', async () => {
  let allowed = false, registers = 0, unregisters = 0, reloads = 0;
  const removed = [], window = new EventTarget();
  window.SitePrivacy = { allows: category => category === 'offline' && allowed };
  const own = { scriptURL: 'https://example.test/sw.js' };
  const serviceWorker = {
    controller: null,
    async register() { registers++; this.controller = own; return { addEventListener() {} }; },
    async getRegistrations() { return this.controller ? [{ active: own, unregister: async () => { unregisters++; this.controller = null; } }] : []; }
  };
  window.caches = { keys: async () => [config.prefix + 'test', 'private-downloads'], delete: async key => removed.push(key) };
  const context = { window, document: { readyState: 'complete' }, navigator: { serviceWorker }, location: { origin: 'https://example.test', reload: () => reloads++ }, caches: window.caches, URL, CustomEvent, console };
  const code = fs.readFileSync(new URL(config.worker, import.meta.url), 'utf8').replace('export function registerServiceWorker', 'function registerServiceWorker');
  vm.runInNewContext(code + (config.selfStarting ? '' : '\nregisterServiceWorker();'), context);
  await tick(); assert.equal(registers, 0); removed.length = 0;
  allowed = true; window.dispatchEvent(new Event('siteprivacychange')); await tick(); assert.equal(registers, 1);
  allowed = false; window.dispatchEvent(new Event('siteprivacychange')); await tick();
  assert.equal(unregisters, 1); assert.equal(reloads, 1); assert.deepEqual(removed, [config.prefix + 'test']);
});
