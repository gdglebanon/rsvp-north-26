import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSubmission, submitRegistration, isValidFamiliarity, FORM_ENDPOINT } from '../src/lib/registration.js';

const form = {
    email: ' attendee@example.test ', firstName: 'Test', lastName: 'Attendee',
    organization: 'Test University', googleFamiliarity: '4',
    experience: 'Student: Year 1', attendedBefore: 'No', attendanceType: 'full_day',
    takeaways: ['Networking', 'Other'], otherTakeawaysInput: 'Meet speakers',
    techInterests: ['Flutter', 'Other'], otherTechInterestInput: 'Firebase',
    secretCode: 'do-not-transmit', comments: '',
};
test('maps text answers, custom selections, and required comments without leaking access codes', () => {
    const body = buildSubmission(form);
    assert.equal(body.get('entry.295367295'), 'attendee@example.test');
    assert.equal(body.get('entry.327953436'), '4');
    assert.equal(body.get('entry.160715155'), 'Test University');
    assert.equal(body.get('entry.143332262'), 'Student: Year 1');
    assert.equal(body.get('entry.2034856158'), 'Networking, Other: Meet speakers');
    assert.equal(body.get('entry.2022593'), 'Flutter, Other: Firebase');
    assert.equal(body.get('entry.313950534'), 'Full Day Experience');
    assert.equal(body.get('entry.204822568'), 'No additional comments');
    assert.equal([...body.keys()].length, 18);
    assert.ok(!body.toString().includes('do-not-transmit'));
});
test('requires a whole-number familiarity rating between 1 and 5', () => {
    for (const value of ['', 0, 6, 2.5, null, undefined, 'invalid']) {
        assert.equal(isValidFamiliarity(value), false);
        assert.throws(() => buildSubmission({ ...form, googleFamiliarity: value }));
    }
    for (const value of [1, 2, 3, 4, 5, '1', '5']) assert.equal(isValidFamiliarity(value), true);
});
test('submits directly without authentication and does not claim confirmed receipt', async () => {
    let calls = 0;
    const result = await submitRegistration(form, async (url, options) => {
        calls++;
        assert.equal(url, FORM_ENDPOINT);
        assert.equal(options.method, 'POST');
        assert.equal(options.mode, 'no-cors');
        assert.equal(options.credentials, 'omit');
        assert.equal(options.body.get('entry.327953436'), '4');
        return { type: 'opaque', ok: false };
    });
    assert.equal(calls, 1);
    assert.equal(result.receiptConfirmed, false);
});
test('surfaces network failures and rejects invalid input before sending', async () => {
    await assert.rejects(submitRegistration(form, async () => { throw new TypeError('Failed to fetch'); }), /Check your connection/);
    await assert.rejects(submitRegistration(form, async () => ({type: 'basic', ok: false})), /Unable to send/);
    const unexpected = () => assert.fail('Invalid data must not be sent');
    await assert.rejects(submitRegistration({...form, email: 'invalid'}, unexpected), /valid email/);
    await assert.rejects(submitRegistration({...form, organization: ''}, unexpected), /university/);
});

test('every destination field retains its required or optional answer', () => {
    const complete = { ...form, phone: '03123456', linkedIn: 'https://www.linkedin.com/in/test-only', region: 'North', ageRange: '24-30', gender: 'Prefer not to say', specialization: 'Frontend Developer', major: 'Computer Science', referral: 'partner: TEST Partner', comments: 'FINAL TEST — not a real attendee' };
    const actual = Object.fromEntries(buildSubmission(complete));
    assert.deepEqual(actual, {
        'entry.295367295': 'attendee@example.test', 'entry.674041903': 'Test',
        'entry.1797548834': 'Attendee', 'entry.630991022': '03123456',
        'entry.1089718516': 'https://www.linkedin.com/in/test-only',
        'entry.1070627913': 'North', 'entry.975849543': '24-30',
        'entry.1233592363': 'Prefer not to say', 'entry.175051641': 'Frontend Developer',
        'entry.143332262': 'Student: Year 1, Major: Computer Science',
        'entry.160715155': 'Test University', 'entry.1868580612': 'No',
        'entry.1640393405': 'partner: TEST Partner',
        'entry.2034856158': 'Networking, Other: Meet speakers',
        'entry.2022593': 'Flutter, Other: Firebase',
        'entry.313950534': 'Full Day Experience', 'entry.327953436': '4',
        'entry.204822568': 'FINAL TEST — not a real attendee',
    });
});
test('optional fields can be omitted and all attendance types retain their labels', () => {
    const minimal = { email: 'test@example.com', organization: 'Test', googleFamiliarity: '1' };
    const body = buildSubmission(minimal);
    for (const id of ['630991022', '975849543', '1233592363', '2022593']) assert.equal(body.get(`entry.${id}`), '');
    assert.equal(body.get('entry.204822568'), 'No additional comments');
    for (const [value, label] of Object.entries({full_day:'Full Day Experience',few_hours:'Flash Attendee (Few Hours)',networking:'Networking Focused (Visitor)',afternoon:'Afternoon attendee'})) {
        assert.equal(buildSubmission({...minimal, attendanceType:value}).get('entry.313950534'),label);
    }
});
