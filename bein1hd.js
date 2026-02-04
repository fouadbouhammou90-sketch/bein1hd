const http = require('http');

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // تأكد أن الرابط يحتوي على كلمة السر 2026
    if (url.searchParams.get("key") !== "2026") {
        res.writeHead(403);
        res.end("Access Denied: Wrong Key");
        return;
    }

    const targetUrl = "http://app.upsdo.me:8080/live/PCCQTZPXVCEG/041212071179/93914.ts";

    res.writeHead(302, {
        'Location': targetUrl,
        'Access-Control-Allow-Origin': '*'
    });
    res.end();
});

server.listen(process.env.PORT || 10000);
