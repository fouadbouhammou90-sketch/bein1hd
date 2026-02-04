const http = require('http');
const crypto = require('crypto');

const server = http.createServer((req, res) => {
    // 1. محاولة الحصول على الـ IP بذكاء أكبر
    let userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "127.0.0.1";
    if (userIP.includes(',')) userIP = userIP.split(',')[0]; // أخذ أول IP فقط
    userIP = userIP.trim();

    const secretKey = "PROTECT_STREAMS_2026";
    const url = new URL(req.url, `http://${req.headers.host}`);

    // 2. توليد التوكن بناءً على الـ IP فقط (لضمان الثبات حالياً)
    const expectedToken = crypto.createHmac('md5', secretKey).update(userIP).digest('hex');

    // 3. إذا طلب الصفحة الرئيسية: نعطيه المشغل والتوكن الصحيح تلقائياً
    if (url.pathname === "/" || url.pathname === "") {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <html>
            <head><title>Player</title><script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script></head>
            <body style="margin:0;background:#000;">
                <video id="v" controls autoplay style="width:100%;height:100%;"></video>
                <script>
                    var v = document.getElementById('v');
                    var src = '/live.m3u8?token=${expectedToken}';
                    if(Hls.isSupported()) { var hls = new Hls(); hls.loadSource(src); hls.attachMedia(v); }
                    else if(v.canPlayType('application/vnd.apple.mpegurl')) { v.src = src; }
                </script>
            </body>
            </html>
        `);
        return;
    }

    // 4. التحقق من التوكن لطلبات البث
    const receivedToken = url.searchParams.get("token");
    if (receivedToken !== expectedToken) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end("خطأ في التوكن! الـ IP الخاص بك هو: " + userIP + "\\nالتوكن المتوقع هو: " + expectedToken);
        return;
    }

    // 5. جلب البث وتمريره (الرابط الأصلي)
    const targetUrl = "http://app.upsdo.me:8080/live/PCCQTZPXVCEG/041212071179/93914.ts";
    const options = { headers: { 'User-Agent': 'IPTVSmartersPlayer' } };

    http.get(targetUrl, options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'video/mp2t',
            'Access-Control-Allow-Origin': '*',
            'Transfer-Encoding': 'chunked'
        });
        proxyRes.pipe(res);
    }).on('error', (e) => res.end("Error: " + e.message));
});

server.listen(process.env.PORT || 10000);
