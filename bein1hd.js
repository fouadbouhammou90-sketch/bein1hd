const http = require('http');

const server = http.createServer((req, res) => {
    const targetUrl = "http://app.upsdo.me:8080/live/PCCQTZPXVCEG/041212071179/93914.ts";

    // إرسال أمر "تحويل" (302 Redirect)
    // هذا يجعل التطبيق يفتح الرابط الأصلي مباشرة ولكن خلف اسم نطاقك
    res.writeHead(302, {
        'Location': targetUrl,
        'Access-Control-Allow-Origin': '*'
    });
    res.end();
});

server.listen(process.env.PORT || 10000);
