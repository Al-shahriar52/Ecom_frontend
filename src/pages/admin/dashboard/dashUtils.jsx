import React, { useEffect, useRef, useState } from 'react';

/* ---------- formatting ---------- */
export const money = (v) => `৳${Math.round(Number(v) || 0).toLocaleString('en-US')}`;
export const num = (v) => (Number(v) || 0).toLocaleString('en-US');
export const compact = (v) => {
    const n = Number(v) || 0;
    if (n >= 1e7) return `${(n / 1e7).toFixed(1).replace(/\.0$/, '')}Cr`;
    if (n >= 1e5) return `${(n / 1e5).toFixed(1).replace(/\.0$/, '')}L`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, '')}k`;
    return String(Math.round(n));
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const shortDate = (iso) => {                      // "2026-11-01" -> "1 Nov" (no timezone shifts)
    const [, m, d] = String(iso).split('-');
    return `${Number(d)} ${MONTHS[Number(m) - 1] || ''}`;
};
export const pctChange = (cur, prev) => {
    const c = Number(cur) || 0; const p = Number(prev) || 0;
    if (p === 0) return c > 0 ? null : 0;                // null = "new" (no base to compare)
    return ((c - p) / p) * 100;
};
export const timeAgo = (iso) => {
    if (!iso) return '';
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return '';
    const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    const d = Math.floor(s / 86400);
    return d < 30 ? `${d} d ago` : new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

/* ---------- icons (inline, so nothing depends on the icon library version) ---------- */
const ICONS = {
    bag: [['path', 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z'], ['path', 'M3 6h18'], ['path', 'M16 10a4 4 0 0 1-8 0']],
    wallet: [['path', 'M20 12V8H6a2 2 0 0 1 0-4h12v4'], ['path', 'M4 6v12a2 2 0 0 0 2 2h14v-4'], ['path', 'M18 12a2 2 0 0 0 0 4h4v-4z']],
    clock: [['circle', 12, 12, 10], ['path', 'M12 6v6l4 2']],
    users: [['path', 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'], ['circle', 9, 7, 4], ['path', 'M23 21v-2a4 4 0 0 0-3-3.87'], ['path', 'M16 3.13a4 4 0 0 1 0 7.75']],
    box: [['path', 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'], ['path', 'M3.27 6.96 12 12.01l8.73-5.05'], ['path', 'M12 22.08V12']],
    alert: [['path', 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'], ['path', 'M12 9v4'], ['path', 'M12 17h.01']],
    truck: [['rect', 1, 3, 15, 13], ['path', 'M16 8h4l3 3v5h-7z'], ['circle', 5.5, 18.5, 2.5], ['circle', 18.5, 18.5, 2.5]],
    refresh: [['path', 'M23 4v6h-6'], ['path', 'M1 20v-6h6'], ['path', 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15']],
    plus: [['path', 'M12 5v14'], ['path', 'M5 12h14']],
    up: [['path', 'M7 17 17 7'], ['path', 'M7 7h10v10']],
    down: [['path', 'M7 7 17 17'], ['path', 'M17 7v10H7']],
    trend: [['path', 'M23 6 13.5 15.5 8.5 10.5 1 18'], ['path', 'M17 6h6v6']],
    chevron: [['path', 'm9 18 6-6-6-6']],
    check: [['path', 'M20 6 9 17l-5-5']],
};

export function Icon({ name, size = 18 }) {
    const parts = ICONS[name] || [];
    return (
        <svg className="ad-ico" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            {parts.map((p, i) => {
                if (p[0] === 'path') return <path key={i} d={p[1]} />;
                if (p[0] === 'circle') return <circle key={i} cx={p[1]} cy={p[2]} r={p[3]} />;
                if (p[0] === 'rect') return <rect key={i} x={p[1]} y={p[2]} width={p[3]} height={p[4]} rx="1" />;
                return null;
            })}
        </svg>
    );
}

/* ---------- charts (plain SVG) ---------- */
const useWidth = () => {
    const ref = useRef(null);
    const [w, setW] = useState(600);
    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const measure = () => setW(Math.max(240, el.clientWidth));
        measure();
        if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure); }
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    return [ref, w];
};

/** Smooth area chart with grid, hover line and tooltip. data: [{label, value, extra}] */
export function AreaChart({ data, height = 260, color = '#4f46e5', format = money, extraLabel }) {
    const [ref, width] = useWidth();
    const [hover, setHover] = useState(null);
    const pad = { l: 46, r: 12, t: 14, b: 26 };
    const iw = width - pad.l - pad.r;
    const ih = height - pad.t - pad.b;
    const max = Math.max(1, ...data.map((d) => d.value));
    const niceMax = (() => { const p = 10 ** Math.floor(Math.log10(max)); const f = max / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; })();
    const x = (i) => pad.l + (data.length <= 1 ? iw / 2 : (i / (data.length - 1)) * iw);
    const y = (v) => pad.t + ih - (v / niceMax) * ih;
    const pts = data.map((d, i) => [x(i), y(d.value)]);

    const line = pts.reduce((acc, p, i, arr) => {
        if (i === 0) return `M${p[0]},${p[1]}`;
        const prev = arr[i - 1];
        const cx = (prev[0] + p[0]) / 2;
        return `${acc} C${cx},${prev[1]} ${cx},${p[1]} ${p[0]},${p[1]}`;
    }, '');
    const area = pts.length ? `${line} L${pts[pts.length - 1][0]},${pad.t + ih} L${pts[0][0]},${pad.t + ih} Z` : '';
    const gid = `g${color.replace('#', '')}`;
    const tickEvery = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(iw / 70))));

    const onMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left - pad.l;
        const i = Math.round((px / iw) * (data.length - 1));
        setHover(Math.max(0, Math.min(data.length - 1, i)));
    };

    return (
        <div ref={ref} className="ad-chart" style={{ height }}>
            <svg width={width} height={height} onMouseMove={onMove} onTouchMove={onMove} onMouseLeave={() => setHover(null)} onTouchEnd={() => setHover(null)}>
                <defs>
                    <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity=".28" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[0, 1, 2, 3, 4].map((g) => {
                    const v = (niceMax / 4) * g;
                    return (
                        <g key={g}>
                            <line x1={pad.l} x2={width - pad.r} y1={y(v)} y2={y(v)} className="ad-grid" />
                            <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" className="ad-axis">{compact(v)}</text>
                        </g>
                    );
                })}
                {data.map((d, i) => (i % tickEvery === 0 || i === data.length - 1) && (
                    <text key={i} x={x(i)} y={height - 6} textAnchor="middle" className="ad-axis">{d.label}</text>
                ))}
                {area && <path d={area} fill={`url(#${gid})`} />}
                {line && <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                {hover !== null && pts[hover] && (
                    <g>
                        <line x1={pts[hover][0]} x2={pts[hover][0]} y1={pad.t} y2={pad.t + ih} className="ad-cross" />
                        <circle cx={pts[hover][0]} cy={pts[hover][1]} r="5" fill="#fff" stroke={color} strokeWidth="2.5" />
                    </g>
                )}
            </svg>
            {hover !== null && data[hover] && (
                <div className="ad-tip" style={{ left: Math.min(Math.max(pts[hover][0], 70), width - 70), top: Math.max(pts[hover][1] - 12, 8) }}>
                    <b>{data[hover].label}</b>
                    <span>{format(data[hover].value)}</span>
                    {extraLabel && data[hover].extra !== undefined && <small>{extraLabel(data[hover].extra)}</small>}
                </div>
            )}
        </div>
    );
}

