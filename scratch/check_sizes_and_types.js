import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { products } from '@wix/stores';
import { getTranslatedProduct } from '../src/lib/productTranslations.js';

const wixClient = createClient({
  modules: {
    products
  },
  auth: ApiKeyStrategy({
    siteId: '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7',
    apiKey: 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg'
  }),
});

async function main() {
  try {
    const res = await wixClient.products.queryProducts().limit(100).find();
    console.log(`Analyzing ${res.items.length} products...\n`);

    let issuesCount = 0;

    res.items.forEach(p => {
      const translatedNo = getTranslatedProduct(p, 'no');
      const translatedEn = getTranslatedProduct(p, 'en');
      const translatedEs = getTranslatedProduct(p, 'es');

      // Check if size options exist in Wix
      const sizeOpt = p.productOptions?.find(o => {
        const name = o.name?.trim().toLowerCase();
        return name && (name.includes('size') || name.includes('størrelse') || name.includes('størrelser') || name.includes('format') || name === 'str' || name === 'str.');
      });

      // Filtered sizes in AppContext / ProductDetails (simulated logic)
      let parsedSizes = [];
      if (sizeOpt) {
        const rawSizes = sizeOpt.choices?.map(c => c.value) || [];
        parsedSizes = rawSizes.filter(s => {
          if (!s) return false;
          const isDimension = s.includes('cm') || s.includes('″') || s.includes('"') || s.toLowerCase().includes('x');
          if (s.length > 15 && !isDimension) return false;
          const lower = s.toLowerCase();
          if (lower.includes('sticker') || lower.includes('mug') || lower.includes('kopp') || lower.includes('flaske') || lower.includes('valg') || lower.includes('option') || lower.includes('pega') || lower.includes('norsk') || lower.includes('english')) {
            return false;
          }
          return true;
        });
      }

      // Detect if we determined a product type (produktart)
      const nameLower = p.name.toLowerCase();
      let detectedType = 'unknown';
      if (nameLower.includes('travel mug') || nameLower.includes('travelmug') || nameLower.includes('termokopp')) {
        detectedType = 'travel-mug';
      } else if (nameLower.includes('enamel mug') || nameLower.includes('emaljekopp')) {
        detectedType = 'enamel-mug';
      } else if (nameLower.includes('glassbrikker') || nameLower.includes('koppeunderlag') || nameLower.includes('coasters')) {
        detectedType = 'coasters';
      } else if (nameLower.includes('water bottle') || nameLower.includes('drikkeflaske')) {
        detectedType = 'bottle';
      } else if (nameLower.includes('sweatshirt') || nameLower.includes('genser')) {
        detectedType = 'sweatshirt';
      } else if (nameLower.includes('hettegenser') || nameLower.includes('hoodie') || nameLower.includes('hettejakke')) {
        detectedType = 'hoodie';
      } else if (nameLower.includes('t-shirt') || nameLower.includes('tshirt') || nameLower.includes('tskjorte') || nameLower.includes('dametrøye') || nameLower.includes('treningstrøye') || nameLower.includes('tee')) {
        detectedType = 't-shirt';
      } else if (nameLower.includes('babybody') || nameLower.includes('onesie') || nameLower.includes('body')) {
        detectedType = 'babybody';
      } else if (nameLower.includes('totebag') || nameLower.includes('tote bag') || nameLower.includes('handlenett')) {
        detectedType = 'totebag';
      } else if (nameLower.includes('klistremerke') || nameLower.includes('sticker')) {
        detectedType = 'sticker';
      } else if (nameLower.includes('poster') || nameLower.includes('print') || nameLower.includes('plakat')) {
        detectedType = 'poster';
      } else if (nameLower.includes('wristband') || nameLower.includes('bracelet') || nameLower.includes('armbånd')) {
        detectedType = 'wristband';
      } else if (nameLower.includes('mug') || nameLower.includes('cup') || nameLower.includes('kopp') || nameLower.includes('koppen')) {
        detectedType = 'mug';
      }

      let hasIssue = false;
      const issuesList = [];

      // Flag 1: No product type detected
      if (detectedType === 'unknown') {
        hasIssue = true;
        issuesList.push(`Missing product type (produktart) detection. Original name: "${p.name}"`);
      }

      // Flag 2: Size option exists in Wix, but all choices got filtered out or no size option exists where it should (e.g. apparel/posters)
      const needsSize = ['t-shirt', 'hoodie', 'sweatshirt', 'babybody', 'poster'].includes(detectedType);
      if (sizeOpt && parsedSizes.length === 0) {
        hasIssue = true;
        issuesList.push(`Size option exists in Wix but got completely filtered out by s.length > 15 or other filters. Raw choices: [${sizeOpt.choices?.map(c => c.value).join(', ')}]`);
      } else if (needsSize && !sizeOpt) {
        hasIssue = true;
        issuesList.push(`Product type "${detectedType}" usually requires sizes, but no Size option was found on Wix.`);
      }

      if (hasIssue) {
        issuesCount++;
        console.log(`[ISSUE] Product: "${p.name}" (ID: ${p.id})`);
        issuesList.forEach(issue => console.log(`   - ${issue}`));
        console.log(`   Translations:`);
        console.log(`     NO: "${translatedNo.name}"`);
        console.log(`     EN: "${translatedEn.name}"`);
        console.log(`     ES: "${translatedEs.name}"`);
        console.log('');
      }
    });

    console.log(`Analysis complete. Found issues with ${issuesCount} products.`);
  } catch (err) {
    console.error(err);
  }
}

main();
