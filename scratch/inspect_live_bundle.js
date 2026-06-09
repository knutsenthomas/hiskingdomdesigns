import fetch from 'node-fetch';

async function inspectBundle() {
  const url = 'https://hiskingdomdesigns.vercel.app/assets/index-DjcSmn_B.js';
  console.log(`Fetching live JS bundle from Vercel: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch bundle: ${response.status} ${response.statusText}`);
  }
  const code = await response.text();
  console.log('Bundle fetched successfully. Size:', code.length, 'bytes');

  // Search for the provider value key strings to verify if 'member' and 'isLoggedIn' are in the bundle.
  // In minified code, it will be something like {products:..., member:..., isLoggedIn:...}
  const searchTerms = ['member', 'isLoggedIn', 'getCategoryNameBySlug'];
  searchTerms.forEach(term => {
    const index = code.indexOf(term);
    if (index !== -1) {
      console.log(`Found term "${term}" at index ${index}. Surrounding context:`);
      console.log(code.substring(index - 50, index + 150));
    } else {
      console.log(`Did NOT find term "${term}" in the bundle!`);
    }
  });
}

inspectBundle().catch(err => console.error(err));
