/**
 * API Endpoint: /api/notify-incident
 * Sends real-time Slack incident alerts and logs critical customer-facing e-commerce issues.
 */

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
      source = 'Checkout',
      errorMessage = 'Ukjent feil',
      errorCode = 'UNKNOWN_ERROR',
      details = null,
      cartItems = [],
      customerEmail = null,
      customerName = null,
      url = '',
      userAgent = ''
    } = req.body || {};

    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

    // Calculate cart total and formatted item summary
    const totalAmount = cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
    const formattedItems = cartItems.map(item => {
      const parts = [item.name || 'Uten navn'];
      if (item.selectedSize) parts.push(`Str: ${item.selectedSize}`);
      if (item.selectedColor) parts.push(`Farge: ${item.selectedColor}`);
      parts.push(`x${item.quantity || 1}`);
      parts.push(`${item.price || 0} kr`);
      return `• ${parts.join(' | ')}`;
    }).join('\n') || 'Ingen varer registrert';

    const nowFormatted = new Date().toLocaleString('nb-NO', { timeZone: 'Europe/Oslo' });

    // Determine device
    const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
    const deviceType = isMobile ? '📱 Mobil' : '💻 Desktop';

    console.log(`[IncidentAlert] ${source}: ${errorMessage} (${customerEmail || 'Anonym'})`);

    // If Slack webhook is configured, dispatch Slack notification
    if (slackWebhookUrl) {
      const slackPayload = {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🚨 Kasse- / Handlekurvfeil oppdaget!',
              emoji: true
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Kilde:*\n${source}`
              },
              {
                type: 'mrkdwn',
                text: `*Tidspunkt:*\n${nowFormatted}`
              },
              {
                type: 'mrkdwn',
                text: `*Kunde:*\n${customerEmail ? `\`${customerEmail}\`` : '_Ikke oppgitt / Anonym_'}`
              },
              {
                type: 'mrkdwn',
                text: `*Enhet:*\n${deviceType}`
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*⚠️ Feilmelding:*\n\`\`\`${errorMessage}\`\`\`${errorCode ? `\n*Feilkode / Status:* \`${errorCode}\`` : ''}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*🛒 Varer i kurven (${cartItems.length} stk - Totalt ca. ${totalAmount} kr):*\n${formattedItems}`
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `🔗 URL: \`${url || 'hiskingdomdesigns.no'}\` | E-post til support: *post@hiskingdomministry.no*`
              }
            ]
          }
        ]
      };

      const slackRes = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload)
      });

      if (!slackRes.ok) {
        console.error('[IncidentAlert] Slack webhook returned error status:', slackRes.status);
      }
    } else {
      console.warn('[IncidentAlert] SLACK_WEBHOOK_URL is not configured in environment variables.');
    }

    res.status(200).json({ 
      success: true, 
      slackSent: Boolean(slackWebhookUrl),
      timestamp: nowFormatted 
    });
  } catch (err) {
    console.error('[IncidentAlert] Error processing incident alert:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
