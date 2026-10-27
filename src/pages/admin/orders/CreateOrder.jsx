import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Search, User, Phone, Mail, MapPin, Package, Plus, Minus, Trash2, X, Check, AlertCircle,
    CreditCard, Wallet, Truck, Bell, StickyNote, UserPlus, Home, Clock, ShoppingBag, Loader2,
} from 'lucide-react';
import axiosInstance from '../../../api/AxiosInstance';
import './CreateOrder.css';

const API = '/api/v1/admin/order-builder';
const PHONE_RE = /^01[3-9]\d{8}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const money = (n) => `৳${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const normPhone = (raw) => {
    let p = String(raw || '').replace(/[\s\-()]/g, '');
    if (p.startsWith('+88')) p = p.slice(3);
    else if (p.startsWith('0088')) p = p.slice(4);
    else if (p.startsWith('88') && p.length === 13) p = p.slice(2);
    return p;
};
const initials = (name) => (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
const errText = (e, fallback) => e?.response?.data?.message || e?.response?.data?.error || e?.message || fallback;

const PAY_METHODS = [
    { key: 'COD', label: 'Cash on delivery' },
    { key: 'BKASH', label: 'bKash' },
    { key: 'NAGAD', label: 'Nagad' },
    { key: 'ROCKET', label: 'Rocket' },
    { key: 'CARD', label: 'Card' },
];

/** Debounced remote search. Returns [results, loading]. */
function useRemoteSearch(path, query, minLen) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const seq = useRef(0);
    useEffect(() => {
        const q = query.trim();
        if (q.length < minLen) { setResults([]); setLoading(false); return undefined; }
        const my = ++seq.current;
        setLoading(true);
        const t = setTimeout(async () => {
            try {
                const res = await axiosInstance.get(`${API}/${path}`, { params: { q } });
                if (my === seq.current) setResults(res.data?.data || []);
            } catch (e) {
                if (my === seq.current) setResults([]);
            } finally {
                if (my === seq.current) setLoading(false);
            }
        }, 280);
        return () => clearTimeout(t);
    }, [path, query, minLen]);
    return [results, loading];
}

function useClickOutside(ref, onOutside) {
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onOutside(); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [ref, onOutside]);
}

const Card = ({ icon, title, hint, children, right }) => (
    <section className="co-card">
        <header className="co-card-h">
            <div className="co-card-t"><span className="co-card-ic">{icon}</span><div><h2>{title}</h2>{hint && <p>{hint}</p>}</div></div>
            {right}
        </header>
        <div className="co-card-b">{children}</div>
    </section>
);

const Field = ({ label, required, error, children, className = '' }) => (
    <label className={`co-field ${className} ${error ? 'has-err' : ''}`}>
        <span className="co-label">{label}{required && <b> *</b>}</span>
        {children}
        {error && <span className="co-err">{error}</span>}
    </label>
);

export default function CreateOrder() {
    const navigate = useNavigate();

    /* ------------------------------ customer ------------------------------ */
    const [customer, setCustomer] = useState(null);
    const [cq, setCq] = useState('');
    const [cOpen, setCOpen] = useState(false);
    const [custResults, custLoading] = useRemoteSearch('customers', cq, 2);
    const custBox = useRef(null);
    useClickOutside(custBox, useCallback(() => setCOpen(false), []));

    const [form, setForm] = useState({ name: '', phone: '', email: '', street: '', city: '', area: '' });
    const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    /* ------------------------------ location ------------------------------ */
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);
    useEffect(() => {
        axiosInstance.get('/api/v1/location/cities').then((r) => setCities(r.data?.data || [])).catch(() => setCities([]));
    }, []);
    useEffect(() => {
        const c = cities.find((x) => x.name.toLowerCase() === form.city.trim().toLowerCase());
        if (!c) { setAreas([]); return; }
        axiosInstance.get('/api/v1/location/areas', { params: { city_id: c.id } })
            .then((r) => setAreas(r.data?.data || [])).catch(() => setAreas([]));
    }, [form.city, cities]);

    /* ------------------------------ products ------------------------------ */
    const [pq, setPq] = useState('');
    const [pOpen, setPOpen] = useState(false);
    const [prodResults, prodLoading] = useRemoteSearch('products', pq, 1);
    const prodBox = useRef(null);
    useClickOutside(prodBox, useCallback(() => setPOpen(false), []));
    const [items, setItems] = useState([]);

    /* ------------------------------ payment / options ------------------------------ */
    const [method, setMethod] = useState('COD');
    const [payStatus, setPayStatus] = useState('PENDING');
    const [orderStatus, setOrderStatus] = useState('CONFIRMED');
    const [shipOverride, setShipOverride] = useState(null);
    const [discount, setDiscount] = useState('');
    const [note, setNote] = useState('');
    const [notify, setNotify] = useState(true);
    const [saveAddress, setSaveAddress] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [touched, setTouched] = useState(false);

    /* ------------------------------ actions ------------------------------ */
    const applyAddress = (a) => setForm((f) => ({ ...f, street: a.address || '', city: a.city || '', area: a.area || '' }));

    const pickCustomer = (c) => {
        setCustomer(c);
        setCq('');
        setCOpen(false);
        setForm((f) => ({ ...f, name: c.name || '', phone: c.phone || '', email: c.email || '' }));
        const def = (c.addresses || []).find((a) => a.isDefault) || (c.addresses || [])[0];
        if (def) applyAddress(def);
        else if (c.lastOrder?.address) applyAddress(c.lastOrder);
        setSaveAddress(!def && !c.lastOrder?.address ? true : false);
    };

    const clearCustomer = () => {
        setCustomer(null);
        setForm({ name: '', phone: '', email: '', street: '', city: '', area: '' });
        setSaveAddress(true);
    };

    const addProduct = (p) => {
        if (p.stock < 1) return;
        setItems((cur) => {
            const i = cur.findIndex((x) => x.productId === p.id);
            if (i >= 0) {
                const next = [...cur];
                next[i] = { ...next[i], qty: Math.min(next[i].qty + 1, p.stock) };
                return next;
            }
            return [...cur, { productId: p.id, name: p.name, brand: p.brand, size: p.size, sku: p.sku, image: p.image, mrp: p.mrp, stock: p.stock, qty: 1, unit: String(p.price), listPrice: p.price }];
        });
        setPq('');
        setPOpen(false);
    };
    const setItem = (id, patch) => setItems((cur) => cur.map((x) => (x.productId === id ? { ...x, ...patch } : x)));
    const removeItem = (id) => setItems((cur) => cur.filter((x) => x.productId !== id));

    /* ------------------------------ totals ------------------------------ */
    const autoShip = form.city.trim().toLowerCase() === 'dhaka' ? 60 : (form.city.trim() ? 120 : 0);
    const shipping = shipOverride !== null && shipOverride !== '' ? Number(shipOverride) || 0 : autoShip;
    const subTotal = useMemo(() => items.reduce((s, i) => s + (Number(i.unit) || 0) * i.qty, 0), [items]);
    const savings = useMemo(() => items.reduce((s, i) => s + Math.max(0, (i.mrp || 0) - (Number(i.unit) || 0)) * i.qty, 0), [items]);
    const disc = Math.min(Number(discount) || 0, subTotal);
    const total = Math.max(0, subTotal - disc) + shipping;
    const units = items.reduce((s, i) => s + i.qty, 0);

    /* ------------------------------ validation ------------------------------ */
    const phone = normPhone(form.phone);
    const errors = {
        name: !form.name.trim() ? 'Customer name is required' : '',
        phone: !PHONE_RE.test(phone) ? 'Enter a valid mobile number, e.g. 01712345678' : '',
        email: form.email.trim() && !EMAIL_RE.test(form.email.trim()) ? 'Email address is not valid' : '',
        street: !form.street.trim() ? 'Street address is required' : '',
        city: !form.city.trim() ? 'Select a city' : '',
        area: !form.area.trim() ? 'Select an area' : '',
        items: items.length === 0 ? 'Add at least one product' : '',
        stock: items.some((i) => i.qty > i.stock) ? 'A quantity is higher than the stock' : '',
        discount: (Number(discount) || 0) > subTotal && subTotal > 0 ? 'Discount is more than the products total' : '',
    };
    const hasErr = Object.values(errors).some(Boolean);
    const show = (k) => (touched ? errors[k] : '');

    const submit = async () => {
        setTouched(true);
        if (hasErr) { toast.error('Please fix the highlighted fields'); return; }
        setSubmitting(true);
        try {
            const payload = {
                customerId: customer?.id || null,
                name: form.name.trim(), phone, email: form.email.trim() || null,
                shippingAddress: form.street.trim(), city: form.city.trim(), area: form.area.trim(),
                paymentMethod: method, paymentStatus: payStatus, orderStatus,
                shippingCost: shipOverride !== null && shipOverride !== '' ? Number(shipOverride) : null,
                discount: disc || null, orderNote: note.trim() || null,
                notifyCustomer: notify, saveAddress,
                items: items.map((i) => ({ productId: i.productId, quantity: i.qty, unitPrice: Number(i.unit) !== i.listPrice ? Number(i.unit) : null })),
            };
            const res = await axiosInstance.post(API, payload);
            const d = res.data?.data || {};
            const sent = [d.emailSent && 'email', d.smsSent && 'SMS'].filter(Boolean).join(' and ');
            toast.success(`Order ${d.invoiceNumber} created${sent ? ` · customer notified by ${sent}` : ''}`, { duration: 5000 });
            navigate(`/admin/orders/${d.orderId}`);
        } catch (e) {
            toast.error(errText(e, 'Could not create the order'));
        } finally {
            setSubmitting(false);
        }
    };

    const savedAddrs = [
        ...(customer?.addresses || []).map((a) => ({ ...a, label: a.type || 'Saved' })),
        ...(customer?.lastOrder?.address ? [{ ...customer.lastOrder, label: 'Last order' }] : []),
    ].filter((a, i, arr) => arr.findIndex((b) => `${b.address}|${b.city}|${b.area}` === `${a.address}|${a.city}|${a.area}`) === i);

    const areaOptions = form.area && !areas.some((a) => a.name === form.area) ? [{ id: 'cur', name: form.area }, ...areas] : areas;

    return (
        <div className="co">
            <div className="co-top">
                <div className="co-top-l">
                    <Link to="/admin/orders" className="co-back" aria-label="Back to orders"><ArrowLeft size={18} /></Link>
                    <div>
                        <div className="co-crumb">Orders / New</div>
                        <h1>Create order</h1>
                    </div>
                </div>
                <div className="co-top-r">
                    <Link to="/admin/orders" className="co-btn ghost">Discard</Link>
                    <button className="co-btn primary" onClick={submit} disabled={submitting}>
                        {submitting ? <Loader2 size={16} className="co-spin" /> : <Check size={16} />} Create order
                    </button>
                </div>
            </div>

            <div className="co-grid">
                <div className="co-main">
                    {/* ---------------- CUSTOMER ---------------- */}
                    <Card icon={<User size={17} />} title="Customer" hint="Search an existing customer or type a new one below"
                          right={customer && <button className="co-link" onClick={clearCustomer}><X size={14} /> Remove customer</button>}>
                        {!customer ? (
                            <div className="co-search" ref={custBox}>
                                <Search size={16} className="co-search-ic" />
                                <input value={cq} onChange={(e) => { setCq(e.target.value); setCOpen(true); }} onFocus={() => setCOpen(true)}
                                       placeholder="Search by name, email or phone…" autoComplete="off" />
                                {custLoading && <Loader2 size={15} className="co-spin co-search-sp" />}
                                {cOpen && cq.trim().length >= 2 && (
                                    <div className="co-dd">
                                        {custResults.map((c) => (
                                            <button key={c.id} type="button" className="co-dd-row" onClick={() => pickCustomer(c)}>
                                                <span className="co-av">{initials(c.name)}</span>
                                                <span className="co-dd-main">
                                                    <b>{c.name}</b>
                                                    <small>{[c.phone, c.email].filter(Boolean).join(' · ') || 'No contact details'}</small>
                                                </span>
                                                <span className="co-dd-meta">{c.orders} order{c.orders === 1 ? '' : 's'}</span>
                                            </button>
                                        ))}
                                        {!custLoading && custResults.length === 0 && (
                                            <div className="co-dd-empty"><UserPlus size={16} /> No customer found. Fill in the details below and we will create a new customer.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="co-cust">
                                <span className="co-av lg">{initials(customer.name)}</span>
                                <div className="co-cust-i">
                                    <b>{customer.name}</b>
                                    <div className="co-chips">
                                        <span className="co-chip"><ShoppingBag size={12} /> {customer.orders} order{customer.orders === 1 ? '' : 's'}</span>
                                        <span className={`co-chip ${customer.registered ? 'ok' : ''}`}>{customer.registered ? 'Registered' : 'Guest'}</span>
                                        {customer.joinedAt && <span className="co-chip"><Clock size={12} /> Since {new Date(customer.joinedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="co-row">
                            <Field label="Full name" required error={show('name')}>
                                <div className="co-inp"><User size={15} /><input value={form.name} onChange={(e) => setF('name', e.target.value)} placeholder="Customer name" /></div>
                            </Field>
                            <Field label="Mobile" required error={show('phone')}>
                                <div className="co-inp"><Phone size={15} /><input value={form.phone} onChange={(e) => setF('phone', e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" /></div>
                            </Field>
                        </div>
                        <Field label="Email (optional)" error={show('email')}>
                            <div className="co-inp"><Mail size={15} /><input value={form.email} onChange={(e) => setF('email', e.target.value)} placeholder="name@example.com" inputMode="email" /></div>
                        </Field>
                    </Card>

                    {/* ---------------- ADDRESS ---------------- */}
                    <Card icon={<MapPin size={17} />} title="Delivery address" hint="Where the courier should deliver">
                        {savedAddrs.length > 0 && (
                            <div className="co-saved">
                                <span className="co-label">Use a saved address</span>
                                <div className="co-saved-l">
                                    {savedAddrs.map((a, i) => (
                                        <button key={i} type="button" className="co-addr" onClick={() => applyAddress(a)}>
                                            <span className="co-addr-t"><Home size={12} /> {a.label}{a.isDefault ? ' · Default' : ''}</span>
                                            <span className="co-addr-b">{[a.address, a.area, a.city].filter(Boolean).join(', ')}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <Field label="Street address" required error={show('street')}>
                            <textarea rows={2} value={form.street} onChange={(e) => setF('street', e.target.value)} placeholder="House, road, block, landmark" />
                        </Field>
                        <div className="co-row">
                            <Field label="City" required error={show('city')}>
                                <select value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value, area: '' }))}>
                                    <option value="">Select city</option>
                                    {form.city && !cities.some((c) => c.name === form.city) && <option value={form.city}>{form.city}</option>}
                                    {cities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </Field>
                            <Field label="Area" required error={show('area')}>
                                <select value={form.area} onChange={(e) => setF('area', e.target.value)} disabled={!form.city}>
                                    <option value="">{form.city ? 'Select area' : 'Select a city first'}</option>
                                    {areaOptions.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
                                </select>
                            </Field>
                        </div>
                        <label className="co-check"><input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} /><span>Save this address to the customer's address book</span></label>
                    </Card>

                    {/* ---------------- PRODUCTS ---------------- */}
                    <Card icon={<Package size={17} />} title="Products" hint="Search by name, brand or SKU and add as many as you need">
                        <div className="co-search" ref={prodBox}>
                            <Search size={16} className="co-search-ic" />
                            <input value={pq} onChange={(e) => { setPq(e.target.value); setPOpen(true); }} onFocus={() => setPOpen(true)}
                                   placeholder="Search products…" autoComplete="off" />
                            {prodLoading && <Loader2 size={15} className="co-spin co-search-sp" />}
                            {pOpen && pq.trim().length >= 1 && (
                                <div className="co-dd">
                                    {prodResults.map((p) => {
                                        const out = p.stock < 1;
                                        return (
                                            <button key={p.id} type="button" className={`co-dd-row ${out ? 'is-out' : ''}`} onClick={() => addProduct(p)} disabled={out}>
                                                {p.image ? <img src={p.image} alt="" className="co-thumb" /> : <span className="co-thumb ph"><Package size={16} /></span>}
                                                <span className="co-dd-main">
                                                    <b>{p.name}</b>
                                                    <small>{[p.brand, p.size, p.sku].filter(Boolean).join(' · ')}</small>
                                                </span>
                                                <span className="co-dd-meta right">
                                                    <b>{money(p.price)}</b>
                                                    <small className={out ? 'bad' : p.stock <= 5 ? 'warn' : ''}>{out ? 'Out of stock' : `${p.stock} in stock`}</small>
                                                </span>
                                            </button>
                                        );
                                    })}
                                    {!prodLoading && prodResults.length === 0 && <div className="co-dd-empty">No products match “{pq}”.</div>}
                                </div>
                            )}
                        </div>
                        {show('items') && <div className="co-err block">{show('items')}</div>}

                        {items.length > 0 && (
                            <div className="co-lines">
                                <div className="co-lines-h"><span>Product</span><span>Price</span><span>Qty</span><span className="r">Total</span><span /></div>
                                {items.map((i) => (
                                    <div key={i.productId} className={`co-line ${i.qty > i.stock ? 'bad' : ''}`}>
                                        <div className="co-line-p">
                                            {i.image ? <img src={i.image} alt="" className="co-thumb" /> : <span className="co-thumb ph"><Package size={16} /></span>}
                                            <div>
                                                <b>{i.name}</b>
                                                <small>{[i.brand, i.size, i.sku].filter(Boolean).join(' · ')}</small>
                                                {i.qty > i.stock && <small className="bad">Only {i.stock} in stock</small>}
                                            </div>
                                        </div>
                                        <div className="co-line-price">
                                            <div className="co-money"><span>৳</span><input value={i.unit} onChange={(e) => setItem(i.productId, { unit: e.target.value.replace(/[^\d.]/g, '') })} inputMode="decimal" aria-label="Unit price" /></div>
                                            {Number(i.unit) !== i.listPrice && <button type="button" className="co-reset" onClick={() => setItem(i.productId, { unit: String(i.listPrice) })}>Reset to {money(i.listPrice)}</button>}
                                        </div>
                                        <div className="co-qty">
                                            <button type="button" onClick={() => setItem(i.productId, { qty: Math.max(1, i.qty - 1) })} aria-label="Decrease"><Minus size={14} /></button>
                                            <input value={i.qty} onChange={(e) => setItem(i.productId, { qty: Math.max(1, parseInt(e.target.value.replace(/\D/g, ''), 10) || 1) })} inputMode="numeric" aria-label="Quantity" />
                                            <button type="button" onClick={() => setItem(i.productId, { qty: i.qty + 1 })} aria-label="Increase"><Plus size={14} /></button>
                                        </div>
                                        <div className="co-line-t r">{money((Number(i.unit) || 0) * i.qty)}</div>
                                        <button type="button" className="co-x" onClick={() => removeItem(i.productId)} aria-label="Remove"><Trash2 size={15} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {items.length === 0 && (
                            <div className="co-empty"><ShoppingBag size={26} /><b>No products yet</b><span>Search above to add products to this order.</span></div>
                        )}
                    </Card>

                    <Card icon={<StickyNote size={17} />} title="Order note" hint="Optional. Visible to your team and sent to the courier">
                        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Call before delivery, gift wrap, deliver after 5 pm" />
                    </Card>
                </div>

                {/* ---------------- SUMMARY ---------------- */}
                <aside className="co-side">
                    <div className="co-sticky">
                        <Card icon={<CreditCard size={17} />} title="Payment">
                            <span className="co-label">Method</span>
                            <div className="co-seg wrap">
                                {PAY_METHODS.map((m) => (
                                    <button key={m.key} type="button" className={method === m.key ? 'on' : ''} onClick={() => { setMethod(m.key); if (m.key === 'COD') setPayStatus('PENDING'); }}>{m.label}</button>
                                ))}
                            </div>
                            <span className="co-label">Payment status</span>
                            <div className="co-seg">
                                <button type="button" className={payStatus === 'PENDING' ? 'on' : ''} onClick={() => setPayStatus('PENDING')}>{method === 'COD' ? 'Collect on delivery' : 'Awaiting payment'}</button>
                                <button type="button" className={payStatus === 'PAID' ? 'on ok' : ''} onClick={() => setPayStatus('PAID')}>Already paid</button>
                            </div>
                            <span className="co-label">Order status</span>
                            <div className="co-seg">
                                <button type="button" className={orderStatus === 'CONFIRMED' ? 'on' : ''} onClick={() => setOrderStatus('CONFIRMED')}>Confirmed</button>
                                <button type="button" className={orderStatus === 'PENDING' ? 'on' : ''} onClick={() => setOrderStatus('PENDING')}>Pending</button>
                            </div>
                        </Card>

                        <Card icon={<Wallet size={17} />} title="Summary">
                            <div className="co-sum">
                                <div><span>Products ({units} item{units === 1 ? '' : 's'})</span><b>{money(subTotal)}</b></div>
                                {savings > 0 && <div className="ok"><span>You save on MRP</span><b>{money(savings)}</b></div>}
                                <div className="co-sum-in">
                                    <span>Discount</span>
                                    <div className="co-money"><span>৳</span><input value={discount} onChange={(e) => setDiscount(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0" inputMode="decimal" /></div>
                                </div>
                                {show('discount') && <div className="co-err block">{show('discount')}</div>}
                                <div className="co-sum-in">
                                    <span><Truck size={13} /> Delivery{shipOverride === null && form.city && <em> · auto</em>}</span>
                                    <div className="co-money"><span>৳</span><input value={shipOverride !== null ? shipOverride : String(autoShip)} onChange={(e) => setShipOverride(e.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" /></div>
                                </div>
                                {shipOverride !== null && <button type="button" className="co-reset" onClick={() => setShipOverride(null)}>Use standard charge ({money(autoShip)})</button>}
                                <div className="co-total"><span>{method === 'COD' && payStatus === 'PENDING' ? 'Rider collects' : 'Total'}</span><b>{money(total)}</b></div>
                            </div>
                        </Card>

                        <Card icon={<Bell size={17} />} title="Notify customer">
                            <label className="co-switch">
                                <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
                                <i />
                                <span><b>Send order confirmation</b><small>SMS{form.email.trim() ? ' and email' : ' (add an email to also send email)'} with the invoice number</small></span>
                            </label>
                        </Card>

                        {touched && hasErr && (
                            <div className="co-alert"><AlertCircle size={16} /><div>
                                <b>Complete these before creating the order</b>
                                <ul>{Object.values(errors).filter(Boolean).map((m) => <li key={m}>{m}</li>)}</ul>
                            </div></div>
                        )}

                        <button className="co-btn primary block" onClick={submit} disabled={submitting}>
                            {submitting ? <Loader2 size={16} className="co-spin" /> : <Check size={16} />} Create order · {money(total)}
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
