import React, { useEffect, useState } from 'react';
import { SmartLink } from './homeUtils';

/** Thin rotating message strip, managed from Admin → Homepage → Announcement bar. */
export default function AnnouncementBar({ items }) {
    const [i, setI] = useState(0);
    const [hidden, setHidden] = useState(() => {
        try { return sessionStorage.getItem('hp-ann-closed') === '1'; } catch (e) { return false; }
    });

    useEffect(() => {
        if (!items || items.length < 2) return undefined;
        const t = setInterval(() => setI((x) => (x + 1) % items.length), 5000);
        return () => clearInterval(t);
    }, [items]);

    if (!items || items.length === 0 || hidden) return null;
    const cur = items[i % items.length];

    const close = () => {
        setHidden(true);
        try { sessionStorage.setItem('hp-ann-closed', '1'); } catch (e) { /* ignore */ }
    };

    return (
        <div className="hp-ann" style={{ background: cur.bgColor || '#1f2937', color: cur.textColor || '#fff' }} role="region" aria-label="Announcements">
            <SmartLink url={cur.linkUrl} className="hp-ann-text" key={cur.id}>
                <span>{cur.title}</span>
                {cur.linkUrl && <u>Shop now</u>}
            </SmartLink>
            <button className="hp-ann-x" onClick={close} aria-label="Close announcement">×</button>
        </div>
    );
}
