const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 5500;
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/$/, '');
const root = __dirname;

function sendHtml(file) {
  return (req, res) => res.sendFile(path.join(root, file));
}

// All routes that must work for /ar
const arRoutes = express.Router();
arRoutes.get('/', sendHtml('index.html'));
arRoutes.get('/index.html', sendHtml('index.html'));
arRoutes.get('/moreGames.html', sendHtml('moreGames.html'));
arRoutes.get('/myAccount.html', sendHtml('myAccount.html'));
arRoutes.get('/termsAndConditions.html', sendHtml('termsAndConditions.html'));
// Static assets under /ar (e.g. /ar/main.js, /ar/style.css)
arRoutes.use(express.static(root));

app.get(BASE_PATH + '/ar', sendHtml('index.html'));
app.get(BASE_PATH + '/ar/', sendHtml('index.html'));
app.use(BASE_PATH + '/ar', arRoutes);

// Proxy: /api/checkstatus?serviceid=...&msisdn=...
app.get(BASE_PATH + '/api/checkstatus', (req, res) => {
  const { serviceid, msisdn } = req.query;
  if (!serviceid || !msisdn) return res.status(400).json({ status: 'error', message: 'Missing params' });
  const url = `https://wap.zeendcb.com/vaspay/checkstatus?serviceid=${encodeURIComponent(serviceid)}&msisdn=${encodeURIComponent(msisdn)}`;
  https.get(url, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try { res.json(JSON.parse(data)); }
      catch { res.status(502).json({ status: 'error' }); }
    });
  }).on('error', () => res.status(502).json({ status: 'error' }));
});

// Root static files
app.use(BASE_PATH + '/', express.static(root));
// Root HTML
app.get(BASE_PATH + '/', sendHtml('index.html'));
if (BASE_PATH) {
  app.get(BASE_PATH, sendHtml('index.html')); // /portal without trailing slash
}

app.listen(PORT, '0.0.0.0', () => {
  const host = `http://localhost:${PORT}`;
  const base = host + BASE_PATH;
  console.log(`AiGameopedia running on port ${PORT}`);
  console.log(`  English: ${base}/`);
  console.log(`  Arabic:  ${base}/ar`);
  if (BASE_PATH) console.log(`  (BASE_PATH=${BASE_PATH})`);
});
