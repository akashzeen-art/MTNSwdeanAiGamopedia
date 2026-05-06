const https = require('https');

exports.handler = async (event) => {
  const { serviceid, msisdn } = event.queryStringParameters || {};
  if (!serviceid || !msisdn) {
    return { statusCode: 400, body: JSON.stringify({ status: 'error', message: 'Missing params' }) };
  }

  const url = `https://wap.zeendcb.com/vaspay/checkstatus?serviceid=${encodeURIComponent(serviceid)}&msisdn=${encodeURIComponent(msisdn)}`;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: data
          });
        } catch {
          resolve({ statusCode: 502, body: JSON.stringify({ status: 'error' }) });
        }
      });
    }).on('error', () => {
      resolve({ statusCode: 502, body: JSON.stringify({ status: 'error' }) });
    });
  });
};
