import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-hot-toast';
import { Truck, AlertTriangle, ChevronDown } from 'lucide-react';
import {
    fetchProviders, bookParcels, fetchPathaoCities, fetchPathaoZones, quotePathao,
} from '../courier/courierApi';
import CourierBadge from '../courier/CourierBadge';
import '../courier/CourierBadge.css';
import './BookParcelModal.css';

const ModalPortal = ({ children }) => ReactDOM.createPortal(children, document.body);

const validPhone = (raw) => {
    let d = String(raw || '').replace(/\D/g, '');
    if (d.startsWith('880')) d = d.slice(2);
    if (d.length === 10 && d.startsWith('1')) d = `0${d}`;
    return /^01\d{9}$/.test(d);
};

/**
 * Book Parcel: choose a courier and send one or many orders to it.
 * Pass `order` for a single order or `orders` for a bulk selection.
 */
const PickupModal = ({ order, orders, onClose, onSuccess }) => {
    const list = useMemo(() => (orders && orders.length ? orders : order ? [order] : []), [order, orders]);
    const [providers, setProviders] = useState([]);
    const [courier, setCourier] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProviders, setLoadingProviders] = useState(true);

    // fee estimate (Pathao)
    const [showQuote, setShowQuote] = useState(false);
    const [cities, setCities] = useState([]);
    const [zones, setZones] = useState([]);
    const [q, setQ] = useState({ cityId: '', zoneId: '', weight: 0.5 });
    const [quote, setQuote] = useState(null);
    const [quoting, setQuoting] = useState(false);

    useEffect(() => {
        fetchProviders()
            .then((all) => {
                const usable = (all || []).filter((p) => p.enabled && p.configured);
                setProviders(usable);
                const def = usable.find((p) => p.defaultProvider) || usable[0];
                if (def) setCourier(def.provider);
            })
            .catch(() => toast.error('Could not load couriers'))
            .finally(() => setLoadingProviders(false));
    }, []);

    const selected = providers.find((p) => p.provider === courier);

    // Pathao has stricter rules than Steadfast, so warn before the API call.
    const problems = useMemo(() => {
        if (courier !== 'pathao') return [];
        const out = [];
        list.forEach((o) => {
            const inv = o.invoice || `#${o.id}`;
            if (!validPhone(o.phone)) out.push(`${inv}: phone must be 11 digits starting with 01`);
            if ((o.address || '').replace(/,\s*/g, '').trim().length < 10) out.push(`${inv}: address is too short`);
            if ((o.customer || '').trim().length < 3) out.push(`${inv}: customer name is too short`);
        });
        return out;
    }, [courier, list]);

    const openQuote = async () => {
        const next = !showQuote;
        setShowQuote(next);
        if (next && cities.length === 0) {
            try { setCities((await fetchPathaoCities()) || []); } catch { toast.error('Could not load Pathao cities'); }
        }
    };
    const pickCity = async (id) => {
        setQ((s) => ({ ...s, cityId: id, zoneId: '' }));
        setZones([]); setQuote(null);
        if (id) { try { setZones((await fetchPathaoZones(id)) || []); } catch { toast.error('Could not load zones'); } }
    };
    const getQuote = async () => {
        setQuoting(true);
        try {
            setQuote(await quotePathao({ cityId: Number(q.cityId), zoneId: Number(q.zoneId), weight: Number(q.weight) }));
        } catch (e) {
            toast.error(e.response?.data?.message || 'Could not get a quote');
        } finally { setQuoting(false); }
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!courier) { toast.error('Choose a courier'); return; }
        setLoading(true);
        try {
            await bookParcels(list.map((o) => o.id), courier);
            toast.success(list.length === 1
                ? `Parcel booked with ${selected?.displayName || courier}`
                : `${list.length} parcels sent to ${selected?.displayName || courier}`);
            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to book the parcel.');
        } finally { setLoading(false); }
    };

    const shown = list.slice(0, 5);

    return (
        <ModalPortal>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content bp-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <div>
                            <h4>Book Parcel</h4>
                            <span className="text-small" style={{ color: '#ccc' }}>
                                {list.length === 1 ? `Inv: ${list[0].invoice || list[0].id}` : `${list.length} orders selected`}
                            </span>
                        </div>
                        <button onClick={onClose}>✕</button>
                    </div>

                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                        <div className="modal-body">
                            <div className="bp-label">Courier</div>
                            {loadingProviders && <div className="bp-muted">Loading couriers…</div>}
                            {!loadingProviders && providers.length === 0 && (
                                <div className="bp-warn"><AlertTriangle size={15} /> No courier is enabled. Turn one on under Courier → Couriers.</div>
                            )}
                            <div className="bp-couriers">
                                {providers.map((p) => (
                                    <label key={p.provider} className={`bp-courier ${courier === p.provider ? 'on' : ''}`}>
                                        <input type="radio" name="courier" value={p.provider} checked={courier === p.provider} onChange={() => setCourier(p.provider)} />
                                        <div>
                                            <div className="bp-cname"><CourierBadge name={p.displayName} />{p.defaultProvider && <span className="bp-def">Default</span>}{p.sandbox && <span className="bp-sbx">Sandbox</span>}</div>
                                            <div className="bp-muted">
                                                {p.capabilities?.pickupRequest
                                                    ? 'Book now, then send a pickup request'
                                                    : 'Rider collects automatically from your store'}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="bp-label" style={{ marginTop: 16 }}>{list.length === 1 ? 'Order' : 'Orders'}</div>
                            <div className="bp-orders">
                                {shown.map((o) => (
                                    <div className="bp-order" key={o.id}>
                                        <div><strong>{o.invoice || `#${o.id}`}</strong><span className="bp-muted"> · {o.customer}</span></div>
                                        <div className="bp-muted">{o.phone}</div>
                                        <div className="bp-cod">{o.paymentMethod === 'COD' ? `COD ৳${o.totalAmount}` : 'Prepaid'}</div>
                                    </div>
                                ))}
                                {list.length > shown.length && <div className="bp-muted">+ {list.length - shown.length} more</div>}
                            </div>

                            {problems.length > 0 && (
                                <div className="bp-warn" style={{ marginTop: 12 }}>
                                    <AlertTriangle size={15} />
                                    <div>Pathao may reject these. Fix them on the order first:
                                        <ul>{problems.slice(0, 5).map((m) => <li key={m}>{m}</li>)}</ul>
                                    </div>
                                </div>
                            )}

                            {selected?.capabilities?.priceQuote && (
                                <div className="bp-quote">
                                    <button type="button" className="bp-quote-toggle" onClick={openQuote}>
                                        Estimate delivery fee <ChevronDown size={14} style={{ transform: showQuote ? 'rotate(180deg)' : 'none' }} />
                                    </button>
                                    {showQuote && (
                                        <div className="bp-quote-body">
                                            <select value={q.cityId} onChange={(e) => pickCity(e.target.value)}>
                                                <option value="">City</option>
                                                {cities.map((c) => <option key={c.city_id} value={c.city_id}>{c.city_name}</option>)}
                                            </select>
                                            <select value={q.zoneId} disabled={!zones.length} onChange={(e) => { setQ({ ...q, zoneId: e.target.value }); setQuote(null); }}>
                                                <option value="">Zone</option>
                                                {zones.map((z) => <option key={z.zone_id} value={z.zone_id}>{z.zone_name}</option>)}
                                            </select>
                                            <input type="number" min="0.5" max="10" step="0.5" value={q.weight} onChange={(e) => { setQ({ ...q, weight: e.target.value }); setQuote(null); }} title="Weight (kg)" />
                                            <button type="button" className="btn-cancel-modal" disabled={!q.cityId || !q.zoneId || quoting} onClick={getQuote}>{quoting ? '…' : 'Get fee'}</button>
                                            {quote && (
                                                <div className="bp-fee">
                                                    Fee <strong>৳{quote.final_price ?? quote.price}</strong>
                                                    {quote.cod_percentage ? <span className="bp-muted"> · COD charge {(quote.cod_percentage * 100).toFixed(0)}%</span> : null}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn-cancel-modal" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-submit-modal" disabled={loading || !courier}>
                                <Truck size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                                {loading ? 'Booking…' : list.length === 1 ? 'Book Parcel' : `Book ${list.length} Parcels`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ModalPortal>
    );
};

export default PickupModal;
