const SITE_ID = process.env.WIX_SITE_ID || '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7';
const API_KEY = process.env.WIX_API_KEY;

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('API: Fetching Wix products...');
    let allProducts = [];
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const queryRes = await fetch('https://www.wixapis.com/stores/v1/products/query', {
        method: 'POST',
        headers: {
          'Authorization': API_KEY,
          'wix-site-id': SITE_ID,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: {
            paging: {
              limit: 100,
              offset: skip
            }
          }
        })
      });

      if (!queryRes.ok) {
        throw new Error(`Failed to fetch from Wix API: ${queryRes.status} ${queryRes.statusText}`);
      }

      const queryData = await queryRes.json();
      const products = queryData.products || [];
      allProducts = allProducts.concat(products);

      if (products.length < 100) {
        hasMore = false;
      } else {
        skip += 100;
      }
    }

    // Include real Wix collection names and creation dates for the newsletter picker.
    const collections = [];
    let categoriesAvailable = true;
    try {
      for (let offset = 0; ; offset += 100) {
        const response = await fetch('https://www.wixapis.com/stores-reader/v1/collections/query', {
          method: 'POST',
          headers: { Authorization: API_KEY, 'wix-site-id': SITE_ID, 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: { paging: { limit: 100, offset } } })
        });
        if (!response.ok) throw new Error(`Collection query failed: ${response.status}`);
        const page = (await response.json()).collections || [];
        collections.push(...page.map(item => ({ id: item.id, name: item.name })));
        if (page.length < 100) break;
      }
    } catch (error) {
      categoriesAvailable = false;
      console.warn('Product categories unavailable:', error.message);
    }
    const collectionNames = new Map(collections.map(item => [item.id, item.name]));

    // Format products
    const formatted = allProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price?.price || 0,
      inStock: p.inStock !== false,
      imageUrl: p.media?.mainMedia?.image?.url || '',
      description: p.description || '',
      createdDate: p.createdDate || null,
      collectionIds: p.collectionIds || [],
      categories: (p.collectionIds || []).filter(id => collectionNames.has(id)).map(id => ({ id, name: collectionNames.get(id) }))
    }));

    res.status(200).json({
      success: true,
      products: formatted,
      collections,
      categoriesAvailable
    });
  } catch (error) {
    console.error('API Error: Failed to fetch Wix products:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || String(error) 
    });
  }
}
