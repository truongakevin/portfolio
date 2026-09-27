const express = require('express');
const nodemailer = require('nodemailer');

const PORT = 33322;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const GLOBAL_WINDOW_MS = 60 * 60 * 1000;
const MAX_GLOBAL_REQUESTS = 10;
const MIN_FORM_AGE_MS = 3 * 1000;
const MAX_FORM_AGE_MS = 4 * 60 * 60 * 1000;
const ALLOWED_ORIGINS = new Set([
    'https://kevinatruong.com',
    'https://www.kevinatruong.com',
]);

function requestOrigin(req) {
    const origin = req.get('origin');
    if (origin) return origin;
    const referer = req.get('referer');
    if (!referer) return null;
    try {
        return new URL(referer).origin;
    } catch {
        return null;
    }
}

function createApp({ sendMail, now = Date.now } = {}) {
    const app = express();
    const requests = new Map();
    let globalRequests = [];
    app.set('trust proxy', 'loopback');
    app.use(express.json({ limit: '16kb' }));
    app.get('/health', (_req, res) => res.sendStatus(200));

    app.post('/contact', async (req, res) => {
        const ip = req.ip;
        const timestamp = now();
        const { name, email, message, website, formStartedAt } = req.body || {};
        const validName = typeof name === 'string' && name.trim().length >= 1 && name.trim().length <= 100 && !/[\r\n\x00-\x1f]/.test(name);
        const validEmail = typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const validMessage = typeof message === 'string' && message.trim().length >= 1 && message.length <= 5000;
        if (!validName || !validEmail || !validMessage) {
            return res.status(400).send('Please provide a valid name, email, and message.');
        }

        if (typeof website !== 'string' || website.length > 200) {
            return res.status(400).send('Please reload the contact page and try again.');
        }
        if (website.trim()) {
            return res.sendStatus(204);
        }
        const formAge = timestamp - formStartedAt;
        if (!Number.isFinite(formStartedAt) || formAge < MIN_FORM_AGE_MS || formAge > MAX_FORM_AGE_MS) {
            return res.status(400).send('Please reload the contact page and try again.');
        }
        if (!ALLOWED_ORIGINS.has(requestOrigin(req))) {
            return res.status(403).send('Contact requests must come from the portfolio site.');
        }

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

        globalRequests = globalRequests.filter(time => timestamp - time < GLOBAL_WINDOW_MS);
        if (globalRequests.length >= MAX_GLOBAL_REQUESTS) {
            return res.status(429).send('Message delivery is temporarily busy. Please try again later.');
        }
        globalRequests.push(timestamp);

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
