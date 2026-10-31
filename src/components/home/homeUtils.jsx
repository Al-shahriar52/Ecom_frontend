import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export const SITE = 'https://beautyhaat.com';

/** Turns an admin-entered link into an internal route or an external URL. */
export const resolveLink = (url) => {
    if (!url) return null;
    if (url.startsWith(SITE)) return { internal: true, to: url.slice(SITE.length) || '/' };
    if (url.startsWith('/')) return { internal: true, to: url };
    return { internal: false, href: url };
};

/** <Link>/<a>/<div> depending on the link, so banners work with or without a link. */
export const SmartLink = ({ url, className, children, ...rest }) => {
    const l = resolveLink(url);
    if (!l) return <div className={className} {...rest}>{children}</div>;
    if (l.internal) return <Link to={l.to} className={className} {...rest}>{children}</Link>;
    return <a href={l.href} className={className} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
};

const pad = (n) => String(n).padStart(2, '0');

/** Ticks once a second until `endIso`. Returns null when there is no end time or it has passed. */
export const useCountdown = (endIso) => {
    const target = endIso ? new Date(endIso).getTime() : NaN;
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        if (Number.isNaN(target)) return undefined;
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, [target]);
    if (Number.isNaN(target) || target <= now) return null;
    const s = Math.floor((target - now) / 1000);
    return { d: Math.floor(s / 86400), h: pad(Math.floor((s % 86400) / 3600)), m: pad(Math.floor((s % 3600) / 60)), s: pad(s % 60) };
};

export const Countdown = ({ endsAt, className = '' }) => {
    const c = useCountdown(endsAt);
    if (!c) return null;
    return (
        <span className={`hp-count ${className}`} aria-label="Time left">
            {c.d > 0 && <span><b>{c.d}</b>d</span>}
            <span><b>{c.h}</b>h</span>
            <span><b>{c.m}</b>m</span>
            <span><b>{c.s}</b>s</span>
        </span>
    );
};

export const SectionHead = ({ eyebrow, title, to, linkText = 'View all' }) => (
    <div className="hp-head">
        <div>
            {eyebrow && <span className="hp-eyebrow">{eyebrow}</span>}
            <h2>{title}</h2>
        </div>
        {to && <Link to={to} className="hp-viewall">{linkText} <span aria-hidden="true">→</span></Link>}
    </div>
);

export const reducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
