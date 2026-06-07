import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { conversations } from '@wix/inbox';
import { members } from '@wix/members';
import { headlessSite } from '@wix/headless-site';

const wixClient = createClient({
  host: headlessSite.host(),
  modules: {
    inboxConversations: conversations,
    members,
  },
  auth: ApiKeyStrategy({
    siteId: process.env.WIX_SITE_ID || '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7',
    apiKey: process.env.WIX_API_KEY || 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg'
  })
});

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    return;
  }

  try {
    const { memberId, contactId, email, name, anonymousVisitorId } = req.body;
    
    let participantId = {};
    
    if (contactId) {
      participantId = { contactId };
    } else if (memberId) {
      try {
        console.log('Backend fetching member details to retrieve contactId for memberId:', memberId);
        const memberRes = await wixClient.members.getMember(memberId);
        const cId = memberRes.member?.contactId || memberRes.member?.contact?._id;
        if (cId) {
          participantId = { contactId: cId };
          console.log('Resolved contactId via backend lookup:', cId);
        } else {
          participantId = { memberId };
        }
      } catch (mErr) {
        console.warn('Failed to fetch member details on backend, falling back to memberId:', mErr);
        participantId = { memberId };
      }
    } else if (email && name) {
      console.log('Backend querying/creating CRM contact for:', email, name);
      try {
        const apiKey = process.env.WIX_API_KEY || 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg';
        const siteId = process.env.WIX_SITE_ID || '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7';
        
        // 1. Query contact by email
        const queryRes = await fetch('https://www.wixapis.com/contacts/v4/contacts/query', {
          method: 'POST',
          headers: {
            'Authorization': apiKey,
            'wix-site-id': siteId,
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

        const queryData = await queryRes.json();
        let resolvedContactId = null;

        if (queryRes.ok && queryData.contacts && queryData.contacts.length > 0) {
          resolvedContactId = queryData.contacts[0].id;
          console.log('Backend found existing CRM contact ID:', resolvedContactId);
        } else {
          // 2. Create contact if not found
          console.log('Backend contact not found, creating new CRM contact...');
          const firstName = name.split(' ')[0];
          const lastName = name.split(' ').slice(1).join(' ') || 'Gjest';

          const createRes = await fetch('https://www.wixapis.com/contacts/v4/contacts', {
            method: 'POST',
            headers: {
              'Authorization': apiKey,
              'wix-site-id': siteId,
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

          const createData = await createRes.json();
          if (createRes.ok && createData.contact) {
            resolvedContactId = createData.contact.id;
            console.log('Backend successfully created new CRM contact with ID:', resolvedContactId);
          } else {
            console.error('Backend failed to create contact REST response:', createData);
          }
        }

        if (resolvedContactId) {
          participantId = { contactId: resolvedContactId };
        } else {
          throw new Error('Could not resolve or create contactId via REST');
        }
      } catch (crmErr) {
        console.error('Failed in CRM REST flow on backend, falling back:', crmErr);
        participantId = { anonymousVisitorId: anonymousVisitorId || '00000000-0000-0000-0000-000000000001' };
      }
    } else if (anonymousVisitorId) {
      participantId = { anonymousVisitorId };
    } else {
      res.status(400).json({ error: 'Missing memberId, contactId, contact details, or anonymousVisitorId in request body.' });
      return;
    }

    console.log('Backend calling getOrCreateConversation with participantId:', participantId);
    const result = await wixClient.inboxConversations.getOrCreateConversation(participantId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in get-or-create-conversation serverless function:', error);
    res.status(500).json({
      error: error.message || 'Internal Server Error',
      details: error.details || null
    });
  }
}
