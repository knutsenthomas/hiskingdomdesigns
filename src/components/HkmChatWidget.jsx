import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';

// Helper to parse bold (**) and italic (*) syntax into React nodes
const parseInlineStyles = (text, isAssistant) => {
  if (!text) return '';
  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
  const tokens = text.split(regex);
  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      const content = token.slice(2, -2);
      return (
        <strong key={index} className={`font-bold ${isAssistant ? 'text-terracotta' : 'text-white'}`}>
          {content}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const content = token.slice(1, -1);
      return (
        <em key={index} className={`italic font-medium ${isAssistant ? 'text-onyx/80' : 'text-white/90'}`}>
          {content}
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

export default function HkmChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const { assistantMessages, isAssistantTyping, sendAssistantMessage, assistantContext, setAssistantContext } = useApp();
  const chatBodyRef = useRef(null);
  const location = useLocation();

  // Scroll to the top of the newest AI reply
  useEffect(() => {
    if (isOpen) {
      const scrollTimer = setTimeout(() => {
        const body = chatBodyRef.current;
        if (!body) return;

        // Exclude the typing dot element
        const messages = body.querySelectorAll('.hkm-message:not(.typing)');
        if (messages && messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          // Smooth scroll to top of last message with a 10px offset
          body.scrollTo({
            top: lastMsg.offsetTop - 10,
            behavior: 'smooth'
          });
        }
      }, 100);
      return () => clearTimeout(scrollTimer);
    }
  }, [assistantMessages, isAssistantTyping, isOpen]);

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
        // Exclude interactive / system containers
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
            {/* Header - Mørkeblå (#1B4965) */}
            <div className="bg-[#1B4965] text-white px-5 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-white text-2xl select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                  church
                </span>
                <div>
                  <h3 className="font-semibold text-sm">HKD Assistent</h3>
                  <span className="text-[10px] text-white/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 inline-block rounded-full animate-pulse"></span>
                    Tilkoblet butikken
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 text-white/80 hover:text-white transition-colors rounded-full"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Chat Body - Scroll with Offset Context */}
            <div 
              ref={chatBodyRef}
              className="hkm-chat-body flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50 custom-scrollbar"
            >
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
                      {renderRichText(msg.text, msg.sender === 'assistant')}
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
            </div>

            {/* Input Form - Strict block to prevent jitter */}
            <form 
              onSubmit={handleSubmit}
              className="p-3 bg-white border-t border-outline-variant"
              style={{ display: 'block' }}
            >
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Skriv din melding her..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-slate-50 border border-outline-variant rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta transition-all font-medium text-onyx"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-terracotta hover:text-primary-container disabled:text-secondary/40 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
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
          <span className="material-symbols-outlined text-2xl">close</span>
        ) : (
          <span className="material-symbols-outlined text-2xl">chat_bubble</span>
        )}
      </button>
    </div>
  );
}
