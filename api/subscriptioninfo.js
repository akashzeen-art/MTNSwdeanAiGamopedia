const https = require('https');

module.exports = (req, res) => {
  const { serviceid, msisdn } = req.query;
  if (!serviceid || !msisdn) {
    return res.status(400).json({ status: 'error', message: 'Missing params' });
  }

  const url = `https://wap.zeendcb.com/vaspay/subscriptioninfo?serviceid=${encodeURIComponent(serviceid)}&msisdn=${encodeURIComponent(msisdn)}`;

  https.get(url, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(data);
      } catch {
        res.status(502).json({ status: 'error' });
      }
    });
  }).on('error', () => res.status(502).json({ status: 'error' }));
};
