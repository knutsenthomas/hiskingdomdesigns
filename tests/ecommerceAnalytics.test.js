import test from 'node:test';
import assert from 'node:assert/strict';
import { paidOrderPayload, trackPaidOrder, flushPurchases } from '../src/lib/ecommerceAnalytics.js';
const order = { _id: 'paid-test', paymentStatus: 'PAID', currency: 'NOK', buyerInfo: { email: 'private@example.test' }, lineItems: [{ catalogReference: {catalogItemId: 'catalog-1'}, quantity: 2, totalPriceBeforeTax: {amount: '200'}, customTextFields: ['private'] }], priceSummary: {tax: {amount:'50'}, shipping: {amount:'30'}} };
test('only paid orders with verified line amounts produce anonymous ecommerce data', () => {
  assert.equal(paidOrderPayload({...order, paymentStatus:'NOT_PAID', status:'APPROVED'}), null);
  assert.equal(paidOrderPayload({...order, lineItems:[{quantity:1}]}), null);
  const payload = paidOrderPayload(order);
  assert.equal(payload.value, 200);
  assert.equal(payload.items[0].price, 100);
  assert.ok(!JSON.stringify(payload).includes('private'));
});
test('consent, delayed consent and transaction deduplication', () => {
 const storage = new Map(); const calls=[];
 const environment={ localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)}, gtag:(...args)=>calls.push(args),location:{origin:'https://example.test',pathname:'/profile',search:'?secret=private'} };
 assert.equal(trackPaidOrder(order,environment),false);
 assert.equal(calls.length,0);
 storage.set('hkd-cookie-consent','all');
 assert.equal(flushPurchases(environment),true);
 assert.equal(trackPaidOrder(order,environment),false);
 assert.equal(calls.length,1);
 assert.equal(calls[0][2].page_location,'https://example.test/profile');
});
test('unavailable storage never breaks checkout',()=>assert.equal(trackPaidOrder({...order,_id:'storage-failure'},{localStorage:{getItem(){throw Error('blocked');}}}),false));

test('cart events allow only catalog fields and reject invalid prices', async () => {
 const {trackCartEvent}=await import('../src/lib/ecommerceAnalytics.js');
 const calls=[]; const environment={localStorage:{getItem:()=> 'all'},gtag:(...args)=>calls.push(args),location:{origin:'https://example.test',pathname:'/cart'}};
 assert.equal(trackCartEvent('add_to_cart',[{id:'product',price:125,quantity:2,customTextFields:['private']}],environment),true);
 assert.equal(calls[0][2].value,250);
 assert.ok(!JSON.stringify(calls).includes('private'));
 assert.equal(trackCartEvent('begin_checkout',[{id:'product',price:'invalid',quantity:2}],environment),false);
 assert.equal(trackCartEvent('purchase',[{id:'product',price:125,quantity:2}],environment),false);
});
