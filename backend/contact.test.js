const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { createApp } = require('./contact');

let server;
let baseUrl;
let messages;
let failDelivery;
let timestamp;

before(async () => {
    process.env.CONTACT_EMAIL_USER = 'owner@example.com';
    messages = [];
    timestamp = 1000000;
    server = createApp({
        now: () => timestamp,
        sendMail: async message => {
            if (failDelivery) throw new Error('mail transport unavailable');
            messages.push(message);
        },
    }).listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise(resolve => server.close(resolve));
});

async function submit(body, headers = {}) {
    return fetch(`${baseUrl}/contact`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Origin: 'https://kevinatruong.com',
            ...headers,
        },
        body: JSON.stringify({
            website: '',
            formStartedAt: timestamp - 5000,
            ...body,
        }),
    });
}

test('sends valid messages with the server address as sender', async () => {
    const response = await submit({ name: 'Kevin', email: 'visitor@example.com', message: 'Hello' });
    assert.equal(response.status, 200);
    assert.deepEqual(messages[0], {
        from: 'owner@example.com',
        replyTo: 'visitor@example.com',
        to: 'owner@example.com',
        subject: 'Portfolio message from Kevin',
        text: 'Hello',
    });
});

test('rejects invalid input and limits repeated requests', async () => {
    timestamp += 600001;
    assert.equal((await submit({ name: 'A\nB', email: 'bad', message: 'Hi' })).status, 400);
    for (let i = 0; i < 5; i++) {
        assert.equal((await submit({ name: 'A', email: 'a@example.com', message: 'Hi' })).status, 200);
    }
    assert.equal((await submit({ name: 'A', email: 'a@example.com', message: 'Hi' })).status, 429);
});

test('silently discards honeypot submissions', async () => {
    timestamp += 600001;
    const before = messages.length;
    const response = await submit({
        name: 'Bot',
        email: 'bot@example.com',
        message: 'Hello',
        website: 'https://spam.example',
    });
    assert.equal(response.status, 204);
    assert.equal(messages.length, before);
});

test('requires a plausible form age and same-site origin', async () => {
    assert.equal((await submit({
        name: 'A',
        email: 'a@example.com',
        message: 'Hi',
        website: undefined,
    })).status, 400);
    assert.equal((await submit({
        name: 'A',
        email: 'a@example.com',
        message: 'Hi',
        formStartedAt: timestamp,
    })).status, 400);
    assert.equal((await submit({
        name: 'A',
        email: 'a@example.com',
        message: 'Hi',
    }, { Origin: 'https://example.com' })).status, 403);
});

test('limits total delivery across rotating client addresses', async () => {
    timestamp += 3600001;
    for (let i = 0; i < 10; i++) {
        const response = await submit(
            { name: 'A', email: 'a@example.com', message: 'Hi' },
            { 'X-Forwarded-For': `198.51.100.${i + 1}` },
        );
        assert.equal(response.status, 200);
    }
    assert.equal((await submit(
        { name: 'A', email: 'a@example.com', message: 'Hi' },
        { 'X-Forwarded-For': '198.51.100.200' },
    )).status, 429);
});

test('reports delivery failure rather than success', async () => {
    timestamp += 3600001;
    failDelivery = true;
    const response = await submit({ name: 'A', email: 'a@example.com', message: 'Hi' });
    assert.equal(response.status, 502);
    failDelivery = false;
});
