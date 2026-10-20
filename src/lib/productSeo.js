import { canonicalProductPath } from './seoCanonical.js';
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const jsonForHtml = value => JSON.stringify(value).replace(/</g, '\\u003c');
export function buildProductSchema(product, {price, images} = {}) {
  const rawPrice = price ?? product.price?.discountedPrice ?? product.price?.price ?? product.price;
  const amount = Number(rawPrice);
  const url = `https://hiskingdomdesigns.no${canonicalProductPath(product)}`;
  const offers = {'@type':'Offer',url,priceCurrency:product.price?.currency || 'NOK'};
  if (Number.isFinite(amount) && amount >= 0) offers.price = amount;
  const stock = product.stock?.inStock ?? product.inStock;
  if (typeof stock === 'boolean') offers.availability = stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  return {'@context':'https://schema.org','@type':'Product',name:product.name,
    image:images || product.image || product.media?.mainMedia?.image?.url || '',
    description:String(product.description || '').replace(/<[^>]*>/g,' '),
    sku:product.sku || product._id || product.id,
    brand:{'@type':'Brand',name:'His Kingdom Designs'},offers};
}
