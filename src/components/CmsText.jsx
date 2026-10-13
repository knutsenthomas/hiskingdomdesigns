import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CmsText({ 
  slug, 
  fallback = '', 
  className = '', 
  as: Component = 'span', 
  replaceObj = null,
  style = {}
}) {
  const { cmsContent, updateCmsContent, isAdminEditing, showToast } = useApp();
  const { t, language } = useLanguage();

  const getCmsText = () => {
    let text = "";
    if (language === 'en') {
      text = cmsContent?.[slug + '-en'] || cmsContent?.[slug];
    } else if (language === 'es') {
      text = cmsContent?.[slug + '-es'] || cmsContent?.[slug];
    } else {
      text = cmsContent?.[slug];
    }

    if (text !== undefined && text !== null && text !== '') {
      return text;
    }

    // Fallback order: Explicit fallback -> Translation dictionary -> Slug itself
    if (fallback !== undefined && fallback !== null && fallback !== '') {
      return fallback;
    }

    const dictText = t(slug);
    if (dictText && dictText !== slug) {
      return dictText;
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
