// Only catalog identifiers and amounts leave the checkout; never buyer/custom fields.
const pending = new Map();
const sent = new Set();
const money = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
export function paidOrderPayload(order) {
  if (!order?._id || order.paymentStatus !== 'PAID' || !/^[A-Z]{3}$/.test(order.currency || '')) return null;
  const items = (order.lineItems || []).map(item => {
    const total = money(item.totalPriceBeforeTax?.amount);
    const quantity = Number(item.quantity);
    const id = item.catalogReference?.catalogItemId;
    return id && total !== null && Number.isInteger(quantity) && quantity > 0
      ? { item_id: String(id), quantity, price: total / quantity } : null;
  });
  if (!items.length || items.some(item => !item)) return null;
  return { transaction_id: String(order._id), currency: order.currency,
    value: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    tax: money(order.priceSummary?.tax?.amount) ?? 0,
    shipping: money(order.priceSummary?.shipping?.amount) ?? 0, items };
}
export function trackPaidOrder(order, environment = globalThis.window) {
  const payload = paidOrderPayload(order);
  if (!payload || !environment) return false;
  pending.set(payload.transaction_id, payload);
  return flushPurchases(environment);
}
export function flushPurchases(environment = globalThis.window) {
  try {
    if (environment.localStorage.getItem('hkd-cookie-consent') !== 'all' || typeof environment.gtag !== 'function') return false;
    let delivered = false;
    for (const [id, payload] of pending) {
      const key = `hkd-ga-purchase:${id}`;
      if (sent.has(id) || environment.localStorage.getItem(key)) { pending.delete(id); continue; }
      environment.gtag('event', 'purchase', { ...payload, page_location: environment.location.origin + environment.location.pathname });
      sent.add(id);
      environment.localStorage.setItem(key, '1');
      pending.delete(id);
      delivered = true;
    }
    return delivered;
  } catch { return false; } // Analytics must never interrupt checkout.
}

export function trackCartEvent(name, cart, environment = globalThis.window) {
  if (!['add_to_cart', 'begin_checkout'].includes(name)) return false;
  try {
    if (environment?.localStorage.getItem('hkd-cookie-consent') !== 'all' || typeof environment.gtag !== 'function') return false;
    const items = cart.map(item => {
      const price = money(typeof item.price === 'object' ? item.price?.discountedPrice ?? item.price?.price : item.price);
      const quantity = Number(item.quantity);
      return item.id && price !== null && Number.isInteger(quantity) && quantity > 0 ? {item_id: String(item.id), price, quantity} : null;
    });
    if (!items.length || items.some(item => !item)) return false;
    environment.gtag('event', name, {currency:'NOK', value:items.reduce((sum,item)=>sum+item.price*item.quantity,0), items, page_location:environment.location.origin+environment.location.pathname});
    return true;
  } catch { return false; }
}
