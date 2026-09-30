import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProfile } from '../src/lib/profile.js';

test('extracts profile usernames while allowing query strings and trailing slashes', () => {
    assert.deepEqual(parseProfile(' https://github.com/test-user/ '), {platform:'GitHub',username:'test-user'});
    assert.deepEqual(parseProfile('https://www.linkedin.com/in/jane-doe/?trk=public'), {platform:'LinkedIn',username:'jane-doe'});
});
test('does not collapse invalid URLs, non-profile pages or lookalike hosts', () => {
    for (const value of ['', 'hello', 'https://github.com/', 'https://github.com/user/repo', 'https://linkedin.com/company/test', 'https://github.com.evil.com/user', 'javascript:alert(1)', 'https://user:password@github.com/test']) assert.equal(parseProfile(value), null);
});
