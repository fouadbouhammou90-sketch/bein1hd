const http = require('http');

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // كلمة السر التي اخترتها
    if (url.searchParams.get("pass") !== "7788") {
        res.writeHead(403);
        res.end("Access Denied");
        return;
    }

    const targetUrl = "http://app.upsdo.me:8080/live/PCCQTZPXVCEG/041212071179/93914.ts";

    // أهم خطوة: تزييف هوية الطلب ليبدو كأنه تطبيق IPTV Smarters
    const options = {
        headers: {
            'User-Agent': 'IPTVSmartersPlayer', 
            'Accept': '*/*',
            'Connection': 'keep-alive',
            'Host': 'app.upsdo.me:8080'
        }
    };

    http.get(targetUrl, options, (proxyRes) => {
        // نقل البيانات مع رؤوس متوافقة مع VLC
        res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'video/mp2t',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
            'Transfer-Encoding': 'chunked'
        });

        proxyRes.pipe(res);
    }).on('error', (e) => {
        res.end("Error: " + e.message);
    });
});

// المنفذ الخاص بـ Render
server.listen(process.env.PORT || 10000);
