import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { programs, rewards, tiers } from '@wix/loyalty';

const wixClient = createClient({
  modules: {
    programs,
    rewards,
    tiers
  },
  auth: ApiKeyStrategy({
    siteId: '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7',
    apiKey: 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg'
  })
});

async function main() {
  console.log('Fetching Loyalty Program...');
  try {
    const prog = await wixClient.programs.getLoyaltyProgram();
    console.log('Loyalty Program name:', prog.loyaltyProgram.name);
  } catch (err) {
    console.error('Failed to fetch loyalty program:', err.message);
  }

  console.log('\nFetching Loyalty Rewards...');
  try {
    const rws = await wixClient.rewards.queryRewards({ query: {} });
    console.log('Loyalty Rewards:', JSON.stringify(rws.rewards, null, 2));
  } catch (err) {
    console.error('Failed to fetch loyalty rewards:', err.message);
  }

  console.log('\nFetching Loyalty Tiers...');
  try {
    const trs = await wixClient.tiers.queryTiers({ query: {} });
    console.log('Loyalty Tiers:', JSON.stringify(trs.tiers, null, 2));
  } catch (err) {
    console.error('Failed to fetch loyalty tiers:', err.message);
  }
}

main().catch(console.error);
