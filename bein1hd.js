const http = require('http');
const crypto = require('crypto');

const server = http.createServer((req, res) => {
    // 1. الحصول على عنوان IP المستخدم الحقيقي خلف بروكسي Render
    const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const cleanIP = userIP.split(',')[0].trim(); // تنظيف الـ IP في حال وجود عدة عناوين

    // 2. الحصول على تاريخ اليوم (ليتغير التوكن تلقائياً كل 24 ساعة)
    const today = new Date().toISOString().slice(0, 10); // يعطي تنسيق YYYY-MM-DD

    // 3. مفتاحك السري (لا تغيره بعد توزيع الروابط إلا إذا أردت إيقافها عن الجميع)
    const secretKey = "PROTECT_STREAMS_2026";

    // 4. توليد التوكن الصحيح (بناءً على الـ IP + التاريخ + المفتاح السري)
    const expectedToken = crypto
        .createHmac('md5', secretKey)
        .update(cleanIP + today)
        .digest('hex');

    const url = new URL(req.url, `http://${req.headers.host}`);
    const receivedToken = url.searchParams.get("token");

    // 5. التحقق من التوكن
    if (!receivedToken || receivedToken !== expectedToken) {
        res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        res.write(`<h2 style='color:red; text-align:center;'>عذراً، الوصول مرفوض!</h2>`);
        res.write(`<p style='text-align:center;'>هذا الرابط مخصص لجهازك فقط وينتهي بنهاية اليوم.</p>`);
        res.write(`<p style='text-align:center;'>الرابط الصحيح لجهازك حالياً هو:</p>`);
        res.write(`<div style='background:#eee; padding:10px; text-align:center;'>
            <code>https://${req.headers.host}/live.m3u8?token=${expectedToken}</code>
        </div>`);
        res.end();
        return;
    }

    // 6. الرابط الأصلي الذي تريد حمايته
    const targetUrl = "http://app.upsdo.me:8080/live/PCCQTZPXVCEG/041212071179/93914.ts";

    // 7. توجيه المستخدم للبث (Redirect)
    // نستخدم التوجيه هنا لضمان السرعة القصوى وعدم الضغط على سيرفر Render
    res.writeHead(302, {
        'Location': targetUrl,
        'Access-Control-Allow-Origin': '*'
    });
    res.end();
});

// تشغيل السيرفر على المنفذ الذي يطلبه Render
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
