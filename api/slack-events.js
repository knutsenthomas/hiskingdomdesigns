/**
 * API Endpoint: /api/slack-events
 * Receives Slack Event Subscriptions (e.g., when the store owner replies to a chat thread in Slack)
 * and delivers the reply directly to the customer on hiskingdomdesigns.no via Wix Inbox & Firestore.
 */

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
    apiKey: process.env.WIX_API_KEY || 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg'
  })
});

// Cache processed event IDs to prevent Slack retry duplicates
const processedEvents = new Set();

export default async function handler(req, res) {
  // 1. Slack URL Verification Handshake
  if (req.body?.type === 'url_verification') {
    console.log('[SlackEvents] URL verification challenge received.');
    return res.status(200).json({ challenge: req.body.challenge });
  }

  // Deduplicate Slack retries immediately
  if (req.headers['x-slack-retry-num']) {
    console.log('[SlackEvents] Ignoring Slack retry attempt #', req.headers['x-slack-retry-num']);
    return res.status(200).json({ ok: true, ignored: 'retry' });
  }

  try {
    const { event_id, type, event } = req.body || {};

    if (type !== 'event_callback' || !event) {
      return res.status(200).json({ ok: true });
    }

    // Deduplicate identical Slack events
    if (event_id) {
      if (processedEvents.has(event_id)) {
        return res.status(200).json({ ok: true, duplicate: true });
      }
      processedEvents.add(event_id);
      if (processedEvents.size > 1000) {
        const first = processedEvents.values().next().value;
        processedEvents.delete(first);
      }
    }

    // Ignore bot messages, message updates, or messages without text to prevent infinite loops
    if (event.bot_id || event.subtype === 'bot_message' || !event.text) {
      return res.status(200).json({ ok: true, ignored: 'bot_or_empty' });
    }

    // We support both replies inside a thread AND direct messages in the channel
    const threadTs = event.thread_ts;
    const isThreadReply = Boolean(threadTs && threadTs !== event.ts);

    const replyText = event.text.trim();
    if (!replyText) {
      return res.status(200).json({ ok: true, ignored: 'empty_text' });
    }

    console.log(`[SlackEvents] Received message (thread: ${isThreadReply ? threadTs : 'no'}, channel: ${event.channel}): "${replyText.substring(0, 40)}..."`);

    // 2. Fetch thread or recent channel history directly from Slack (stateless - eliminates database dependency)
    const slackBotToken = process.env.SLACK_BOT_TOKEN;
    const channel = event.channel;
    let conversationId = null;
    let sessionId = null;

    if (slackBotToken && channel) {
      try {
        let messagesToScan = [];
        if (isThreadReply) {
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
          if (slackData.ok && slackData.messages) {
            messagesToScan = slackData.messages;
          } else {
            console.warn('[SlackEvents] conversations.replies failed:', slackData.error);
          }
        } else {
          // If store owner replied directly in the DM/channel without creating a thread:
          console.log(`[SlackEvents] No threadTs provided; scanning recent history for channel ${channel}...`);
          const slackRes = await fetch(
            `https://slack.com/api/conversations.history?channel=${channel}&limit=20`,
            {
              headers: {
                'Authorization': `Bearer ${slackBotToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          const slackData = await slackRes.json();
          if (slackData.ok && slackData.messages) {
            messagesToScan = slackData.messages;
          } else {
            console.warn('[SlackEvents] conversations.history failed:', slackData.error);
          }
        }

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

        console.log('[SlackEvents] Resolved conversation from Slack messages:', { conversationId, sessionId });
      } catch (slackFetchErr) {
        console.warn('[SlackEvents] Error fetching messages from Slack:', slackFetchErr);
      }
    }

    // 3. Fallback to Firestore cache if not found in Slack metadata
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

    // 4. Send reply to Wix Inbox (if linked to a Wix conversation)
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

    // 5. Save reply to Firestore for real-time instant display on web widget (if Firestore works)
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

    return res.status(200).json({ ok: true, deliveredToWix, conversationId });
  } catch (err) {
    console.error('[SlackEvents] Unexpected error processing event:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
