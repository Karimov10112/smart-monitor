/**
 * Vercel Serverless Function - Cron Job
 * Har daqiqada Render backend'ni uyg'otib, eslatmalarni tekshiradi
 * Vercel cron: "* * * * *" (har daqiqa)
 */
export default async function handler(req, res) {
  // Faqat Vercel Cron yoki test so'rovlariga ruxsat
  const authHeader = req.headers['authorization'];
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const BACKEND_URL = 'https://smart-monitor-4fv9.onrender.com';

  try {
    const response = await fetch(`${BACKEND_URL}/api/cron/check-reminders`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(25000), // 25 soniya timeout
    });

    const data = await response.json();

    console.log(`[Vercel Cron] check-reminders result:`, data);

    return res.status(200).json({
      success: true,
      backend: data,
      calledAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Vercel Cron] check-reminders error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

