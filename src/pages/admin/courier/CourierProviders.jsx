import WebhookEvents from './WebhookEvents';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Plug, Star, Store } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchProviders, updateProvider, testPathaoConnection } from './courierApi';
import CourierBadge from './CourierBadge';
import './CourierPickups.css';

const CAPS = [
    ['singleBooking', 'Single booking'],
    ['bulkBooking', 'Bulk booking'],
    ['pickupRequest', 'Separate pickup request'],
    ['priceQuote', 'Fee quote before booking'],
    ['statusLookup', 'Status lookup'],
];

const CourierProviders = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(null);

    const load = useCallback(async () => {
        try { setProviders(await fetchProviders() || []); }
        catch (e) { toast.error('Could not load couriers'); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { load(); }, [load]);

    const change = async (p, payload, okMsg) => {
        setBusy(p.provider);
        try {
            setProviders(await updateProvider(p.provider, payload));
            toast.success(okMsg);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Could not update courier');
        } finally { setBusy(null); }
    };

    const test = async (p) => {
        setBusy(p.provider);
        try { await testPathaoConnection(); toast.success('Connected to Pathao'); }
        catch (e) { toast.error(e.response?.data?.message || 'Connection failed'); }
        finally { setBusy(null); }
    };

    if (loading) return <div className="cp-page"><div className="cp-wrap"><div className="cp-empty">Loading…</div></div></div>;

    return (
        <div className="cp-page">
            <div className="cp-pbar">
                <div>
                    <div className="cp-h1">Couriers</div>
                    <div className="cp-sub">Turn couriers on, pick the default for new bookings, and test connections</div>
                </div>
            </div>
            <div className="cp-wrap">
                <div className="cp-provgrid">
                    {providers.map((p) => (
                        <section className="cp-card cp-prov" key={p.provider}>
                            <div className="cp-ch">
                                <h3><CourierBadge name={p.displayName} /> <span style={{ marginLeft: 6 }}>{p.displayName}</span></h3>
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {p.defaultProvider && <span className="cp-chip"><Star size={11} /> Default</span>}
                                    {p.sandbox && <span className="cp-pill warn">Sandbox</span>}
                                    <span className={`cp-pill ${p.enabled ? 'ok' : 'bad'}`}>{p.enabled ? 'Enabled' : 'Disabled'}</span>
                                </div>
                            </div>
                            <div className="cp-pad">
                                {!p.configured && (
                                    <div className="cp-note" style={{ marginBottom: 12 }}>
                                        Not configured on the server. Set this courier's environment variables, then restart the backend.
                                    </div>
                                )}
                                <ul className="cp-caps">
                                    {CAPS.map(([k, label]) => (
                                        <li key={k} className={p.capabilities?.[k] ? 'yes' : 'no'}>
                                            {p.capabilities?.[k] ? <Check size={14} /> : <X size={14} />} {label}
                                        </li>
                                    ))}
                                </ul>
                                {!p.capabilities?.pickupRequest && (
                                    <div className="cp-s" style={{ marginBottom: 12 }}>
                                        Pickup happens automatically from your store when you book. No separate pickup request needed.
                                    </div>
                                )}
                                <div className="cp-actions" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                                    <button className="cp-btn" disabled={busy === p.provider || (!p.enabled && !p.configured)}
                                        onClick={() => change(p, { enabled: !p.enabled }, p.enabled ? 'Courier disabled' : 'Courier enabled')}>
                                        {p.enabled ? 'Disable' : 'Enable'}
                                    </button>
                                    {p.enabled && !p.defaultProvider && (
                                        <button className="cp-btn" disabled={busy === p.provider}
                                            onClick={() => change(p, { defaultProvider: true }, `${p.displayName} is now the default`)}>
                                            <Star size={14} /> Make default
                                        </button>
                                    )}
                                    {p.provider === 'pathao' && (
                                        <>
                                            <button className="cp-btn" disabled={busy === p.provider || !p.configured} onClick={() => test(p)}>
                                                <Plug size={14} /> Test connection
                                            </button>
                                            <Link className="cp-btn" to="/admin/courier/pathao-stores"><Store size={14} /> Stores</Link>
                                        </>
                                    )}
                                    {p.provider === 'steadfast' && (
                                        <Link className="cp-btn" to="/admin/courier/pickups">Pickup requests</Link>
                                    )}
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
                <WebhookEvents />
            </div>
        </div>
    );
};

export default CourierProviders;
