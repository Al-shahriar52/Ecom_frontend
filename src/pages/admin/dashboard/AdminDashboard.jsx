import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../api/AxiosInstance';
import { AuthContext } from '../../../context/AuthContext';
import { usePermissions } from '../../../context/PermissionContext';
import { AreaChart, Delta, Donut, Icon, Sparkline, money, num, shortDate, timeAgo } from './dashUtils';
import './AdminDashboard.css';

const RANGES = [{ d: 7, label: '7 days' }, { d: 30, label: '30 days' }, { d: 90, label: '90 days' }];

const STATUS_META = {
    PENDING: { label: 'Pending', color: '#f59e0b' },
    CONFIRMED: { label: 'Confirmed', color: '#3b82f6' },
    PACKAGED: { label: 'Packaged', color: '#8b5cf6' },
    SHIPPED: { label: 'Shipped', color: '#0ea5e9' },
    DELIVERED: { label: 'Delivered', color: '#10b981' },
    CANCELLED: { label: 'Cancelled', color: '#ef4444' },
    RETURNED: { label: 'Returned', color: '#f97316' },
};
const PAY_META = {
    COD: { label: 'Cash on delivery', color: '#4f46e5' },
    BKASH: { label: 'bKash', color: '#e2136e' },
    NAGAD: { label: 'Nagad', color: '#f6921e' },
    ROCKET: { label: 'Rocket', color: '#8b1e8f' },
    CARD: { label: 'Card', color: '#0d9488' },
    OTHER: { label: 'Other', color: '#94a3b8' },
};
const DELIVERY_META = {
    PENDING: 'Waiting', READY_FOR_PICKUP: 'Ready for pickup', IN_TRANSIT: 'On the way', DELIVERED: 'Delivered', RETURNED: 'Returned', CANCELLED: 'Cancelled',
};

