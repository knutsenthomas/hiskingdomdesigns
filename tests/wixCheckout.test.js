import test from 'node:test';
import assert from 'node:assert/strict';
import { mapCartItemsToWixLineItems } from '../src/lib/wixCartItems.js';
import { assertCheckoutMatches, createVerifiedCheckout, verifyCheckout } from '../src/lib/wixCheckout.js';

const product = {
  manageVariants: false,
  productOptions: [
    { name: 'Størrelse', choices: [{ value: 'S', description: 'S' }, { value: 'M', description: 'M' }] },
    { name: 'Farge', choices: [{ value: '#1364ac', description: 'blå melange' }] },
  ],
  variants: [{ _id: '00000000-0000-0000-0000-000000000000', choices: {} }],
};
const item = {
  id: 'isaiah', quantity: 1, selectedSize: 'M', selectedColor: 'Blå Melange',
  selectedOptions: { 'Størrelse': 'M', Color: '#1364ac' },
  // This is the old translated metadata already saved in customers' carts.
  productOptions: product.productOptions.map(o => ({ ...o, name: o.name === 'Farge' ? 'Color' : o.name })),
  variants: product.variants, manageVariants: false,
};
const mapItems = (items = [item], canonical = product) => mapCartItemsToWixLineItems(items, async () => canonical);

test('existing translated cart uses original catalog names and choice descriptions', async () => {
  const [line] = await mapItems();
  assert.deepEqual(line.catalogReference.options, { options: { 'Størrelse': 'M', Farge: 'blå melange' } });
  assert.equal(item.selectedOptions.Color, '#1364ac');
});

test('unmanaged products ignore even a stale non-placeholder variant ID', async () => {
  const canonical = { ...product, variants: [{ _id: 'old-variant', choices: {} }] };
  const [line] = await mapItems([{ ...item, variantId: 'old-variant' }], canonical);
  assert.equal(line.catalogReference.options.variantId, undefined);
  assert.equal(line.catalogReference.options.options.Farge, 'blå melange');
});

test('managed products use the selected variant, never substitute the first variant', async () => {
  const managed = { ...product, manageVariants: true, variants: [
    { _id: 'small', choices: { 'Størrelse': 'S', Farge: '#1364ac' } },
    { _id: 'medium', choices: { 'Størrelse': 'M', Farge: '#1364ac' } },
  ] };
  assert.equal((await mapItems([item], managed))[0].catalogReference.options.variantId, 'medium');
  await assert.rejects(mapItems([item], { ...managed, variants: [managed.variants[0]] }), /produktvarianten/);
});

test('canonical lookup failures do not fall back to translated cart metadata', async () => {
  await assert.rejects(mapItems([item], null), /hente produktvalg/);
});

test('a valid checkout ID and zero items is rejected', async () => {
  const lines = await mapItems();
  let request;
  const client = { checkout: { createCheckout: async (args) => { request = args; return { _id: 'empty', lineItems: [] }; } } };
  await assert.rejects(createVerifiedCheckout(client, lines), /mangler varer/);
  assert.deepEqual(request, { lineItems: lines, channelType: 'WEB' });
});

test('verification accepts reordered option keys and grouped identical items', async () => {
  const lines = await mapItems();
  const actual = structuredClone(lines[0]);
  actual.catalogReference.options.options = { Farge: 'blå melange', 'Størrelse': 'M' };
  actual.quantity = 2;
  assertCheckoutMatches({ _id: 'ok', lineItems: [actual] }, [...lines, ...lines]);
});

test('missing items, wrong quantity, wrong options and extra items are rejected', async () => {
  const lines = await mapItems();
  for (const mutate of [
    a => { a[0].quantity = 2; },
    a => { a[0].catalogReference.options.options['Størrelse'] = 'S'; },
    a => { a.push({ ...a[0], catalogReference: { ...a[0].catalogReference, catalogItemId: 'other' } }); },
    a => { a.pop(); },
  ]) {
    const actual = structuredClone(lines);
    mutate(actual);
    assert.throws(() => assertCheckoutMatches({ _id: 'bad', lineItems: actual }, lines), /mangler varer/);
  }
});

test('checkout read-back verifies contents using the same checkout ID', async () => {
  const lines = await mapItems();
  const client = { checkout: { getCheckout: async id => { assert.equal(id, 'created'); return { _id: id, lineItems: lines }; } } };
  assert.equal((await verifyCheckout(client, 'created', lines))._id, 'created');
});

test('custom text is preserved and distinguishes otherwise identical products', async () => {
  const lines = await mapItems([{ ...item, customTextFields: [{ title: 'Navn', value: 'Anna' }] }]);
  assert.equal(lines[0].catalogReference.options.customTextFields.Navn, 'Anna');
  const actual = structuredClone(lines);
  actual[0].catalogReference.options.customTextFields.Navn = 'Eva';
  assert.throws(() => assertCheckoutMatches({ _id: 'wrong', lineItems: actual }, lines), /mangler varer/);
});
