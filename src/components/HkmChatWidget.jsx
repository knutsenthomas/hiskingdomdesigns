import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { notifySlackChatMessage } from '@/lib/incidentAlerts';

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
        return (
          <a
            key={index}
            href={linkUrl}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className={`underline font-semibold transition-colors ${
              isAssistant 
                ? 'text-[#bd4f2a] hover:text-[#d17d39]' 
                : 'text-white hover:text-white/80'
            } pointer-events-auto`}
          >
            {linkText}
          </a>
        );
      }
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      const content = token.slice(2, -2);
      return (
        <strong key={index} className={`font-bold ${isAssistant ? 'text-[#bd4f2a]' : 'text-white'}`}>
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
  
  const flushList = (key) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={key} className="list-none space-y-1.5 my-2 pl-1">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Header block (### Heading)
    if (trimmed.startsWith('### ')) {
      flushList(`list-before-h-${index}`);
      const headingText = trimmed.slice(4);
      renderedElements.push(
        <h3 key={`h-${index}`} className={`text-base font-bold mt-3 mb-1.5 first:mt-0 flex items-center gap-1.5 leading-snug ${isAssistant ? 'text-[#bd4f2a]' : 'text-white'}`}>
          {parseInlineStyles(headingText, isAssistant)}
        </h3>
      );
    }
    // Bullet point (• or -)
    else if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      const bulletText = trimmed.slice(2);
      listItems.push(
        <li key={`li-${index}`} className={`flex items-start gap-2 text-sm leading-relaxed ${isAssistant ? 'text-onyx/75' : 'text-white/90'}`}>
          <span className={`${isAssistant ? 'text-[#bd4f2a]' : 'text-white'} shrink-0 mt-1 select-none`}>•</span>
          <span className="flex-1">{parseInlineStyles(bulletText, isAssistant)}</span>
        </li>
      );
    }
    // Numbered list item
    else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      const num = match[1];
      const bulletText = match[2];
      listItems.push(
        <li key={`li-${index}`} className={`flex items-start gap-2 text-sm leading-relaxed ${isAssistant ? 'text-onyx/75' : 'text-white/90'}`}>
          <span className={`${isAssistant ? 'text-[#bd4f2a]' : 'text-white'} shrink-0 font-bold text-xs mt-0.5 select-none`}>{num}.</span>
          <span className="flex-1">{parseInlineStyles(bulletText, isAssistant)}</span>
        </li>
      );
    }
    // Empty spacing
    else if (trimmed === '') {
      flushList(`list-before-blank-${index}`);
      renderedElements.push(<div key={`blank-${index}`} className="h-1.5" />);
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

// Safe localStorage wrapper
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

// Robust UUID v4 generator
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

const isOutsideOpeningHours = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Søndag, 6 = Lørdag, 1-5 = Man-Fre
  const hour = now.getHours();
  
  // Stengt i helger
  if (day === 0 || day === 6) return true;
  // Stengt før 08:00 og etter 16:00
  if (hour < 8 || hour >= 16) return true;
  
  return false;
};

