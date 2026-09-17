const SITE_ID = process.env.WIX_SITE_ID || '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7';
const API_KEY = process.env.WIX_API_KEY;

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

  const { email } = req.body;
  if (!email || !email.trim()) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const lowerEmail = email.toLowerCase().trim();

  try {
    console.log('Backend checking if contact exists for newsletter:', lowerEmail);

    // 1. Query contact by email
    const queryRes = await fetch('https://www.wixapis.com/contacts/v4/contacts/query', {
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
              '$eq': lowerEmail
            }
          }
        }
      })
    });

    const queryData = await queryRes.json();

    if (queryRes.ok && queryData.contacts && queryData.contacts.length > 0) {
      const existingContact = queryData.contacts[0];
      const existingLabels = existingContact.labelKeys || [];
      console.log('Backend found existing contact:', existingContact.id, 'Existing labels:', existingLabels);

      // If already tagged for newsletter, return success
      if (existingLabels.includes('custom.newsletter')) {
        res.status(200).json({ success: true, message: 'Already subscribed', contactId: existingContact.id });
        return;
      }

      // Add custom.newsletter label to existing contact
      try {
        const updatedLabels = Array.from(new Set([...existingLabels, 'custom.newsletter']));
        const updateRes = await fetch(`https://www.wixapis.com/contacts/v4/contacts/${existingContact.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': API_KEY,
            'wix-site-id': SITE_ID,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            revision: existingContact.revision,
            labelKeys: updatedLabels
          })
        });

        if (updateRes.ok) {
          console.log('Successfully added custom.newsletter label to existing contact.');
          res.status(200).json({ success: true, updated: true, contactId: existingContact.id });
          return;
        } else {
          const updateErr = await updateRes.json();
          console.warn('Wix CRM PATCH label warning:', updateErr);
          res.status(200).json({ success: true, contactId: existingContact.id });
          return;
        }
      } catch (patchErr) {
        console.warn('Error patching existing contact label:', patchErr);
        res.status(200).json({ success: true, contactId: existingContact.id });
        return;
      }
    }

    // 2. Create contact if not found
    console.log('Backend contact not found. Creating new CRM contact for newsletter...');
    const createRes = await fetch('https://www.wixapis.com/contacts/v4/contacts', {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'wix-site-id': SITE_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        info: {
          emails: {
            items: [
              {
                email: lowerEmail,
                tag: 'MAIN'
              }
            ]
          }
        },
        labelKeys: ['custom.newsletter']
      })
    });

    const createData = await createRes.json();
    if (createRes.ok && createData.contact) {
      console.log('Backend successfully created contact for newsletter:', createData.contact.id);
      res.status(200).json({ success: true, contactId: createData.contact.id });
    } else {
      console.error('Backend failed to create contact REST response:', createData);
      res.status(createRes.status).json({ error: 'Failed to create contact in Wix CRM', details: createData });
    }
  } catch (error) {
    console.error('Error in subscribe-newsletter serverless function:', error);
    res.status(500).json({
      error: error.message || 'Internal Server Error'
    });
  }
}
