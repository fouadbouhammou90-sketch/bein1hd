const http = require('http');

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userAgent = req.headers['user-agent'] || '';

    // التحقق من المفتاح
    if (url.searchParams.get("key") !== "2026") {
        res.writeHead(403);
        res.end("Key Required");
        return;
    }

    const targetUrl = "http://app.upsdo.me:8080/live/PCCQTZPXVCEG/041212071179/93914.ts";

    // --- الطريقة 1: إذا كان الطلب من متصفح (Web Player) ---
    // المتصفحات ترسل عادة كلمة "Mozilla" أو "shaka" أو "hls.js"
    if (userAgent.includes('Mozilla') || userAgent.includes('hls.js')) {
        const options = {
            headers: { 'User-Agent': 'IPTVSmartersPlayer' }
        };

        http.get(targetUrl, options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, {
                'Content-Type': 'video/mp2t',
                'Access-Control-Allow-Origin': '*', // حل مشكلة CORS للمتصفح
                'Cache-Control': 'no-cache',
                'Transfer-Encoding': 'chunked'
            });
            proxyRes.pipe(res);
        }).on('error', (e) => { res.end(e.message); });
    } 
    
    // --- الطريقة 2: إذا كان الطلب من تطبيق (VLC / IPTV App) ---
    else {
        res.writeHead(302, {
            'Location': targetUrl,
            'Access-Control-Allow-Origin': '*'
        });
        res.end();
    }
});

server.listen(process.env.PORT || 10000);
