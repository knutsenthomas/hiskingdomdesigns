import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { conversations } from '@wix/inbox';
import { contacts } from '@wix/site-crm';
import { headlessSite } from '@wix/headless-site';

const wixClient = createClient({
  host: headlessSite.host(),
  modules: {
    inboxConversations: conversations,
    contacts,
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
    const { memberId, email, name, anonymousVisitorId } = req.body;
    
    let participantId = {};
    
    if (memberId) {
      participantId = { memberId };
    } else if (email && name) {
      console.log('Backend creating/appending CRM contact for:', email, name);
      try {
        const contactRes = await wixClient.contacts.appendOrCreateContact({
          contact: {
            emails: [{ email }],
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' ') || 'Gjest'
          }
        });
        const contactId = contactRes.contact?._id || contactRes.contactId;
        if (contactId) {
          participantId = { contactId };
          console.log('Successfully created CRM contact with contactId:', contactId);
        } else {
          throw new Error('No contactId returned from Wix Contacts API');
        }
      } catch (crmErr) {
        console.error('Failed to create contact in CRM backend, falling back:', crmErr);
        participantId = { anonymousVisitorId: anonymousVisitorId || '00000000-0000-0000-0000-000000000001' };
      }
    } else if (anonymousVisitorId) {
      participantId = { anonymousVisitorId };
    } else {
      res.status(400).json({ error: 'Missing memberId, contact details, or anonymousVisitorId in request body.' });
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
