const http = require('http');
const crypto = require('crypto');

const server = http.createServer((req, res) => {
    let userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "127.0.0.1";
    if (userIP.includes(',')) userIP = userIP.split(',')[0];
    userIP = userIP.trim();

    const secretKey = "PROTECT_STREAMS_2026";
    const url = new URL(req.url, `http://${req.headers.host}`);
    const expectedToken = crypto.createHmac('md5', secretKey).update(userIP).digest('hex');

    // 1. صفحة المشغل (تم تحسينها لتعمل مع ملفات TS)
    if (url.pathname === "/" || url.pathname === "") {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <html>
            <head>
                <title>Live Player</title>
                <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
            </head>
            <body style="margin:0;background:#000;display:flex;justify-content:center;align-items:center;height:100vh;">
                <video id="v" controls autoplay style="width:100%;max-width:800px;"></video>
                <script>
                    var v = document.getElementById('v');
                    var src = '/live.ts?token=${expectedToken}'; // غيرنا الامتداد لـ TS
                    
                    // استخدام HLS.js لتشغيل الـ TS كبث مباشر
                    if(Hls.isSupported()) {
                        var hls = new Hls({ enableWorker: true });
                        hls.loadSource(src);
                        hls.attachMedia(v);
                        hls.on(Hls.Events.MANIFEST_PARSED, function() { v.play(); });
                    } else {
                        v.src = src; // دعم مباشر لمتصفحات معينة
                    }
                </script>
            </body>
            </html>
        `);
        return;
    }

    // 2. التحقق من التوكن
    const receivedToken = url.searchParams.get("token");
    if (receivedToken !== expectedToken) {
        res.writeHead(403);
        res.end("Token Error");
        return;
    }

    // 3. سحب البث وتمريره مع رؤوس "البث المباشر"
    const targetUrl = "http://app.upsdo.me:8080/live/PCCQTZPXVCEG/041212071179/93914.ts";
    
    const options = {
        headers: {
            'User-Agent': 'VLC/3.0.18',
            'Connection': 'keep-alive',
            'Accept': '*/*'
        }
    };

    http.get(targetUrl, options, (proxyRes) => {
        // إرسال رؤوس تجعل المتصفح لا ينتظر نهاية الملف (Streaming Headers)
        res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'video/mp2t', // ضروري لملفات .ts
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Connection': 'keep-alive',
            'Transfer-Encoding': 'chunked' // إخبار المتصفح أن البيانات مستمرة
        });

        proxyRes.pipe(res);
    }).on('error', (e) => res.end("Stream Error"));
});

server.listen(process.env.PORT || 10000);
