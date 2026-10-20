import test from 'node:test';
import assert from 'node:assert/strict';
import {productTaxonomy,selectCategoryProducts} from '../src/lib/catalogSelection.js';
import {createCatalogLoader} from '../server/catalog.js';
const collections=[{_id:'nor',name:'NORSKE produkter',slug:'norske-produkter'},{_id:'eng',name:'ENGLISH products',slug:'english'}];
const raw=[{_id:'nor-p',name:'Bevar hjertet - Tskjorte',collectionIds:['nor'],stock:{inStock:true}},{_id:'eng-p',name:'Prayerless makes weak - Tshirt',collectionIds:['eng']},{_id:'hidden',name:'Hidden',visible:false}];
const client=(items=raw)=>({products:{queryProducts:()=>query(items)},collections:{queryCollections:()=>query(collections)}});
function query(items){return {descending(){return this;},skip(){return this;},limit(){return this;},async find(){return {items};}};}
test('Wix collections drive the same Norwegian category selection as the storefront',async()=>{
 const catalog=await createCatalogLoader(()=>client())();
 const result=selectCategoryProducts(catalog.products,{categorySlug:'norske-produkter',categoryName:'NORSKE produkter',wixCollections:catalog.collections});
 assert.deepEqual(result.map(p=>p.id),['nor-p']);
 assert.deepEqual(productTaxonomy(raw[0],{nor:'NORSKE produkter'}).subcategories,['NORSKE produkter']);
 assert.equal(catalog.products.some(p=>p.id==='hidden'),false);
});
test('SEO clothing pages include raw Wix clothing without a synthetic category field',async()=>{
 const c=await createCatalogLoader(()=>client())();
 assert.equal(selectCategoryProducts(c.products,{categorySlug:'kristne-klaer'}).some(p=>p.id==='nor-p'),true);
});
test('failed or malformed catalog reads reject, rather than pretending there are no products',async()=>{
 await assert.rejects(createCatalogLoader(()=>({products:{queryProducts(){throw Error('upstream');}},collections:client().collections}))(),/upstream/);
 const bad=client();bad.products.queryProducts=()=>query(undefined);
 await assert.rejects(createCatalogLoader(()=>bad)(),/Incomplete/);
});
test('concurrent rendering shares a complete catalog fetch',async()=>{
 let reads=0;const load=createCatalogLoader(()=>{reads++;return client();});
 const [a,b]=await Promise.all([load(),load()]);assert.equal(a,b);assert.equal(reads,1);
});
