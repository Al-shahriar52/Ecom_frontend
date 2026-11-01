import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/AxiosInstance';
import { AuthContext } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard';
import './DashboardHome.css';

const taka = (v) => `৳${Math.round(Number(v) || 0).toLocaleString('en-US')}`;
const when = (iso, withTime) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('en-GB', withTime
        ? { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }
        : { day: 'numeric', month: 'short', year: 'numeric' });
};

const STATUS = {
    PENDING: { label: 'Order placed', cls: 'pending' },
    CONFIRMED: { label: 'Confirmed', cls: 'info' },
    PACKAGED: { label: 'Packed', cls: 'info' },
    SHIPPED: { label: 'On the way', cls: 'ship' },
    DELIVERED: { label: 'Delivered', cls: 'done' },
    CANCELLED: { label: 'Cancelled', cls: 'bad' },
    RETURNED: { label: 'Returned', cls: 'bad' },
};

// small inline icons: they never depend on the icon-library version or the page theme
const I = ({ d, size = 20 }) => (
    <svg className="dh-ico" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{[].concat(d).map((p, i) => <path key={i} d={p} />)}</svg>
);
const P = {
    bag: ['M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0'],
    wallet: ['M20 12V8H6a2 2 0 0 1 0-4h12v4', 'M4 6v12a2 2 0 0 0 2 2h14v-4', 'M18 12a2 2 0 0 0 0 4h4v-4z'],
    truck: ['M1 3h15v13H1z', 'M16 8h4l3 3v5h-7z', 'M5.5 16a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z', 'M18.5 16a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z'],
    check: ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4 12 14.01l-3-3'],
    heart: ['M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'],
    pin: ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z', 'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
    user: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
    lock: ['M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z', 'M7 11V7a5 5 0 0 1 10 0v4'],
    arrow: ['M5 12h14', 'm13 6 6 6-6 6'],
};

const STEPS = [
    { key: 'PENDING', label: 'Placed', at: 'createdAt' },
    { key: 'CONFIRMED', label: 'Confirmed', at: 'confirmedAt' },
    { key: 'PACKAGED', label: 'Packed', at: 'packagedAt' },
    { key: 'SHIPPED', label: 'On the way', at: 'shippedAt' },
    { key: 'DELIVERED', label: 'Delivered', at: null },
];

function Thumbs({ items, max = 3 }) {
    const list = (items || []).slice(0, max);
    if (list.length === 0) return <span className="dh-thumb empty"><I d={P.bag} size={18} /></span>;
    return (
        <span className="dh-thumbs">
            {list.map((t, i) => (
                <span key={i} className="dh-thumb" style={{ zIndex: 5 - i }}>{t.imageUrl ? <img src={t.imageUrl} alt={t.name || ''} loading="lazy" /> : <I d={P.bag} size={16} />}</span>
            ))}
        </span>
    );
}

