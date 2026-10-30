import test from 'node:test';
import assert from 'node:assert/strict';
import { allOrders, orderPage } from '../lib/wix-order-history.js';
test('loads more than 100 orders, every status lane and no duplicate IDs', async () => {
  const calls=[];
  const result=await allOrders(async search=>{
    calls.push(search);
    if(search.filter.status)return {orders:[{_id:search.filter.status,_createdDate:'2020-01-01'}],metadata:{hasNext:false}};
    const offset=Number(search.cursorPaging.cursor||0);
    return {orders:Array.from({length:offset<200?100:5},(_,i)=>({_id:`id${offset+i}`,_createdDate:'2020-01-01'})),metadata:{hasNext:offset<200,cursors:{next:String(offset+100)}}};
  });
  assert.equal(result.length,207);
  assert.equal(calls.length,5);
});
test('a page failure and invalid pagination never become empty successful history', async () => {
  await assert.rejects(allOrders(async()=>{throw Error('offline')}));
  await assert.rejects(orderPage(async()=>({orders:[],metadata:{hasNext:true}})));
  await assert.rejects(orderPage(async()=>({orders:[],metadata:{hasNext:true,cursors:{next:'same'}}}),{cursor:'same'}));
});
