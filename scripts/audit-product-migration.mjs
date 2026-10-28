import assert from 'node:assert/strict';
import { loadCatalog } from '../server/catalog.js';
import { createRenderHandler } from '../api/render.js';
import { escapeHtml } from '../src/lib/productSeo.js';

const catalog = await loadCatalog();
const handler = createRenderHandler({ catalogLoader: async () => catalog });
const render = async (url, agent) => {
  const res = {headers:{},setHeader(k,v){this.headers[k]=v;},writeHead(code,headers){this.statusCode=code;Object.assign(this.headers,headers);},status(code){this.statusCode=code;return this;},send(body){this.body=body;},end(){}};
  await handler({url,headers:{'user-agent':agent}},res);
  return res;
};
let checked=0;
for(const product of catalog.products) {
  const url=`https://hiskingdomdesigns.no/produkt/${product.id}`;
  const responses=[];
  for(const agent of ['Mozilla/5.0','Googlebot']) {
    const res=await render(`/produkt/${product.id}`,agent);
    assert.equal(res.statusCode,200,url);
    assert.ok(res.body.includes(`<link rel="canonical" href="${url}"`),url);
    assert.ok(res.body.includes(`>${escapeHtml(product.name)}</h1>`),url);
    assert.equal((res.body.match(/<h1\b/g)||[]).length,1,url);
    const schema=JSON.parse(res.body.match(/id="jsonld-product-schema"[^>]*>([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema.name,product.name,url);
    assert.equal(schema.offers.url,url,url);
    responses.push(res.body.match(/<main\b[\s\S]*?<\/main>/)[0]);
  }
  assert.equal(responses[0],responses[1],`Crawler/browser mismatch: ${url}`);
  if(product.slug && product.slug!==product.id) {
    const redirect=await render(`/produkt/${product.slug}`,'Mozilla/5.0');
    assert.equal(redirect.statusCode,301);
    assert.equal(redirect.headers.Location,url);
  }
  checked++;
}
console.log(JSON.stringify({checkedProducts:checked,checks:['browser/crawler product body parity','unique matching heading','self canonical','matching product schema','slug redirects']},null,2));
