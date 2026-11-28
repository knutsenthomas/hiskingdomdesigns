import { wixClient } from '@/lib/wix';

// Calls /api/customer-data with the logged-in Wix member's token.
// Returns and affiliate applications are only read and written on the server.
export async function customerApi(action, data = {}) {
  const accessToken = wixClient.auth?.getTokens?.()?.accessToken?.value;
  const res = await fetch('/api/customer-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    },
    body: JSON.stringify({ action, data })
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Feil (${res.status})`);
  return body;
}
