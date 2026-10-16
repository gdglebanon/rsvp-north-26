// Event 131276 pre-order survey and ticket from the supplied Bevy request.
export const BEVY_ENDPOINT = 'https://gdg.community.dev/api/event/131276/waitlist/list/';

const familiarity = {
    1: '1 - Novice', 2: '2 - Fundamental', 3: '3 - Intermediate',
    4: '4 - Advanced', 5: '5 - Expert',
};

function referralChoice(value = '') {
    const source = value.trim().toLowerCase();
    if (source === 'meetup.com') return 'Meetup.com';
    if (['social_media', 'social media'].includes(source)) return 'Social media';
    if (['gdg_website', 'gdg website / newsletter', 'notified by this community'].includes(source)) return 'Notified by this community';
    if (['friends', 'friends / colleagues', 'university', 'partner', 'via partner', 'recommended by a friend or peer'].includes(source) || source.startsWith('partner:')) return 'Recommended by a friend or peer';
    return 'Other';
}

function experienceChoice(value) {
    if (!value) return null;
    const source = (Array.isArray(value) ? value.join(', ') : String(value)).toLowerCase();
    // Prefer professional experience when the attendee also selects Student.
    const professional = source.match(/professional:\s*([^,]+)/)?.[1] || source;
    if (professional.includes('10+')) return '10+ years';
    if (/6\s*-\s*10|5\+/.test(professional)) return '6-10 years';
    if (/3\s*-\s*5/.test(professional)) return '3-5 years';
    if (/1\s*-\s*[23]/.test(professional)) return '1-2 years';
    if (/intern|<\s*1|up to 1 year/.test(professional)) return 'Up to 1 year';
    if (source.includes('student') || source.includes('not a developer')) return 'Not a developer';
    return null;
}

export function buildBevySubmission(form) {
    return {
        ticket: 83923,
        first_name: form.firstName || '',
        last_name: form.lastName || '',
        email: String(form.email || '').trim(),
        event_survey_entry: {
            survey: 393635,
            fields: {
                '2034556': null,
                '2034557': referralChoice(form.referral),
                '2034558': experienceChoice(form.experience),
                '2034559': familiarity[form.googleFamiliarity] || '1 - Novice',
                '2034560': form.organization || '',
                '2034561': null,
            },
        },
        signup_consent: true,
    };
}

// Deliberately independent of the visible Google Form submission result.
// No retries: a lost response may still have added the email to the waitlist.
export async function confirmBevyInBackground(form, send = fetch) {
    try {
        const response = await send(BEVY_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildBevySubmission(form)),
            keepalive: true,
        });
        if (response.ok) return true;
        if (response.status === 400 && (await response.text()).includes('already on the waitlist')) return true;
        console.warn('Background event confirmation was not accepted.');
    } catch {
        console.warn('Background event confirmation could not be completed.');
    }
    return false;
}
