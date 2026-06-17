import fetch from 'node-fetch';

const SITE_ID = '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7';
const API_KEY = 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg';

async function testPayload(name, body) {
  console.log(`\nTesting payload format: ${name}`);
  console.log(JSON.stringify(body, null, 2));

  try {
    const res = await fetch('https://www.wixapis.com/contacts/v4/contacts', {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'wix-site-id': SITE_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error during fetch:', err);
  }
}

async function run() {
  const email1 = `test-payload-label-a-${Math.floor(Math.random() * 100000)}@example.com`;
  const email2 = `test-payload-label-b-${Math.floor(Math.random() * 100000)}@example.com`;

  // Payload A: labelKeys inside info
  await testPayload('Payload A: labelKeys inside info', {
    info: {
      emails: {
        items: [
          {
            email: email1,
            tag: 'MAIN'
          }
        ]
      },
      labelKeys: ['custom.newsletter']
    }
  });

  // Payload B: labelKeys outside info (at root)
  await testPayload('Payload B: labelKeys at root', {
    info: {
      emails: {
        items: [
          {
            email: email2,
            tag: 'MAIN'
          }
        ]
      }
    },
    labelKeys: ['custom.newsletter']
  });
}

run();
