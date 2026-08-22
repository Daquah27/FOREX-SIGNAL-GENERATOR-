export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { licenseKey } = req.body;

  if (!licenseKey || !licenseKey.startsWith('QUAH-')) {
    return res.status(400).json({ valid: false, message: 'Invalid license format.' });
  }

  try {
    const parts = licenseKey.split('-');
    if (parts.length < 3) {
      return res.status(400).json({ valid: false, message: 'Malformed license key.' });
    }

    const encodedPayload = parts[1];
    const decodedString = Buffer.from(encodedPayload, 'base64').toString('utf-8');
    const payload = JSON.parse(decodedString);

    const currentTime = Date.now();
    if (currentTime > payload.expiresAt) {
      return res.status(200).json({ valid: false, message: 'License key has expired.' });
    }

    return res.status(200).json({
      valid: true,
      tier: payload.tier,
      expiresAt: payload.expiresAt,
      message: 'Access granted successfully.'
    });

  } catch (error) {
    return res.status(500).json({ valid: false, message: 'Error processing license key.' });
  }
}
