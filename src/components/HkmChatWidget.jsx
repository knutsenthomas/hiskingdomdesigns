import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { wixClient } from '@/lib/wix';

// Helper to parse bold (**), italic (*), and markdown links ([text](url)) syntax into React nodes
const parseInlineStyles = (text, isAssistant) => {
  if (!text) return '';
  const regex = /(\[[^\]]*\]\([^)]*\)|\*\*.*?\*\*|\*.*?\*)/g;
  const tokens = text.split(regex);
  return tokens.map((token, index) => {
    if (token.startsWith('[') && token.includes('](')) {
      const match = token.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        const linkText = match[1];
        const linkUrl = match[2];
        const isExternal = linkUrl.startsWith('http');
        if (isExternal) {
          return (
            <a
              key={index}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline font-semibold transition-colors ${
                isAssistant 
                  ? 'text-terracotta hover:text-terracotta/80' 
                  : 'text-white hover:text-white/80'
              } pointer-events-auto`}
            >
              {linkText}
            </a>
          );
        } else {
          return (
            <a
              key={index}
              href={linkUrl}
              className={`underline font-semibold transition-colors ${
                isAssistant 
                  ? 'text-terracotta hover:text-terracotta/80' 
                  : 'text-white hover:text-white/80'
              } pointer-events-auto`}
            >
              {linkText}
            </a>
          );
        }
      }
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      const content = token.slice(2, -2);
      return (
        <strong key={index} className={`font-bold ${isAssistant ? 'text-terracotta' : 'text-white'}`}>
          {parseInlineStyles(content, isAssistant)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const content = token.slice(1, -1);
      return (
        <em key={index} className={`italic font-medium ${isAssistant ? 'text-onyx/80' : 'text-white/90'}`}>
          {parseInlineStyles(content, isAssistant)}
        </em>
      );
    }
    return token.replace(/\*\*/g, '').replace(/\*/g, '');
  });
};

// Rich text renderer supporting headings, bullet points, numbered lists, and paragraphs
const renderRichText = (text, isAssistant) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const renderedElements = [];
  let listItems = [];
  let inList = false;
  
  const flushList = (key) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={key} className="list-none space-y-1.5 my-2 pl-1">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Header block (### Heading)
    if (trimmed.startsWith('### ')) {
      flushList(`list-before-h-${index}`);
      const headingText = trimmed.slice(4);
      renderedElements.push(
        <h3 key={`h-${index}`} className={`text-base font-bold mt-4 mb-2 first:mt-0 flex items-center gap-1.5 leading-snug ${isAssistant ? 'text-terracotta' : 'text-white'}`}>
          {parseInlineStyles(headingText, isAssistant)}
        </h3>
      );
    }
    // Bullet point (• or -)
    else if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      inList = true;
      const bulletText = trimmed.slice(2);
      listItems.push(
        <li key={`li-${index}`} className={`flex items-start gap-2 text-sm leading-relaxed ${isAssistant ? 'text-onyx/75' : 'text-white/90'}`}>
          <span className={`${isAssistant ? 'text-terracotta' : 'text-white'} shrink-0 mt-1 select-none`}>•</span>
          <span className="flex-1">{parseInlineStyles(bulletText, isAssistant)}</span>
        </li>
      );
    }
    // Numbered list item
    else if (/^\d+\.\s/.test(trimmed)) {
      inList = true;
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      const num = match[1];
      const bulletText = match[2];
      listItems.push(
        <li key={`li-${index}`} className={`flex items-start gap-2 text-sm leading-relaxed ${isAssistant ? 'text-onyx/75' : 'text-white/90'}`}>
          <span className={`${isAssistant ? 'text-terracotta' : 'text-white'} shrink-0 font-bold text-xs mt-0.5 select-none`}>{num}.</span>
          <span className="flex-1">{parseInlineStyles(bulletText, isAssistant)}</span>
        </li>
      );
    }
    // Empty spacing
    else if (trimmed === '') {
      flushList(`list-before-blank-${index}`);
      renderedElements.push(<div key={`blank-${index}`} className="h-2" />);
    }
    // Regular text
    else {
      flushList(`list-before-p-${index}`);
      renderedElements.push(
        <p key={`p-${index}`} className={`text-sm leading-relaxed my-1 ${isAssistant ? 'text-onyx/85' : 'text-white'}`}>
          {parseInlineStyles(line, isAssistant)}
        </p>
      );
    }
  });
  
  flushList(`list-trailing`);
  return <div className="space-y-1">{renderedElements}</div>;
};

import { useLanguage } from '@/contexts/LanguageContext';

// Safe localStorage wrapper to prevent crashes in private browsing / restricted contexts
const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`[SafeStorage] Failed to read key "${key}":`, e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[SafeStorage] Failed to write key "${key}":`, e);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[SafeStorage] Failed to remove key "${key}":`, e);
    }
  }
};

// Robust UUID v4 generator with Web Crypto API and Math.random fallback
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function HkmChatWidget() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const QUICK_REPLIES = [
    { text: t('chat.quickReply.deliveryTime'), label: t('chat.quickReply.deliveryLabel') },
    { text: t('chat.quickReply.returns'), label: t('chat.quickReply.returnsLabel') },
    { text: t('chat.quickReply.freeShipping'), label: t('chat.quickReply.freeShippingLabel') },
    { text: t('chat.quickReply.sizes'), label: t('chat.quickReply.sizesLabel') }
  ];
  const [inputText, setInputText] = useState('');
  const { assistantMessages, isAssistantTyping, sendAssistantMessage, assistantContext, setAssistantContext, generateAiResponseText } = useApp();
  const chatBodyRef = useRef(null);
  const location = useLocation();

  // Live Chat / Inbox Integration States
  const [chatMode, setChatMode] = useState('live'); // 'ai' | 'live'
  const [liveMessages, setLiveMessages] = useState([]);
  const [isLiveTyping, setIsLiveTyping] = useState(false);
  const [conversationId, setConversationId] = useState(() => {
    const stored = safeStorage.getItem('hkd-inbox-conv-id');
    return (stored && stored !== 'undefined' && stored !== 'null') ? stored : null;
  });
  const [chatParticipant, setChatParticipant] = useState(() => {
    try {
      const stored = safeStorage.getItem('hkd-inbox-participant');
      return (stored && stored !== 'undefined' && stored !== 'null') ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [member, setMember] = useState(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [needsContactInfo, setNeedsContactInfo] = useState(false);
  const [isCreatingConv, setIsCreatingConv] = useState(false);
  const [chatError, setChatError] = useState('');

  // Fetch logged in member info if available
  useEffect(() => {
    async function checkMember() {
      if (wixClient.auth.loggedIn()) {
        try {
          const res = await wixClient.members.getCurrentMember({ fieldsets: ['FULL'] });
          if (res && res.member) {
            setMember(res.member);
          }
        } catch (e) {
          console.warn('Failed to get member for chat:', e);
        }
      }
    }
    checkMember();
    window.addEventListener('wix-auth-change', checkMember);
    return () => window.removeEventListener('wix-auth-change', checkMember);
  }, []);

  // Auto-start live chat once member is loaded if in live mode
  useEffect(() => {
    if (chatMode === 'live' && !conversationId && !isCreatingConv && wixClient.auth.loggedIn() && member) {
      startLiveChat(getMemberEmail(member) || 'member@hiskingdomdesigns.no', displayName);
    }
  }, [chatMode, conversationId, member]);

  // Clear old conversationId from localStorage to migrate to contactId-based routing
  useEffect(() => {
    try {
      const chatVersion = safeStorage.getItem('hkd-chat-version');
      if (chatVersion !== '3') {
        console.log('Migrating chat to version 3 (REST contactId resolution): clearing old conversationId');
        safeStorage.removeItem('hkd-inbox-conv-id');
        safeStorage.removeItem('hkd-inbox-participant');
        safeStorage.setItem('hkd-chat-version', '3');
        setConversationId(null);
        setChatParticipant(null);
      }
    } catch (e) {
      console.warn('Failed to migrate chat version in localStorage:', e);
    }
  }, []);

  const getMemberEmail = (m) => {
    if (m?.loginEmail) return m.loginEmail;
    const cdEmails = m?.contactDetails?.emails || [];
    if (cdEmails[0]) {
      return typeof cdEmails[0] === 'object' ? cdEmails[0].email : cdEmails[0];
    }
    return m?.contact?.email || m?.contactDetails?.email || '';
  };

  const displayName = member?.contactDetails?.firstName 
    ? `${member.contactDetails.firstName} ${member.contactDetails.lastName || ''}`.trim() 
    : member?.contact?.firstName 
      ? `${member.contact.firstName} ${member.contact.lastName || ''}`.trim() 
      : (member?.profile?.nickname || '');

  const fetchWithTimeout = (promise, ms) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Tidsavbrudd under tilkobling (CORS-blokkering eller nettverksfeil)')), ms);
      promise.then(
        (res) => { clearTimeout(timer); resolve(res); },
        (err) => { clearTimeout(timer); reject(err); }
      );
    });
  };

  const startLiveChat = async (emailToUse, nameToUse) => {
    setIsCreatingConv(true);
    setChatError('');
    try {
      const host = window.location.origin;
      
      const payload = {};
      if (wixClient.auth.loggedIn() && member) {
        payload.memberId = member._id;
        if (member.contactId) {
          payload.contactId = member.contactId;
        } else if (member.contact?._id) {
          payload.contactId = member.contact._id;
        }
      } else if (emailToUse && nameToUse) {
        payload.email = emailToUse;
        payload.name = nameToUse;
      } else {
        const anonId = safeStorage.getItem('hkd-chat-anon-id') || generateUUID();
        safeStorage.setItem('hkd-chat-anon-id', anonId);
        payload.anonymousVisitorId = anonId;
      }

      console.log('Creating/getting conversation in Wix Inbox via API proxy with payload:', payload);
      const apiRes = await fetchWithTimeout(
        fetch(`${host}/api/get-or-create-conversation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(async (r) => {
          if (!r.ok) {
            const errJson = await r.json().catch(() => ({}));
            throw new Error(errJson.error || `HTTP error ${r.status}`);
          }
          return r.json();
        }),
        5000
      );

      if (apiRes && apiRes.conversation) {
        const convId = apiRes.conversation._id;
        const participant = apiRes.conversation.participant;
        setConversationId(convId);
        safeStorage.setItem('hkd-inbox-conv-id', convId);
        if (participant) {
          setChatParticipant(participant);
          safeStorage.setItem('hkd-inbox-participant', JSON.stringify(participant));
        }
        setNeedsContactInfo(false);
        fetchLiveMessages(convId);
      }
    } catch (err) {
      console.error('Failed to start live chat:', err);
      // Intercept and handle 403 Forbidden elegantly
      const errStr = JSON.stringify(err);
      if (err.message?.includes('403') || errStr.includes('403') || err.message?.includes('Forbidden')) {
        setChatError('Tillatelse nektet (403): Appen mangler tillatelsen "Manage Inbox Messages" i Wix Developer Center for His Kingdom Designs.');
      } else {
        setChatError('Kunne ikke starte live chat: ' + (err.message || 'Tilkoblingsfeil'));
      }
    } finally {
      setIsCreatingConv(false);
    }
  };

  const fetchLiveMessages = async (convId) => {
    if (!convId) return;
    try {
      const host = window.location.origin;
      const res = await fetchWithTimeout(
        fetch(`${host}/api/list-messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: convId })
        }).then(async (r) => {
          if (!r.ok) {
            const errJson = await r.json().catch(() => ({}));
            const err = new Error(errJson.error || `HTTP error ${r.status}`);
            err.status = r.status;
            throw err;
          }
          return r.json();
        }),
        5000
      );
      if (res && res.messages) {
        const safeFormatTime = (val) => {
          if (!val) return '';
          try {
            const d = new Date(val);
            if (!isNaN(d.getTime())) {
              return d.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
            }
          } catch (e) {
            console.warn('Failed to format time:', e);
          }
          return '';
        };

        const mapped = res.messages.map(msg => {
          const isUser = msg.direction === 'VISITOR_TO_BUSINESS' || msg.direction === 'PARTICIPANT_TO_BUSINESS';
          let timeStr = msg._createdDate ? safeFormatTime(msg._createdDate) : '';
          if (!timeStr) {
            timeStr = safeFormatTime(new Date());
          }
          
          let text = '';
          if (msg.content?.basic?.items) {
            text = msg.content.basic.items.map(i => i.text).filter(Boolean).join('\n');
          } else if (msg.content?.minimal?.text) {
            text = msg.content.minimal.text;
          } else {
            text = '[Systemmelding/Vedlegg]';
          }

          return {
            id: msg._id,
            sender: isUser ? 'user' : 'assistant',
            text,
            time: timeStr
          };
        });
        setLiveMessages(mapped.reverse());
      }
    } catch (err) {
      console.warn('Failed to fetch messages from Wix Inbox:', err);
      const errStr = (err.message || '').toLowerCase();
      const isStale = 
        err.status === 404 || 
        err.status === 400 || 
        errStr.includes('not found') || 
        errStr.includes('invalid') || 
        errStr.includes('conversation');
      
      if (isStale) {
        console.warn('Resetting invalid Wix Inbox conversationId:', convId);
        setConversationId(null);
        setChatParticipant(null);
        safeStorage.removeItem('hkd-inbox-conv-id');
        safeStorage.removeItem('hkd-inbox-participant');
      }
    }
  };

  // Poll for live chat messages
  useEffect(() => {
    let interval = null;
    if (chatMode === 'live' && conversationId) {
      fetchLiveMessages(conversationId);
      interval = setInterval(() => {
        fetchLiveMessages(conversationId);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [chatMode, conversationId]);

  // Scroll to the top of the newest reply
  const messagesToScroll = chatMode === 'ai' ? assistantMessages : liveMessages;
  useEffect(() => {
    if (isOpen) {
      const scrollTimer = setTimeout(() => {
        const body = chatBodyRef.current;
        if (!body) return;

        const messages = body.querySelectorAll('.hkm-message:not(.typing)');
        if (messages && messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          body.scrollTo({
            top: lastMsg.offsetTop - 10,
            behavior: 'smooth'
          });
        }
      }, 100);
      return () => clearTimeout(scrollTimer);
    }
  }, [messagesToScroll, isAssistantTyping, isLiveTyping, isOpen]);

  // Dynamic DOM text scraper to extract context from active page
  useEffect(() => {
    const contextScraper = setTimeout(() => {
      const pageTitle = document.title || "His Kingdom Designs";
      const h1El = document.querySelector('h1') || document.querySelector('h2');
      const heading = h1El ? h1El.textContent.trim() : pageTitle;

      const mainContainer = document.querySelector('main') || document.body;
      const elements = mainContainer.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span.content-text');
      const textChunks = [];
      const seenTexts = new Set();

      elements.forEach(el => {
        if (
          el.closest('.hkm-chat-panel') ||
          el.closest('.hkm-chat-toggle') ||
          el.closest('header') ||
          el.closest('nav') ||
          el.closest('footer') ||
          el.closest('form') ||
          el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'SELECT'
        ) {
          return;
        }

        const text = el.textContent.trim();
        if (text && text.length > 10 && text.length < 500 && !seenTexts.has(text)) {
          seenTexts.add(text);
          textChunks.push(text);
        }
      });

      const pageText = textChunks.join('\n\n');
      setAssistantContext({
        title: heading,
        content: pageText.substring(0, 2000),
        pageType: location.pathname.includes('/cart') ? 'cart' : (location.pathname.includes('/product') ? 'details' : 'general'),
        url: location.pathname
      });
    }, 400);

    return () => clearTimeout(contextScraper);
  }, [location.pathname, setAssistantContext]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    sendAssistantMessage(inputText.trim());
    setInputText('');
  };

  const sendLiveChatMessage = async (textToSend) => {
    let activeConvId = conversationId;

    if (!activeConvId) {
      setIsCreatingConv(true);
      setChatError('');
      try {
        const host = window.location.origin;
        const payload = {};
        if (wixClient.auth.loggedIn() && member) {
          payload.memberId = member._id;
          if (member.contactId) {
            payload.contactId = member.contactId;
          } else if (member.contact?._id) {
            payload.contactId = member.contact._id;
          }
        } else if (contactEmail && contactName) {
          payload.email = contactEmail;
          payload.name = contactName;
        } else {
          const anonId = safeStorage.getItem('hkd-chat-anon-id') || generateUUID();
          safeStorage.setItem('hkd-chat-anon-id', anonId);
          payload.anonymousVisitorId = anonId;
        }

        console.log('Auto-creating conversation on send with payload:', payload);
        const apiRes = await fetchWithTimeout(
          fetch(`${host}/api/get-or-create-conversation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).then(async (r) => {
            if (!r.ok) {
              const errJson = await r.json().catch(() => ({}));
              throw new Error(errJson.error || `HTTP error ${r.status}`);
            }
            return r.json();
          }),
          5000
        );

        if (apiRes && apiRes.conversation) {
          activeConvId = apiRes.conversation._id;
          const participant = apiRes.conversation.participant;
          setConversationId(activeConvId);
          safeStorage.setItem('hkd-inbox-conv-id', activeConvId);
          if (participant) {
            setChatParticipant(participant);
            safeStorage.setItem('hkd-inbox-participant', JSON.stringify(participant));
          }
          setNeedsContactInfo(false);
        } else {
          throw new Error('Kunne ikke opprette samtale');
        }
      } catch (err) {
        console.error('Failed to auto-create conversation on send:', err);
        setChatError('Kunne ikke starte chat: ' + (err.message || 'Tilkoblingsfeil'));
        setIsCreatingConv(false);
        return;
      }
      setIsCreatingConv(false);
    }

    const getSenderPayload = () => {
      if (chatParticipant) return chatParticipant;
      if (wixClient.auth.loggedIn() && member) {
        const contactId = member.contactId || member.contact?._id;
        if (contactId) return { contactId };
      }
      const anonId = safeStorage.getItem('hkd-chat-anon-id');
      if (anonId) return { anonymousVisitorId: anonId };
      return undefined;
    };

    const optMsg = {
      id: `msg-user-opt-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
    };
    setLiveMessages(prev => [...prev, optMsg]);

    try {
      const messagePayload = {
        direction: 'PARTICIPANT_TO_BUSINESS',
        visibility: 'BUSINESS_AND_PARTICIPANT',
        sender: getSenderPayload(),
        content: {
          basic: {
            items: [
              {
                text: textToSend
              }
            ]
          }
        }
      };
      const host = window.location.origin;
      await fetchWithTimeout(
        fetch(`${host}/api/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: activeConvId, message: messagePayload })
        }).then(async (r) => {
          if (!r.ok) {
            const errJson = await r.json().catch(() => ({}));
            const err = new Error(errJson.error || `HTTP error ${r.status}`);
            err.status = r.status;
            err.details = errJson.details || errJson.error;
            throw err;
          }
          return r.json();
        }),
        5000
      );
      
      // Refresh messages so the user message has its real Wix status
      fetchLiveMessages(activeConvId);

      // Trigger local AI response and send to Wix Inbox
      setIsLiveTyping(true);
      setTimeout(async () => {
        try {
          const aiReply = generateAiResponseText(textToSend);
          const aiMessagePayload = {
            direction: 'BUSINESS_TO_PARTICIPANT',
            visibility: 'BUSINESS_AND_PARTICIPANT',
            content: {
              basic: {
                items: [
                  {
                    text: aiReply
                  }
                ]
              }
            }
          };

          await fetchWithTimeout(
            fetch(`${host}/api/send-message`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ conversationId: activeConvId, message: aiMessagePayload })
            }).then(async (r) => {
              if (!r.ok) {
                const errJson = await r.json().catch(() => ({}));
                const err = new Error(errJson.error || `HTTP error ${r.status}`);
                err.status = r.status;
                err.details = errJson.details || errJson.error;
                throw err;
              }
              return r.json();
            }),
            5000
          );
          
          fetchLiveMessages(activeConvId);
        } catch (aiErr) {
          console.error('Failed to send automated AI response to Wix Inbox:', aiErr);
        } finally {
          setIsLiveTyping(false);
        }
      }, 1500);

    } catch (err) {
      console.error('Failed to send message to Wix Inbox:', err);
      const errStr = (err.message || '').toLowerCase();
      const errDetails = (JSON.stringify(err.details) || '').toLowerCase();
      const isStaleConv = 
        err.status === 404 || 
        err.status === 400 ||
        errStr.includes('not found') ||
        errStr.includes('invalid') ||
        errStr.includes('conversation') ||
        errDetails.includes('not_found') ||
        errDetails.includes('invalid');

      if (isStaleConv) {
        console.warn('Resetting invalid/stale Wix Inbox conversationId on send failure:', activeConvId);
        setConversationId(null);
        setChatParticipant(null);
        safeStorage.removeItem('hkd-inbox-conv-id');
        safeStorage.removeItem('hkd-inbox-participant');
      }
    }
  };

  const handleLiveMessageSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');
    await sendLiveChatMessage(textToSend);
  };

  return (
    <div className="fixed bottom-6 right-4 z-[99] font-sans flex flex-col items-end pointer-events-none">
      
      {/* Stylesheet enforcing Chrome Jitter Fix / Layer Isolation & Offset Context */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hkm-chat-panel {
          transform: translateZ(0) !important;
          backface-visibility: hidden !important;
        }
        .hkm-chat-panel input {
          transform: translateZ(0) !important;
          backface-visibility: hidden !important;
        }
        .hkm-chat-body {
          position: relative !important;
        }
        .hkm-chat-toggle {
          background: linear-gradient(135deg, #d17d39 0%, #bd4f2a 100%) !important;
          transform: translateZ(0) !important;
          backface-visibility: hidden !important;
          transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        .hkm-chat-toggle:hover {
          transform: translateZ(0) scale(1.05) !important;
          box-shadow: 0 10px 20px rgba(209, 125, 57, 0.3) !important;
        }
        .hkm-chat-toggle:active {
          transform: translateZ(0) scale(0.95) !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="hkm-chat-panel bg-white flex flex-col overflow-hidden fixed inset-0 w-full h-[100dvh] md:h-[500px] md:w-[360px] md:inset-auto md:bottom-24 md:right-4 md:rounded-2xl md:shadow-2xl md:border md:border-outline-variant z-[999] mb-0 pointer-events-auto"
          >
            {/* Header - Mørkeblå farge (#1B4965) */}
            <div className="bg-[#1B4965] text-white px-5 py-4 flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 flex items-center justify-center overflow-hidden shrink-0">
                  <img src="/logo-hkm.png" alt="His Kingdom Designs Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t('chat.title')}</h3>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 text-white/80 hover:text-white transition-colors rounded-full"
              >
                <span className="material-symbols-outlined text-lg select-none">close</span>
              </button>
            </div>

            {/* Reset Conversation Bar for Live Chat */}
            {chatMode === 'live' && conversationId && !chatError && !needsContactInfo && (
              <div className="bg-orange-50/70 border-b border-[#d17d39]/10 px-4 py-2 text-[10px] text-secondary flex items-center justify-between select-none shrink-0 pointer-events-auto">
                <span className="flex items-center gap-1.5 font-medium text-onyx/70">
                  <span className="w-1.5 h-1.5 bg-[#d17d39] rounded-full"></span>
                  Aktiv samtale (Wix Inbox)
                </span>
                <button 
                  type="button"
                  onClick={() => {
                    if (window.confirm(language === 'en' ? 'Are you sure you want to start a new conversation?' : (language === 'es' ? '¿Estás seguro de que deseas iniciar una nueva conversación?' : 'Er du sikker på at du vil starte en ny samtale? Dette vil tømme samtalen i nettleseren din.'))) {
                      setConversationId(null);
                      setChatParticipant(null);
                      setLiveMessages([]);
                      safeStorage.removeItem('hkd-inbox-conv-id');
                      safeStorage.removeItem('hkd-inbox-participant');
                      if (!wixClient.auth.loggedIn()) {
                        setNeedsContactInfo(true);
                      } else {
                        startLiveChat(getMemberEmail(member) || 'member@hiskingdomdesigns.no', displayName);
                      }
                    }
                  }}
                  className="text-terracotta hover:underline font-bold transition-all active:scale-95 cursor-pointer"
                >
                  {language === 'en' ? 'Start new chat' : (language === 'es' ? 'Iniciar nueva' : 'Start ny samtale')}
                </button>
              </div>
            )}

            {/* Chat Body - Scroll with Offset Context */}
            <div 
              ref={chatBodyRef}
              className="hkm-chat-body flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50 custom-scrollbar"
            >
              {chatMode === 'ai' ? (
                <>
                  {assistantMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`hkm-message flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
                    >
                      {msg.sender !== 'user' && (
                        <span className="material-symbols-outlined text-terracotta text-lg mt-0.5 shrink-0 self-start">
                          support_agent
                        </span>
                      )}
                      <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.sender === 'user' 
                            ? 'bg-terracotta text-white rounded-tr-none' 
                            : 'bg-white text-onyx border border-outline-variant/60 rounded-tl-none'
                        }`}>
                          {renderRichText(msg.id === 'msg-init-1' ? t('chat.welcome') : msg.text, msg.sender === 'assistant')}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-secondary select-none font-semibold">
                          <span className="font-mono">{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing dots */}
                  {isAssistantTyping && (
                    <div className="hkm-message typing flex gap-2 mr-auto justify-start max-w-[85%]">
                      <span className="material-symbols-outlined text-terracotta text-lg mt-0.5 shrink-0 self-start">
                        support_agent
                      </span>
                      <div className="flex flex-col items-start">
                        <div className="px-4 py-3 rounded-2xl bg-white border border-outline-variant/60 rounded-tl-none flex items-center shadow-sm">
                          <div className="hkm-typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : chatError ? (
                /* Elegant error fallback */
                <div className="p-6 bg-white rounded-2xl border border-red-100 space-y-4 shadow-sm text-left animate-fade-in shrink-0">
                  <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl select-none">error_outline</span>
                  </div>
                  <h4 className="font-bold text-xs text-onyx">{t('chat.connectionErrorTitle')}</h4>
                  <p className="text-[11px] text-secondary leading-relaxed">
                    {chatError.includes('403') ? (
                      t('chat.permissionError')
                    ) : (
                      chatError
                    )}
                  </p>
                  <div className="text-[11px] text-secondary leading-relaxed font-semibold">
                    {renderRichText(t('chat.emailContactDesc'), true)}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setChatError('');
                      if (!wixClient.auth.loggedIn() && !conversationId) {
                        setNeedsContactInfo(true);
                      } else {
                        startLiveChat(getMemberEmail(member) || 'member@hiskingdomdesigns.no', displayName);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-[#d17d39] to-[#bd4f2a] text-white font-label-md text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    {language === 'en' ? 'Try again' : (language === 'es' ? 'Intentar de nuevo' : 'Prøv igjen')}
                  </button>
                </div>
              ) : needsContactInfo ? (
                /* Guest contact form for Live Chat */
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    startLiveChat(contactEmail, contactName);
                  }}
                  className="p-4 bg-white rounded-2xl border border-outline-variant/30 space-y-4 shadow-sm text-left"
                  style={{ display: 'block' }}
                >
                  <h4 className="font-bold text-xs text-onyx mb-1">{t('chat.liveChatTitle')}</h4>
                  <p className="text-[11px] text-secondary leading-relaxed mb-4">
                    {t('chat.guestFormDesc')}
                  </p>
                  
                  <div className="block">
                    <label className="block text-[9px] font-semibold text-onyx uppercase mb-1">{t('chat.yourName')}</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="F.eks. Thomas Knutsen"
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1B4965] text-onyx"
                    />
                  </div>

                  <div className="block mt-3">
                    <label className="block text-[9px] font-semibold text-onyx uppercase mb-1">{t('chat.emailAddress')}</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="din@epost.no"
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1B4965] text-onyx"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingConv}
                    className="w-full bg-gradient-to-r from-[#d17d39] to-[#bd4f2a] text-white font-label-md text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    {isCreatingConv ? t('chat.startingConversation') : t('chat.startConversation')}
                  </button>
                </form>
              ) : isCreatingConv ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 border-3 border-[#1B4965] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-secondary font-semibold">{t('chat.startingConversation')}</p>
                </div>
              ) : (
                /* Live Chat Messages list */
                <>
                  {liveMessages.length === 0 ? (
                    <div className="text-center py-12 text-secondary/60 text-xs font-medium space-y-1">
                      <span className="material-symbols-outlined text-3xl opacity-40">chat</span>
                      <p>{t('chat.convStarted')}</p>
                      <p>{t('chat.convStartedDesc')}</p>
                    </div>
                  ) : (
                    liveMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`hkm-message flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
                      >
                        {msg.sender !== 'user' && (
                          <span className="material-symbols-outlined text-[#1B4965] text-lg mt-0.5 shrink-0 self-start">
                            support_agent
                          </span>
                        )}
                        <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.sender === 'user' 
                              ? 'bg-terracotta text-white rounded-tr-none' 
                              : 'bg-white text-onyx border border-outline-variant/60 rounded-tl-none'
                          }`}>
                            <div className="text-sm select-text">
                              {renderRichText(msg.text, msg.sender !== 'user')}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-secondary select-none font-semibold">
                            <span className="font-mono">{msg.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Typing dots for Live Chat AI responder */}
                  {isLiveTyping && (
                    <div className="hkm-message typing flex gap-2 mr-auto justify-start max-w-[85%]">
                      <span className="material-symbols-outlined text-[#1B4965] text-lg mt-0.5 shrink-0 self-start">
                        support_agent
                      </span>
                      <div className="flex flex-col items-start">
                        <div className="px-4 py-3 rounded-2xl bg-white border border-outline-variant/60 rounded-tl-none flex items-center shadow-sm">
                          <div className="hkm-typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Quick Replies chips bar (Byrå-UX feature) */}
            {(!needsContactInfo || chatMode === 'ai') && !chatError && (
              <div className="px-3 pt-2 pb-1 bg-slate-50 flex gap-2 overflow-x-auto select-none no-scrollbar shrink-0 scrollbar-none border-t border-outline-variant/30">
                {QUICK_REPLIES.map((reply, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (chatMode === 'ai') {
                        sendAssistantMessage(reply.text);
                      } else {
                        sendLiveChatMessage(reply.text);
                      }
                    }}
                    className="flex-shrink-0 bg-white border border-outline-variant/60 hover:border-[#1B4965] hover:text-[#1B4965] text-onyx text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95 shadow-sm cursor-pointer flex items-center gap-1"
                  >
                    {reply.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form - Strict block to prevent jitter */}
            {(!needsContactInfo || chatMode === 'ai') && !chatError && (
              <form 
                onSubmit={chatMode === 'ai' ? handleSubmit : handleLiveMessageSubmit}
                className="p-3 bg-white border-t border-outline-variant shrink-0"
                style={{ display: 'block' }}
              >
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder={chatMode === 'ai' ? t('chat.aiPlaceholder') : t('chat.livePlaceholder')}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isCreatingConv || (chatMode === 'live' && needsContactInfo)}
                    className="w-full bg-slate-50 border border-outline-variant rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1B4965] focus:border-[#1B4965] transition-all font-medium text-onyx"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isCreatingConv}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#1B4965] hover:text-[#1B4965]/80 disabled:text-secondary/40 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`hkm-chat-toggle w-14 h-14 flex items-center justify-center text-white shadow-xl hover:shadow-2xl cursor-pointer pointer-events-auto ${isOpen ? 'hidden md:flex' : 'flex'}`}
        style={{
          borderRadius: '9999px'
        }}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>
    </div>
  );
}
