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
    timestamp = 0;
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

async function submit(body) {
    return fetch(`${baseUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
    for (let i = 0; i < 4; i++) {
        assert.equal((await submit({ name: 'A', email: 'a@example.com', message: 'Hi' })).status, 200);
    }
    assert.equal((await submit({ name: 'A', email: 'a@example.com', message: 'Hi' })).status, 429);
});

test('reports delivery failure rather than success', async () => {
    timestamp += 600001;
    failDelivery = true;
    const response = await submit({ name: 'A', email: 'a@example.com', message: 'Hi' });
    assert.equal(response.status, 502);
    failDelivery = false;
});