const SHORTCUTS = [
  {
    command: '/hei',
    label: 'Velkomst',
    description: 'Standard velkomsthilsen',
    text: 'Velkommen til His Kingdom Designs. Hvordan kan vi hjelpe deg i dag?'
  },
  {
    command: '/frakt',
    label: 'Frakt',
    description: 'Leveringstid og fraktsatser (ca. 2 uker)',
    text: 'Hei! Vi pakker og sender bestillinger fortløpende. Siden produktene våre produseres på bestilling (print-on-demand), er normal total leveringstid ca. 2 uker (produksjonstid 1-2 uker pluss frakt). Du vil motta en bekreftelse på e-post med sporingsinfo så snart pakken din er på vei! 📦'
  },
  {
    command: '/retur',
    label: 'Retur',
    description: 'Hvordan returnere eller bytte',
    text: 'Hei! Det er helt i orden å ombestemme seg eller bytte størrelse. Du har 14 dagers angrerett fra du mottar varen. Varen må være ubrukt og i original stand. Send oss en melding her eller på e-post med ordrenummeret ditt, så sender vi deg instruksjoner for retur. 🔄'
  },
  {
    command: '/vask',
    label: 'Vaskeråd',
    description: 'Hvordan vaske klærne best',
    text: 'Hei! For at trykket og passformen på klærne skal holde seg penest mulig over tid, anbefaler vi å vaske plaggene på 30 grader med innsiden ut. Unngå tørketrommel og ikke stryk direkte på selve trykket. 👕✨'
  },
  {
    command: '/gave',
    label: 'Gave',
    description: 'Sende som gave direkte til mottaker',
    text: 'Hei! Så koselig at du vil gi en gave! Du kan fint bestille og få pakken sendt direkte til mottakeren. Da legger du bare inn din egen adresse under "Fakturaadresse", og mottakerens adresse under "Leveringsadresse" i kassen. Vi legger selvfølgelig ikke ved kvittering med pris i pakken når det sendes som gave. 🎁'
  },
  {
    command: '/feil',
    label: 'Reklamasjon',
    description: 'Feil eller skade på varen',
    text: 'Hei! Uff, det var kjempetrist å høre. Slik skal det absolutt ikke være, og vi vil ordne opp med en gang! Kunne du sendt oss et bilde av skaden og oppgitt ordrenummeret ditt her (eller til vår e-post post@hiskingdomministry.no)? Da sender vi deg et nytt produkt uten ekstra kostnad. 🤍'
  },
  {
    command: '/takk',
    label: 'Takk',
    description: 'Avslutt samtale / takk for hjelpen',
    text: 'Da sier vi det! Da håper jeg du blir kjempefornøyd med produktene. Bare ta kontakt igjen om det skulle være noe mer senere. Ønsker deg en kjempefin og velsignet dag videre! 🌟'
  }
];

