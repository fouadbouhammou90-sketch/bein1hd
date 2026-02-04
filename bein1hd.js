const http = require('http');

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // التحقق من المفتاح
    if (url.searchParams.get("key") !== "2026") {
        res.writeHead(403);
        res.end("Key Required");
        return;
    }

    // الرابط الأصلي
    const targetUrl = "http://app.upsdo.me:8080/live/PCCQTZPXVCEG/041212071179/93914.ts";

    const options = {
        headers: {
            'User-Agent': 'IPTVSmartersPlayer',
            'Connection': 'keep-alive'
        }
    };

    // سحب البيانات من السيرفر الأصلي وتمريرها
    http.get(targetUrl, options, (proxyRes) => {
        // إضافة رؤوس CORS لكي يقبلها المتصفح
        res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'video/mp2t',
            'Access-Control-Allow-Origin': '*', // هذا السطر يحل مشكلة الـ CORS
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'no-cache',
            'Transfer-Encoding': 'chunked'
        });

        proxyRes.pipe(res);
    }).on('error', (e) => {
        res.end("Error: " + e.message);
    });
});

server.listen(process.env.PORT || 10000);
