export function parseProfile(value) {
    try {
        const url = new URL(value.trim());
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
        const host = url.hostname.toLowerCase().replace(/^www\./, '');
        const parts = url.pathname.split('/').filter(Boolean);
        if (host === 'github.com' && parts.length === 1 && /^[\w-]+$/.test(parts[0])) {
            return { platform: 'GitHub', username: parts[0] };
        }
        if (host === 'linkedin.com' && parts[0] === 'in' && parts.length === 2) {
            return { platform: 'LinkedIn', username: decodeURIComponent(parts[1]) };
        }
        return null;
    } catch { return null; }
}
