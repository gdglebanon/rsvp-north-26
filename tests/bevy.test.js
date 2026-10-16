import test from 'node:test';
import assert from 'node:assert/strict';
import { BEVY_ENDPOINT, buildBevySubmission, confirmBevyInBackground } from '../src/lib/bevy.js';
import { FORM_ENDPOINT, submitRegistration } from '../src/lib/registration.js';

const form = {
    NewID: 'cf326425-30ef-46ef-b579-28d68ec91891', secretCode: 'Speaker',
    firstName: 'Test', lastName: 'Speaker', email: ' test@example.com ',
    organization: 'Test Company', referral: 'social_media',
    experience: 'Professional: 3 - 5 years', googleFamiliarity: '4',
    comments: 'Private Google Form comment', takeaways: ['Networking'],
};

test('matches the Confirm Participation payload, including all survey fields', () => {
    assert.deepEqual(buildBevySubmission(form), {
        ticket: 82068, first_name: 'Test', last_name: 'Speaker', email: 'test@example.com',
        company: 'Test Company', signup_consent: true,
        event_survey_entry: {survey: 393635, fields: {
            '2034556': null, '2034557': 'Social media', '2034558': '3-5 years',
            '2034559': '4 - Advanced', '2034560': 'Test Company', '2034561': null,
        }},
    });
});

test('preserves source experience and familiarity mappings', () => {
    for (const [experience, expected] of [
        ['Student', 'Not a developer'], ['Professional: 1 - 3 years', '1-2 years'],
        ['Professional: 5+ years', '6-10 years'], ['Professional: 10+ years', '10+ years'],
    ]) assert.equal(buildBevySubmission({...form, experience}).event_survey_entry.fields['2034558'], expected);
    for (const [index, label] of ['Novice','Fundamental','Intermediate','Advanced','Expert'].entries()) {
        assert.equal(buildBevySubmission({...form, googleFamiliarity: index + 1}).event_survey_entry.fields['2034559'], `${index + 1} - ${label}`);
    }
});

test('sends the same JSON request without delaying the Google Form result', async () => {
    const calls = [];
    let finishBackground;
    const result = await submitRegistration(form, async (url, options) => {
        calls.push({url, options});
        if (url === FORM_ENDPOINT) return {type: 'opaque'};
        return new Promise(resolve => { finishBackground = resolve; });
    });
    assert.equal(result.receiptConfirmed, false);
    assert.equal(calls.length, 2);
    const {url, options} = calls[1];
    assert.equal(url, BEVY_ENDPOINT);
    assert.equal(options.method, 'POST');
    assert.deepEqual(options.headers, {'Content-Type': 'application/json'});
    assert.equal(options.keepalive, true);
    assert.deepEqual(JSON.parse(options.body), buildBevySubmission(form));
    finishBackground({ok: true});
});

test('duplicate confirmations are accepted and failures do not reject', async () => {
    assert.equal(await confirmBevyInBackground(form, async () => ({ok: false, status: 400, text: async () => 'already on the waitlist'})), true);
    const original = console.warn;
    const warnings = [];
    console.warn = text => warnings.push(text);
    try {
        assert.equal(await confirmBevyInBackground(form, async () => {throw new Error('offline');}), false);
        assert.equal(await confirmBevyInBackground(form, async () => ({ok: false, status: 500})), false);
        assert.equal(warnings.length, 2);
        assert.ok(warnings.every(text => !text.includes(form.email)));
    } finally { console.warn = original; }
});

test('failed primary submissions do not create a Bevy registration', async () => {
    const calls = [];
    await assert.rejects(submitRegistration(form, async url => {
        calls.push(url); throw new Error('offline');
    }));
    assert.deepEqual(calls, [FORM_ENDPOINT]);
});
