import fetch from 'node-fetch';

async function checkDeployment() {
  const url = 'https://hiskingdomdesigns.vercel.app/assets/index-CGYJw4Rg.js';
  console.log(`Checking if latest JS bundle exists: ${url}`);
  const response = await fetch(url, { method: 'HEAD' });
  console.log(`Status: ${response.status} ${response.statusText}`);
  
  const htmlUrl = 'https://hiskingdomdesigns.vercel.app/';
  console.log(`Fetching HTML from: ${htmlUrl}`);
  const htmlRes = await fetch(htmlUrl);
  const text = await htmlRes.text();
  const match = text.match(/src="\/assets\/index-([^"]+)\.js"/);
  if (match) {
    console.log(`Currently deployed asset: /assets/index-${match[1]}.js`);
  } else {
    console.log('Could not find index.js in HTML');
    console.log('HTML snippet:', text.substring(0, 1000));
  }
}

checkDeployment().catch(err => console.error(err));
