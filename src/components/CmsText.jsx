import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations, SLUG_ALIASES } from '@/lib/translations';

export default function CmsText({ 
  slug, 
  fallback = '', 
  className = '', 
  as: Component = 'span', 
  replaceObj = null,
  style = {}
}) {
  const { cmsContent, updateCmsContent, isAdminEditing, showToast } = useApp();
  const { language } = useLanguage();

  const getCmsText = () => {
    // 1. Language-specific CMS edit saved by admin in Firestore
    const activeCmsKey = language === 'en' ? `${slug}-en` : (language === 'es' ? `${slug}-es` : slug);
    const customText = cmsContent?.[activeCmsKey];
    if (customText !== undefined && customText !== null && customText !== '') {
      return customText;
    }

    // 2. Active language translation dictionary lookup
    const currentDict = translations[language] || translations['no'] || {};

    // a) Direct slug match
    if (currentDict[slug] !== undefined && currentDict[slug] !== null && currentDict[slug] !== '') {
      return currentDict[slug];
    }

    // b) Slug alias match
    const aliasKey = SLUG_ALIASES[slug];
    if (aliasKey && currentDict[aliasKey] !== undefined && currentDict[aliasKey] !== null && currentDict[aliasKey] !== '') {
      return currentDict[aliasKey];
    }

    // c) Dot / Dash normalization match
    const dotSlug = slug.replace(/-/g, '.');
    if (currentDict[dotSlug] !== undefined && currentDict[dotSlug] !== null && currentDict[dotSlug] !== '') {
      return currentDict[dotSlug];
    }
    const dashSlug = slug.replace(/\./g, '-');
    if (currentDict[dashSlug] !== undefined && currentDict[dashSlug] !== null && currentDict[dashSlug] !== '') {
      return currentDict[dashSlug];
    }

    // 3. Fallback resolution
    if (language === 'no') {
      if (fallback !== undefined && fallback !== null && fallback !== '') {
        return fallback;
      }
      if (cmsContent?.[slug] !== undefined && cmsContent?.[slug] !== null && cmsContent?.[slug] !== '') {
        return cmsContent[slug];
      }
    } else {
      // For EN/ES:
      // If a fallback was provided, check if it was dynamically translated by the caller
      // (i.e. does not match the static Norwegian reference string)
      const noDict = translations['no'] || {};
      const norwegianRef = noDict[slug] || (aliasKey && noDict[aliasKey]) || noDict[dotSlug] || noDict[dashSlug];

      if (fallback !== undefined && fallback !== null && fallback !== '' && (!norwegianRef || fallback !== norwegianRef)) {
        return fallback;
      }

      // Ultimate fallback if neither translated dict nor custom CMS edit exists
      if (fallback !== undefined && fallback !== null && fallback !== '') {
        return fallback;
      }
      if (cmsContent?.[slug] !== undefined && cmsContent?.[slug] !== null && cmsContent?.[slug] !== '') {
        return cmsContent[slug];
      }
    }

    return '';
  };
  
  const rawText = getCmsText();
  
  // Apply placeholders (e.g. {amount}) ONLY when NOT editing
  let displayText = rawText;
  if (replaceObj && !isAdminEditing) {
    Object.entries(replaceObj).forEach(([key, val]) => {
      if (typeof displayText === 'string') {
        displayText = displayText.split(key).join(val);
      }
    });
  }

  const elementRef = useRef(null);
  const [localText, setLocalText] = useState(rawText);

  // Sync state if CMS changes externally
  useEffect(() => {
    setLocalText(rawText);
  }, [rawText]);

  const handleBlur = () => {
    if (!isAdminEditing) return;
    const newText = elementRef.current?.innerText?.trim() || '';
    
    // Safety check to avoid blank strings
    if (newText === '') {
      if (elementRef.current) {
        elementRef.current.innerText = rawText;
      }
      showToast("Feltet kan ikke være tomt");
      return;
    }

    if (newText !== rawText) {
      const activeSlug = language === 'en' ? `${slug}-en` : (language === 'es' ? `${slug}-es` : slug);
      showToast(
        language === 'en' 
          ? "Oppdaterer og oversetter til norsk og spansk..." 
          : "Oppdaterer og oversetter til engelsk og spansk..."
      );
      updateCmsContent(activeSlug, newText);
    }
  };

  const handleKeyDown = (e) => {
    // Save on Enter (unless holding shift or component is multiline paragraph/div/textarea)
    if (e.key === 'Enter') {
      if (e.shiftKey || Component === 'p' || Component === 'textarea' || Component === 'div') {
        return; // Allow newline
      }
      e.preventDefault();
      elementRef.current?.blur();
    }
  };

  // Prevent rich text styling being pasted in contentEditable
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleClick = (e) => {
    if (isAdminEditing) {
      if (Component === 'a' || Component === 'button') {
        e.preventDefault();
      }
      e.stopPropagation();
      elementRef.current?.focus();
    }
  };

  if (!isAdminEditing) {
    return (
      <Component 
        className={className} 
        style={style} 
        data-cms-slug={slug}
      >
        {displayText}
      </Component>
    );
  }

  return (
    <Component
      ref={elementRef}
      contentEditable
      suppressContentEditableWarning
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck="false"
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onClick={handleClick}
      data-cms-slug={slug}
      className={`${className} inline-block outline-none border border-dashed border-terracotta/60 hover:border-terracotta focus:border-terracotta focus:bg-terracotta/5 focus:ring-1 focus:ring-terracotta rounded px-1.5 -mx-1.5 transition-all cursor-text relative group min-h-[1em]`}
      title={`Klikk for å redigere "${slug}" direkte på siden`}
      style={style}
    >
      {rawText}
    </Component>
  );
}
