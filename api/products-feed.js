import { merchantTitle, isExcludedFromMerchant, merchantCategory, merchantAgeGroup, isEnglishMotif, merchantMotif, merchantTypeKey } from './_merchant-titles.js';
import { MERCHANT_DESCRIPTIONS } from './_merchant-descriptions.js';
import { productDescriptionsEn } from '../src/lib/productDescriptionsEn.js';
import { productTranslations } from '../src/lib/productTranslations.js';

// English feed (?lang=en): only products whose design text is English, linked to the
// English product page with prices shown in NOK (same currency as the feed).
const PRODUCT_TYPE_EN = { Plakater: 'Posters', 'T-skjorter': 'T-shirts', Kopper: 'Mugs', Gensere: 'Sweatshirts & hoodies', Trosprodukter: 'Christian gifts' };
const TYPE_TEXT_EN = {
  tshirt: 'A comfortable everyday T-shirt with a faith-filled message.',
  longsleeve: 'A comfortable long sleeve T-shirt with a faith-filled message.',
  hoodie: 'A soft, cosy hoodie with a faith-filled message.',
  zip: 'A soft zip hoodie with a faith-filled message.',
  sweater: 'A soft, comfortable sweatshirt with a faith-filled message.',
  joggers: 'Comfortable joggers with a faith-filled message.',
  babybody: 'A soft baby bodysuit with a faith-filled message.',
  bib: 'A soft baby bib with a faith-filled message.',
  mug: 'A mug for your morning coffee or tea, with a faith-filled message.',
  travelmug: 'A travel mug that keeps your drink warm on the go, with a faith-filled message.',
  bottle: 'A reusable water bottle with a faith-filled message.',
  poster: 'A Christian wall art poster, a daily reminder of God\'s word in your home.',
  tote: 'A practical tote bag with a faith-filled message.',
  cap: 'A cap with a faith-filled message.',
  phonecase: 'A protective phone case with a faith-filled message.',
};
// Shipping in NOK by weight, same rates as Wix (Europe / USA zones).
const SHIP_EUROPE = [[0.25, 79], [1.5, 129], [3, 199], [5, 249]];
const SHIP_US = [[0.41, 99], [2.5, 149], [5, 249]];
const shipPrice = (table, kg) => (table.find(([max]) => kg <= max) || table[table.length - 1])[1];
const EN_COUNTRIES = [['GB', SHIP_EUROPE], ['IE', SHIP_EUROPE], ['US', SHIP_US]];
const englishDescription = (p) => {
  const fixed = productDescriptionsEn[p.id] || productTranslations.ids?.[p.id]?.en?.description;
  if (fixed) return stripHtml(fixed);
  const motif = merchantMotif(p.name);
  const type = TYPE_TEXT_EN[merchantTypeKey(p.name)] || 'A Christian product with a faith-filled message.';
  return `"${motif}" from His Kingdom Designs. ${type} Made to order for you.`;
};

const SITE_ID = process.env.WIX_SITE_ID || '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7';
const API_KEY = process.env.WIX_API_KEY;

const decodeEntities = (str = '') => str
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

const stripHtml = (html = '') => {
  // Block tags become spaces so paragraphs don't run together ("150g/m2Tekstil")
  return decodeEntities(html.replace(/<(br|\/p|\/li|\/div|\/h\d)[^>]*>/gi, ' ').replace(/<[^>]*>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
};

const cleanCdata = (str = '') => {
  return str.replace(/]]>/g, ']]&gt;');
};

const getProductType = (name = '') => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('poster') || lowerName.includes('plakat')) return 'Plakater';
  if (lowerName.includes('t-shirt') || lowerName.includes('t-skjorte')) return 'T-skjorter';
  if (lowerName.includes('kopp') || lowerName.includes('mug') || lowerName.includes('krus')) return 'Kopper';
  if (lowerName.includes('genser') || lowerName.includes('hoodie') || lowerName.includes('sweater')) return 'Gensere';
  return 'Trosprodukter';
};

const getShippingWeight = (productType, name = '') => {
  const lowerName = name.toLowerCase();
  if (productType === 'Plakater') return '0.15 kg';
  if (productType === 'T-skjorter') return '0.2 kg';
  if (productType === 'Kopper') return '0.35 kg';
  if (productType === 'Gensere') return '0.6 kg';
  if (lowerName.includes('caps') || lowerName.includes('lue') || lowerName.includes('beanie')) return '0.1 kg';
  if (lowerName.includes('klistremerke') || lowerName.includes('sticker')) return '0.005 kg';
  return '0.1 kg';
};

