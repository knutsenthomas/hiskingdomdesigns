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
  const { range = '30d', startDate: queryStartDate, endDate: queryEndDate } = req.query;
  let startDate = '30daysAgo';
  let endDate = 'today';
  let chartDimension = 'date'; // 'date' for daily/weekly, 'yearMonth' for monthly

  if (range === 'today') {
    startDate = 'today';
    endDate = 'today';
    chartDimension = 'date';
  } else if (range === 'yesterday') {
    startDate = 'yesterday';
    endDate = 'yesterday';
    chartDimension = 'date';
  } else if (range === '7d') {
    startDate = '7daysAgo';
    endDate = 'today';
    chartDimension = 'date';
  } else if (range === '90d') {
    startDate = '90daysAgo';
    endDate = 'today';
    chartDimension = 'date';
  } else if (range === '12m') {
    startDate = '365daysAgo';
    endDate = 'today';
    chartDimension = 'yearMonth';
  } else if (range === 'custom') {
    startDate = queryStartDate || '30daysAgo';
    endDate = queryEndDate || 'today';
    
    // Velg chartDimension dynamisk basert på antall dager i perioden
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 35) {
        chartDimension = 'yearMonth';
      } else {
        chartDimension = 'date';
      }
    } catch (e) {
      chartDimension = 'date';
    }
  }

  let credentials;
  try {
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
    if (!credentials && typeof currentInput === 'string' && currentInput.includes('-----BEGIN PRIVATE KEY-----')) {
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

    // Run all reports in parallel for maximum performance
    const [
      overviewResponse,
      chartResponse,
      trafficResponse,
      deviceResponse,
      geoResponse,
      pagesResponse,
      realtimeResponse
    ] = await Promise.all([
      // 1. Fetch Overview Metrics
      analyticsDataClient.runReport({
        property: formattedProperty,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ]
      }),
      // 2. Fetch Chart Data (Active Users over time)
      analyticsDataClient.runReport({
        property: formattedProperty,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: chartDimension }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: chartDimension } }]
      }),
      // 3. Fetch Traffic Sources
      analyticsDataClient.runReport({
        property: formattedProperty,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
      }),
      // 4. Fetch Devices
      analyticsDataClient.runReport({
        property: formattedProperty,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
      }),
      // 5. Fetch Geographic (Cities)
      analyticsDataClient.runReport({
        property: formattedProperty,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'city' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 5
      }),
      // 6. Fetch Top Pages
      analyticsDataClient.runReport({
        property: formattedProperty,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 5
      }),
      // 7. Fetch Realtime Active Users
      analyticsDataClient.runRealtimeReport({
        property: formattedProperty,
        metrics: [{ name: 'activeUsers' }]
      }).catch(err => {
        console.warn('Realtime report failed:', err.message);
        return [null];
      })
    ]);

    res.status(200).json({
      success: true,
      overview: overviewResponse[0].rows?.[0] ? {
        activeUsers: overviewResponse[0].rows[0].metricValues[0].value,
        screenPageViews: overviewResponse[0].rows[0].metricValues[1].value,
        bounceRate: parseFloat(overviewResponse[0].rows[0].metricValues[2].value * 100).toFixed(1) + '%',
        averageSessionDuration: overviewResponse[0].rows[0].metricValues[3].value
      } : {
        activeUsers: '0',
        screenPageViews: '0',
        bounceRate: '0.0%',
        averageSessionDuration: '0'
      },
      chart: chartResponse[0].rows?.map(row => ({
        dimension: row.dimensionValues[0].value,
        activeUsers: parseInt(row.metricValues[0].value, 10)
      })) || [],
      traffic: trafficResponse[0].rows?.map(row => ({
        source: row.dimensionValues[0].value,
        activeUsers: parseInt(row.metricValues[0].value, 10)
      })) || [],
      devices: deviceResponse[0].rows?.map(row => ({
        device: row.dimensionValues[0].value,
        activeUsers: parseInt(row.metricValues[0].value, 10)
      })) || [],
      geo: geoResponse[0].rows?.map(row => ({
        city: row.dimensionValues[0].value,
        activeUsers: parseInt(row.metricValues[0].value, 10)
      })) || [],
      pages: pagesResponse[0].rows?.map(row => ({
        pageTitle: row.dimensionValues[0].value,
        pageviews: parseInt(row.metricValues[0].value, 10)
      })) || [],
      realtime: realtimeResponse && realtimeResponse[0] && realtimeResponse[0].rows?.[0] 
        ? parseInt(realtimeResponse[0].rows[0].metricValues[0].value, 10) 
        : 0
    });
  } catch (error) {
    console.error('GA4 API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || String(error)
    });
  }
}
