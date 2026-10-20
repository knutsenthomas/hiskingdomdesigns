import test from 'node:test';
import assert from 'node:assert/strict';
import {buildProductSchema,jsonForHtml,escapeHtml} from '../src/lib/productSeo.js';
test('product identity, price and stock stay consistent without invented shipping or ratings',()=>{
 const product={_id:'poster',name:'A "poster"',price:{price:200,discountedPrice:150,currency:'NOK'},stock:{inStock:true}};
 const server=buildProductSchema(product),client=buildProductSchema({...product,price:150},{price:150});
 assert.deepEqual(server.offers,client.offers);
 assert.equal(server.offers.url,'https://hiskingdomdesigns.no/produkt/poster');
 assert.equal(server.offers.availability,'https://schema.org/InStock');
 assert.equal(server.offers.shippingDetails,undefined);assert.equal(server.aggregateRating,undefined);
 assert.equal(buildProductSchema({...product,stock:undefined}).offers.availability,undefined);
});
test('catalog text cannot break HTML attributes or JSON script boundaries',()=>{
 assert.equal(escapeHtml('A "B" & <C>'),'A &quot;B&quot; &amp; &lt;C&gt;');
 assert.ok(!jsonForHtml({name:'</script><title>wrong</title>'}).includes('</script>'));
});
