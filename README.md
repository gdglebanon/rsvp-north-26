# GDG Lebanon RSVP

React/Vite RSVP interface that submits directly to the DevFest Google Form.

## Development

```sh
npm ci
npm run dev
```

Run `npm test` for submission checks and `npm run build` for a production build.
Optional: copy `.env.example` to `.env.local` to change the hosting base path.

## Registration flow

Attendees complete the form and submit directly. Email is an ordinary required
contact field; there is no sign-in, email verification, pending session, or
five-minute editing window. Registration data is not stored in sessionStorage.

The required Google technology familiarity rating accepts 1–5 and is sent as text.
`src/lib/registration.js` maps answers to the supplied Google Form's public entry
IDs. Multi-select answers and custom “Other” values are serialized as text. Blank
comments become “No additional comments” because the destination requires that
field even though its label says optional. VIP access codes are not transmitted.

Submission uses a URL-encoded POST to Google Forms with `mode: 'no-cors'`. Google
returns an opaque response, so the completion screen says the submission is pending
and asks attendees to wait for the organizers' email confirmation. The app does not
send that email automatically. Network failures keep the form available for
retry. This is a form-backed submission prototype, not a verified registration API;
use a backend with explicit success responses if confirmed receipt is needed.
Unit tests mock the transport and do not create real form responses.

Event settings and registration deadline are in `src/config.js`. Use
`npm run deploy` to publish the static build to GitHub Pages.
