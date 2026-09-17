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
    apiKey: process.env.WIX_API_KEY
  })
});

import { verifyAdminAuth } from './_admin-auth.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Admin-Key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }

  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) {
    res.status(401).json({ success: false, error: 'Unauthorized: Admin access required' });
    return;
  }

  try {
    const {
      productId,
      variantId,
      productName,
      quantity,
      price,
      buyerName,
      buyerEmail,
      buyerPhone,
      paymentMethod
    } = req.body || {};

    if (!price || !productName || !quantity) {
      res.status(400).json({ success: false, error: 'Manglende påkrevde felt (price, productName, quantity)' });
      return;
    }

    const nameParts = (buyerName || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Manuell';
    const lastName = nameParts.slice(1).join(' ') || 'Bestilling';

    // Format phone to E.164 (+47XXXXXXXX for Norwegian numbers)
    let formattedPhone = null;
    if (buyerPhone) {
      const cleaned = String(buyerPhone).trim().replace(/[\s\-\.\(\)\/]/g, '');
      if (cleaned.startsWith('00')) {
        formattedPhone = '+' + cleaned.slice(2);
      } else if (cleaned.startsWith('+')) {
        formattedPhone = cleaned;
      } else if (cleaned.length === 8) {
        formattedPhone = `+47${cleaned}`;
      } else if (cleaned.length === 10 && cleaned.startsWith('47')) {
        formattedPhone = `+${cleaned}`;
      } else {
        formattedPhone = `+${cleaned}`;
      }
    }

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
        catalogItemId: productId,
        ...(variantId ? { options: { variantId } } : {})
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
          lastName,
          ...(formattedPhone ? { phone: formattedPhone } : {})
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
