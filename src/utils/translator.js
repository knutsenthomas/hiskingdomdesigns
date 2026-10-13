/**
 * Utility for automatic translation between Norwegian (no), English (en), and Spanish (es).
 * Uses high-speed Google Translate public endpoint with MyMemory fallback.
 */

const translationCache = new Map();

export async function translateText(text, fromLang = 'no', toLang = 'en') {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (!trimmed) return text;

  const validLangs = ['no', 'en', 'es'];
  const sl = validLangs.includes(fromLang) ? fromLang : 'no';
  const tl = validLangs.includes(toLang) ? toLang : 'en';

  // Return original if source and target languages are identical
  if (sl === tl) return text;

  const cacheKey = `${sl}:${tl}:${trimmed}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // 1. Google Translate GTX API (Fast, preserves formatting & punctuation)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map(item => item[0]).join('');
        if (translated && translated.trim()) {
          translationCache.set(cacheKey, translated);
          return translated;
        }
      }
    }
  } catch (err) {
    console.warn('Primær oversetter feilet, forsøker reserve:', err);
  }

  // 2. Secondary fallback: MyMemory Translation API
  try {
    const langPair = `${sl}|${tl}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${langPair}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const translated = data?.responseData?.translatedText;
      if (translated && !translated.startsWith('MYMEMORY WARNING:') && !translated.includes('QUERY LENGTH LIMIT')) {
        translationCache.set(cacheKey, translated);
        return translated;
      }
    }
  } catch (err) {
    console.warn('MyMemory reserve oversetter feilet:', err);
  }

  // Return original text as fallback if translation service is unavailable
  return text;
}
