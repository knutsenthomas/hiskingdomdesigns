import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { conversations } from '@wix/inbox';

const wixClient = createClient({
  modules: {
    inboxConversations: conversations,
  },
  auth: ApiKeyStrategy({
    siteId: '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7',
    apiKey: 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg'
  }),

});

async function main() {
  console.log('Testing Wix Inbox API connection with API Key...');
  try {
    const participantId = { anonymousVisitorId: '00000000-0000-0000-0000-000000000001' };
    console.log('Calling getOrCreateConversation with dummy visitor ID...');
    const res = await wixClient.inboxConversations.getOrCreateConversation(participantId);
    console.log('API Call Success!');
    console.log('Conversation Details:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('API Call Failed!');
    console.error(err);
  }
}

main();

