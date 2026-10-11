import React from 'react';

// Local-date helpers. (toISOString shifts the day in timezones ahead of UTC, e.g. Dhaka.)
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const presetRange = (key) => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    switch (key) {
        case 'last': return { start: iso(new Date(y, m - 1, 1)), end: iso(new Date(y, m, 0)) };
        case '3m': return { start: iso(new Date(y, m - 2, 1)), end: iso(new Date(y, m + 1, 0)) };
        case 'year': return { start: iso(new Date(y, 0, 1)), end: iso(new Date(y, 11, 31)) };
        case 'all': return { start: '2000-01-01', end: iso(new Date(y + 1, 11, 31)) };
        default: return { start: iso(new Date(y, m, 1)), end: iso(new Date(y, m + 1, 0)) }; // this month
    }
};

const PRESETS = [['month', 'This month'], ['last', 'Last month'], ['3m', 'Last 3 months'], ['year', 'This year'], ['all', 'All time']];

export const rangeLabel = (r) => {
    for (const [k, label] of PRESETS) {
        const p = presetRange(k);
        if (p.start === r.start && p.end === r.end) return label;
    }
    return `${r.start} to ${r.end}`;
};

/** Preset chips + a specific from/to date. value = { start, end } (YYYY-MM-DD). */
const DateRangeBar = ({ value, onChange }) => {
    const isPreset = (k) => { const p = presetRange(k); return p.start === value.start && p.end === value.end; };
    return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {PRESETS.map(([k, label]) => (
                <button key={k} className={`fin-chip ${isPreset(k) ? 'on' : ''}`} onClick={() => onChange(presetRange(k))}>{label}</button>
            ))}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--fin-tx2)' }}>
                <input type="date" aria-label="From date" value={value.start} max={value.end}
                       onChange={(e) => e.target.value && onChange({ ...value, start: e.target.value })}
                       style={{ height: 30, border: '1px solid var(--fin-line-2)', borderRadius: 6, padding: '0 6px' }} />
                to
                <input type="date" aria-label="To date" value={value.end} min={value.start}
                       onChange={(e) => e.target.value && onChange({ ...value, end: e.target.value })}
                       style={{ height: 30, border: '1px solid var(--fin-line-2)', borderRadius: 6, padding: '0 6px' }} />
            </span>
        </div>
    );
};

export default DateRangeBar;
