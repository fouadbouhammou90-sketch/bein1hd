const http = require('http');

const server = http.createServer((req, res) => {
    // الرابط الأصلي المشفر
    const targetUrl = "http://app.upsdo.me:8080/live/PCCQTZPXVCEG/041212071179/93914.ts";

    // إعدادات المحاكاة الكاملة لتطبيق IPTV Smarters
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (QtEmbedded; Linux; Target; Wayland) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 IPTV-Smarters-Pro/4.0',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'X-Requested-With': 'com.nst.iptvsmarterstvbox',
            'Connection': 'keep-alive',
            'Host': 'app.upsdo.me:8080'
        }
    };

    const proxyReq = http.request(targetUrl, options, (proxyRes) => {
        // إذا كان السيرفر الأصلي يطلب "إعادة توجيه" (Redirect)
        if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
             console.log("Redirecting to: " + proxyRes.headers.location);
             // يمكنك هنا إضافة كود لتتبع الرابط الجديد إذا لزم الأمر
        }

        res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'video/mp2t',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
            'Transfer-Encoding': 'chunked'
        });

        proxyRes.pipe(res);
    });

    proxyReq.on('error', (e) => {
        res.end("Error Connecting to Server: " + e.message);
    });

    proxyReq.end();
});

server.listen(process.env.PORT || 10000);
