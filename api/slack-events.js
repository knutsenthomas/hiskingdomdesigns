/**
 * API Endpoint: /api/slack-events
 * Receives Slack Event Subscriptions (e.g., when the store owner replies to a chat thread in Slack)
 * and delivers the reply directly to the customer on hiskingdomdesigns.no via Wix Inbox & Firestore.
 */

import crypto from 'crypto';
import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { conversations, messages } from '@wix/inbox';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

// Initialize Firebase client for serverless Firestore sync
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

// Initialize Wix SDK for Inbox replies
const wixClient = createClient({
  modules: {
    inboxConversations: conversations,
    inboxMessages: messages,
  },
  auth: ApiKeyStrategy({
    siteId: process.env.WIX_SITE_ID || '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7',
    apiKey: process.env.WIX_CHAT_API_KEY || process.env.WIX_API_KEY
  })
});

// Cache processed event IDs to prevent duplicate execution
const processedEvents = new Set();

/**
 * Verify incoming Slack requests using HMAC SHA-256 and signing secret
 */
function verifySlackSignature(req) {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) return true; // If not configured yet in environment, allow with warning

  const signature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];
  if (!signature || !timestamp) {
    return false;
  }

  // Prevent replay attacks (older than 5 minutes)
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - Number(timestamp)) > 300) {
    return false;
  }

  const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
  const sigBaseString = `v0:${timestamp}:${rawBody}`;
  const hmac = crypto.createHmac('sha256', signingSecret).update(sigBaseString).digest('hex');
  const expectedSignature = `v0=${hmac}`;

  try {
    return crypto.timingSafeEqual(Buffer.from(expectedSignature, 'utf8'), Buffer.from(signature, 'utf8'));
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  // 1. Verify Slack HMAC signature
  if (process.env.SLACK_SIGNING_SECRET && !verifySlackSignature(req)) {
    console.warn('[SlackEvents] Unauthorized: Invalid Slack signature');
    return res.status(401).json({ error: 'Invalid Slack signature' });
  }

  // 2. Slack URL Verification Handshake
  if (req.body?.type === 'url_verification') {
    console.log('[SlackEvents] URL verification challenge received.');
    return res.status(200).json({ challenge: req.body.challenge });
  }

  try {
    const { event_id, type, event } = req.body || {};

    if (type !== 'event_callback' || !event) {
      return res.status(200).json({ ok: true });
    }

    // Deduplicate identical Slack events if already processed
    if (event_id && processedEvents.has(event_id)) {
      console.log('[SlackEvents] Event already processed:', event_id);
      return res.status(200).json({ ok: true, duplicate: true });
    }

    // Ignore bot messages, message updates, or messages without text to prevent infinite loops
    if (event.bot_id || event.subtype === 'bot_message' || !event.text) {
      return res.status(200).json({ ok: true, ignored: 'bot_or_empty' });
    }

    // Strictly enforce thread replies: never guess or route unthreaded messages to customers
    const threadTs = event.thread_ts;
    const isThreadReply = Boolean(threadTs && threadTs !== event.ts);
    if (!isThreadReply) {
      console.log('[SlackEvents] Ignored non-thread message to prevent routing ambiguity.');
      return res.status(200).json({ ok: true, ignored: 'not_thread_reply' });
    }

    const replyText = event.text.trim();
    if (!replyText) {
      return res.status(200).json({ ok: true, ignored: 'empty_text' });
    }

    console.log(`[SlackEvents] Received thread reply (thread: ${threadTs}, channel: ${event.channel}): "${replyText.substring(0, 40)}..."`);

    // 3. Fetch thread replies directly from Slack
    const slackBotToken = process.env.SLACK_BOT_TOKEN;
    const channel = event.channel;
    let conversationId = null;
    let sessionId = null;

    if (slackBotToken && channel) {
      try {
        console.log(`[SlackEvents] Fetching messages in thread ${threadTs} in channel ${channel}...`);
        const slackRes = await fetch(
          `https://slack.com/api/conversations.replies?channel=${channel}&ts=${threadTs}&limit=50`,
          {
            headers: {
              'Authorization': `Bearer ${slackBotToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const slackData = await slackRes.json();
        const messagesToScan = slackData.ok && slackData.messages ? slackData.messages : [];

        // Scan messages backwards (newest customer inquiry first) to find latest conversationId
        for (let i = messagesToScan.length - 1; i >= 0; i--) {
          const m = messagesToScan[i];

          // A) Metadata check
          if (!conversationId && m.metadata?.event_payload?.conversationId) {
            conversationId = m.metadata.event_payload.conversationId;
          }
          if (!sessionId && m.metadata?.event_payload?.sessionId) {
            sessionId = m.metadata.event_payload.sessionId;
          }

          // B) Text / blocks regex check for [hkd:conv:...|sess:...]
          const str = JSON.stringify(m);
          if (!conversationId || conversationId === 'none') {
            const convMatch = str.match(/\[hkd:conv:([a-zA-Z0-9_-]+)/);
            if (convMatch && convMatch[1] !== 'none') {
              conversationId = convMatch[1];
            }
          }
          if (!sessionId || sessionId === 'none') {
            const sessMatch = str.match(/\|sess:([a-zA-Z0-9_-]+)\]/);
            if (sessMatch && sessMatch[1] !== 'none') {
              sessionId = sessMatch[1];
            }
          }

          if (conversationId && conversationId !== 'none') {
            break;
          }
        }

        console.log('[SlackEvents] Resolved conversation from Slack thread:', { conversationId, sessionId });
      } catch (slackFetchErr) {
        console.warn('[SlackEvents] Error fetching thread from Slack:', slackFetchErr);
      }
    }

    // 4. Fallback to Firestore cache if not found in Slack metadata
    if (!conversationId) {
      try {
        const threadSnap = await getDoc(doc(db, 'slack_chat_threads', threadTs));
        if (threadSnap.exists()) {
          const data = threadSnap.data();
          conversationId = data.conversationId;
          sessionId = sessionId || data.sessionId;
        }
      } catch (fsErr) {
        // Non-blocking fallback
      }
    }

    // 5. Send reply to Wix Inbox (if linked to a Wix conversation)
    let deliveredToWix = false;
    if (conversationId && conversationId !== 'none') {
      try {
        console.log('[SlackEvents] Forwarding reply to Wix Inbox conversation:', conversationId);
        const wixRes = await wixClient.inboxMessages.sendMessage(conversationId, {
          direction: 'BUSINESS_TO_PARTICIPANT',
          visibility: 'BUSINESS_AND_PARTICIPANT',
          content: {
            basic: {
              items: [{ text: replyText }]
            }
          }
        });
        deliveredToWix = true;
        console.log('[SlackEvents] Successfully delivered reply to Wix Inbox:', wixRes?.message?._id || 'ok');
      } catch (wixErr) {
        console.error('[SlackEvents] Wix Inbox sendMessage error:', wixErr);
      }
    } else {
      console.warn('[SlackEvents] Could not resolve conversationId for thread:', threadTs);
    }

    // 6. Save reply to Firestore for real-time instant display on web widget
    const targetSessionId = sessionId || conversationId;
    if (targetSessionId && targetSessionId !== 'none') {
      try {
        await addDoc(collection(db, 'chat_sessions', targetSessionId, 'messages'), {
          sender: 'assistant',
          senderName: 'Thomas (His Kingdom Designs)',
          text: replyText,
          time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }),
          createdAt: serverTimestamp(),
          source: 'slack'
        });
        console.log('[SlackEvents] Saved reply to Firestore real-time collection for session:', targetSessionId);
      } catch (fsErr) {
        // Non-blocking fallback
      }
    }

    // Mark event as processed only after handling
    if (event_id) {
      processedEvents.add(event_id);
      if (processedEvents.size > 1000) {
        const first = processedEvents.values().next().value;
        processedEvents.delete(first);
      }
    }

    return res.status(200).json({ ok: true, deliveredToWix, conversationId });
  } catch (err) {
    console.error('[SlackEvents] Unexpected error processing event:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
