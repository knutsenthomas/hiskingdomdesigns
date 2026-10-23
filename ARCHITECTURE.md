# Store feature structure

Page controllers remain in `src/pages/`. Administration panels and statistics parsers live in `src/features/admin/`; product purchase/review panels and description helpers live in `src/features/product/`; profile normalization and loyalty/referral panels live in `src/features/profile/`.

Pages own their existing state, effects and API calls. Panels receive that state and the existing callbacks explicitly; they do not start independent fetches or duplicate writes. Shared authentication exchange state stays in the profile page module. Existing language context and CMS content continue to flow through the panels.

Run `npm run build` and `node --test tests/*.test.js`. Keep payment, commerce analytics and consent tests passing.
