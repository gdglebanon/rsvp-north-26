// Matches the Confirm Participation request in sendToBevy.html.
export const BEVY_ENDPOINT = 'https://gdg.community.dev/api/event/131276/waitlist/list/';

function transformToSurveyEntry(response, ticketId) {
    if (!response || !response.data) throw new Error('Invalid response format');
    const data = response.data;
    const surveyId = 393635; // Updated Survey ID

    // Map 'how did you learn' field
    const referenceMap = { 
        'social_media': 'Social media', 
        'gdg_website': 'Notified by this community', 
        'friends': 'Recommended by a friend or peer', 
        'university': 'Recommended by a friend or peer', 
        'partner': 'Recommended by a friend or peer', 
        'other_events': 'Other', 
        'other': 'Other' 
    };
    
    // Fallback to match API JSON format if the original key format isn't there
    const howHeard = data["How did you hear about DevFest"] || data.reference;
    const fieldLearn = referenceMap[howHeard?.toLowerCase().replace(' ', '_')] || 'Other';

    // Map experience values from Google Sheets text to strict API choices
    let experienceVal = 'Not a developer'; // Default
    const expSource = data["Experience / Study Category (Select all that apply)"] || data.experience;
    if (expSource) {
        let expStr = Array.isArray(expSource) ? expSource.join(' ') : String(expSource);
        expStr = expStr.toLowerCase();
        
        if (expStr.includes('student')) {
            experienceVal = 'Not a developer';
        } else if (expStr.includes('1 - 3') || expStr.includes('1-3') || expStr.includes('1 - 2')) {
            experienceVal = '1-2 years';
        } else if (expStr.includes('3 - 5') || expStr.includes('3-5')) {
            experienceVal = '3-5 years';
        } else if (expStr.includes('5+') || expStr.includes('6-10') || expStr.includes('6 - 10')) {
            experienceVal = '6-10 years';
        } else if (expStr.includes('10+')) {
            experienceVal = '10+ years';
        } else if (expStr.includes('professional')) {
            // Fallback for professionals without clear year mapping
            experienceVal = '1-2 years'; 
        }
    }

    return {
        ticket: ticketId,
        first_name: data["First Name"] || data.firstName || '',
        last_name: data["Last Name"] || data.lastName || '',
        email: data.Email || data.email || '',
        company: data["University / Company"] || data.company || '',
        event_survey_entry: {
            survey: surveyId,
            fields: {
                '2034556': null, // Text snippet 1
                '2034557': fieldLearn,
                '2034558': experienceVal,
                '2034559': '1 - Novice', // Default, updated on submit based on fetchedUserData
                '2034560': data["University / Company"] || data.company || '',
                '2034561': null  // Text snippet 2
            }
        },
        signup_consent: true
    };
}

export function buildBevySubmission(form) {
    const data = {
        'First Name': form.firstName,
        'Last Name': form.lastName,
        Email: String(form.email || '').trim(),
        'University / Company': form.organization,
        'How did you hear about DevFest': form.referral,
        'Experience / Study Category (Select all that apply)': form.experience,
    };
    const payload = transformToSurveyEntry({ data }, 82068);
    const familiarity = {
        1: '1 - Novice', 2: '2 - Fundamental', 3: '3 - Intermediate',
        4: '4 - Advanced', 5: '5 - Expert',
    };
    payload.event_survey_entry.fields['2034559'] = familiarity[form.googleFamiliarity] || '1 - Novice';
    return payload;
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
