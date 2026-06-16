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

  // Fetch credentials from Vercel environment variables
  const propertyId = process.env.GA4_PROPERTY_ID;
  const saKeyStr = process.env.GA4_SERVICE_ACCOUNT_KEY;

  if (!propertyId || !saKeyStr) {
    res.status(200).json({
      success: false,
      error: 'Google Analytics 4 er ikke konfigurert. Sett GA4_PROPERTY_ID og GA4_SERVICE_ACCOUNT_KEY i Vercel.',
      setupRequired: true
    });
    return;
  }

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
    try {
      credentials = JSON.parse(saKeyStr);
    } catch (parseErr) {
      // If the secret is base64 encoded to avoid multiline environment variable issues, decode it
      const decoded = Buffer.from(saKeyStr, 'base64').toString('utf-8');
      credentials = JSON.parse(decoded);
    }

    const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
    const formattedProperty = `properties/${propertyId}`;

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
    res.status(500).json({
      success: false,
      error: error.message || String(error)
    });
  }
}
