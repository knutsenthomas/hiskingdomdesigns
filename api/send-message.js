import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { conversations, messages } from '@wix/inbox';

const wixClient = createClient({
  modules: {
    inboxConversations: conversations,
    inboxMessages: messages,
  },
  auth: ApiKeyStrategy({
    siteId: process.env.WIX_SITE_ID || '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7',
    apiKey: process.env.WIX_API_KEY
  })
});

import { verifyAdminAuth } from './_admin-auth.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Admin-Key'
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
    const { conversationId, message } = req.body;
    if (!conversationId) {
      res.status(400).json({ error: 'Missing conversationId in request body.' });
      return;
    }
    if (!message) {
      res.status(400).json({ error: 'Missing message in request body.' });
      return;
    }

    console.log('Backend sending message to conversation:', conversationId);
    
    // Only authenticated admin can send messages on behalf of the business
    let direction = 'PARTICIPANT_TO_BUSINESS';
    if (message.direction === 'BUSINESS_TO_PARTICIPANT') {
      const auth = await verifyAdminAuth(req);
      if (auth.authorized) {
        direction = 'BUSINESS_TO_PARTICIPANT';
      } else {
        console.warn('send-message: Unauthenticated attempt to send BUSINESS_TO_PARTICIPANT. Forcing to PARTICIPANT_TO_BUSINESS.');
        direction = 'PARTICIPANT_TO_BUSINESS';
      }
    }
    
    let sender = message.sender;
    if (!sender && direction === 'PARTICIPANT_TO_BUSINESS') {
      try {
        console.log('Backend resolving participant/sender for conversation:', conversationId);
        const convDetails = await wixClient.inboxConversations.getConversation(conversationId);
        if (convDetails && convDetails.participant) {
          sender = convDetails.participant;
          console.log('Backend resolved sender to:', JSON.stringify(sender));
        }
      } catch (err) {
        console.warn('Backend failed to resolve sender from conversation:', err);
      }
    }

    // Ensure direction, visibility and sender are correctly set
    const formattedMessage = {
      ...message,
      direction,
      visibility: message.visibility || 'BUSINESS_AND_PARTICIPANT',
      ...(sender ? { sender } : {})
    };

    const result = await wixClient.inboxMessages.sendMessage(conversationId, formattedMessage);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in send-message serverless function:', error);
    res.status(500).json({
      error: error.message || 'Internal Server Error',
      details: error.details || null
    });
  }
}
