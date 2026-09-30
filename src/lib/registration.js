// Public field IDs from the supplied DevFest Google Form.
export const FORM_ENDPOINT = 'https://docs.google.com/forms/d/e/1FAIpQLScDTrRzdjQPncFCWutQ2nM8GyFUpvqLVabhrcY3dc3LNxYcYw/formResponse';
export const FORM_FIELDS = {
    email: '295367295', firstName: '674041903', lastName: '1797548834',
    phone: '630991022', linkedIn: '1089718516', region: '1070627913',
    ageRange: '975849543', gender: '1233592363', specialization: '175051641',
    experience: '143332262', organization: '160715155', attendedBefore: '1868580612',
    referral: '1640393405', takeaways: '2034856158', techInterests: '2022593',
    attendanceType: '313950534', googleFamiliarity: '327953436', comments: '204822568',
};
export const isValidFamiliarity = value => /^[1-5]$/.test(String(value));
const attendanceLabels = {
    full_day: 'Full Day Experience', few_hours: 'Flash Attendee (Few Hours)',
    networking: 'Networking Focused (Visitor)', afternoon: 'Afternoon attendee',
};
const selections = (values = [], other = '') => values.map(value =>
    value === 'Other' && other.trim() ? `Other: ${other.trim()}` : value
).join(', ');

export function buildSubmission(form) {
    if (!isValidFamiliarity(form.googleFamiliarity)) throw new Error('Please select a rating from 1 to 5.');
    const email = String(form.email || '').trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid email.');
    if (!form.organization?.trim()) throw new Error('Company or university is required.');
    const values = {
        ...form, email,
        experience: [form.experience, form.major?.trim() && `Major: ${form.major.trim()}`].filter(Boolean).join(', '),
        takeaways: selections(form.takeaways, form.otherTakeawaysInput),
        techInterests: selections(form.techInterests, form.otherTechInterestInput),
        attendanceType: attendanceLabels[form.attendanceType] || form.attendanceType,
        comments: form.comments?.trim() || 'No additional comments',
    };
    // Only mapped answers are transmitted; access codes and local UI state are excluded.
    return new URLSearchParams(Object.entries(FORM_FIELDS).map(([key, id]) =>
        [`entry.${id}`, String(values[key] ?? '')]
    ));
}

export async function submitRegistration(form, send = fetch) {
    const body = buildSubmission(form);
    try {
        const response = await send(FORM_ENDPOINT, {
            method: 'POST', mode: 'no-cors', credentials: 'omit', body,
        });
        // Cross-origin no-cors responses are opaque, so receipt cannot be verified.
        if (response.type !== 'opaque' && !response.ok) throw new Error('Request rejected');
        return { receiptConfirmed: false };
    } catch {
        throw new Error('Unable to send your RSVP request. Check your connection and try again.');
    }
}
