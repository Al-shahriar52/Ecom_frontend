import React, { useCallback, useEffect, useState } from 'react';
import { Check, X, Copy, RefreshCw, Package, Truck, MapPin, Clock, Wallet, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/AxiosInstance';
import './OrderTrackingPanel.css';

// Accepts an ISO string, a "2026,9,5,19,35,55,..." string or a [y,m,d,h,mi,s,ns] array (Java LocalDateTime) and returns a Date.
const toDate = (v) => {
    if (v == null || v === '') return null;
    let d;
    if (Array.isArray(v)) {
        const [y, mo, da, h = 0, mi = 0, sec = 0] = v.map(Number);
        d = new Date(y, mo - 1, da, h, mi, sec);
    } else if (typeof v === 'string' && /^\d{4},\d{1,2},\d{1,2}/.test(v)) {
        return toDate(v.split(','));
    } else {
        d = new Date(v);
    }
    return Number.isNaN(d.getTime()) ? null : d;
};

const fmtDateTime = (v) => {
    const d = toDate(v);
    if (!d) return v ? String(v) : null;
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
};

const ago = (v) => {
    const d = toDate(v);
    if (!d) return null;
    const mins = Math.round((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const h = Math.round(mins / 60);
    if (h < 24) return `${h} hr ago`;
    const days = Math.round(h / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
};

const duration = (hours) => {
    if (hours == null) return '';
    if (hours < 1) return 'under an hour';
    if (hours < 48) return `${hours} hr`;
    const d = Math.floor(hours / 24);
    const h = hours % 24;
    return h ? `${d} days ${h} hr` : `${d} days`;
};

/**
 * Order journey with times. `admin` switches the endpoint and shows courier-side details.
 * Fetches its own data so every place that shows tracking looks the same.
 */
const OrderTrackingPanel = ({ orderId, admin = false, onChanged }) => {
    const [t, setT] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        if (!orderId) return;
        setLoading(true);
        try {
            const url = admin ? `/api/v1/admin/orders/${orderId}/tracking` : `/api/v1/order/${orderId}/tracking`;
            const res = await axiosInstance.get(url);
            setT(res.data.data);
            setError(null);
            onChanged?.(res.data.data);
        } catch (e) {
            setError('Could not load tracking right now.');
        } finally {
            setLoading(false);
        }
    }, [orderId, admin, onChanged]);

    useEffect(() => { load(); }, [load]);

    const copy = (text) => {
        try { navigator.clipboard.writeText(text); toast.success('Copied'); } catch { /* clipboard unavailable */ }
    };

    if (loading && !t) return <div className="ot-muted">Loading tracking…</div>;
    if (error && !t) return <div className="ot-error">{error} <button className="ot-link" onClick={load}>Try again</button></div>;
    if (!t) return null;

    const cid = t.consignmentId;
    return (
        <div className="ot">
            <div className={`ot-hero ot-${t.tone}`}>
                <div className="ot-hero-top">
                    <div>
                        <div className="ot-eyebrow">{t.invoice ? `Invoice ${t.invoice}` : `Order #${t.orderId}`}</div>
                        <div className="ot-headline">{t.headline}</div>
                        <div className="ot-sub">
                            {t.finishedAt
                                ? `${t.tone === 'success' ? 'Delivered' : 'Closed'} on ${fmtDateTime(t.finishedAt)}`
                                : `Placed ${ago(t.placedAt)} · ${fmtDateTime(t.placedAt)}`}
                            {t.hoursInJourney != null && t.finishedAt && <> · took {duration(t.hoursInJourney)}</>}
                        </div>
                    </div>
                    <button className="ot-icon-btn" onClick={load} disabled={loading} title="Refresh">
                        <RefreshCw size={15} className={loading ? 'ot-spin' : ''} />
                    </button>
                </div>
                <div className="ot-bar"><span style={{ width: `${t.progressPct}%` }} /></div>
            </div>

            <div className="ot-grid">
                <div className="ot-chip"><Truck size={15} /><div><div className="ot-k">Courier</div><div className="ot-v">{t.courier || 'Not assigned yet'}</div></div></div>
                <div className="ot-chip"><Package size={15} /><div><div className="ot-k">Tracking ID</div>
                    <div className="ot-v">{cid || '—'} {cid && <button className="ot-icon-btn sm" onClick={() => copy(cid)} title="Copy"><Copy size={12} /></button>}</div></div></div>
                <div className="ot-chip"><Wallet size={15} /><div><div className="ot-k">{t.paymentMethod === 'COD' ? 'Pay on delivery' : 'Payment'}</div>
                    <div className="ot-v">{t.paymentMethod === 'COD' ? `৳${t.codAmount ?? '—'}` : 'Paid online'}</div></div></div>
                <div className="ot-chip"><Clock size={15} /><div><div className="ot-k">Time in journey</div><div className="ot-v">{duration(t.hoursInJourney)}</div></div></div>
            </div>

            {(t.riderName || t.riderPhone) ? (
                <div className="ot-rider">
                    <div className="ot-rider-ic"><User size={18} /></div>
                    <div className="ot-rider-info">
                        <div className="ot-k">Your delivery rider</div>
                        <div className="ot-v">{t.riderName || 'Name not shared'}</div>
                    </div>
                    {t.riderPhone && (
                        <a className="ot-call" href={`tel:${t.riderPhone}`}><Phone size={14} /> {t.riderPhone}</a>
                    )}
                </div>
            ) : admin && t.courier && (
                <div className="ot-muted" style={{ marginBottom: 10 }}>Rider name and phone appear here when the courier sends them.</div>
            )}

            {t.recipientAddress && (
                <div className="ot-dest"><MapPin size={15} /><div><strong>{t.recipientName}</strong><div className="ot-muted">{t.recipientAddress}</div></div></div>
            )}

            <ol className="ot-steps">
                {t.steps.map((s) => (
                    <li key={s.key} className={`ot-step ot-${s.state}`}>
                        <span className="ot-dot">{s.state === 'done' ? <Check size={13} strokeWidth={3} /> : s.state === 'failed' ? <X size={13} strokeWidth={3} /> : null}</span>
                        <div className="ot-step-body">
                            <div className="ot-step-title">{s.title}</div>
                            <div className="ot-muted">{s.detail}</div>
                        </div>
                        <div className="ot-time">
                            {s.time ? (<><div>{fmtDateTime(s.time)}</div><div className="ot-muted">{ago(s.time)}</div></>)
                                : s.state === 'done' ? <span className="ot-muted">Time not recorded</span> : null}
                        </div>
                    </li>
                ))}
            </ol>

            {t.courierEvents && t.courierEvents.length > 0 && (
                <div className="ot-events">
                    <div className="ot-section">Courier updates</div>
                    <ul>
                        {t.courierEvents.slice().reverse().map((e, i) => (
                            <li key={i}><span className="ot-ev-time">{fmtDateTime(e.time) || '—'}</span><span>{e.text}</span></li>
                        ))}
                    </ul>
                </div>
            )}

            {(!t.courierEvents || t.courierEvents.length === 0) && t.statusHistory && t.statusHistory.length > 0 && (
                <div className="ot-events">
                    <div className="ot-section">Status history</div>
                    <ul>
                        {t.statusHistory.slice().reverse().map((e, i) => (
                            <li key={i}><span className="ot-ev-time">{fmtDateTime(e.time) || '—'}</span><span>{e.text}</span></li>
                        ))}
                    </ul>
                    <div className="ot-muted" style={{ marginTop: 6 }}>Times are when we received each update from the courier.</div>
                </div>
            )}

            {admin && (
                <div className="ot-admin">
                    <span>Courier says: <strong>{t.courierStatus || 'not checked yet'}</strong></span>
                    {t.lastSyncedAt && <span>checked {ago(t.lastSyncedAt)}</span>}
                    {t.deliveryFee != null && <span>Courier fee ৳{t.deliveryFee}</span>}
                </div>
            )}
        </div>
    );
};

export default OrderTrackingPanel;
