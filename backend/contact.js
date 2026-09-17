const express = require('express');
const nodemailer = require('nodemailer');

const PORT = 33322;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

function createApp({ sendMail, now = Date.now } = {}) {
    const app = express();
    const requests = new Map();
    app.set('trust proxy', 'loopback');
    app.use(express.json({ limit: '16kb' }));
    app.get('/health', (_req, res) => res.sendStatus(200));

    app.post('/contact', async (req, res) => {
        const ip = req.ip;
        const timestamp = now();
        if (requests.size > 1000) {
            for (const [address, times] of requests) {
                if (times.every(time => timestamp - time >= WINDOW_MS)) requests.delete(address);
            }
        }
        const recent = (requests.get(ip) || []).filter(time => timestamp - time < WINDOW_MS);
        if (recent.length >= MAX_REQUESTS) {
            return res.status(429).send('Too many messages. Please try again later.');
        }
        recent.push(timestamp);
        requests.set(ip, recent);

        const { name, email, message } = req.body || {};
        const validName = typeof name === 'string' && name.trim().length >= 1 && name.trim().length <= 100 && !/[\r\n\x00-\x1f]/.test(name);
        const validEmail = typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const validMessage = typeof message === 'string' && message.trim().length >= 1 && message.length <= 5000;
        if (!validName || !validEmail || !validMessage) {
            return res.status(400).send('Please provide a valid name, email, and message.');
        }

        try {
            await sendMail({
                from: process.env.CONTACT_EMAIL_USER,
                replyTo: email,
                to: process.env.CONTACT_EMAIL_USER,
                subject: `Portfolio message from ${name.trim()}`,
                text: message.trim(),
            });
            res.status(200).send('Message sent successfully');
        } catch (error) {
            console.error('Contact delivery failed:', error.message);
            res.status(502).send('Could not send your message. Please try again later.');
        }
    });

    return app;
}

if (require.main === module) {
    if (!process.env.CONTACT_EMAIL_USER || !process.env.CONTACT_EMAIL_PASSWORD) {
        console.error('Missing contact email credentials');
        process.exit(1);
    }
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.CONTACT_EMAIL_USER,
            pass: process.env.CONTACT_EMAIL_PASSWORD,
        },
    });
    createApp({ sendMail: options => transporter.sendMail(options) }).listen(PORT, '127.0.0.1', () => {
        console.log(`Contact service listening on 127.0.0.1:${PORT}`);
    });
}

module.exports = { createApp };