export function Sparkline({ values, color = '#4f46e5', width = 96, height = 34 }) {
    if (!values || values.length < 2) return <svg width={width} height={height} aria-hidden="true" />;
    const max = Math.max(...values); const min = Math.min(...values);
    const span = max - min || 1;
    const pts = values.map((v, i) => [(i / (values.length - 1)) * (width - 4) + 2, height - 4 - ((v - min) / span) * (height - 8)]);
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    return (
        <svg width={width} height={height} aria-hidden="true">
            <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function Donut({ slices, size = 150, thickness = 20, center }) {
    const total = slices.reduce((s, x) => s + x.value, 0);
    const r = (size - thickness) / 2;
    const c = 2 * Math.PI * r;
    let offset = 0;
    return (
        <div className="ad-donut" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
                {total > 0 && slices.map((s) => {
                    const len = (s.value / total) * c;
                    const el = <circle key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
                                       strokeDasharray={`${Math.max(len - 2, 0)} ${c - Math.max(len - 2, 0)}`} strokeDashoffset={-offset} />;
                    offset += len;
                    return el;
                })}
            </svg>
            <div className="ad-donut-c">{center}</div>
        </div>
    );
}

export function Delta({ cur, prev, suffix = 'vs yesterday' }) {
    const p = pctChange(cur, prev);
    if (p === null) return <span className="ad-delta new">New {suffix && <i>{suffix}</i>}</span>;
    if (Math.abs(p) < 0.05) return <span className="ad-delta flat">0% {suffix && <i>{suffix}</i>}</span>;
    const up = p > 0;
    return (
        <span className={`ad-delta ${up ? 'up' : 'down'}`}>
            <Icon name={up ? 'up' : 'down'} size={13} />{Math.abs(p).toFixed(1)}% {suffix && <i>{suffix}</i>}
        </span>
    );
}
