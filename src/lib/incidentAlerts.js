import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Anti-spam debounce map to avoid duplicate alerts for the same error within 60 seconds
const recentAlerts = new Map();

/**
 * Reports a checkout or shopping cart incident in real-time to:
 * 1. Slack (via /api/notify-incident)
 * 2. Firebase Firestore (checkout_incidents collection for audit/admin)
 */
export async function reportCheckoutIncident({
  source = 'Checkout',
  error,
  cartItems = [],
  customerEmail = null,
  customerName = null
} = {}) {
  try {
    const errorMessage = error?.message || (typeof error === 'string' ? error : 'Ukjent feil i kassen');
    const errorCode = error?.code || error?.status || error?.details?.applicationError?.code || 'CHECKOUT_FAIL';
    const errorDetails = error?.details || null;

    // Deduplicate identical errors within 60 seconds
    const dedupKey = `${source}:${errorMessage}:${customerEmail || 'anon'}`;
    const now = Date.now();
    if (recentAlerts.has(dedupKey) && now - recentAlerts.get(dedupKey) < 60000) {
      console.log('[IncidentAlert] Skipping duplicate alert (within 60s cooldown)');
      return;
    }
    recentAlerts.set(dedupKey, now);

    // Retrieve active customer email if not explicitly passed
    let email = customerEmail;
    if (!email) {
      try {
        email = localStorage.getItem('hkd-checkout-email') || localStorage.getItem('hkm-user-email') || null;
      } catch (e) {}
    }

    const payload = {
      source,
      errorMessage,
      errorCode: String(errorCode),
      details: errorDetails ? JSON.stringify(errorDetails).slice(0, 1000) : null,
      cartItems: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
        variantId: item.variantId || null
      })),
      customerEmail: email,
      customerName: customerName || null,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString()
    };

    // 1. Dispatch to /api/notify-incident (Slack Notification)
    try {
      fetch('/api/notify-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(fetchErr => {
        console.warn('[IncidentAlert] Could not post to /api/notify-incident:', fetchErr);
      });
    } catch (apiErr) {
      console.warn('[IncidentAlert] Failed triggering API notify:', apiErr);
    }

    // 2. Log incident to Firebase Firestore for Admin view
    try {
      if (db) {
        addDoc(collection(db, 'checkout_incidents'), {
          ...payload,
          createdAt: serverTimestamp()
        }).catch(fsErr => {
          console.warn('[IncidentAlert] Firestore write skipped/failed:', fsErr);
        });
      }
    } catch (fsErr) {
      // Non-blocking
    }
  } catch (outerErr) {
    console.warn('[IncidentAlert] Global handler exception (non-blocking):', outerErr);
  }
}

/**
 * Notifies Slack in real-time when a customer sends a message to the HKM Assistant or Live chat.
 */
export async function notifySlackChatMessage({
  userMessage,
  assistantReply = null,
  customerEmail = null,
  customerName = null,
  mode = 'ai',
  conversationId = null
} = {}) {
  try {
    if (!userMessage || !userMessage.trim()) return;

    let email = customerEmail;
    if (!email) {
      try {
        email = localStorage.getItem('hkd-checkout-email') || localStorage.getItem('hkm-user-email') || null;
      } catch (e) {}
    }

    let sessionId = null;
    let threadTs = null;
    let convId = conversationId;
    try {
      if (!convId) {
        convId = localStorage.getItem('hkd-inbox-conv-id') || null;
      }
      sessionId = localStorage.getItem('hkd-chat-session-id') || localStorage.getItem('hkd-chat-anon-id');
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('hkd-chat-session-id', sessionId);
      }
      threadTs = localStorage.getItem('hkd-slack-thread-ts');
    } catch (e) {}

    const payload = {
      userMessage: userMessage.trim(),
      assistantReply: assistantReply ? assistantReply.trim() : null,
      customerEmail: email,
      customerName: customerName || null,
      pageUrl: typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : '/',
      mode,
      conversationId: convId,
      sessionId,
      threadTs,
      timestamp: new Date().toISOString()
    };

    fetch('/api/notify-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    })
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          if (json.threadTs) {
            try {
              localStorage.setItem('hkd-slack-thread-ts', json.threadTs);
            } catch (e) {}
          }
        }
      })
      .catch(err => {
        console.warn('[ChatNotify] Failed to dispatch to /api/notify-chat:', err);
      });
  } catch (err) {
    console.warn('[ChatNotify] Error in notifySlackChatMessage:', err);
  }
}

