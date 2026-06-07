import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { conversations, messages } from '@wix/inbox';

const wixClient = createClient({
  modules: {
    inboxConversations: conversations,
    inboxMessages: messages,
  },
  auth: ApiKeyStrategy({
    siteId: '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7',
    apiKey: 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg'
  }),
});

async function main() {
  console.log('Testing Wix Inbox API message sending with sender object...');
  try {
    const participantId = { anonymousVisitorId: '00000000-0000-0000-0000-000000000003' };
    console.log('1. Getting/Creating Conversation...');
    const convRes = await wixClient.inboxConversations.getOrCreateConversation(participantId);
    const convId = convRes.conversation._id;
    console.log('Conversation ID:', convId);

    console.log('2. Sending message with direction, visibility, and sender...');
    const messagePayload = {
      direction: 'PARTICIPANT_TO_BUSINESS',
      visibility: 'BUSINESS_AND_PARTICIPANT',
      sender: participantId, // Overriding default app sender
      content: {
        basic: {
          items: [
            {
              text: 'Testmelding med eksplisitt sender-identitet for Wix Inbox!'
            }
          ]
        }
      }
    };
    
    const sendRes = await wixClient.inboxMessages.sendMessage(convId, messagePayload);
    console.log('Message Sent Success! Response:', JSON.stringify(sendRes, null, 2));
  } catch (err) {
    console.error('API Test Failed!');
    console.error(err);
  }
}

main();
