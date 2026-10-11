import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, MapPin, Package, Clock, CheckCircle2, AlertTriangle, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    fetchPickupLocations, fetchAwaitingPickup, fetchPickupHistory, createPickupRequest, syncAllStatuses,
} from './courierApi';
import PickupLocationsModal from './PickupLocationsModal';
import './CourierPickups.css';

const STATUS = {
    SUBMITTED: ['ok', 'Requested'],
    ALREADY_PENDING: ['warn', 'Already pending'],
    FAILED: ['bad', 'Failed'],
};

const fmtMoney = (n) => `৳${Number(n || 0).toLocaleString('en-BD', { maximumFractionDigits: 0 })}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

const CourierPickups = () => {
    const [locations, setLocations] = useState([]);
    const [awaiting, setAwaiting] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showLocations, setShowLocations] = useState(false);
    const [locationId, setLocationId] = useState('');
    const [estimQty, setEstimQty] = useState('');
    const [note, setNote] = useState('');
    const [qtyTouched, setQtyTouched] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const load = useCallback(async () => {
        try {
            const [locs, wait, hist] = await Promise.all([
                fetchPickupLocations(), fetchAwaitingPickup(), fetchPickupHistory(0, 10),
            ]);
            setLocations(locs || []);
            setAwaiting(wait || []);
            setHistory(hist?.content || []);
            const def = (locs || []).find((l) => l.primaryLocation) || (locs || [])[0];
            setLocationId((cur) => (cur && (locs || []).some((l) => String(l.id) === String(cur)) ? cur : def ? String(def.id) : ''));
        } catch (err) {
            console.error(err);
            toast.error('Could not load courier data');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    // Pre-fill the estimate with the real number of waiting parcels until the admin types their own.
    useEffect(() => {
        if (!qtyTouched) setEstimQty(awaiting.length ? String(awaiting.length) : '');
    }, [awaiting, qtyTouched]);

    const codHeld = awaiting.reduce((s, p) => s + (p.codAmount || 0), 0);
    const last = history[0];
    const hasPending = last && (last.status === 'SUBMITTED' || last.status === 'ALREADY_PENDING');

    const syncNow = async () => {
        setSyncing(true);
        try {
            const r = await syncAllStatuses();
            toast.success(`Checked ${r.checked} parcels, ${r.updated} updated${r.failed ? `, ${r.failed} failed` : ''}`);
            if (r.message) toast(r.message, { icon: 'ℹ️' });
            await load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not sync statuses');
        } finally { setSyncing(false); }
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!locationId) { toast.error('Add a pickup location first'); return; }
        setSubmitting(true);
        try {
            const res = await createPickupRequest({
                locationId: Number(locationId),
                note: note.trim() || null,
                estimQty: estimQty ? Number(estimQty) : null,
            });
            if (res.status === 'SUBMITTED') toast.success('Pickup requested — a rider will collect your parcels');
            else if (res.status === 'ALREADY_PENDING') toast(res.message, { icon: 'ℹ️' });
            else toast.error(res.message || 'Steadfast did not accept the request');
            setNote('');
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not send the request');
        } finally { setSubmitting(false); }
    };

    if (loading) return <div className="cp-wrap"><div className="cp-empty">Loading…</div></div>;

    return (
        <div className="cp-page">
            <div className="cp-pbar">
                <div>
                    <div className="cp-h1">Pickup requests</div>
                    <div className="cp-sub">Ask Steadfast to send a rider to collect your booked parcels</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="cp-btn" onClick={syncNow} disabled={syncing}><RefreshCw size={14} className={syncing ? 'cp-spin' : ''} /> Sync statuses</button>
                    <button className="cp-btn" onClick={() => setShowLocations(true)}><Settings size={14} /> Pickup locations</button>
                </div>
            </div>

            <div className="cp-wrap">
                <div className="cp-tiles">
                    <div className="cp-tile"><div className="cp-k"><Package size={14} /> Awaiting pickup</div><div className="cp-v">{awaiting.length}</div><div className="cp-m">parcels booked, not collected</div></div>
                    <div className="cp-tile"><div className="cp-k"><Truck size={14} /> COD to collect</div><div className="cp-v">{fmtMoney(codHeld)}</div><div className="cp-m">across waiting parcels</div></div>
                    <div className="cp-tile">
                        <div className="cp-k"><Clock size={14} /> Last request</div>
                        <div className="cp-v sm">{last ? fmtDate(last.createdAt) : 'None yet'}</div>
                        <div className="cp-m">{last ? (STATUS[last.status]?.[1] || last.status) : 'Send your first one'}</div>
                    </div>
                </div>

                <div className="cp-split">
                    <section className="cp-card">
                        <div className="cp-ch"><h3>Parcels waiting for the rider</h3><span className="cp-count">{awaiting.length}</span></div>
                        <div className="cp-tw">
                            <table className="cp-table">
                                <thead><tr><th>Invoice</th><th>Customer</th><th>City</th><th className="r">COD</th><th>Booked</th></tr></thead>
                                <tbody>
                                {awaiting.length === 0 && <tr><td colSpan={5} className="cp-empty">No parcels waiting. Book parcels from <Link to="/admin/orders">Orders</Link> first.</td></tr>}
                                {awaiting.map((p) => (
                                    <tr key={p.orderId}>
                                        <td><Link to={`/admin/orders/${p.orderId}`}>{p.invoiceNumber || `#${p.orderId}`}</Link><div className="cp-s">{p.consignmentId}</div></td>
                                        <td>{p.customerName}<div className="cp-s">{p.phone}</div></td>
                                        <td>{p.city}</td>
                                        <td className="r">{fmtMoney(p.codAmount)}</td>
                                        <td>{fmtDate(p.requestedAt)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <div className="cp-col">
                        <section className="cp-card">
                            <div className="cp-ch"><h3>Request a pickup</h3></div>
                            <form className="cp-form cp-pad" onSubmit={submit}>
                                {hasPending && (
                                    <div className="cp-note"><AlertTriangle size={15} /> A request is already open. Sending another is safe — Steadfast will tell you if one is pending.</div>
                                )}
                                {locations.length === 0 ? (
                                    <div className="cp-note"><MapPin size={15} /> Add a pickup location to get started.
                                        <button type="button" className="cp-link" onClick={() => setShowLocations(true)}>Add one</button></div>
                                ) : (
                                    <>
                                        <label>Pickup from
                                            <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                                                {locations.map((l) => <option key={l.id} value={l.id}>{l.label}{l.primaryLocation ? ' (default)' : ''}</option>)}
                                            </select>
                                        </label>
                                        <label>Estimated parcels
                                            <input type="number" min="1" value={estimQty} onChange={(e) => { setQtyTouched(true); setEstimQty(e.target.value); }} />
                                        </label>
                                        <label>Note for the rider <span className="cp-opt">optional</span>
                                            <textarea rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ring the bell twice, ask for Rafi…" />
                                        </label>
                                        <button className="cp-btn pri block" disabled={submitting}><Truck size={14} /> {submitting ? 'Sending…' : 'Request pickup'}</button>
                                    </>
                                )}
                            </form>
                        </section>

                        <section className="cp-card">
                            <div className="cp-ch"><h3>Recent requests</h3></div>
                            <div className="cp-hist">
                                {history.length === 0 && <div className="cp-empty">Nothing yet.</div>}
                                {history.map((h) => {
                                    const [cls, label] = STATUS[h.status] || ['warn', h.status];
                                    return (
                                        <div className="cp-hrow" key={h.id}>
                                            <div className="cp-hmain">
                                                <div className="cp-ht">{h.locationLabel || 'Pickup'} {h.estimQty ? `· ~${h.estimQty} parcels` : ''}</div>
                                                <div className="cp-s">{fmtDate(h.createdAt)}{h.createdBy ? ` · ${h.createdBy}` : ''}</div>
                                                {h.status === 'FAILED' && h.courierMessage && <div className="cp-err">{h.courierMessage}</div>}
                                            </div>
                                            <span className={`cp-pill ${cls}`}>{cls === 'ok' && <CheckCircle2 size={11} />}{label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {showLocations && (
                <PickupLocationsModal locations={locations} onClose={() => setShowLocations(false)} onChanged={load} />
            )}
        </div>
    );
};

export default CourierPickups;
