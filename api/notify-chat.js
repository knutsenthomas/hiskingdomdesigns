/**
 * API Endpoint: /api/notify-chat
 * Dispatches real-time chat interactions from the HKM Assistant to Slack.
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
      userMessage,
      assistantReply = null,
      customerEmail = null,
      customerName = null,
      pageUrl = '',
      mode = 'ai', // 'ai' | 'live'
      conversationId = null
    } = req.body || {};

    if (!userMessage) {
      res.status(400).json({ success: false, error: 'Manglende userMessage' });
      return;
    }

    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    const nowFormatted = new Date().toLocaleString('nb-NO', { timeZone: 'Europe/Oslo' });

    console.log(`[ChatNotify] New message from ${customerEmail || customerName || 'Anonym'}: "${userMessage.substring(0, 50)}..."`);

    if (slackWebhookUrl) {
      const modeLabel = mode === 'ai' ? '🤖 HKM Assistent (AI)' : '👤 Kundeservice (Live Chat)';
      const customerDisplay = customerName && customerEmail 
        ? `${customerName} (\`${customerEmail}\`)`
        : (customerEmail ? `\`${customerEmail}\`` : (customerName || '_Anonym besøkende_'));

      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: mode === 'ai' ? '💬 HKM Assistent: Ny melding fra kunde!' : '🛎️ Kundeservice: Ny live-melding!',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Kunde:*\n${customerDisplay}`
            },
            {
              type: 'mrkdwn',
              text: `*Modus:*\n${modeLabel}`
            },
            {
              type: 'mrkdwn',
              text: `*Aktiv side:*\n\`${pageUrl || '/'}\``
            },
            {
              type: 'mrkdwn',
              text: `*Tid:*\n${nowFormatted}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Kundens melding:*\n> ${userMessage.replace(/\n/g, '\n> ')}`
          }
        }
      ];

      if (assistantReply) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Assistentens svar:*\n${assistantReply.substring(0, 1000)}`
          }
        });
      }

      if (conversationId) {
        blocks.push({
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `🆔 Samtale-ID: \`${conversationId}\` | Sjekk Wix Inbox på mobilen for å svare direkte.`
            }
          ]
        });
      }

      const slackRes = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks })
      });

      if (!slackRes.ok) {
        console.error('[ChatNotify] Slack webhook returned error status:', slackRes.status);
      }
    } else {
      console.warn('[ChatNotify] SLACK_WEBHOOK_URL is not configured in environment variables.');
    }

    res.status(200).json({ 
      success: true, 
      slackSent: Boolean(slackWebhookUrl),
      timestamp: nowFormatted 
    });
  } catch (err) {
    console.error('[ChatNotify] Error processing chat notification:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
