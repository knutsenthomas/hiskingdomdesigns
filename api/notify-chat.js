/**
 * API Endpoint: /api/notify-chat
 * Dispatches real-time chat interactions from the HKM Assistant to Slack.
 * Supports both standard Slack Webhooks and the full Slack Web API (chat.postMessage)
 * to enable two-way replies via threads.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyABoePYQM_Xpo-hC1AKKfN7ODJdDgbQi_k",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "his-kingdom-designs.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "his-kingdom-designs",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "his-kingdom-designs.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "626968403342",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:626968403342:web:5f76bfe02d3ccfbfa198df"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

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
      conversationId = null,
      sessionId = null,
      threadTs = null
    } = req.body || {};

    if (!userMessage) {
      res.status(400).json({ success: false, error: 'Manglende userMessage' });
      return;
    }

    const slackBotToken = process.env.SLACK_BOT_TOKEN;
    const slackChannelId = process.env.SLACK_CHAT_CHANNEL_ID;
    const slackWebhookUrl = process.env.SLACK_CHAT_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
    const nowFormatted = new Date().toLocaleString('nb-NO', { timeZone: 'Europe/Oslo' });

    console.log(`[ChatNotify] New message from ${customerEmail || customerName || 'Anonym'}: "${userMessage.substring(0, 50)}..."`);

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

    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `💬 *Svar i denne tråden i Slack* for å sende meldingen direkte tilbake til kunden på nettsiden!`
        }
      ]
    });

    let messageTs = threadTs;

    // 1. If Slack Bot Token & Channel are configured, use chat.postMessage (Enables threads & two-way chat)
    if (slackBotToken && slackChannelId) {
      const postPayload = {
        channel: slackChannelId,
        text: `💬 Ny kundemelding: "${userMessage}"`,
        blocks
      };
      if (threadTs) {
        postPayload.thread_ts = threadTs;
      }

      const slackRes = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${slackBotToken}`
        },
        body: JSON.stringify(postPayload)
      });

      const resJson = await slackRes.json();
      if (resJson.ok && resJson.ts) {
        messageTs = resJson.ts;
        // Save thread mapping to Firestore so replies to this thread reach the customer
        const activeThreadTs = threadTs || resJson.ts;
        try {
          await setDoc(doc(db, 'slack_chat_threads', activeThreadTs), {
            threadTs: activeThreadTs,
            sessionId: sessionId || conversationId || `session-${activeThreadTs}`,
            conversationId: conversationId || null,
            customerEmail: customerEmail || null,
            customerName: customerName || null,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (fsErr) {
          console.warn('[ChatNotify] Could not save thread mapping to Firestore:', fsErr);
        }
      } else {
        console.error('[ChatNotify] Slack chat.postMessage failed:', resJson.error);
      }
    } 
    // 2. Otherwise, fall back to Incoming Webhook
    else if (slackWebhookUrl) {
      const slackRes = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks })
      });

      if (!slackRes.ok) {
        console.error('[ChatNotify] Slack webhook returned error status:', slackRes.status);
      }
    }

    res.status(200).json({ 
      success: true, 
      threadTs: messageTs,
      timestamp: nowFormatted 
    });
  } catch (err) {
    console.error('[ChatNotify] Error processing chat notification:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
