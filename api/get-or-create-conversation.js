import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { conversations } from '@wix/inbox';
import { members } from '@wix/members';

const wixClient = createClient({
  modules: {
    inboxConversations: conversations,
    members,
  },
  auth: ApiKeyStrategy({
    siteId: process.env.WIX_SITE_ID || '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7',
    apiKey: process.env.WIX_CHAT_API_KEY || process.env.WIX_API_KEY
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
    } else if (email) {
      const cleanEmail = email.trim();
      const resolvedName = (name || cleanEmail.split('@')[0] || 'Kunde').trim();
      console.log('Backend querying/creating CRM contact for:', cleanEmail, resolvedName);
      try {
        const apiKey = process.env.WIX_CHAT_API_KEY || process.env.WIX_API_KEY;
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
                  '$eq': cleanEmail
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
          const firstName = resolvedName.split(' ')[0] || 'Kunde';
          const lastName = resolvedName.split(' ').slice(1).join(' ') || 'Gjest';

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
                      email: cleanEmail,
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
