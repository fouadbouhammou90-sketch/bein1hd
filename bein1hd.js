const http = require('http');
const crypto = require('crypto');

const server = http.createServer((req, res) => {
    const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const cleanIP = userIP.split(',')[0].trim();
    const today = new Date().toISOString().slice(0, 10);
    const secretKey = "PROTECT_STREAMS_2026";

    const expectedToken = crypto.createHmac('md5', secretKey).update(cleanIP + today).digest('hex');
    const url = new URL(req.url, `http://${req.headers.host}`);
    const receivedToken = url.searchParams.get("token");

    if (!receivedToken || receivedToken !== expectedToken) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end("Access Denied. Invalid Token.");
        return;
    }

    // الرابط الأصلي المخفي تماماً عن المتصفح
    const targetUrl = "http://app.upsdo.me:8080/live/PCCQTZPXVCEG/041212071179/93914.ts";

    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
            'Connection': 'keep-alive'
        }
    };

    // جلب البث وتمريره (بدون Redirect)
    http.get(targetUrl, options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'video/mp2t',
            'Access-Control-Allow-Origin': '*', // ليعمل المشغل بدون مشاكل CORS
            'Cache-Control': 'no-cache',
            'Transfer-Encoding': 'chunked'
        });
        proxyRes.pipe(res);
    }).on('error', (e) => {
        res.end("Error: " + e.message);
    });
});

server.listen(process.env.PORT || 10000);
