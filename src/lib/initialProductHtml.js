// Capture the public server-rendered product before createRoot replaces its DOM.
// Never reuse one product's HTML for a different client-side route.
const initialProduct = typeof document === 'undefined'
  ? null
  : document.querySelector('#root main[data-server-product-id]');
const initialId = initialProduct?.getAttribute('data-server-product-id');
const initialHtml = initialProduct?.outerHTML || '';

export function getInitialProductHtml(productId) {
  return productId === initialId ? initialHtml : '';
}
