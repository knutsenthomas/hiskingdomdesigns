import handler from '../api/get-or-create-conversation.js';

async function testEndpoint() {
  console.log('Testing api/get-or-create-conversation handler...');
  
  // Set up process env just in case
  process.env.WIX_SITE_ID = '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7';
  process.env.WIX_API_KEY = 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg';

  const mockReq = {
    method: 'POST',
    body: {
      email: 'knutsenthomas@gmail.com',
      name: 'Thomas Knutsen'
    },
    headers: {}
  };

  let statusCode = 200;
  let jsonResponse = null;

  const mockRes = {
    setHeader(name, val) {
      // console.log(`[Header] ${name}: ${val}`);
    },
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    }
  };

  try {
    await handler(mockReq, mockRes);
    console.log(`Endpoint returned status code: ${statusCode}`);
    console.log('JSON response:', JSON.stringify(jsonResponse, null, 2));
  } catch (err) {
    console.error('Handler execution error:', err);
  }
}

testEndpoint();