const greeting = () => {
    const h = new Date().getHours();
    return h < 5 ? 'Working late' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const Skeleton = () => (
    <div className="ad-skel">
        <div className="ad-grid4">{[...Array(4)].map((_, i) => <div key={i} className="ad-card sk" style={{ height: 118 }} />)}</div>
        <div className="ad-grid-main"><div className="ad-card sk" style={{ height: 340 }} /><div className="ad-card sk" style={{ height: 340 }} /></div>
    </div>
);

function Kpi({ icon, tone, label, value, delta, spark, sub, to }) {
    const body = (
        <>
            <div className="ad-kpi-top">
                <span className={`ad-kpi-ico ${tone}`}><Icon name={icon} size={18} /></span>
                <span className="ad-kpi-label">{label}</span>
            </div>
            <div className="ad-kpi-val">{value}</div>
            <div className="ad-kpi-foot">
                <div>{delta}{sub && <span className="ad-sub">{sub}</span>}</div>
                {spark}
            </div>
        </>
    );
    return to ? <Link to={to} className="ad-card ad-kpi link">{body}</Link> : <div className="ad-card ad-kpi">{body}</div>;
}

const Card = ({ title, action, children, className = '' }) => (
    <section className={`ad-card ${className}`}>
        <header className="ad-card-h"><h3>{title}</h3>{action}</header>
        {children}
    </section>
);

export default function AdminDashboard() {
    const { user } = useContext(AuthContext);
    const { hasPermission } = usePermissions();
    const [days, setDays] = useState(30);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [metric, setMetric] = useState('sales');

    const load = useCallback(async (silent) => {
        if (!silent) setLoading(true);
        try {
            const res = await axiosInstance.get('/api/v1/admin/dashboard', { params: { days } });
            setData(res.data?.data || null);
            setError('');
        } catch (e) {
            if (!silent) setError(e?.response?.status === 403 ? 'You do not have permission to view the dashboard.' : 'Could not load the dashboard.');
        } finally { setLoading(false); }
    }, [days]);

    useEffect(() => { load(false); }, [load]);

    // keep numbers fresh while the tab is open
    useEffect(() => {
        const t = setInterval(() => { if (!document.hidden) load(true); }, 60000);
        return () => clearInterval(t);
    }, [load]);

    const has = (s) => !!data && data.sections.includes(s);
    const sales = data?.sales;
    const daily = sales?.daily || [];

    const chartData = useMemo(() => daily.map((d) => ({
        label: shortDate(d.date),
        value: metric === 'sales' ? d.sales : d.orders,
        extra: metric === 'sales' ? d.orders : d.sales,
    })), [daily, metric]);

    const last14 = (key) => daily.slice(-14).map((d) => d[key]);

    const firstName = (user?.name || '').trim().split(' ')[0];
    const roleLabel = (() => {
        const r = Array.isArray(user?.roles) ? user.roles[0] : (user?.role || (user?.roles ? Array.from(user.roles)[0] : ''));
        return String(r?.name || r || '').replace(/^ROLE_/, '');
    })();
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const quick = [
        { perm: 14, to: '/admin/orders/new', label: 'New order' },
        { perm: 11, to: '/admin/products/add', label: 'Add product' },
        { perm: 4, to: '/admin/orders', label: 'Orders' },
        { perm: 11, to: '/admin/products', label: 'Products' },
        { perm: 8, to: '/admin/coupons', label: 'Coupons' },
        { perm: 12, to: '/admin/homepage', label: 'Homepage' },
        { perm: 13, to: '/admin/catalog', label: 'Catalog' },
    ].filter((q) => hasPermission(user, q.perm));

    // things that need a human today
    const attention = [];
    if (has('orders')) {
        const pending = data.pipeline?.PENDING || 0;
        if (pending > 0) attention.push({ tone: 'amber', icon: 'clock', text: `${num(pending)} order${pending === 1 ? '' : 's'} waiting to be confirmed`, to: '/admin/orders' });
        if (data.stalePending > 0) attention.push({ tone: 'red', icon: 'alert', text: `${num(data.stalePending)} pending for over 24 hours`, to: '/admin/orders' });
    }
    if (has('inventory')) {
        const inv = data.inventory;
        if (inv.outOfStock > 0) attention.push({ tone: 'red', icon: 'box', text: `${num(inv.outOfStock)} product${inv.outOfStock === 1 ? '' : 's'} out of stock`, to: '/admin/products' });
        if (inv.lowStock > 0) attention.push({ tone: 'amber', icon: 'box', text: `${num(inv.lowStock)} running low (under 5)`, to: '/admin/products' });
    }

    if (loading && !data) return <div className="ad"><Skeleton /></div>;
    if (error && !data) {
        return (
            <div className="ad"><div className="ad-card ad-empty"><Icon name="alert" size={28} /><b>{error}</b>
                <button type="button" className="ad-btn" onClick={() => load(false)}>Try again</button></div></div>
        );
    }
    if (!data) return null;

    const open = ['PENDING', 'CONFIRMED', 'PACKAGED', 'SHIPPED'];
    const openTotal = open.reduce((s, k) => s + (data.pipeline?.[k] || 0), 0);
    const pay = (sales?.payments || []).map((p) => ({ label: (PAY_META[p.method] || PAY_META.OTHER).label, color: (PAY_META[p.method] || PAY_META.OTHER).color, value: p.orders }));
    const payTotal = pay.reduce((s, p) => s + p.value, 0);
    const topMax = Math.max(1, ...(data.topProducts || []).map((p) => p.qty));
    const fin = data.finance;
    const courier = data.courier || {};

    return (
        <div className="ad">
            {/* ---------- header ---------- */}
            <div className="ad-head">
                <div>
                    <h1>{greeting()}{firstName ? `, ${firstName}` : ''} <span className="ad-wave" aria-hidden="true">&#128075;</span></h1>
                    <p>{today}{roleLabel && <span className="ad-role">{roleLabel}</span>}</p>
                </div>
                <div className="ad-head-r">
                    {(has('sales') || has('orders')) && (
                        <div className="ad-seg" role="tablist" aria-label="Date range">
                            {RANGES.map((r) => <button key={r.d} type="button" role="tab" aria-selected={days === r.d} className={days === r.d ? 'on' : ''} onClick={() => setDays(r.d)}>{r.label}</button>)}
                        </div>
                    )}
                    <button type="button" className="ad-btn ghost" onClick={() => load(false)} aria-label="Refresh"><Icon name="refresh" size={16} /><span>Refresh</span></button>
                </div>
            </div>

            {/* ---------- quick actions ---------- */}
            {quick.length > 0 && (
                <div className="ad-quick">
                    {quick.map((q, i) => (
                        <Link key={q.to + q.label} to={q.to} className={`ad-chip ${i === 0 ? 'primary' : ''}`}>{i === 0 && <Icon name="plus" size={15} />}{q.label}</Link>
                    ))}
                </div>
            )}

            {data.sections.length === 0 && (
                <div className="ad-card ad-empty">
                    <Icon name="check" size={28} />
                    <b>Welcome to the admin panel</b>
                    <span>Use the menu on the left. Ask an administrator in Roles &amp; Permissions if you need to see sales, stock or customers here.</span>
                </div>
            )}

            {/* ---------- needs attention ---------- */}
            {attention.length > 0 && (
                <div className="ad-attn">
                    {attention.map((a, i) => (
                        <Link key={i} to={a.to} className={`ad-attn-i ${a.tone}`}><Icon name={a.icon} size={16} /><span>{a.text}</span><Icon name="chevron" size={15} /></Link>
                    ))}
                </div>
            )}

            {/* ---------- KPIs ---------- */}
            {has('sales') && (
                <div className="ad-grid4">
                    <Kpi icon="wallet" tone="indigo" label="Today's sales" value={money(sales.today.sales)}
                         delta={<Delta cur={sales.today.sales} prev={sales.yesterday.sales} />} spark={<Sparkline values={last14('sales')} color="#4f46e5" />} />
                    <Kpi icon="bag" tone="pink" label="Today's orders" value={num(sales.today.orders)}
                         delta={<Delta cur={sales.today.orders} prev={sales.yesterday.orders} />} spark={<Sparkline values={last14('orders')} color="#e91e63" />}
                         to={has('orders') ? '/admin/orders' : undefined} />
                    <Kpi icon="trend" tone="teal" label="This month" value={money(sales.month.sales)}
                         delta={<Delta cur={sales.month.sales} prev={sales.lastMonthSamePeriod.sales} suffix="vs last month" />}
                         sub={`${num(sales.month.orders)} orders`} />
                    {has('orders') ? (
                        <Kpi icon="clock" tone="amber" label="Pending orders" value={num(data.pipeline?.PENDING || 0)}
                             delta={<span className={`ad-delta ${data.stalePending > 0 ? 'down' : 'flat'}`}>{data.stalePending > 0 ? `${num(data.stalePending)} over 24 h` : 'All on time'}</span>}
                             sub={`${num(openTotal)} open in total`} to="/admin/orders" />
                    ) : (
                        <Kpi icon="wallet" tone="amber" label={`Average order (${days}d)`} value={money(sales.range.avgOrder)} sub={`${num(sales.range.orders)} orders`} />
                    )}
                </div>
            )}

            {/* ---------- chart + pipeline ---------- */}
            {has('sales') && (
                <div className="ad-grid-main">
                    <Card title={`Sales, last ${days} days`}
                          action={<div className="ad-seg sm">
                              <button type="button" className={metric === 'sales' ? 'on' : ''} onClick={() => setMetric('sales')}>Sales</button>
                              <button type="button" className={metric === 'orders' ? 'on' : ''} onClick={() => setMetric('orders')}>Orders</button>
                          </div>}>
                        <div className="ad-summary">
                            <div><small>Total sales</small><b>{money(sales.range.sales)}</b></div>
                            <div><small>Orders</small><b>{num(sales.range.orders)}</b></div>
                            <div><small>Average order</small><b>{money(sales.range.avgOrder)}</b></div>
                            <div><small>Delivered</small><b>{num(sales.range.delivered)}</b></div>
                            <div><small>Cancelled / returned</small><b>{num(sales.range.cancelled + sales.range.returned)}</b></div>
                        </div>
                        <AreaChart data={chartData} color={metric === 'sales' ? '#4f46e5' : '#e91e63'}
                                   format={metric === 'sales' ? money : (v) => `${num(v)} orders`}
                                   extraLabel={metric === 'sales' ? (v) => `${num(v)} orders` : (v) => money(v)} />
                    </Card>

                    <div className="ad-stack">
                        {has('orders') && (
                            <Card title="Order pipeline" action={<Link to="/admin/orders" className="ad-link">Open orders</Link>}>
                                <ul className="ad-pipe">
                                    {open.map((k) => {
                                        const c = data.pipeline?.[k] || 0;
                                        return (
                                            <li key={k}>
                                                <span className="dot" style={{ background: STATUS_META[k].color }} />
                                                <span className="nm">{STATUS_META[k].label}</span>
                                                <span className="bar"><i style={{ width: `${openTotal ? (c / openTotal) * 100 : 0}%`, background: STATUS_META[k].color }} /></span>
                                                <b>{num(c)}</b>
                                            </li>
                                        );
                                    })}
                                </ul>
                                <div className="ad-pipe-foot">
                                    <span><i style={{ background: STATUS_META.DELIVERED.color }} />{num(sales.range.delivered)} delivered</span>
                                    <span><i style={{ background: STATUS_META.CANCELLED.color }} />{num(sales.range.cancelled)} cancelled</span>
                                    <span><i style={{ background: STATUS_META.RETURNED.color }} />{num(sales.range.returned)} returned</span>
                                </div>
                            </Card>
                        )}
                        <Card title="Payment methods">
                            {payTotal === 0 ? <div className="ad-none">No orders in this period</div> : (
                                <div className="ad-pay">
                                    <Donut slices={pay} size={128} thickness={18} center={<><b>{num(payTotal)}</b><small>orders</small></>} />
                                    <ul>
                                        {pay.map((p) => (
                                            <li key={p.label}><i style={{ background: p.color }} /><span>{p.label}</span><b>{Math.round((p.value / payTotal) * 100)}%</b></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            )}

            {/* ---------- recent orders + top products ---------- */}
            {has('orders') && (
                <div className="ad-grid-main">
                    <Card title="Recent orders" action={<Link to="/admin/orders" className="ad-link">View all</Link>}>
                        {data.recentOrders.length === 0 ? <div className="ad-none">No orders yet</div> : (
                            <div className="ad-table-wrap">
                                <table className="ad-table">
                                    <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>When</th></tr></thead>
                                    <tbody>
                                        {data.recentOrders.map((o) => {
                                            const st = STATUS_META[o.status] || { label: o.status, color: '#94a3b8' };
                                            return (
                                                <tr key={o.id}>
                                                    <td><Link to={`/admin/orders/${o.id}`} className="ad-oid">#{o.id}</Link></td>
                                                    <td className="nm" title={o.name}>{o.name || '-'}{o.city && <small>{o.city}</small>}</td>
                                                    <td className="mo">{money(o.total)}</td>
                                                    <td>{(PAY_META[o.payment] || PAY_META.OTHER).label}{o.paid === 'PAID' && <em className="paid">Paid</em>}</td>
                                                    <td><span className="ad-pill" style={{ color: st.color, background: `${st.color}1a` }}>{st.label}</span></td>
                                                    <td className="tm">{timeAgo(o.createdAt)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>

                    <Card title={`Best sellers, ${days} days`} action={has('inventory') ? <Link to="/admin/products" className="ad-link">Products</Link> : null}>
                        {data.topProducts.length === 0 ? <div className="ad-none">No sales in this period</div> : (
                            <ol className="ad-top">
                                {data.topProducts.map((p, i) => (
                                    <li key={p.id}>
                                        <span className="rk">{i + 1}</span>
                                        <span className="im">{p.imageUrl ? <img src={p.imageUrl} alt="" loading="lazy" /> : <Icon name="box" size={16} />}</span>
                                        <span className="tx">
                                            <b title={p.name}>{p.name}</b>
                                            <span className="bar"><i style={{ width: `${(p.qty / topMax) * 100}%` }} /></span>
                                        </span>
                                        <span className="nu"><b>{num(p.qty)}</b><small>{money(p.revenue)}</small></span>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </Card>
                </div>
            )}

            {/* ---------- inventory / customers / money / courier ---------- */}
            {(has('inventory') || has('customers') || has('finance') || has('courier')) && (
                <div className="ad-grid3">
                    {has('inventory') && (
                        <Card title="Stock alerts" action={<Link to="/admin/products" className="ad-link">Manage</Link>}>
                            <div className="ad-mini">
                                <div><b>{num(data.inventory.published)}</b><small>Live products</small></div>
                                <div className={data.inventory.outOfStock ? 'bad' : ''}><b>{num(data.inventory.outOfStock)}</b><small>Out of stock</small></div>
                                <div className={data.inventory.lowStock ? 'warn' : ''}><b>{num(data.inventory.lowStock)}</b><small>Low stock</small></div>
                                <div><b>{num(data.inventory.drafts)}</b><small>Drafts</small></div>
                            </div>
                            {data.inventory.lowStockList.length === 0 ? <div className="ad-none">Every product is well stocked</div> : (
                                <ul className="ad-low">
                                    {data.inventory.lowStockList.map((p) => (
                                        <li key={p.id}>
                                            <Link to={`/admin/products/edit/${p.id}`} title={p.name}>{p.name}</Link>
                                            <span className={`q ${p.quantity <= 0 ? 'zero' : ''}`}>{p.quantity <= 0 ? 'Out' : `${p.quantity} left`}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    )}

                    <div className="ad-stack">
                        {has('finance') && (
                            <Card title="This month's money" action={<Link to="/admin/accounting" className="ad-link">Accounting</Link>}>
                                <div className="ad-money">
                                    <div><small>Sales</small><b>{money(fin.monthSales)}</b></div>
                                    <div><small>Expenses</small><b>{money(fin.monthExpenses)}</b></div>
                                    <div className={fin.monthNet < 0 ? 'neg' : 'pos'}><small>Left after expenses</small><b>{fin.monthNet < 0 ? '-' : ''}{money(Math.abs(fin.monthNet))}</b></div>
                                </div>
                                <div className="ad-split" title="Share of sales spent on expenses">
                                    <i style={{ width: `${fin.monthSales > 0 ? Math.min(100, (fin.monthExpenses / fin.monthSales) * 100) : 0}%` }} />
                                </div>
                                <p className="ad-note">Expenses are {fin.monthSales > 0 ? Math.round((fin.monthExpenses / fin.monthSales) * 100) : 0}% of this month's sales. Sales exclude cancelled and returned orders.</p>
                            </Card>
                        )}
                        {has('customers') && (
                            <Card title="Customers" action={<Link to="/admin/users" className="ad-link">Users</Link>}>
                                <div className="ad-mini three">
                                    <div><b>{num(data.customers.total)}</b><small>Total</small></div>
                                    <div><b>{num(data.customers.newInRange)}</b><small>New, {days}d</small></div>
                                    <div><b>{num(data.customers.newToday)}</b><small>New today</small></div>
                                </div>
                            </Card>
                        )}
                    </div>

                    {has('courier') && (
                        <Card title="Deliveries" action={<Link to="/admin/courier/pickups" className="ad-link">Courier</Link>}>
                            {Object.keys(courier).length === 0 ? <div className="ad-none">No shipments yet</div> : (
                                <ul className="ad-ship">
                                    {Object.entries(DELIVERY_META).map(([k, label]) => (
                                        <li key={k}>
                                            <span className="ic"><Icon name="truck" size={15} /></span><span className="nm">{label}</span><b>{num(courier[k] || 0)}</b>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    )}
                </div>
            )}

            <p className="ad-foot">Updated {timeAgo(data.generatedAt) || 'just now'}. Numbers refresh every minute. Amounts are in taka (৳).</p>
        </div>
    );
}
