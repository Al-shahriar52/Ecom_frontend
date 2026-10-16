import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-hot-toast';
import { Truck, AlertTriangle, ChevronDown } from 'lucide-react';
import {
    fetchProviders, bookParcels, fetchPathaoCities, fetchPathaoZones, quotePathao,
} from '../courier/courierApi';
import axiosInstance from '../../../api/AxiosInstance';
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
    // Editable copy of each order's delivery details. Changed fields are saved to the order before booking.
    const [edits, setEdits] = useState({});
    useEffect(() => {
        const init = {};
        list.forEach((o) => {
            init[o.id] = {
                customerName: o.customer || '',
                phone: o.phone || '',
                city: o.city || '',
                area: o.area || '',
                shippingAddress: o.shippingAddress || o.address || '',
                orderNote: o.orderNote || '',
                cod: o.totalAmount != null ? String(o.totalAmount) : '',
            };
        });
        setEdits(init);
    }, [list]);
    const setField = (id, key, val) => setEdits((e) => ({ ...e, [id]: { ...e[id], [key]: val } }));
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

    // Checks before the API call: Steadfast and Pathao both need a valid phone and an address; Pathao is stricter.
    const problems = useMemo(() => {
        const out = [];
        list.forEach((o) => {
            const e = edits[o.id];
            if (!e) return;
            const inv = o.invoice || `#${o.id}`;
            const addr = [e.city, e.area, e.shippingAddress].filter((x) => (x || '').trim()).join(', ');
            if (o.paymentMethod === 'COD') {
                const c = Number(e.cod);
                if (e.cod === '' || Number.isNaN(c) || c < 0 || c > 1000000) out.push(`${inv}: COD amount must be between 0 and 1,000,000`);
            }
            if (!validPhone(e.phone)) out.push(`${inv}: phone must be 11 digits starting with 01`);
            if (!(e.shippingAddress || '').trim()) out.push(`${inv}: street address is missing`);
            if (courier === 'pathao') {
                if (addr.replace(/,\s*/g, '').trim().length < 10) out.push(`${inv}: address is too short for Pathao (10+ characters)`);
                if ((e.customerName || '').trim().length < 3) out.push(`${inv}: customer name is too short for Pathao (3+ characters)`);
            }
        });
        return out;
    }, [courier, list, edits]);

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
            // 1) save any corrected details to the order
            for (const o of list) {
                const e = edits[o.id] || {};
                const was = { customerName: o.customer || '', phone: o.phone || '', city: o.city || '', area: o.area || '',
                    shippingAddress: o.shippingAddress || o.address || '', orderNote: o.orderNote || '' };
                const changed = {};
                Object.keys(was).forEach((k) => { if ((e[k] ?? '') !== was[k]) changed[k] = e[k] ?? ''; });
                if (Object.keys(changed).length) {
                    await axiosInstance.patch(`/api/v1/admin/orders/${o.id}/status`, changed);
                }
            }
            // 2) then book (a changed COD amount applies to the courier only; the invoice is untouched)
            const codOverrides = {};
            list.forEach((o) => {
                if (o.paymentMethod !== 'COD') return;
                const v = Number(edits[o.id]?.cod);
                if (!Number.isNaN(v) && v !== Number(o.totalAmount)) codOverrides[o.id] = v;
            });
            await bookParcels(list.map((o) => o.id), courier, codOverrides);
            toast.success(list.length === 1
                ? `Parcel booked with ${selected?.displayName || courier}`
                : `${list.length} parcels sent to ${selected?.displayName || courier}`);
            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to book the parcel.');
        } finally { setLoading(false); }
    };

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
                                {list.map((o) => {
                                    const cod = o.paymentMethod === 'COD';
                                    return (
                                        <div className="bp-order" key={o.id}>
                                            <div className="bp-order-top">
                                                <div><strong>{o.invoice || `#${o.id}`}</strong></div>
                                                <div className="bp-cod">{cod ? `Collect ৳${edits[o.id]?.cod ?? o.totalAmount}` : 'Prepaid, collect ৳0'}</div>
                                            </div>
                                            {edits[o.id] && (
                                                <div className="bp-edit">
                                                    <label>Customer name<input value={edits[o.id].customerName} onChange={(ev) => setField(o.id, 'customerName', ev.target.value)} /></label>
                                                    <label>Phone<input value={edits[o.id].phone} inputMode="tel" onChange={(ev) => setField(o.id, 'phone', ev.target.value)} /></label>
                                                    <label>City<input value={edits[o.id].city} onChange={(ev) => setField(o.id, 'city', ev.target.value)} /></label>
                                                    <label>Area<input value={edits[o.id].area} onChange={(ev) => setField(o.id, 'area', ev.target.value)} /></label>
                                                    <label className="wide">Street address<textarea rows={2} value={edits[o.id].shippingAddress} onChange={(ev) => setField(o.id, 'shippingAddress', ev.target.value)} /></label>
                                                    {o.paymentMethod === 'COD' ? (
                                                        <label className="wide">Amount the rider collects (৳)
                                                            <input type="number" min="0" step="1" value={edits[o.id].cod} onChange={(ev) => setField(o.id, 'cod', ev.target.value)} />
                                                            {Number(edits[o.id].cod) !== Number(o.totalAmount) && <span className="bp-hint">Order total is ৳{o.totalAmount}. Only the courier's amount changes; your invoice stays as is.</span>}
                                                        </label>
                                                    ) : (
                                                        <div className="wide bp-hint">Prepaid: the rider collects ৳0.</div>
                                                    )}
                                                    <label className="wide">Note for the rider<input value={edits[o.id].orderNote} placeholder="e.g. Call before 3 PM" onChange={(ev) => setField(o.id, 'orderNote', ev.target.value)} /></label>
                                                </div>
                                            )}
                                            <div className="bp-row"><span className="bp-k">Payment</span><span>{o.paymentMethod || '—'}{o.paymentStatus ? ` · ${o.paymentStatus}` : ''} · Total ৳{o.totalAmount}</span></div>
                                            {Array.isArray(o.items) && o.items.length > 0 && (
                                                <div className="bp-row"><span className="bp-k">Items</span>
                                                    <span>{o.items.map((it) => `${it.productName || it.name || 'Item'} × ${it.quantity ?? 1}`).join(', ')}</span></div>
                                            )}
                                                                        </div>
                                    );
                                })}
                            </div>

                            {problems.length > 0 && (
                                <div className="bp-warn" style={{ marginTop: 12 }}>
                                    <AlertTriangle size={15} />
                                    <div>The courier may reject these. Fix them on the order first:
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