export default function DashboardHome() {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [picks, setPicks] = useState([]);

    useEffect(() => {
        let alive = true;
        axiosInstance.get('/api/v1/account/summary')
            .then((r) => { if (alive) setData(r.data?.data || null); })
            .catch(() => { if (alive) setFailed(true); })
            .finally(() => { if (alive) setLoading(false); });
        axiosInstance.get('/api/v1/product/newestArrivals')
            .then((r) => { if (alive) setPicks((Array.isArray(r.data?.data) ? r.data.data : []).filter((p) => p.quantity > 0).slice(0, 8)); })
            .catch(() => {});
        return () => { alive = false; };
    }, []);

    const name = (data?.name || user?.name || '').trim();
    const first = name.split(' ')[0] || 'there';
    const stats = data?.stats;
    const active = data?.activeOrder;
    const recent = data?.recentOrders || [];

    if (loading) {
        return (
            <div className="dh">
                <div className="dh-sk" style={{ height: 110 }} />
                <div className="dh-stats">{[...Array(4)].map((_, i) => <div key={i} className="dh-sk" style={{ height: 92 }} />)}</div>
                <div className="dh-sk" style={{ height: 180 }} />
            </div>
        );
    }

    const stepIndex = active ? Math.max(0, STEPS.findIndex((s) => s.key === active.status)) : 0;

    return (
        <div className="dh">
            {/* ---------- welcome ---------- */}
            <section className="dh-hero">
                <div>
                    <h2>Hello, {first}!</h2>
                    <p>{data?.memberSince ? `Member since ${when(data.memberSince)}. ` : ''}Here is what is happening with your orders.</p>
                </div>
                <div className="dh-hero-btns">
                    <Link to="/shop" className="dh-btn primary">Continue shopping</Link>
                    <Link to="/dashboard/orders" className="dh-btn">My orders</Link>
                </div>
            </section>

            {failed && <div className="dh-note">We could not load your summary right now. Your orders are still available from the Orders page.</div>}

            {/* ---------- numbers ---------- */}
            {stats && (
                <section className="dh-stats">
                    <div className="dh-stat"><span className="ic a"><I d={P.bag} /></span><div><b>{stats.orders}</b><small>Total orders</small></div></div>
                    <div className="dh-stat"><span className="ic b"><I d={P.wallet} /></span><div><b>{taka(stats.spent)}</b><small>Total spent</small></div></div>
                    <div className="dh-stat"><span className="ic c"><I d={P.truck} /></span><div><b>{stats.inProgress}</b><small>In progress</small></div></div>
                    <div className="dh-stat"><span className="ic d"><I d={P.check} /></span><div><b>{stats.delivered}</b><small>Delivered</small></div></div>
                </section>
            )}

            {/* ---------- live order ---------- */}
            {active && (
                <section className="dh-card dh-live">
                    <header>
                        <div>
                            <span className="dh-eyebrow">Your latest order</span>
                            <h3>Order #{active.id} <span className={`dh-pill ${STATUS[active.status]?.cls || ''}`}>{STATUS[active.status]?.label || active.status}</span></h3>
                        </div>
                        <Link to={`/dashboard/orders/${active.id}`} className="dh-link">View details <I d={P.arrow} size={15} /></Link>
                    </header>

                    <ol className="dh-track">
                        {STEPS.map((s, i) => {
                            const done = i <= stepIndex;
                            const at = s.at ? active[s.at] : null;
                            return (
                                <li key={s.key} className={`${done ? 'done' : ''} ${i === stepIndex ? 'now' : ''}`}>
                                    <span className="dot">{done ? <I d={['M20 6 9 17l-5-5']} size={13} /> : i + 1}</span>
                                    <b>{s.label}</b>
                                    <small>{done && at ? when(at, true) : ''}</small>
                                </li>
                            );
                        })}
                    </ol>

                    <div className="dh-live-foot">
                        <div className="dh-live-items">
                            <Thumbs items={active.thumbs} max={4} />
                            <span>{active.itemCount} item{active.itemCount === 1 ? '' : 's'}<small>{active.firstItem}{active.itemCount > 1 ? ' and more' : ''}</small></span>
                        </div>
                        <div className="dh-live-meta">
                            <span><small>Total</small><b>{taka(active.total)}</b></span>
                            <span><small>Payment</small><b>{active.paymentMethod === 'COD' ? 'Cash on delivery' : (active.paymentMethod || '-')}</b></span>
                            {active.courier && (active.courier.trackingCode || active.courier.name) && (
                                <span><small>{active.courier.name || 'Courier'} tracking</small><b>{active.courier.trackingCode || '-'}</b></span>
                            )}
                            {active.courier?.riderName && <span><small>Delivery rider</small><b>{active.courier.riderName}</b></span>}
                        </div>
                    </div>
                </section>
            )}

            {/* ---------- recent orders ---------- */}
            <section className="dh-card">
                <header>
                    <h3>Recent orders</h3>
                    {recent.length > 0 && <Link to="/dashboard/orders" className="dh-link">View all <I d={P.arrow} size={15} /></Link>}
                </header>
                {recent.length === 0 ? (
                    <div className="dh-empty">
                        <I d={P.bag} size={34} />
                        <b>You have not placed an order yet</b>
                        <span>Your orders will show up here with live tracking.</span>
                        <Link to="/shop" className="dh-btn primary">Start shopping</Link>
                    </div>
                ) : (
                    <ul className="dh-orders">
                        {recent.map((o) => (
                            <li key={o.id}>
                                <Link to={`/dashboard/orders/${o.id}`} className="dh-order">
                                    <Thumbs items={o.thumbs} />
                                    <span className="mid">
                                        <b>Order #{o.id}</b>
                                        <small>{when(o.createdAt)} &middot; {o.itemCount} item{o.itemCount === 1 ? '' : 's'}</small>
                                    </span>
                                    <span className={`dh-pill ${STATUS[o.status]?.cls || ''}`}>{STATUS[o.status]?.label || o.status}</span>
                                    <b className="amt">{taka(o.total)}</b>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* ---------- shortcuts ---------- */}
            <section className="dh-links">
                <Link to="/wishlist" className="dh-lk"><span className="ic"><I d={P.heart} /></span><b>Wishlist</b><small>{stats ? `${stats.wishlist} saved item${stats.wishlist === 1 ? '' : 's'}` : 'Your saved items'}</small></Link>
                <Link to="/dashboard/address" className="dh-lk"><span className="ic"><I d={P.pin} /></span><b>Addresses</b><small>{stats ? `${stats.addresses} saved` : 'Delivery addresses'}</small></Link>
                <Link to="/dashboard/account-details" className="dh-lk"><span className="ic"><I d={P.user} /></span><b>Account details</b><small>Name, email, phone</small></Link>
                <Link to="/dashboard/change-password" className="dh-lk"><span className="ic"><I d={P.lock} /></span><b>Password</b><small>Keep your account safe</small></Link>
            </section>

            {/* ---------- recommendations ---------- */}
            {picks.length > 0 && (
                <section className="dh-card">
                    <header><h3>New for you</h3><Link to="/shop" className="dh-link">Shop all <I d={P.arrow} size={15} /></Link></header>
                    <div className="dh-picks">{picks.map((p) => <ProductCard key={p.productId} product={p} />)}</div>
                </section>
            )}
        </div>
    );
}
