import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { orders } from '@wix/ecom';
import { headlessSite } from '@wix/headless-site';

const wixClient = createClient({
  host: headlessSite.host(),
  modules: {
    orders
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
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }

  try {
    const {
      productId,
      productName,
      quantity,
      price,
      buyerName,
      buyerEmail,
      paymentMethod
    } = req.body || {};

    if (!price || !productName || !quantity) {
      res.status(400).json({ success: false, error: 'Manglende påkrevde felt (price, productName, quantity)' });
      return;
    }

    const nameParts = (buyerName || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Manuell';
    const lastName = nameParts.slice(1).join(' ') || 'Bestilling';

    const numericPrice = parseFloat(price);
    const numericQuantity = parseInt(quantity, 10) || 1;
    const totalAmount = (numericPrice * numericQuantity).toFixed(2);

    const lineItem = {
      quantity: numericQuantity,
      itemType: {
        preset: 'PHYSICAL'
      },
      price: {
        amount: numericPrice.toFixed(2)
      },
      productName: {
        original: productName
      },
      taxInfo: {
        taxAmount: { amount: '0' },
        taxableAmount: { amount: numericPrice.toFixed(2) },
        taxRate: '0',
        taxIncludedInPrice: false
      }
    };

    // If a valid Wix catalog product is selected
    if (productId && productId !== 'custom') {
      lineItem.catalogReference = {
        appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
        catalogItemId: productId
      };
    }

    const orderData = {
      lineItems: [lineItem],
      buyerInfo: {
        email: buyerEmail || 'manual-order@example.com'
      },
      billingInfo: {
        contactDetails: {
          firstName,
          lastName
        }
      },
      currency: 'NOK',
      priceSummary: {
        subtotal: { amount: totalAmount },
        total: { amount: totalAmount }
      },
      channelInfo: {
        type: 'OTHER_PLATFORM'
      }
    };

    console.log('API: Creating Wix manual order...', JSON.stringify(orderData, null, 2));
    const orderRes = await wixClient.orders.createOrder(orderData);
    const orderId = orderRes._id;
    const orderNumber = orderRes.number;

    console.log('API: Recording payment for order ID:', orderId);
    await wixClient.orders.recordManuallyCollectedPayment(orderId, { amount: totalAmount }, {
      userDefinedPaymentMethodName: {
        custom: paymentMethod || 'Vipps'
      }
    });

    res.status(200).json({
      success: true,
      orderId,
      orderNumber,
      totalAmount
    });
  } catch (error) {
    console.error('API Error: Failed to create manual Wix order:', error);
    res.status(500).json({
      success: false,
      error: error.message || String(error)
    });
  }
}
