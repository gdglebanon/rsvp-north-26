# GDG Lebanon RSVP

React/Vite RSVP interface that submits directly to the DevFest Google Form.

## Development

```sh
npm ci
npm run dev
```

Run `npm test` for submission checks and `npm run build` for a production build.
Optional: copy `.env.example` to `.env.local` to change the hosting base path.
Assets default to relative URLs so the build works at a domain root or a repository
subpath. Deploy the entire `dist` directory together, including `dist/assets`.

## Registration flow

Attendees complete the form and submit directly. Email is an ordinary required
contact field; there is no sign-in, email verification, pending session, or
five-minute editing window. Registration data is not stored in sessionStorage.

The required Google technology familiarity rating accepts 1–5 and is sent as text.
`src/lib/registration.js` maps answers to the supplied Google Form's public entry
IDs. Multi-select answers and custom “Other” values are serialized as text. Blank
comments become “No additional comments” because the destination requires that
field even though its label says optional. Access codes are not transmitted. A generated UUID is sent to the required `NewID` field (`entry.326468374`) and stays stable across retries on the same page.

Submission uses a URL-encoded POST to Google Forms with `mode: 'no-cors'`. Google
returns an opaque response, so the completion screen says the submission is pending
and asks attendees to wait for the organizers' email confirmation. The app does not
send that email automatically. Network failures keep the form available for
retry. This is a form-backed submission prototype, not a verified registration API;
use a backend with explicit success responses if confirmed receipt is needed.
Unit tests mock the transport and do not create real form responses.

Event settings and registration deadline are in `src/config.js`. Use
`npm run deploy` to publish the static build to GitHub Pages.


Registration stays closed until October 17, 2026 at 08:00 Lebanon time (05:00 UTC).
Before opening, visitors see: “Registration is now closed. Please visit the info desk
tomorrow if you are not registered to get your visitor badge (no lunch meal guarantee), only starting at 10:30 AM.” Open pages update automatically.
At opening, the form displays the prefilled `RSVP26` code and a note inviting people
without a ticket to join the Visitor Experience from 10:30 AM.

The four case-insensitive codes are `RSVP26`, `Speaker`, `Partner`, and `Volunteer`.
Role codes append `SPEAKER_EXTERNAL`, `PARTNER_EXTERNAL`, or `VOLUNTEER_EXTERNAL`
to Additional Comments while preserving attendee text. Switching codes replaces
the previous marker. Visitor Experience is selected automatically and cannot be
changed; submission mapping enforces it too. This remains a direct Google Forms
flow with no backend or sign-in dependency.
