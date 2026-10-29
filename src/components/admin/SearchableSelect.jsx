import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import './SearchableSelect.css';

/**
 * Drop-in replacement for a <select> with a search box inside the list.
 *
 * Props:
 *  - name, value (option id), options [{id, name}]
 *  - onChange({ target: { name, value } })  (same shape as a normal input change event)
 *  - placeholder, searchPlaceholder, emptyText, required, disabled, clearable
 */
export default function SearchableSelect({
    name, value, options = [], onChange, placeholder = 'Select…', searchPlaceholder = 'Search…',
    emptyText = 'No matches', required = false, disabled = false, clearable = false,
}) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const [active, setActive] = useState(0);
    const wrap = useRef(null);
    const input = useRef(null);
    const list = useRef(null);

    const selected = options.find((o) => String(o.id) === String(value));
    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return options;
        const starts = [];
        const contains = [];
        options.forEach((o) => {
            const n = String(o.name || '').toLowerCase();
            if (n.startsWith(t)) starts.push(o);
            else if (n.includes(t)) contains.push(o);
        });
        return [...starts, ...contains];
    }, [options, q]);

    const close = useCallback(() => { setOpen(false); setQ(''); }, []);

    useEffect(() => {
        if (!open) return undefined;
        const h = (e) => { if (wrap.current && !wrap.current.contains(e.target)) close(); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open, close]);

    useEffect(() => {
        if (open) {
            const i = filtered.findIndex((o) => String(o.id) === String(value));
            setActive(i >= 0 ? i : 0);
            setTimeout(() => input.current && input.current.focus(), 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => { setActive(0); }, [q]);

    useEffect(() => {
        if (!open || !list.current) return;
        const el = list.current.children[active];
        if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    }, [active, open]);

    const pick = (o) => {
        onChange && onChange({ target: { name, value: o ? o.id : '' } });
        close();
    };

    const onKey = (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
        else if (e.key === 'Enter') { e.preventDefault(); if (filtered[active]) pick(filtered[active]); }
        else if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'Tab') close();
    };

    const highlight = (text) => {
        const t = q.trim();
        if (!t) return text;
        const i = String(text).toLowerCase().indexOf(t.toLowerCase());
        if (i < 0) return text;
        return (<>{text.slice(0, i)}<mark>{text.slice(i, i + t.length)}</mark>{text.slice(i + t.length)}</>);
    };

    return (
        <div className={`ss ${open ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`} ref={wrap}>
            <button type="button" className="ss-trigger" disabled={disabled} onClick={() => setOpen((o) => !o)}
                    aria-haspopup="listbox" aria-expanded={open}>
                <span className={selected ? 'ss-val' : 'ss-ph'}>{selected ? selected.name : placeholder}</span>
                <span className="ss-icons">
                    {clearable && selected && !disabled && (
                        <span className="ss-clear" role="button" tabIndex={-1} aria-label="Clear"
                              onClick={(e) => { e.stopPropagation(); pick(null); }}><X size={14} /></span>
                    )}
                    <ChevronDown size={16} className="ss-chev" />
                </span>
            </button>

            {/* keeps native form validation working for required fields */}
            {required && (
                <input className="ss-native" tabIndex={-1} required value={selected ? String(selected.id) : ''} onChange={() => {}} aria-hidden="true" />
            )}

            {open && (
                <div className="ss-pop" role="listbox">
                    <div className="ss-search">
                        <Search size={15} />
                        <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
                               placeholder={searchPlaceholder} autoComplete="off" />
                        {q && <button type="button" className="ss-x" onClick={() => { setQ(''); input.current && input.current.focus(); }} aria-label="Clear search"><X size={14} /></button>}
                    </div>
                    <ul ref={list}>
                        {filtered.map((o, i) => {
                            const isSel = String(o.id) === String(value);
                            return (
                                <li key={o.id} role="option" aria-selected={isSel}
                                    className={`${i === active ? 'on' : ''} ${isSel ? 'sel' : ''}`}
                                    onMouseEnter={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(o)}>
                                    <span>{highlight(String(o.name))}</span>
                                    {isSel && <Check size={15} />}
                                </li>
                            );
                        })}
                        {filtered.length === 0 && <li className="ss-empty">{emptyText}</li>}
                    </ul>
                    <div className="ss-foot">{filtered.length} of {options.length}</div>
                </div>
            )}
        </div>
    );
}
