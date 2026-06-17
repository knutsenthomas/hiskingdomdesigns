import handler from '../api/products-feed.js';

class MockResponse {
  constructor() {
    this.headers = {};
    this.statusCode = 200;
    this.body = '';
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  send(body) {
    this.body = body;
    return this;
  }
}

async function runTest() {
  const req = { method: 'GET' };
  const res = new MockResponse();

  console.log('Running local test of products-feed handler...');
  await handler(req, res);

  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  console.log('XML length:', res.body?.length);
  
  if (res.body) {
    const lines = res.body.split('\n');
    console.log('\n--- First 30 lines of XML ---');
    console.log(lines.slice(0, 30).join('\n'));
    console.log('\n--- Last 5 lines of XML ---');
    console.log(lines.slice(-5).join('\n'));
  }
}

runTest().catch(console.error);
