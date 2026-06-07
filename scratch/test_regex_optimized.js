const text = "1. [Herren velsigne deg - Unisex Tskjorte (S-3XL)](/product/d18347a7-86ba-4136-b0d2-a280ae2716f1) – 349 kr 🌟 Bestselger!";

function parseInlineStyles(text) {
  if (!text) return '';
  const regex = /(\[[^\]]*\]\([^)]*\)|\*\*.*?\*\*|\*.*?\*)/g;
  const tokens = text.split(regex);
  console.log('Tokens:', tokens);
  tokens.forEach((token, index) => {
    if (token.startsWith('[') && token.includes('](')) {
      const match = token.match(/\[(.*?)\]\((.*?)\)/);
      console.log(`Token ${index} is link match:`, match ? { text: match[1], url: match[2] } : null);
    }
  });
}

parseInlineStyles(text);
