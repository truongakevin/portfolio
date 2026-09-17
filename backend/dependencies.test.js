const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

test('runtime imports are present before deployment', () => {
    for (const file of ['contact.js', 'spotify.js', 'tiktok.js']) {
        const source = fs.readFileSync(path.join(__dirname, file), 'utf8');
        for (const [, moduleName] of source.matchAll(/require\(['"]([^'"]+)['"]\)/g)) {
            assert.doesNotThrow(() => require.resolve(moduleName), `${file} imports missing ${moduleName}`);
        }
    }
});
