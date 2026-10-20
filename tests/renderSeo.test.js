import test from 'node:test';
import assert from 'node:assert/strict';
import {createRenderHandler} from '../api/render.js';
const collection={_id:'nor',name:'NORSKE produkter',slug:'norske-produkter'};
const catalog={collections:[collection],products:[{id:'poster',_id:'poster',slug:'a-poster',name:'A "poster"',description:'A distinct poster description',price:{price:100},stock:{inStock:true},category:'Plakater',subcategories:['NORSKE produkter']},{id:'shirt',slug:'a-shirt',name:'Other shirt',price:{price:300},category:'Klær',subcategories:['ENGLISH products']}]};
async function render(url,loader=async()=>catalog,agent='Googlebot'){
 const response={headers:{},statusCode:0,setHeader(k,v){this.headers[k]=v;},writeHead(code,headers){this.statusCode=code;Object.assign(this.headers,headers);},status(code){this.statusCode=code;return this;},send(body){this.body=body;},end(){}};
 await createRenderHandler({catalogLoader:loader,htmlLoader:()=>'<html><head><title>Fallback</title><link rel="canonical" href="https://hiskingdomdesigns.no/"></head><body><div id="root"></div></body></html>'})({url,headers:{'host':'hiskingdomdesigns.no','user-agent':agent}},response);
 return response;
}
test('server category HTML contains only its actual Wix collection',async()=>{
 const r=await render('/category/norske-produkter');assert.equal(r.statusCode,200);assert.match(r.body,/A &quot;poster&quot;/);assert.ok(!r.body.includes('Other shirt'));
});
test('different product pages retain separate titles, schemas, canonical URLs and headings',async()=>{
 const p=await render('/produkt/poster'),s=await render('/produkt/shirt');
 assert.equal(p.statusCode,200);assert.match(p.body,/<h1[^>]*>A &quot;poster&quot;<\/h1>/);
 assert.match(p.body,/rel="canonical" href="https:\/\/hiskingdomdesigns.no\/produkt\/poster"/);
 assert.match(s.body,/rel="canonical" href="https:\/\/hiskingdomdesigns.no\/produkt\/shirt"/);
 assert.equal(p.headers['Vercel-CDN-Cache-Control'],'no-store');
 assert.equal(p.headers.Vary,'User-Agent');
 const data=JSON.parse(p.body.match(/id="jsonld-product-schema"[^>]*>([\s\S]*?)<\/script>/)[1]);
 assert.equal(data.name,'A "poster"');assert.equal(data.offers.price,100);
});
test('slugs redirect to the actual matching product, never another product',async()=>{
 const r=await render('/produkt/a-poster');assert.equal(r.statusCode,301);assert.equal(r.headers.Location,'https://hiskingdomdesigns.no/produkt/poster');
});
test('unknown categories and removed or demo products return genuine noindex 404s',async()=>{
 for(const url of ['/category/nonexistent','/produkt/prod-1','/produkt/missing']){const r=await render(url);assert.equal(r.statusCode,404);assert.match(r.body,/noindex/);}
});
test('upstream errors return retryable 503, never a generic successful product page',async()=>{
 const r=await render('/produkt/poster',async()=>{throw Error('temporary upstream outage');});assert.equal(r.statusCode,503);assert.equal(r.headers['Retry-After'],'300');assert.equal(r.headers['Cache-Control'],'no-store, no-cache, must-revalidate');
});

test('Google inspection and Googlebot both receive actual product content; private routes are noindex',async()=>{
 const inspection=await render('/produkt/poster',async()=>catalog,'Google-InspectionTool/1.0');
 assert.match(inspection.body,/<h1[^>]*>A &quot;poster&quot;<\/h1>/);
 assert.match(inspection.body,/A distinct poster description/);
 for(const path of ['/handlekurv','/kasse','/profil']){const r=await render(path);assert.equal(r.statusCode,200);assert.match(r.body,/name="robots" content="noindex, follow"/);}
});
