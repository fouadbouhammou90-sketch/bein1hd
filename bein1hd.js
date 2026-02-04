const http = require('http');

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // اطلب من المستخدم وضع كلمة سر في الرابط (مثلاً: 7788)
    if (url.searchParams.get("pass") !== "7788") {
        res.writeHead(403);
        res.end("خطأ: الرابط غير صحيح أو انتهت صلاحيته");
        return;
    }

    const targetUrl = "http://app.upsdo.me:8080/live/PCCQTZPXVCEG/041212071179/93914.ts";

    http.get(targetUrl, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'video/mp2t',
            'Access-Control-Allow-Origin': '*'
        });
        proxyRes.pipe(res);
    }).on('error', (e) => { res.end(e.message); });
});

server.listen(process.env.PORT || 10000);
