import test from 'node:test';
import assert from 'node:assert/strict';
import { createReviewHandler } from '../api/submit-review.js';
const input = { productId: 'fd72826c-5c5d-67e2-828c-79f3ec3ec87e', name: ' Anonym ', email: 'Person@example.com', title: ' God genser ', body: ' Myk og varm ', rating: 5 };
function response() { return { setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } }; }
const ok = data => ({ ok: true, status: 200, json: async () => data });
test('resolves contact and sends review with server-side identity, without exposing email', async () => {
  const calls = [];
  const handler = createReviewHandler({ apiKey: 'secret', fetchImpl: async (url, options) => {
    const payload = JSON.parse(options.body); calls.push({url, payload});
    return url.endsWith('/query') ? ok({contacts: [{id:'contact-1'}]}) : ok({review:{id:'review-1'}});
  }});
  const res = response(); await handler({method:'POST', body: {...input, contactId:'forged', verified:true}}, res);
  assert.equal(res.code, 201);
  assert.deepEqual(calls[1].payload.review, { namespace:'stores', entityId:input.productId, author:{contactId:'contact-1',authorName:'Anonym'}, content:{title:'God genser',body:'Myk og varm',rating:5} });
  assert.equal(calls[0].payload.query.filter['primaryInfo.email'].$eq, 'person@example.com');
  assert.deepEqual(res.data, {success:true, reviewId:'review-1'});
});
test('creates a contact before review for a new visitor', async () => {
  const calls=[];
  const handler=createReviewHandler({apiKey:'secret',fetchImpl:async(url,options)=>{
    calls.push(JSON.parse(options.body));
    if(url.endsWith('/query')) return ok({contacts:[]});
    if(url.endsWith('/contacts')) return ok({contact:{id:'new-contact'}});
    return ok({review:{id:'review-2'}});
  }});
  const res=response(); await handler({method:'POST',body:input},res);
  assert.equal(res.code,201); assert.equal(calls[2].review.author.contactId,'new-contact');
  assert.equal(calls[1].allowDuplicates,false);
});
test('validation and missing credentials cannot report success', async()=>{
  let called=false;
  const handler=createReviewHandler({apiKey:'',fetchImpl:async()=>{called=true;}});
  for(const [body,code] of [[{...input,rating:0},400],[{...input,body:'x'.repeat(3001)},400],[{...input,email:''},400],[input,503]]){
    const res=response(); await handler({method:'POST',body},res); assert.equal(res.code,code); assert.equal(res.data.success,undefined);
  }
  assert.equal(called,false);
});
test('upstream rejection never produces a success acknowledgement',async()=>{
  const handler=createReviewHandler({apiKey:'secret',fetchImpl:async(url)=>url.endsWith('/query')?ok({contacts:[{id:'contact-1'}]}):({ok:false,status:409,json:async()=>({}),headers:{get:()=>null}})});
  const res=response(); await handler({method:'POST',body:input},res);
  assert.equal(res.code,409); assert.equal(res.data.error,'DUPLICATE_REVIEW');
});
