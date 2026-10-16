// src/config.js

export const EVENT_CONFIG = {
    // October 17 at 08:00 in Lebanon (UTC+03:00).
    registrationOpensAt: new Date('2026-10-17T08:00:00+03:00'),
    registrationDeadline: new Date('2026-12-31T23:59:59+02:00'),

    // Set to true to forcibly close registration regardless of the date.
    forceCloseRegistration: false,

    eventName: "DevFest Lebanon 2026 — Be Part of It",
    eventDescription: "A day of ideas, hands-on learning, and new connections. Join us at BAU Tripoli on October 17th to explore technology and meet the people building what’s next."
};

export const isRegistrationOpen = (now = new Date()) => {
    if (EVENT_CONFIG.forceCloseRegistration) return false;
    return now >= EVENT_CONFIG.registrationOpensAt && now <= EVENT_CONFIG.registrationDeadline;
};
