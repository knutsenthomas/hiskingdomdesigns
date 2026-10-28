import test from 'node:test';
import assert from 'node:assert/strict';

test('server product HTML survives root replacement but never leaks to another product', async () => {
  const originalDocument = globalThis.document;
  try {
    globalThis.document = { querySelector(selector) {
      assert.equal(selector, '#root main[data-server-product-id]');
      return { getAttribute: () => 'poster', outerHTML: '<main><h1>Distinct poster</h1></main>' };
    } };
    const { getInitialProductHtml } = await import('../src/lib/initialProductHtml.js?test=server');
    globalThis.document = { querySelector: () => null };
    assert.match(getInitialProductHtml('poster'), /Distinct poster/);
    assert.equal(getInitialProductHtml('shirt'), '');
  } finally { globalThis.document = originalDocument; }
});
