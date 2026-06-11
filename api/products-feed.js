const SITE_ID = process.env.WIX_SITE_ID || '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7';
const API_KEY = process.env.WIX_API_KEY || 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg';

const stripHtml = (html = '') => {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
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
    xml += `    <description>Bær troen med stolthet - Premium kristne t-skjorter, plakater og kopper</description>\n`;

    allProducts.forEach(p => {
      // Filter out hidden products
      if (p.visible === false) return;

      const id = p.id;
      const title = p.name;
      const description = stripHtml(p.description || '');
      const link = `https://hiskingdomdesigns.no/produkt/${id}`;
      
      // Get main image URL
      const imageUrl = p.media?.mainMedia?.image?.url || '';
      
      const availability = p.inStock ? 'in stock' : 'out of stock';
      
      // Google Merchant prices must be formatted with the currency code, f.eks. "139 NOK"
      const priceVal = p.price?.price || 0;
      const currency = p.price?.currency || 'NOK';
      const formattedPrice = `${priceVal} ${currency}`;

      // Check if there is a discounted/sale price
      const salePriceVal = p.price?.discountedPrice;
      const hasDiscount = salePriceVal && salePriceVal < priceVal;
      const formattedSalePrice = hasDiscount ? `${salePriceVal} ${currency}` : '';

      const productType = getProductType(title);
      const brand = p.brand || 'His Kingdom Designs';

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
      xml += `      <g:product_type><![CDATA[${cleanCdata(productType)}]]></g:product_type>\n`;
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