export default function HkmChatWidget() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const { isLoggedIn, member } = useApp();
  
  const chatBodyRef = useRef(null);
  const inputRef = useRef(null);
  const emailInputRef = useRef(null);
  const seenMessageIdsRef = useRef(new Set());

  const getInitialGreeting = () => {
    if (language === 'en') return 'Welcome to His Kingdom Designs. How can we help you today?';
    if (language === 'es') return '¡Bienvenido a His Kingdom Designs! ¿Cómo podemos ayudarte hoy?';
    return 'Velkommen til His Kingdom Designs. Hvordan kan vi hjelpe deg i dag?';
  };

  const [messages, setMessages] = useState(() => [
    {
      id: 'msg-init-welcome',
      sender: 'assistant',
      text: getInitialGreeting(),
      time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);
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

  const [userEmail, setUserEmail] = useState(() => {
    return safeStorage.getItem('hkd-chat-user-email') || '';
  });
  const [userName, setUserName] = useState(() => {
    return safeStorage.getItem('hkd-chat-user-name') || '';
  });
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailSubmittedSuccess, setEmailSubmittedSuccess] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);

  // Purge any old anonymous conversations that lock the Wix Owner App
  useEffect(() => {
    const isContactConv = safeStorage.getItem('hkd-chat-is-contact-conv') === 'true';
    if (!isContactConv && !isLoggedIn && !userEmail) {
      safeStorage.removeItem('hkd-inbox-conv-id');
      safeStorage.removeItem('hkd-inbox-participant');
      setConversationId(null);
      setChatParticipant(null);
    }
  }, [isLoggedIn, userEmail]);

  const QUICK_REPLIES = [
    { text: t('chat.quickReply.deliveryTime'), label: t('chat.quickReply.deliveryLabel'), actionRequired: false },
    { text: t('chat.quickReply.returns'), label: t('chat.quickReply.returnsLabel'), actionRequired: false },
    { text: t('chat.quickReply.freeShipping'), label: t('chat.quickReply.freeShippingLabel'), actionRequired: false },
    { text: t('chat.quickReply.sizes'), label: t('chat.quickReply.sizesLabel'), actionRequired: false },
    { text: t('chat.quickReply.wash'), label: t('chat.quickReply.washLabel'), actionRequired: false },
    { text: t('chat.quickReply.custom'), label: t('chat.quickReply.customLabel'), actionRequired: true },
    { text: t('chat.quickReply.about'), label: t('chat.quickReply.aboutLabel'), actionRequired: false }
  ];

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

  // Helper with timeout
  const fetchWithTimeout = (promise, ms = 10000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Tidsavbrudd')), ms);
      promise.then(
        (res) => { clearTimeout(timer); resolve(res); },
        (err) => { clearTimeout(timer); reject(err); }
      );
    });
  };

  // Ensure Wix Conversation exists with CRM contact so Wix Owner App unlocks replies
  const ensureConversation = async (explicitEmail = null, explicitName = null) => {
    const emailToUse = explicitEmail || userEmail || (isLoggedIn && member ? getMemberEmail(member) : null);
    const nameToUse = explicitName || userName || displayName || (emailToUse ? emailToUse.split('@')[0] : null);

    const isContactConv = safeStorage.getItem('hkd-chat-is-contact-conv') === 'true';
    if (conversationId && !conversationId.startsWith('conv_') && isContactConv && !explicitEmail) {
      return conversationId;
    }

    try {
      const host = window.location.origin;
      const payload = {};
      if (isLoggedIn && member) {
        payload.memberId = member._id;
        if (member.contactId) {
          payload.contactId = member.contactId;
        } else if (member.contact?._id) {
          payload.contactId = member.contact._id;
        }
        if (emailToUse) payload.email = emailToUse;
        if (nameToUse) payload.name = nameToUse;
      } else if (emailToUse) {
        payload.email = emailToUse;
        if (nameToUse) payload.name = nameToUse;
      } else {
        const anonId = safeStorage.getItem('hkd-chat-anon-id') || generateUUID();
        safeStorage.setItem('hkd-chat-anon-id', anonId);
        payload.anonymousVisitorId = anonId;
      }

      const res = await fetchWithTimeout(
        fetch(`${host}/api/get-or-create-conversation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(r => r.ok ? r.json() : null),
        8000
      );

      if (res && res.conversation) {
        const convId = res.conversation._id || res.conversation.id;
        const participant = res.conversation.participant;
        setConversationId(convId);
        safeStorage.setItem('hkd-inbox-conv-id', convId);
        if (emailToUse || isLoggedIn) {
          safeStorage.setItem('hkd-chat-is-contact-conv', 'true');
        }
        if (participant) {
          setChatParticipant(participant);
          safeStorage.setItem('hkd-inbox-participant', JSON.stringify(participant));
        }
        return convId;
      }
    } catch (e) {
      console.warn('[HKD Chat] Wix conversation creation warning:', e);
    }
    return null;
  };

  const handleSaveEmail = async (e) => {
    if (e) e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;
    const cleanEmail = emailInput.trim().toLowerCase();
    setIsSavingEmail(true);
    try {
      safeStorage.setItem('hkd-chat-user-email', cleanEmail);
      setUserEmail(cleanEmail);
      setEmailSubmittedSuccess(true);

      const activeConvId = await ensureConversation(cleanEmail);

      // Dispatch a notification message into Wix Inbox so Thomas gets a push notification with the customer's email!
      if (activeConvId) {
        const host = window.location.origin;
        await fetch(`${host}/api/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: activeConvId,
            message: {
              direction: 'PARTICIPANT_TO_BUSINESS',
              visibility: 'BUSINESS_AND_PARTICIPANT',
              content: {
                basic: {
                  items: [{ text: `📬 Kunden oppga e-postadresse for svar: ${cleanEmail}` }]
                }
              }
            }
          })
        });
      }

      notifySlackChatMessage({
        userMessage: `[Kunden la igjen e-post for svar]: ${cleanEmail}`,
        customerEmail: cleanEmail,
        customerName: cleanEmail.split('@')[0],
        mode: 'live',
        conversationId: activeConvId || conversationId
      });
    } catch (err) {
      console.warn('[HKD Chat] Error saving email:', err);
    } finally {
      setIsSavingEmail(false);
    }
  };

  // Send message handler (Hybrid: Instant UI + Wix push + Live Sync)
  const handleSendMessage = async (textToSend, options = {}) => {
    if (!textToSend || !textToSend.trim()) return;
    const cleanText = textToSend.trim();

    const skipWixPush = options.skipWixPush === true;
    const isQuickReply = options.isQuickReply === true;

    // Check pre-chat email requirement when message is pushed to Wix
    let senderEmail = userEmail || (isLoggedIn && member ? getMemberEmail(member) : '');
    let senderName = userName || displayName || '';

    if (!skipWixPush && !isLoggedIn && !senderEmail) {
      const inputMail = emailInput.trim().toLowerCase();
      if (!inputMail || !inputMail.includes('@') || !inputMail.includes('.')) {
        setEmailError(
          language === 'en'
            ? 'Please enter your email above so we can reply.'
            : (language === 'es'
              ? 'Por favor ingresa tu email arriba para recibir respuesta.'
              : 'Vennligst oppgi din e-postadresse ovenfor så vi kan svare deg.')
        );
        if (emailInputRef.current) {
          emailInputRef.current.focus();
        }
        return;
      }
      senderEmail = inputMail;
      senderName = nameInput.trim() || senderEmail.split('@')[0];
      safeStorage.setItem('hkd-chat-user-email', senderEmail);
      if (nameInput.trim()) safeStorage.setItem('hkd-chat-user-name', nameInput.trim());
      setUserEmail(senderEmail);
      setUserName(senderName);
      setEmailError('');
    }

    // 1. Optimistically append user message
    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: cleanText,
      time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setHasUserSentMessage(true);

    // 2. Dispatch to Wix Inbox & Slack in background
    if (!skipWixPush) {
      (async () => {
        try {
          const activeConvId = await ensureConversation(senderEmail, senderName);
          if (activeConvId) {
            const host = window.location.origin;
            const senderPayload = chatParticipant || (isLoggedIn && member ? { contactId: member.contactId || member.contact?._id } : undefined);
            
            const emailForOwner = senderEmail || (isLoggedIn && member ? getMemberEmail(member) : null);
            const wixMessageText = emailForOwner 
              ? `${cleanText}\n\n[Svar til kunden på e-post: ${emailForOwner}]`
              : cleanText;

            await fetch(`${host}/api/send-message`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                conversationId: activeConvId,
                message: {
                  direction: 'PARTICIPANT_TO_BUSINESS',
                  visibility: 'BUSINESS_AND_PARTICIPANT',
                  sender: senderPayload,
                  content: {
                    basic: {
                      items: [{ text: wixMessageText }]
                    }
                  }
                }
              })
            });

            // Notify Slack channel about the customer inquiry in real-time
            notifySlackChatMessage({
              userMessage: cleanText,
              customerEmail: senderEmail || (isLoggedIn && member ? getMemberEmail(member) : null),
              customerName: senderName || displayName || (senderEmail ? senderEmail.split('@')[0] : null),
              mode: 'live',
              conversationId: activeConvId
            });
          }
        } catch (err) {
          console.warn('[HKD Chat] Wix push dispatch warning:', err);
        }
      })();
    }

    // 3. ONLY provide answer if user clicked a quick-reply FAQ chip!
    // Free-text messages typed by visitors go directly to Thomas without ANY automated bot reply.
    if (isQuickReply) {
      setIsTyping(true);
      setTimeout(() => {
        let answer = '';
        const lower = cleanText.toLowerCase();
        if (lower.includes('levering') || lower.includes('frakt') || lower.includes('porto')) {
          answer = 'Hei! Normal leveringstid er ca. 2 uker (produksjon 1-2 uker + frakt). Du mottar sporingslenke på e-post så snart pakken din er sendt! 📦';
        } else if (lower.includes('retur') || lower.includes('bytte')) {
          answer = 'Hei! Vi har 14 dagers åpent kjøp og enkel retur/bytte. Varen må være ubrukt og i original stand. Ta kontakt her eller på e-post, så ordner vi det! 🔄';
        } else if (lower.includes('gratis')) {
          answer = 'Hei! Frakten beregnes automatisk i kassen basert på vekt og volum (fra 39 kr). 🚚';
        } else if (lower.includes('størrelse') || lower.includes('storrelse')) {
          answer = 'Hei! Våre klær er normale i størrelsen (regular fit). Hvis du ønsker en mer romslig eller oversized look, anbefaler vi å gå opp én størrelse. 👕';
        } else if (lower.includes('vask')) {
          answer = 'Hei! For at trykket skal holde seg penest mulig over tid, anbefaler vi vask på 30 grader med innsiden ut. Unngå tørketrommel og stryking rett på trykket. ✨';
        } else if (lower.includes('om oss') || lower.includes('om his kingdom')) {
          answer = 'His Kingdom Designs lager kristne klær, plakater og gaver med budskap som peker på Jesus og sprer håp. 🕊️';
        } else {
          answer = 'Takk for spørsmålet! Thomas svarer deg personlig så snart han er tilgjengelig. Legg gjerne igjen e-postadressen din, så får du svar direkte.';
        }

        setMessages(prev => [
          ...prev,
          {
            id: `faq-${Date.now()}`,
            sender: 'assistant',
            text: answer,
            time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsTyping(false);
      }, 400);
    }
  };

  const handleResetConversation = () => {
    safeStorage.removeItem('hkd-inbox-conv-id');
    safeStorage.removeItem('hkd-inbox-participant');
    safeStorage.removeItem('hkd-chat-is-contact-conv');
    setConversationId(null);
    setChatParticipant(null);
    seenMessageIdsRef.current.clear();
    setHasUserSentMessage(false);
    setEmailSubmittedSuccess(false);
    setEmailError('');
    setMessages([
      {
        id: 'msg-init-welcome',
        sender: 'assistant',
        text: getInitialGreeting(),
        time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Poll for replies sent by Thomas from the Wix Owner app on his phone
  useEffect(() => {
    if (!isOpen || !conversationId) return;

    const pollReplies = async () => {
      try {
        const host = window.location.origin;
        const res = await fetch(`${host}/api/list-messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId })
        });
        if (!res.ok) return;
        const data = await res.json();
        const serverMessages = data.messages || [];

        serverMessages.forEach(msg => {
          if (msg.direction === 'BUSINESS_TO_PARTICIPANT' && !seenMessageIdsRef.current.has(msg._id)) {
            seenMessageIdsRef.current.add(msg._id);
            const replyText = msg.content?.basic?.items?.map(i => i.text).join('\n') || msg.content?.minimal?.text;
            if (replyText) {
              // Strictly filter out any historical or bot-generated text stored in Wix Inbox
              const isBotArtifact = 
                replyText.includes('Her er produkter jeg fant') ||
                replyText.includes('Vi ønsker å spre Guds ord') ||
                replyText.includes('Hva kan jeg hjelpe deg med?') ||
                replyText.includes('His Kingdom Designs\n\nVi ønsker') ||
                replyText.includes('Spesialbestilling?') ||
                replyText.includes('Du kan spørre meg om:') ||
                replyText.startsWith('### 🛡️');

              if (!isBotArtifact) {
                setMessages(prev => [
                  ...prev,
                  {
                    id: msg._id,
                    sender: 'owner',
                    name: 'Thomas (His Kingdom Designs)',
                    text: replyText,
                    time: new Date(msg._createdDate || Date.now()).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }
            }
          }
        });
      } catch (e) {
        // Non-blocking
      }
    };

    pollReplies();
    const interval = setInterval(pollReplies, 5000);
    return () => clearInterval(interval);
  }, [isOpen, conversationId]);

  // Scroll to newest message
  useEffect(() => {
    if (isOpen) {
      const scrollTimer = setTimeout(() => {
        const body = chatBodyRef.current;
        if (!body) return;
        body.scrollTo({
          top: body.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
      return () => clearTimeout(scrollTimer);
    }
  }, [messages.length, isTyping, isOpen]);

  return (
    <div className="fixed bottom-6 right-4 z-[99] font-sans flex flex-col items-end pointer-events-none">
      
      {/* Stylesheet enforcing warm orange styling & jitter fix */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hkm-chat-panel {
          transform: translateZ(0) !important;
          backface-visibility: hidden !important;
        }
        .hkm-chat-toggle {
          background: linear-gradient(135deg, #d17d39 0%, #bd4f2a 100%) !important;
          transform: translateZ(0) !important;
          backface-visibility: hidden !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        .hkm-chat-toggle:hover {
          transform: translateZ(0) scale(1.06) !important;
          box-shadow: 0 12px 28px rgba(209, 125, 57, 0.45) !important;
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
        @keyframes hkmDotPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .hkm-typing-dot {
          animation: hkmDotPulse 1.4s infinite ease-in-out both;
        }
      `}} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="hkm-chat-panel bg-white flex flex-col overflow-hidden fixed inset-0 w-full h-[100dvh] md:h-[520px] md:w-[360px] md:inset-auto md:bottom-24 md:right-4 md:rounded-2xl md:shadow-2xl md:border md:border-black/10 z-[999] mb-0 pointer-events-auto"
          >
            {/* Header - Oransje gradient (#d17d39 til #bd4f2a) */}
            <div className="bg-gradient-to-r from-[#d17d39] to-[#bd4f2a] text-white px-5 py-4 flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  <img src="/logo-hkm.png" alt="His Kingdom Designs Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight text-white">His Kingdom Designs</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/90">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    <span>{language === 'en' ? 'Active now' : (language === 'es' ? 'En línea' : 'Aktiv nå')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleResetConversation}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/15 text-white transition-colors rounded-full cursor-pointer"
                  title={language === 'en' ? 'Start new conversation' : (language === 'es' ? 'Nueva conversación' : 'Start ny samtale')}
                  aria-label="Start ny samtale"
                >
                  <span className="material-symbols-outlined text-lg select-none">refresh</span>
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/15 text-white transition-colors rounded-full cursor-pointer"
                  aria-label="Lukk chat"
                >
                  <span className="material-symbols-outlined text-lg select-none">close</span>
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div 
              ref={chatBodyRef}
              className="flex-grow p-4 overflow-y-auto space-y-3.5 bg-slate-50 custom-scrollbar"
            >
              {/* Outside opening hours offline alert */}
              {isOutsideOpeningHours() && (
                <div className="bg-orange-50/90 border border-orange-200/60 rounded-xl p-3 text-[11px] text-[#bd4f2a] leading-relaxed flex items-start gap-2.5 shadow-xs mb-3 select-none shrink-0">
                  <span className="material-symbols-outlined text-[#d17d39] text-base shrink-0 mt-0.5 select-none">
                    schedule
                  </span>
                  <div>
                    <strong className="text-onyx block mb-0.5 font-bold">
                      {language === 'en' ? 'We are currently offline' : (language === 'es' ? 'Estamos fuera de horario' : 'Vi er ikke tilstede nå')}
                    </strong>
                    {language === 'en' 
                      ? 'Our customer support hours are Mon–Fri 08:00–16:00. You can still send a message, and we will reply as soon as we are back! 😊' 
                      : (language === 'es' 
                        ? 'Nuestro horario de atención es de lunes a viernes de 08:00 a 16:00. ¡Aún puedes dejarnos un mensaje y te responderemos pronto! 😊' 
                        : 'Våre åpningstider for kundeservice er mandag–fredag 08:00–16:00. Du kan fortsatt sende oss meldinger, så svarer vi deg her eller på e-post så fort vi er tilbake! 😊')}
                  </div>
                </div>
              )}

              {/* Message bubbles */}
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
                >
                  {msg.sender !== 'user' && (
                    <span className="material-symbols-outlined text-[#d17d39] text-lg mt-0.5 shrink-0 self-start select-none">
                      {msg.sender === 'owner' ? 'account_circle' : 'support_agent'}
                    </span>
                  )}
                  <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.sender === 'owner' && (
                      <span className="text-[10px] font-bold text-[#bd4f2a] mb-0.5 px-1">
                        {msg.name || 'Thomas (His Kingdom Designs)'}
                      </span>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-r from-[#d17d39] to-[#bd4f2a] text-white rounded-tr-none' 
                        : msg.sender === 'owner'
                          ? 'bg-amber-50/80 text-onyx border border-amber-200/70 rounded-tl-none'
                          : 'bg-white text-onyx border border-black/8 rounded-tl-none'
                    }`}>
                      <div className="select-text">
                        {renderRichText(msg.text, msg.sender !== 'user')}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-secondary/70 select-none font-medium">
                      <span className="font-mono">{msg.time}</span>
                    </div>
                  </div>
                </div>
              ))}
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2 mr-auto justify-start max-w-[85%]">
                  <span className="material-symbols-outlined text-[#d17d39] text-lg mt-0.5 shrink-0 self-start select-none">
                    support_agent
                  </span>
                  <div className="px-4 py-2.5 rounded-2xl bg-white border border-black/8 rounded-tl-none flex items-center gap-1.5 shadow-xs">
                    <span className="text-xs text-secondary/80 font-medium mr-1">
                      {language === 'en' ? 'Thinking...' : (language === 'es' ? 'Pensando...' : 'Tenker...')}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d17d39] hkm-typing-dot"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d17d39] hkm-typing-dot" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d17d39] hkm-typing-dot" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Replies chips bar */}
            <div className="px-3 pt-2 pb-1 bg-slate-50 flex gap-2 overflow-x-auto select-none no-scrollbar shrink-0 border-t border-black/5">
              {QUICK_REPLIES.map((reply, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(reply.text, { skipWixPush: !reply.actionRequired, isQuickReply: true })}
                  className="flex-shrink-0 bg-white border border-[#d17d39]/30 hover:border-[#bd4f2a] hover:bg-[#fff7ed] text-[#bd4f2a] text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95 shadow-xs cursor-pointer flex items-center gap-1"
                >
                  {reply.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText, { skipWixPush: false });
              }}
              className="p-3 bg-white border-t border-black/8 shrink-0 relative"
            >
              {/* Pre-chat Form: Required when visitor is not logged in so Wix Owner App unlocks the reply box */}
              {!isLoggedIn && !userEmail && (
                <div className="mb-2.5 p-3 bg-gradient-to-r from-orange-50/90 to-amber-50/90 border border-[#d17d39]/25 rounded-2xl text-left shadow-xs transition-all">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#bd4f2a] mb-1">
                    <span className="material-symbols-outlined text-base select-none">mail</span>
                    <span>{language === 'en' ? 'Where should we reply?' : (language === 'es' ? '¿Dónde te respondemos?' : 'Hvor skal vi svare deg?')}</span>
                  </div>
                  <p className="text-[11px] text-onyx/75 mb-2 leading-relaxed">
                    {language === 'en'
                      ? 'Enter your email so we can reply as soon as we can.'
                      : (language === 'es'
                        ? 'Indica tu correo electrónico para que podamos responderte lo antes posible.'
                        : 'Oppgi din e-post slik at vi kan svare deg så snart vi kan.')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder={language === 'en' ? 'Your name (optional)' : (language === 'es' ? 'Tu nombre (opcional)' : 'Ditt navn (valgfritt)')}
                      className="w-full sm:w-1/3 bg-white border border-black/10 rounded-xl px-3 py-2 text-xs text-onyx placeholder:text-secondary/50 focus:outline-none focus:ring-1 focus:ring-[#d17d39] transition-all"
                    />
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (inputText.trim()) {
                            handleSendMessage(inputText, { skipWixPush: false });
                          } else if (inputRef.current) {
                            inputRef.current.focus();
                          }
                        }
                      }}
                      placeholder={language === 'en' ? 'your@email.com (required) *' : (language === 'es' ? 'tu@email.com (requerido) *' : 'din@epost.no (påkrevd for svar) *')}
                      className={`flex-1 bg-white border ${emailError ? 'border-red-500 ring-1 ring-red-400' : 'border-black/10'} rounded-xl px-3 py-2 text-xs text-onyx placeholder:text-secondary/50 focus:outline-none focus:ring-1 focus:ring-[#d17d39] transition-all`}
                    />
                  </div>
                  {emailError && (
                    <div className="flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-red-600">
                      <span className="material-symbols-outlined text-xs select-none">error</span>
                      <span>{emailError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Verified Contact Banner */}
              {(userEmail || (isLoggedIn && member)) && (
                <div className="flex items-center justify-between px-1 mb-2 text-[11px] text-secondary font-medium select-none">
                  <div className="flex items-center gap-1.5 text-onyx/75 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="truncate">
                      {language === 'en' ? 'Replying to' : (language === 'es' ? 'Respondiendo a' : 'Svar sendes til')}:{' '}
                      <strong className="text-onyx font-semibold">{userEmail || getMemberEmail(member)}</strong>
                    </span>
                  </div>
                  {!isLoggedIn && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserEmail('');
                        safeStorage.removeItem('hkd-chat-user-email');
                        safeStorage.removeItem('hkd-chat-is-contact-conv');
                      }}
                      className="text-[#d17d39] hover:text-[#bd4f2a] underline text-[10px] ml-2 shrink-0 cursor-pointer font-medium"
                    >
                      {language === 'en' ? 'Change' : (language === 'es' ? 'Cambiar' : 'Endre')}
                    </button>
                  )}
                </div>
              )}
              {/* Slash Command Autocomplete Popover */}
              <AnimatePresence>
                {inputText.startsWith('/') && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-black/10 rounded-2xl shadow-xl z-[1000] overflow-hidden flex flex-col max-h-[200px]"
                  >
                    <div className="px-4 py-2 bg-slate-50 border-b border-black/8 flex items-center justify-between shrink-0 select-none">
                      <span className="text-[10px] font-bold text-onyx/60 uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-[#d17d39] select-none">terminal</span>
                        Hurtigsvar-snarveier
                      </span>
                    </div>
                    <div className="overflow-y-auto divide-y divide-black/5 custom-scrollbar max-h-[160px]">
                      {SHORTCUTS.filter(s => s.command.toLowerCase().includes(inputText.slice(1).toLowerCase()))
                        .map((shortcut) => (
                          <button
                            key={shortcut.command}
                            type="button"
                            onClick={() => {
                              setInputText(shortcut.text);
                              if (inputRef.current) inputRef.current.focus();
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-orange-50/50 transition-colors flex flex-col gap-0.5 active:bg-orange-50 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#d17d39] font-mono">{shortcut.command}</span>
                              <span className="text-[11px] font-bold text-onyx">{shortcut.label}</span>
                            </div>
                            <span className="text-[10px] text-secondary line-clamp-1 leading-normal font-medium">{shortcut.description}</span>
                          </button>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative w-full">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={language === 'en' ? 'Type your message here...' : (language === 'es' ? 'Escribe tu mensaje aquí...' : 'Skriv din melding her...')}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-slate-50 border border-black/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#d17d39] focus:border-[#d17d39] transition-all font-medium text-onyx"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#d17d39] hover:text-[#bd4f2a] disabled:text-secondary/40 transition-colors cursor-pointer"
                  aria-label="Send"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hkm-chat-toggle w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl cursor-pointer pointer-events-auto"
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
