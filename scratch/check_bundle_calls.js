import fetch from 'node-fetch';

async function main() {
  const url = 'https://hiskingdomdesigns.vercel.app/assets/index-bLVN2dE8.js';
  console.log('Fetching JS bundle...');
  const res = await fetch(url);
  const text = await res.text();
  
  // Search for .createCheckoutFromCurrentCart
  const index = text.indexOf('createCheckoutFromCurrentCart');
  if (index !== -1) {
    console.log('Found string "createCheckoutFromCurrentCart" in bundle at index:', index);
    // Show surrounding 200 characters
    console.log('Surrounding code:', text.substring(Math.max(0, index - 100), Math.min(text.length, index + 150)));
  } else {
    console.log('String "createCheckoutFromCurrentCart" NOT found in bundle.');
  }

  // Search for .createCheckout
  const index2 = text.indexOf('createCheckout(');
  if (index2 !== -1) {
    console.log('Found "createCheckout(" in bundle.');
    console.log('Surrounding code:', text.substring(Math.max(0, index2 - 100), Math.min(text.length, index2 + 150)));
  }
}

main().catch(console.error);
