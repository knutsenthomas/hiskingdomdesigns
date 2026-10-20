import test from 'node:test';
import assert from 'node:assert/strict';
import {createSitemapHandler} from '../api/sitemap.js';
async function render(loader){const res={headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this;},send(body){this.body=body;}};await createSitemapHandler(loader)({method:'GET'},res);return res;}
test('sitemap includes custom collections and one canonical URL per visible product',async()=>{
 const r=await render(async()=>({products:[{_id:'poster',visible:true},{_id:'hidden',visible:false}],collections:[{slug:'norske-produkter',visible:true},{slug:'Plakater',visible:true}]}));
 assert.equal(r.code,200);assert.match(r.body,/\/category\/norske-produkter/);assert.match(r.body,/\/produkt\/poster/);assert.ok(!r.body.includes('/produkt/hidden'));
 const urls=[...r.body.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);assert.equal(new Set(urls).size,urls.length);
});
test('catalog failure never publishes an incomplete sitemap as successful',async()=>{
 const r=await render(async()=>{throw Error('upstream');});assert.equal(r.code,503);assert.equal(r.headers['Cache-Control'],'no-store');assert.equal(r.headers['Retry-After'],'300');
});
