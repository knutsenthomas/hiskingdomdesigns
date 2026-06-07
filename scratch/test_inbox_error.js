import { createClient, OAuthStrategy } from '@wix/sdk';
import { conversations as inboxConversations } from '@wix/inbox';
import crypto from 'crypto';

const wixClient = createClient({
  modules: {
    inboxConversations,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function main() {
  console.log('Testing Wix Inbox getOrCreateConversation with valid UUID anonymousVisitorId...');
  const participantId = { anonymousVisitorId: crypto.randomUUID() };
  console.log('Using anonymousVisitorId:', participantId.anonymousVisitorId);
  
  try {
    const res = await wixClient.inboxConversations.getOrCreateConversation(participantId);
    console.log('Success! Conversation created/retrieved:', res);
  } catch (err) {
    console.error('Failed to get/create conversation.');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.details) {
      console.error('Error details:', JSON.stringify(err.details, null, 2));
    } else {
      console.error('Full error object:', err);
    }
  }
}

main();
