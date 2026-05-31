const http = require('http');
const https = require('https');

const WALLET = '0x40a47348228d03DE04487c38BB6B412DcAa011E8';
const CHAIN = 'eip155:84532';
const USDC_CONTRACT = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const PAYMENT_AMOUNT = '1000';

function fetchFX(from, to) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.frankfurter.dev',
      path: `/v1/latest?from=${from}&to=${to}`,
      headers: {'Accept': 'application/json', 'User-Agent': 'taskmarket-agent/1.0'}
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error('Parse error: ' + data.slice(0,100))); }
      });
    }).on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const url = new URL(req.url, 'http://localhost');
  
  if (url.pathname === '/' || url.pathname === '/health') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify({status:'ok',agent:'currency-converter',taskmarket:'taskmarket.xyz',description:'GET /convert?from=USD&to=EUR&amount=100'}));
  }
  
  if (url.pathname === '/convert') {
    const from = (url.searchParams.get('from') || 'USD').toUpperCase();
    const to = (url.searchParams.get('to') || 'EUR').toUpperCase();
    const amount = parseFloat(url.searchParams.get('amount') || '1');
    const paymentHeader = req.headers['x-payment'] || req.headers['payment'];
    
    if (!paymentHeader) {
      res.writeHead(402, {'Content-Type':'application/json','WWW-Authenticate':'x402'});
      return res.end(JSON.stringify({
        x402Version:2,
        accepts:[{scheme:'exact',network:CHAIN,maxAmountRequired:PAYMENT_AMOUNT,
          resource:`https://taskmarket-converter.loca.lt/convert`,
          description:'Currency conversion - 0.001 USDC per lookup',
          mimeType:'application/json',payTo:WALLET,maxTimeoutSeconds:300,
          asset:USDC_CONTRACT}],
        error:'Payment required'
      }));
    }
    
    try {
      const fx = await fetchFX(from, to);
      const rate = fx.rates && fx.rates[to];
      if (!rate) {
        res.writeHead(400, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({error:`Currency ${to} not supported. Supported: ${Object.keys(fx.rates||{}).join(',')}`}));
      }
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify({from, to, amount, result: parseFloat((amount*rate).toFixed(4)), rate}));
    } catch(e) {
      res.writeHead(500, {'Content-Type':'application/json'});
      res.end(JSON.stringify({error:'FX fetch failed: ' + e.message}));
    }
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Currency converter on port ' + PORT));