# Browser storage review — 2026-10-23

Scope: hiskingdomdesigns client source and configured public website.

| Storage/service | Purpose and duration |
| --- | --- |
| hkp-app-privacy-v1 | Consent categories, version and time are remembered for 180 days. Reject or withdraw using the cookie settings link. |
| Google Analytics / Vercel Analytics og Speed Insights | Optional visitor analytics starts only after approval. Google may use _ga and _ga_* (configured for up to 180 days). Vercel measures aggregated usage. Withdrawal stops future measurement and removes accessible analytics cookies on our domain. |
| GoAffPro / hkm_referral_id / ref / gfp_v_id / gfp_v_expires | Affiliate/referral tracking is a separate marketing choice. The script and referral storage start only after approval. Rejection removes accessible local referral identifiers and documented provider cookies on our domain. Vendor retention depends on program settings and was not verified. Primary reference: https://docs.goaffpro.com/gdpr-compliance . |
| Wix / wix_oauth_tokens | Wix provides the store, cart, account and checkout. Its SDK uses local session/account tokens and a cookie fallback configured for up to one year, also subject to token expiry. Rejecting analytics must not block the cart or sign-in. |
| Handlekurv, ønskeliste og språk | hkd-cart*, hkd-applied-coupon, hkd-applied-giftcard, hkd-wishlist and hkd-language support your own choices. Empty carts or wishlists are not automatically stored. Checkout IDs use sessionStorage to complete your requested purchase. |
| Chat – Wix Inbox | hkd-chat-* and hkd-inbox-* support the conversation you start. New chat details use this tab’s sessionStorage, not a permanent visitor profile. Messages sent to Wix Inbox are stored separately and are not deleted by closing the tab. |
| Betaling og kontaktopplysninger | The Wix-hosted checkout and payment providers have their own cookies and terms. hkd-checkout-email remembers the email entered at checkout only in the current tab session. Changing cookie choices does not delete orders or previously submitted data. |
| Frakoblet bruk | App caching in Cache Storage and any public content snapshots in localStorage start only when you enable offline use. Rejection unregisters this site’s offline worker and removes its caches. This does not delete your account, cart or notes. |

Verification must cover initial rejection, selective approval, withdrawal, cross-tab updates, unavailable storage, service-worker cleanup, and existing login/cart functions. Provider retention and agreements are not certified by this source review. No real payment or message submission is part of the review.