export default async function handler(req, res) {
  // Set cache control for 1 hour, stale-while-revalidate
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const lang = (req.query?.lang || new URL(req.url, 'https://x').searchParams.get('lang')) === 'en' ? 'en' : 'no';
  const en = lang === 'en';

  try {
    let allProducts = [];
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const queryRes = await fetch('https://www.wixapis.com/stores/v1/products/query', {
        method: 'POST',
        headers: {
          'Authorization': API_KEY,
          'wix-site-id': SITE_ID,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: {
            paging: {
              limit: 100,
              offset: skip
            }
          }
        })
      });

      if (!queryRes.ok) {
        throw new Error(`Failed to fetch from Wix API: ${queryRes.status} ${queryRes.statusText}`);
      }

      const queryData = await queryRes.json();
      const products = queryData.products || [];
      allProducts = allProducts.concat(products);

      if (products.length < 100) {
        hasMore = false;
      } else {
        skip += 100;
      }
    }

    // Generate XML feed
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>His Kingdom Designs</title>\n`;
    xml += `    <link>https://hiskingdomdesigns.no</link>\n`;
    xml += en
      ? `    <description>Wear your faith with pride - Christian T-shirts, posters and mugs</description>\n`
      : `    <description>Bær troen med stolthet - Premium kristne t-skjorter, plakater og kopper</description>\n`;

    allProducts.forEach(p => {
      // Filter out hidden products
      if (p.visible === false) return;
      // Digital goods (Wix productType) and subscriptions can't be Shopping products
      if (p.productType === 'digital' || isExcludedFromMerchant(p.name)) return;
      if (en && !isEnglishMotif(p.name)) return;

      const id = p.id;
      const title = merchantTitle(p.name, lang);
      const description = en ? englishDescription(p) : (MERCHANT_DESCRIPTIONS[id] || stripHtml(p.description || ''));
      const link = en ? `https://hiskingdomdesigns.no/produkt/${id}?lang=en&amp;cur=NOK` : `https://hiskingdomdesigns.no/produkt/${id}`;
      
      // Get main image URL (and resolve wix:image:// internal URIs if present)
      let imageUrl = p.media?.mainMedia?.image?.url || p.media?.items?.[0]?.image?.url || '';
      if (imageUrl.startsWith('wix:image://')) {
        const match = imageUrl.match(/wix:image:\/\/v1\/([^\/]+)\/([^\s#?]+)/);
        if (match && match[1]) {
          const imageId = match[1];
          const filename = match[2];
          imageUrl = `https://static.wixstatic.com/media/${imageId}/v1/fill/w_800,h_1000,q_80/${filename}`;
        }
      }
      
      // Wix Stores v1 keeps stock under p.stock (same source as the product page)
      const stock = p.stock || {};
      let inStock = typeof stock.inStock === 'boolean' ? stock.inStock
        : typeof p.inStock === 'boolean' ? p.inStock : true;
      if (stock.inventoryStatus === 'OUT_OF_STOCK') inStock = false;
      const availability = inStock ? 'in stock' : 'out of stock';
      
      // Google Merchant prices must be formatted with the currency code, f.eks. "139 NOK"
      const priceVal = p.price?.price || 0;
      const currency = p.price?.currency || 'NOK';
      const formattedPrice = `${priceVal} ${currency}`;

      // Check if there is a discounted/sale price
      const salePriceVal = p.price?.discountedPrice;
      const hasDiscount = salePriceVal && salePriceVal < priceVal;
      const formattedSalePrice = hasDiscount ? `${salePriceVal} ${currency}` : '';

      const productType = getProductType(merchantTitle(p.name));
      const brand = p.brand || 'His Kingdom Designs';
      const shippingWeight = getShippingWeight(productType, merchantTitle(p.name));

      xml += `    <item>\n`;
      xml += `      <g:id>${id}</g:id>\n`;
      xml += `      <g:title><![CDATA[${cleanCdata(title)}]]></g:title>\n`;
      xml += `      <g:description><![CDATA[${cleanCdata(description)}]]></g:description>\n`;
      xml += `      <g:link>${link}</g:link>\n`;
      if (imageUrl) {
        xml += `      <g:image_link>${imageUrl}</g:image_link>\n`;
      }
      xml += `      <g:availability>${availability}</g:availability>\n`;
      xml += `      <g:price>${formattedPrice}</g:price>\n`;
      if (hasDiscount) {
        xml += `      <g:sale_price>${formattedSalePrice}</g:sale_price>\n`;
      }
      xml += `      <g:brand><![CDATA[${cleanCdata(brand)}]]></g:brand>\n`;
      xml += `      <g:condition>new</g:condition>\n`;
      xml += `      <g:product_type><![CDATA[${cleanCdata(en ? PRODUCT_TYPE_EN[productType] : productType)}]]></g:product_type>\n`;
      const googleCategory = merchantCategory(p.name);
      if (googleCategory) {
        xml += `      <g:google_product_category><![CDATA[${cleanCdata(googleCategory)}]]></g:google_product_category>\n`;
      }
      const ageGroup = merchantAgeGroup(p.name);
      if (ageGroup) {
        xml += `      <g:age_group>${ageGroup}</g:age_group>\n`;
      }
      xml += `      <g:shipping_weight>${shippingWeight}</g:shipping_weight>\n`;
      if (en) {
        const kg = parseFloat(shippingWeight);
        for (const [country, table] of EN_COUNTRIES) {
          xml += `      <g:shipping><g:country>${country}</g:country><g:service>Standard</g:service><g:price>${shipPrice(table, kg)} NOK</g:price></g:shipping>\n`;
        }
      }
      xml += `    </item>\n`;
    });

    xml += `  </channel>\n`;
    xml += `</rss>\n`;

    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating product feed:', error);
    // If it fails, return a 500 in XML format so GMC knows there was an error
    let errXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    errXml += `<error><message>${error.message || 'Internal Server Error'}</message></error>`;
    res.status(500).send(errXml);
  }
}
