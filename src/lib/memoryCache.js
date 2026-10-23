const values = new Map();
const keys = new Set(["hkm-products-cache", "hkm-wix-collections-cache", "hkm-cms-content"]);
const allowed = () => window.SitePrivacy?.allows('offline') === true;
const sync = () => {
  for (const key of keys) {
    try {
      if (!allowed()) localStorage.removeItem(key);
      else if (values.has(key)) localStorage.setItem(key, values.get(key));
    } catch { /* Memory cache remains usable when browser storage is unavailable. */ }
  }
};
window.addEventListener('siteprivacychange', sync);
sync();
export const memoryCache = {
  getItem(key) {
    if (values.has(key)) return values.get(key);
    if (allowed()) { try { const value = localStorage.getItem(key); if (value !== null) { values.set(key, value); return value; } } catch {} }
    return null;
  },
  setItem(key, value) { keys.add(key); values.set(key, String(value)); if (allowed()) { try { localStorage.setItem(key, String(value)); } catch {} } },
  removeItem(key) { values.delete(key); try { localStorage.removeItem(key); } catch {} },
};
