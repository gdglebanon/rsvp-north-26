import { useRef, useState } from 'react';
import { Github, Linkedin, Pencil } from 'lucide-react';
import { parseProfile } from '../lib/profile';

export default function ProfileField({ value, onChange, onBlur, error }) {
    const [editing, setEditing] = useState(true);
    const input = useRef(null);
    const profile = parseProfile(value);
    const compact = !editing && profile;
    const Icon = profile?.platform === 'GitHub' ? Github : Linkedin;

    function finish(event) {
        onBlur(event);
        if (parseProfile(event.target.value)) setEditing(false);
    }

    return <>
        <input ref={input} hidden={Boolean(compact)} type="url" name="linkedIn"
            aria-label="LinkedIn or GitHub URL" aria-required="true" aria-invalid={Boolean(error)}
            autoCapitalize="none" autoCorrect="off" spellCheck={false}
            placeholder="Paste your profile URL" value={value} onChange={onChange} onBlur={finish}
            onKeyDown={event => {
                if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); }
            }} />
        {compact && <div className="profile-summary">
            <Icon size={20} aria-label={profile.platform} className="profile-icon" />
            <span className="profile-username" title={`${profile.platform}: ${profile.username}`}>{profile.username}</span>
            <button type="button" className="profile-edit" aria-label="Edit LinkedIn or GitHub URL"
                onClick={() => { setEditing(true); requestAnimationFrame(() => input.current?.focus()); }}>
                <Pencil size={14} aria-hidden="true" /> Edit
            </button>
        </div>}
    </>;
}
