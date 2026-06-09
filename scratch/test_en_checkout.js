import fetch from 'node-fetch';

async function main() {
  const urlWithEn = 'https://www.hiskingdomdesigns.no/en/__ecom/checkout';
  const urlWithoutEn = 'https://www.hiskingdomdesigns.no/__ecom/checkout';

  console.log('Fetching WITH /en/:');
  try {
    const res = await fetch(urlWithEn);
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    const text = await res.text();
    console.log('Body HTML preview:', text.substring(0, 500));
  } catch (err) {
    console.error('Failed:', err.message);
  }

  console.log('\nFetching WITHOUT /en/:');
  try {
    const res = await fetch(urlWithoutEn);
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    const text = await res.text();
    console.log('Body HTML preview:', text.substring(0, 500));
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

main().catch(console.error);
