import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalCategoryPath, canonicalProductPath } from '../src/lib/seoCanonical.js';

test('known category aliases converge while distinct collections stay intact', () => {
  assert.equal(canonicalCategoryPath('/category/t-skjorter'), '/category/kristne-t-skjorter');
  assert.equal(canonicalCategoryPath('/category/kl%C3%A6r'), '/category/kristne-klaer');
  assert.equal(canonicalCategoryPath('/category/christmas'), '/category/christmas');
});

test('checkout, callbacks, API proxies and cart paths are never canonicalized', () => {
  for (const path of ['/kasse', '/handlekurv', '/checkout', '/checkout/thank-you', '/_api/checkout', '/__ecom/checkout', '/api/render']) {
    assert.equal(canonicalCategoryPath(path), path);
  }
});

test('product names resolve to the same ID path used by the sitemap', () => {
  assert.equal(canonicalProductPath({ id: 'catalog-id', slug: 'prayer-journal' }), '/produkt/catalog-id');
  assert.equal(canonicalProductPath({ _id: 'wix-id', id: 'other-id' }), '/produkt/wix-id');
});
