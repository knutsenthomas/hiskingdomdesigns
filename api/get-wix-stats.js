import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { orders, abandonedCheckouts } from '@wix/ecom';
import { members } from '@wix/members';
import { headlessSite } from '@wix/headless-site';

const wixClient = createClient({
  host: headlessSite.host(),
  modules: {
    orders,
    abandonedCheckouts,
    members
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('API: Fetching Wix orders...');
    let ordersList = [];
    let totalOrders = 0;
    try {
      // Query up to 100 recent orders
      const ordersRes = await wixClient.orders.searchOrders({
        filter: {},
        cursorPaging: { limit: 100 }
      });
      ordersList = (ordersRes.orders || []).sort((a, b) => new Date(b._createdDate || 0) - new Date(a._createdDate || 0));
      totalOrders = ordersRes.totalCount || ordersList.length || 0;
    } catch (oErr) {
      console.warn('API Warning: Failed to fetch orders from Wix:', oErr);
    }

    console.log('API: Fetching Wix members with full profiles...');
    let totalContacts = 0;
    let membersList = [];
    try {
      const membersRes = await wixClient.members.queryMembers({
        fieldsets: ['FULL']
      })
        .limit(100)
        .find();
      membersList = (membersRes.items || []).sort((a, b) => new Date(b._createdDate || 0) - new Date(a._createdDate || 0));
      totalContacts = membersRes.totalCount || membersList.length || 0;
    } catch (mErr) {
      console.warn('API Warning: Failed to fetch members from Wix:', mErr);
    }

    console.log('API: Fetching Wix abandoned checkouts...');
    let abandonedList = [];
    try {
      const abRes = await wixClient.abandonedCheckouts.searchAbandonedCheckouts({});
      abandonedList = (abRes.abandonedCheckouts || []).sort((a, b) => new Date(b._createdDate || 0) - new Date(a._createdDate || 0));
    } catch (abErr) {
      try {
        const abQueryRes = await wixClient.abandonedCheckouts.queryAbandonedCheckouts().limit(100).find();
        abandonedList = (abQueryRes.items || []).sort((a, b) => new Date(b._createdDate || 0) - new Date(a._createdDate || 0));
      } catch (abQueryErr) {
        console.warn('API Warning: Failed to fetch abandoned checkouts from Wix:', abQueryErr);
      }
    }

    res.status(200).json({
      success: true,
      orders: ordersList,
      totalOrders,
      totalContacts,
      members: membersList,
      abandonedCheckouts: abandonedList
    });
  } catch (error) {
    console.error('API Error: Failed to fetch Wix statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || String(error) 
    });
  }
}
