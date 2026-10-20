// Read-only audit: render every canonical sitemap URL against the current Wix catalog.
import {loadCatalog} from '../server/catalog.js';
import {createRenderHandler} from '../api/render.js';
import {createSitemapHandler} from '../api/sitemap.js';
const catalog=await loadCatalog();
const output=()=>({headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},writeHead(n,h){this.code=n;this.headers={...this.headers,...h}},send(body){this.body=body},end(){}});
const sitemap=output();await createSitemapHandler(async()=>catalog)({method:'GET'},sitemap);
if(sitemap.code!==200)throw Error('Sitemap generation failed');
const paths=[...sitemap.body.matchAll(/<loc>https:\/\/hiskingdomdesigns.no(.*?)<\/loc>/g)].map(m=>m[1]);
const render=createRenderHandler({catalogLoader:async()=>catalog});
const failures=[];
if(new Set(paths).size!==paths.length)failures.push({reason:'Duplicate sitemap URLs'});
for(const url of paths){
 const result=output();await render({url,headers:{host:'hiskingdomdesigns.no','user-agent':'Googlebot'}},result);
 if(result.code!==200){failures.push({url,status:result.code,location:result.headers.Location});continue;}
 if(!result.body.includes(`rel="canonical" href="https://hiskingdomdesigns.no${url}"`))failures.push({url,reason:'Wrong canonical'});
 for(const m of result.body.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)){
  try{JSON.parse(m[1]);}catch(e){failures.push({url,reason:'Invalid JSON-LD',message:e.message});}
 }
 if(url.startsWith('/produkt/')){
  const data=JSON.parse(result.body.match(/id="jsonld-product-schema"[^>]*>([\s\S]*?)<\/script>/)[1]);
  const product=catalog.products.find(p=>p.id===url.split('/').pop());
  if(data.offers.url!=='https://hiskingdomdesigns.no'+url || data.name!==product?.name)failures.push({url,reason:'Mixed product identity'});
 }
}
console.log(JSON.stringify({urls:paths.length,products:catalog.products.length,collections:catalog.collections.length,failures},null,2));
if(failures.length)process.exitCode=1;
