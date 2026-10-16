import test from 'node:test';
import assert from 'node:assert/strict';
import { isRegistrationOpen } from '../src/config.js';

test('opens exactly October 17 at 8 AM Lebanon time', () => {
    assert.equal(isRegistrationOpen(new Date('2026-10-17T04:59:59.999Z')), false);
    assert.equal(isRegistrationOpen(new Date('2026-10-17T05:00:00Z')), true);
    assert.equal(isRegistrationOpen(new Date('2026-12-31T22:00:00Z')), false);
});
