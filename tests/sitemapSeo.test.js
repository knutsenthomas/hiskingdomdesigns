import test from 'node:test';
import assert from 'node:assert/strict';
import {createSitemapHandler, productLastmod, SEO_CONTENT_DATE} from '../api/sitemap.js';
async function render(loader){const res={headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this;},send(body){this.body=body;}};await createSitemapHandler(loader)({method:'GET'},res);return res;}
test('sitemap includes custom collections and one canonical URL per visible product',async()=>{
 const r=await render(async()=>({products:[{_id:'poster',visible:true},{_id:'hidden',visible:false}],collections:[{slug:'norske-produkter',visible:true},{slug:'Plakater',visible:true}]}));
 assert.equal(r.code,200);assert.match(r.body,/\/category\/norske-produkter/);assert.match(r.body,/\/produkt\/poster/);assert.ok(!r.body.includes('/produkt/hidden'));
 const urls=[...r.body.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);assert.equal(new Set(urls).size,urls.length);
});
test('catalog failure never publishes an incomplete sitemap as successful',async()=>{
 const r=await render(async()=>{throw Error('upstream');});assert.equal(r.code,503);assert.equal(r.headers['Cache-Control'],'no-store');assert.equal(r.headers['Retry-After'],'300');
});
test('every URL carries a lastmod no older than the last site-wide content change',async()=>{
 const r=await render(async()=>({products:[{_id:'old',visible:true,lastUpdated:'2025-01-05T10:00:00Z'},{_id:'new',visible:true,lastUpdated:'2026-11-03T08:00:00Z'},{_id:'none',visible:true}],collections:[]}));
 const urls=[...r.body.matchAll(/<url>[\s\S]*?<\/url>/g)].map(m=>m[0]);
 assert.ok(urls.length>0);for(const u of urls)assert.match(u,/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
 assert.match(r.body,new RegExp(`/produkt/old</loc>[\\s\\S]*?<lastmod>${SEO_CONTENT_DATE}</lastmod>`));
 assert.match(r.body,/\/produkt\/new<\/loc>[\s\S]*?<lastmod>2026-11-03<\/lastmod>/);
 assert.equal(productLastmod({lastUpdated:'not a date'}),SEO_CONTENT_DATE);
});
