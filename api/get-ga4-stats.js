import { BetaAnalyticsDataClient } from '@google-analytics/data';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
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

  // Fetch GA4 credentials from Vercel env variables
  let propertyId = process.env.GA4_PROPERTY_ID;
  let saKeyStr = process.env.GA4_SERVICE_ACCOUNT_KEY;

  // Sjekk om miljøvariablene er byttet om (swapped)
  if (propertyId && (propertyId.trim().startsWith('{') || propertyId.trim().includes('service_account'))) {
    const temp = saKeyStr;
    saKeyStr = propertyId;
    propertyId = temp;
  }

  if (!propertyId || !saKeyStr) {
    res.status(200).json({
      success: false,
      error: 'Google Analytics 4 er ikke konfigurert. Sett GA4_PROPERTY_ID og GA4_SERVICE_ACCOUNT_KEY i Vercel.',
      setupRequired: true
    });
    return;
  }

  const cleanPropertyId = (propertyId && /^\d+$/.test(propertyId.trim())) 
    ? propertyId.trim() 
    : '540361199'; // Vår bekreftede numerical Property ID for hiskingdomdesigns

  // Parse time range from query
  const { range = '30d' } = req.query;
  let startDate = '30daysAgo';
  let chartDimension = 'date'; // 'date' for daily/weekly, 'yearMonth' for monthly

  if (range === '7d') {
    startDate = '7daysAgo';
    chartDimension = 'date';
  } else if (range === '12m') {
    startDate = '365daysAgo';
    chartDimension = 'yearMonth';
  }

  try {
    let credentials;
    let currentInput = saKeyStr.trim();
    
    // Forsøk å parse JSON. Håndterer base64 og dobbelt-strengifisert JSON.
    for (let i = 0; i < 5; i++) {
      try {
        const parsed = JSON.parse(currentInput);
        if (typeof parsed === 'string') {
          currentInput = parsed.trim();
        } else {
          credentials = parsed;
          break;
        }
      } catch (parseErr) {
        // Hvis det feilet å parse som JSON, sjekk om det er base64-kodet.
        // Vi prøver bare base64-dekoding på første forsøk.
        if (i === 0) {
          try {
            const decoded = Buffer.from(currentInput, 'base64').toString('utf-8');
            currentInput = decoded.trim();
          } catch (b64Err) {
            break;
          }
        } else {
          break;
        }
      }
    }

    // Hvis det vi endte opp med er en ren privat nøkkel (streng), rekonstruerer vi credentials-objektet
    if (typeof currentInput === 'string' && currentInput.includes('-----BEGIN PRIVATE KEY-----')) {
      credentials = {
        client_email: 'vercel-analytics-reader@his-kingdom-designs-499615.iam.gserviceaccount.com',
        private_key: currentInput
      };
    }

    // Sikre at linjeskift i private_key er riktig formatert
    if (credentials && credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }

    if (!credentials || !credentials.client_email) {
      const parsedKeys = (credentials && typeof credentials === 'object') ? Object.keys(credentials) : [];
      res.status(500).json({
        success: false,
        error: `JSON-objektet mangler client_email. Type: ${typeof credentials}. Tilgjengelige felt: ${parsedKeys.join(', ')}`,
        setupRequired: true
      });
      return;
    }

    const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
    const formattedProperty = `properties/${cleanPropertyId}`;

    // 1. Fetch Overview Metrics
    const [overviewResponse] = await analyticsDataClient.runReport({
      property: formattedProperty,
      dateRanges: [{ startDate, endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ]
    });

    // 2. Fetch Chart Data (Active Users over time)
    const [chartResponse] = await analyticsDataClient.runReport({
      property: formattedProperty,
      dateRanges: [{ startDate, endDate: 'today' }],
      dimensions: [{ name: chartDimension }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ dimension: { dimensionName: chartDimension } }]
    });

    // 3. Fetch Traffic Sources
    const [trafficResponse] = await analyticsDataClient.runReport({
      property: formattedProperty,
      dateRanges: [{ startDate, endDate: 'today' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
    });

    // 4. Fetch Devices
    const [deviceResponse] = await analyticsDataClient.runReport({
      property: formattedProperty,
      dateRanges: [{ startDate, endDate: 'today' }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
    });

    res.status(200).json({
      success: true,
      overview: overviewResponse.rows?.[0] ? {
        activeUsers: overviewResponse.rows[0].metricValues[0].value,
        screenPageViews: overviewResponse.rows[0].metricValues[1].value,
        bounceRate: parseFloat(overviewResponse.rows[0].metricValues[2].value * 100).toFixed(1) + '%',
        averageSessionDuration: overviewResponse.rows[0].metricValues[3].value
      } : {
        activeUsers: '0',
        screenPageViews: '0',
        bounceRate: '0.0%',
        averageSessionDuration: '0'
      },
      chart: chartResponse.rows?.map(row => ({
        dimension: row.dimensionValues[0].value,
        activeUsers: parseInt(row.metricValues[0].value, 10)
      })) || [],
      traffic: trafficResponse.rows?.map(row => ({
        source: row.dimensionValues[0].value,
        activeUsers: parseInt(row.metricValues[0].value, 10)
      })) || [],
      devices: deviceResponse.rows?.map(row => ({
        device: row.dimensionValues[0].value,
        activeUsers: parseInt(row.metricValues[0].value, 10)
      })) || []
    });
  } catch (error) {
    console.error('GA4 API Error:', error);
    let keyInfo = 'Not loaded';
    if (credentials && credentials.private_key) {
      const pk = credentials.private_key;
      const nlCount = (pk.match(/\n/g) || []).length;
      const rCount = (pk.match(/\r/g) || []).length;
      const escapedNlCount = (pk.match(/\\n/g) || []).length;
      keyInfo = `Length: ${pk.length}, Header: ${pk.substring(0, 30)}, Footer: ${pk.substring(Math.max(0, pk.length - 30))}, Newlines: ${nlCount}, CRs: ${rCount}, EscapedNls: ${escapedNlCount}`;
    }
    const saKeyDiagnostic = saKeyStr 
      ? `Length: ${saKeyStr.length}, Start: ${saKeyStr.substring(0, 40).replace(/\n/g, '\\n')}, End: ${saKeyStr.substring(Math.max(0, saKeyStr.length - 40)).replace(/\n/g, '\\n')}`
      : 'Not defined';
    res.status(500).json({
      success: false,
      error: error.message || String(error),
      diagnostic: saKeyDiagnostic,
      keyInfo: keyInfo
    });
  }
}
