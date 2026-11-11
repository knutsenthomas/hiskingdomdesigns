import test from 'node:test';
import assert from 'node:assert/strict';
import { getTranslatedProduct } from '../src/lib/productTranslations.js';
import { productDescriptionsEn } from '../src/lib/productDescriptionsEn.js';

const id = '7d77f8ce-a279-4c62-a1df-a32b565a3b08'; // Herren er nær - kopp
const product = { id, name: 'Herren er nær - kopp', description: '<p>«Herren er nær» (Filipperne 4,5) er et kort, men sterkt løfte.</p>' };

test('Norwegian visitors see the Norwegian Wix description', () => {
  assert.match(getTranslatedProduct(product, 'no').description, /Filipperne 4,5/);
});

test('English visitors see the English description, not Norwegian', () => {
  assert.ok(productDescriptionsEn[id]);
  const en = getTranslatedProduct(product, 'en').description;
  assert.doesNotMatch(en, /Filipperne/);
  assert.match(en, /ceramic mug/i);
});
