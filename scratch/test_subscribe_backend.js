import handler from '../api/subscribe-newsletter.js';

// Mock request and response
const req = {
  method: 'POST',
  body: {
    email: 'test-new-email-' + Math.floor(Math.random() * 100000) + '@example.com'
  }
};

const res = {
  headers: {},
  statusCode: 200,
  setHeader(key, val) {
    this.headers[key] = val;
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    console.log(`\n--- Response [Code ${this.statusCode}] ---`);
    console.log(JSON.stringify(data, null, 2));
  }
};

console.log('Running local backend newsletter subscribe test...');
handler(req, res).catch(err => {
  console.error('Unhandled error in handler:', err);
});
