import fetch from 'node-fetch';

const SITE_ID = '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7';
const API_KEY = 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg';

async function queryContactByEmail(email) {
  console.log(`Querying contact for email: ${email}`);
  const url = 'https://www.wixapis.com/contacts/v4/contacts/query';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': API_KEY,
      'wix-site-id': SITE_ID,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: {
        filter: {
          'primaryInfo.email': {
            '$eq': email
          }
        }
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to query contact: ${JSON.stringify(data)}`);
  }
  return data.contacts || [];
}

async function createContact(email, name) {
  console.log(`Creating contact for email: ${email}, name: ${name}`);
  const url = 'https://www.wixapis.com/contacts/v4/contacts';
  
  const firstName = name.split(' ')[0];
  const lastName = name.split(' ').slice(1).join(' ') || 'Gjest';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': API_KEY,
      'wix-site-id': SITE_ID,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contact: {
        info: {
          name: {
            first: firstName,
            last: lastName
          },
          emails: [
            {
              email: email,
              tag: 'MAIN'
            }
          ]
        }
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to create contact: ${JSON.stringify(data)}`);
  }
  return data.contact;
}

async function main() {
  const email = 'knutsenthomas@gmail.com';
  const name = 'Thomas Knutsen';

  try {
    const existing = await queryContactByEmail(email);
    console.log(`Query successful. Found ${existing.length} contacts.`);
    if (existing.length > 0) {
      console.log('Existing contact details:', JSON.stringify(existing[0], null, 2));
      console.log('Existing contact ID:', existing[0].id);
    } else {
      console.log('No contact found. Creating new contact...');
      const created = await createContact(email, name);
      console.log('Created contact details:', JSON.stringify(created, null, 2));
      console.log('Created contact ID:', created.id);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
