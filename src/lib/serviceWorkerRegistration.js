// Register the offline worker only after the visitor explicitly enables offline use.
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  let lastChoice;
  let queue = Promise.resolve();
  const sync = () => {
    const desired = window.SitePrivacy?.allows('offline') === true;
    if (desired === lastChoice) return;
    lastChoice = desired;
    queue = queue.then(async () => {
      if (desired) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          installing?.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) window.dispatchEvent(new CustomEvent('sw-update-available', { detail: registration }));
          });
        });
        return;
      }
      const controller = navigator.serviceWorker.controller;
      const owned = worker => worker && new URL(worker.scriptURL).origin === location.origin && new URL(worker.scriptURL).pathname === '/sw.js';
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        if ([registration.active, registration.waiting, registration.installing].some(owned)) await registration.unregister();
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.filter(name => ["hk-designs-cache-"].some(prefix => name.startsWith(prefix))).map(name => caches.delete(name)));
      }
      // An already controlling worker continues until navigation. Reload only when such a worker existed.
      if (owned(controller)) location.reload();
    }).catch(error => { lastChoice = undefined; console.warn('[Offline] Could not update offline storage:', error); });
  };
  window.addEventListener('siteprivacychange', sync);
  if (document.readyState === 'complete') sync();
  else window.addEventListener('load', sync, { once: true });
}
