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
  console.log('Testing conversation lookup and sending with resolved sender...');
  const participantId = { anonymousVisitorId: '00000000-0000-0000-0000-000000000005' };
  try {
    console.log('1. Getting/Creating Conversation...');
    const convRes = await wixClient.inboxConversations.getOrCreateConversation(participantId);
    const convId = convRes.conversation._id;
    console.log('Got conversation ID:', convId);

    console.log('\n2. Retrieving Conversation details via getConversation...');
    const convDetails = await wixClient.inboxConversations.getConversation(convId);
    console.log('Conversation details participant:', JSON.stringify(convDetails.participant, null, 2));

    console.log('\n3. Sending message with sender = convDetails.participant...');
    const messagePayload = {
      direction: 'PARTICIPANT_TO_BUSINESS',
      visibility: 'BUSINESS_AND_PARTICIPANT',
      sender: convDetails.participant,
      content: {
        basic: {
          items: [
            {
              text: 'Dette er en testmelding der senderen ble slått opp på backend!'
            }
          ]
        }
      }
    };

    const sendRes = await wixClient.inboxMessages.sendMessage(convId, messagePayload);
    console.log('Message sent successfully! Response ID:', sendRes.message?._id);

    console.log('\n4. Listing messages to verify...');
    const listRes = await wixClient.inboxMessages.listMessages(convId, 'BUSINESS_AND_PARTICIPANT');
    console.log('Found messages:', listRes.messages?.length);
    console.log('Last message sender details:', JSON.stringify(listRes.messages?.[0]?.sender, null, 2));
  } catch (err) {
    console.error('Test failed:', err);
  }
}

main();
