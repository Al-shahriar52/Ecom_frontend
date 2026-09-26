import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, ChevronDown, Plus, Info, AlertTriangle, ArrowUp, ArrowDown, ChevronRight,
} from './financeIcons';
import { money, signedMoney } from './financeUtils';
import { Sparkline, RevenueCostChart, BarList } from './financeCharts';
import { fetchDashboard } from './financeApi';

const RANGE_OPTIONS = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This week' },
    { key: 'month', label: 'This month' },
    { key: 'quarter', label: 'Quarter' },
];

const iso = (d) => d.toISOString().slice(0, 10);

const rangeFor = (key) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (key === 'today') return { start: today, end: today };
    if (key === 'week') {
        const day = (today.getDay() + 6) % 7; // 0 = Monday
        const monday = new Date(today); monday.setDate(today.getDate() - day);
        return { start: monday, end: today };
    }
    if (key === 'month') {
        return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: new Date(today.getFullYear(), today.getMonth() + 1, 0) };
    }
    // quarter
    const qStartMonth = Math.floor(today.getMonth() / 3) * 3;
    return { start: new Date(today.getFullYear(), qStartMonth, 1), end: today };
};

const previousRangeFor = (start, end) => {
    const lengthMs = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000);
    const prevStart = new Date(prevEnd.getTime() - lengthMs);
    return { start: prevStart, end: prevEnd };
};

const pctChange = (current, previous) => {
    if (!previous) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
};

const GW_COLORS = {
    bkash: '#8A2C4E', nagad: '#8A4520', rocket: '#4A3B7A', card: '#1B5788', cod: '#566A62',
};
const GW_LABEL = { bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket', card: 'Card · SSLCommerz', cod: 'Cash on delivery' };
const GW_DISPLAY = {
    bkash: { n: 'bKash', s: 'bK', bg: '#F3E3EA', fg: '#8A2C4E' },
    nagad: { n: 'Nagad', s: 'Ng', bg: '#F6E7DE', fg: '#8A4520' },
    rocket: { n: 'Rocket', s: 'Rk', bg: '#EAE5F2', fg: '#4A3B7A' },
    card: { n: 'Card', s: 'SSL', bg: '#E4EDF5', fg: '#1B5788' },
    cod: { n: 'Cash on delivery', s: 'COD', bg: '#EDF1EF', fg: '#566A62' },
};
const ST = {
    settled: ['ok', 'Settled'], await: ['pend', 'Awaiting payment'], refunded: ['info', 'Refunded'],
    failed: ['fail', 'Failed'], transit: ['info', 'In transit'], delivered: ['pend', 'Delivered, unpaid'], cancelled: ['fail', 'Cancelled'],
};
const CATC = {
    STOCK_PURCHASE: '#0B7A55', ADVERTISING: '#9E3320', COURIER_DELIVERY: '#1B5788',
    PACKAGING: '#8A5D06', SALARIES: '#5C4B8A', RENT_UTILITIES: '#8A6D3B', SOFTWARE: '#2F7D8A', OTHER: '#8A9A93',
};
const catLabel = (c) => (c || '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase());

const formatOrderDate = (dateArray) => {
    if (!Array.isArray(dateArray)) return '—';
    const d = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

const FinanceOverview = () => {
    const navigate = useNavigate();
    const [range, setRange] = useState('month');
    const [grain, setGrain] = useState('week');

    const [data, setData] = useState(null);
    const [prevData, setPrevData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { start, end } = useMemo(() => rangeFor(range), [range]);
    const { start: prevStart, end: prevEnd } = useMemo(() => previousRangeFor(start, end), [start, end]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        Promise.all([
            fetchDashboard(iso(start), iso(end), grain),
            fetchDashboard(iso(prevStart), iso(prevEnd), grain),
        ])
            .then(([current, previous]) => {
                if (cancelled) return;
                setData(current);
                setPrevData(previous);
            })
            .catch((err) => {
                console.error('Error fetching dashboard:', err);
                if (!cancelled) setError('Could not load the dashboard. Please try again.');
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [start, end, grain]);

    if (loading && !data) {
        return (
            <div className="fin-wrap">
                <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--fin-tx3)' }}>Loading dashboard…</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="fin-wrap">
                <div className="fin-note w"><AlertTriangle size={18} style={{ flex: 'none', marginTop: 1 }} /><div>{error || 'No data available.'}</div></div>
            </div>
        );
    }

    const WF = [
        { t: 'Gross sales', v: data.grossSales, c: 'var(--fin-pos)', p: `${data.ordersPaid.toLocaleString('en-IN')} paid orders` },
        { t: 'Refunds & returns', v: -data.refunds, c: '#C58A7A', p: data.grossSales ? `${((data.refunds / data.grossSales) * 100).toFixed(1)}% of sales` : '' },
        { t: 'Gateway fees', v: -data.gatewayFees, c: '#D8B4A6', p: data.grossSales ? `blended ${((data.gatewayFees / data.grossSales) * 100).toFixed(2)}%` : '' },
        { t: 'Cost of goods', v: -data.cogs, c: '#B0654F', p: data.grossSales ? `${((data.cogs / data.grossSales) * 100).toFixed(0)}% of sales` : '' },
        { t: 'Operating cost', v: -data.operatingCost, c: 'var(--fin-neg)', p: 'ads, courier, rent, salary' },
        { t: 'Net profit', v: data.netProfit, c: 'var(--fin-brand-dark)', p: `${data.netMarginPct.toFixed(1)}% net margin` },
    ];
    const wfMax = Math.max(...WF.map((w) => Math.abs(w.v)), 1);

    const netProfitDelta = pctChange(data.netProfit, prevData?.netProfit);
    const ordersDelta = prevData ? data.ordersPaid - prevData.ordersPaid : null;
    const avgOrderDelta = prevData ? data.averageOrder - prevData.averageOrder : null;

    const gwTotal = data.gatewayMix.reduce((sum, g) => sum + g.amount, 0) || 1;
    const gwRows = data.gatewayMix.map((g) => ({
        n: GW_LABEL[g.gateway] || g.gateway, v: g.amount, c: GW_COLORS[g.gateway] || '#94a3b8', s: `${g.count} orders`,
    }));

    const costTotal = data.costBreakdown.reduce((sum, c) => sum + c.total, 0) || 1;
    const costRows = data.costBreakdown.map((c) => ({
        n: catLabel(c.category), v: c.total, c: CATC[c.category] || '#94a3b8',
    }));

    const chartSeries = {
        lab: Object.keys(data.revenueSeries),
        rev: Object.values(data.revenueSeries).map((v) => v / 1000),
        cost: Object.values(data.costSeries).map((v) => v / 1000),
    };

    return (
        <>
            <div className="fin-pbar">
                <div>
                    <div className="fin-h1">Dashboard</div>
                    <div className="fin-sub">{iso(start)} – {iso(end)} · compared with the same length period before</div>
                </div>
                <div className="fin-sp" />
                <div className="fin-seg">
                    {RANGE_OPTIONS.map((r) => (
                        <button key={r.key} className={range === r.key ? 'on' : ''} onClick={() => setRange(r.key)}>
                            {r.label}
                        </button>
                    ))}
                </div>
                <button className="fin-date"><Calendar size={14} /><b>{iso(start)} – {iso(end)}</b><ChevronDown size={14} /></button>
                <button className="fin-btn pri" onClick={() => navigate('expenses/new')}><Plus size={14} />Record a cost</button>
            </div>

            <div className="fin-wrap">

                {data.awaitingSettlementCount > 0 && (
                    <div className="fin-note w fin-mb">
                        <AlertTriangle size={18} style={{ flex: 'none', marginTop: 1 }} />
                        <div className="fin-sp">
                            <b>{data.awaitingSettlementCount} payment{data.awaitingSettlementCount === 1 ? '' : 's'} still awaiting settlement.</b> {money(data.awaitingSettlement)} across non-COD orders hasn't cleared yet.
                        </div>
                        <button onClick={() => navigate('settlements')}>View settlements</button>
                    </div>
                )}

                {/* waterfall hero */}
                <div className="fin-hero">
                    <div className="fin-hero-top">
                        <div className="fin-hero-net">
                            <div className="fin-lab">Net profit <Info size={14} style={{ color: 'var(--fin-tx3)' }} /></div>
                            <div className="fin-big">{money(data.netProfit)}</div>
                            {netProfitDelta !== null && (
                                <div className={`fin-delta ${netProfitDelta >= 0 ? 'up' : 'dn'}`}>
                                    {netProfitDelta >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                    {Math.abs(netProfitDelta).toFixed(1)}% vs previous period
                                </div>
                            )}
                            <div className="fin-foot">After all gateway fees, refunds, COGS and operating cost</div>
                        </div>
                        <div className="fin-hero-side">
                            <div className="fin-hs"><div className="fin-k">Orders paid</div><div className="fin-v">{data.ordersPaid.toLocaleString('en-IN')}</div><div className="fin-m">{ordersDelta === null ? '—' : `${ordersDelta >= 0 ? '+' : ''}${ordersDelta} vs previous`}</div></div>
                            <div className="fin-hs"><div className="fin-k">Average order</div><div className="fin-v">{money(data.averageOrder)}</div><div className="fin-m">{avgOrderDelta === null ? '—' : signedMoney(avgOrderDelta) + ' vs previous'}</div></div>
                            <div className="fin-hs"><div className="fin-k">Net margin</div><div className="fin-v">{data.netMarginPct.toFixed(1)}%</div><div className="fin-m">{prevData ? `${prevData.netMarginPct.toFixed(1)}% before` : '—'}</div></div>
                            <div className="fin-hs"><div className="fin-k">Awaiting payout</div><div className="fin-v">{money(data.awaitingSettlement)}</div><div className="fin-m">{data.awaitingSettlementCount} orders</div></div>
                        </div>
                    </div>
                    <div className="fin-wf">
                        {WF.map((w, i) => {
                            const last = i === WF.length - 1;
                            return (
                                <div key={w.t} className="fin-wf-step" style={{ flex: last ? 1.15 : 1 }}>
                                    <div className="fin-t">{w.t}</div>
                                    <div className="fin-n" style={last ? { color: w.c, fontSize: 17 } : undefined}>{signedMoney(w.v)}</div>
                                    <div className="fin-wf-bar"><span style={{ width: `${Math.max(4, (Math.abs(w.v) / wfMax) * 100)}%`, background: w.c }} /></div>
                                    <div className="fin-p">{w.p}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* tiles */}
                <div className="fin-g4 fin-mb">
                    <div className="fin-tile">
                        <div className="fin-k">Collected today</div>
                        <div className="fin-v">{money(data.collectedToday)}</div>
                        <div className="fin-r"><span>last 12 days</span></div>
                        <Sparkline data={data.collectedTodayTrend.length ? data.collectedTodayTrend : [0, 0]} color="#0B7A55" />
                    </div>
                    <div className="fin-tile">
                        <div className="fin-k">Awaiting settlement</div>
                        <div className="fin-v">{money(data.awaitingSettlement)}</div>
                        <div className="fin-r"><span className="fin-pill pend">{data.awaitingSettlementCount} orders</span></div>
                    </div>
                    <div className="fin-tile">
                        <div className="fin-k">Cash on delivery pending</div>
                        <div className="fin-v">{money(data.codPending)}</div>
                        <div className="fin-r"><span>{data.codPendingCount} parcels</span><span>out for delivery</span></div>
                    </div>
                    <div className="fin-tile">
                        <div className="fin-k">Operating cost this period</div>
                        <div className="fin-v">{money(data.operatingCostThisPeriod)}</div>
                        <div className="fin-r"><span>last 12 weeks</span></div>
                        <Sparkline data={data.operatingCostTrend.length ? data.operatingCostTrend : [0, 0]} color="#9E3320" />
                    </div>
                </div>

                {/* chart + gateway mix */}
                <div className="fin-split fin-mb">
                    <div className="fin-card">
                        <div className="fin-ch">
                            <div><h3>Revenue against cost</h3><p>Gross revenue against total cost, per {grain}</p></div>
                            <div className="fin-sp" />
                            <div className="fin-seg">
                                <button className={grain === 'week' ? 'on' : ''} onClick={() => setGrain('week')}>Weekly</button>
                                <button className={grain === 'month' ? 'on' : ''} onClick={() => setGrain('month')}>Monthly</button>
                            </div>
                        </div>
                        <div className="fin-cb">
                            <div className="fin-legend">
                                <span><i style={{ background: '#0B7A55' }} />Gross revenue</span>
                                <span><i style={{ background: '#D8B4A6' }} />Total cost</span>
                                <span><i style={{ background: 'var(--fin-brand-dark)' }} />Net profit kept (own scale, below)</span>
                            </div>
                            {chartSeries.lab.length > 0 ? (
                                <RevenueCostChart series={chartSeries} />
                            ) : (
                                <div style={{ color: 'var(--fin-tx3)', fontSize: 13, padding: '30px 0', textAlign: 'center' }}>Not enough data yet.</div>
                            )}
                        </div>
                    </div>

                    <div className="fin-card">
                        <div className="fin-ch"><div><h3>Where the money came in</h3><p>Share of collected revenue</p></div></div>
                        <div className="fin-cb">
                            {gwRows.length > 0 ? (
                                <BarList rows={gwRows} total={gwTotal} />
                            ) : (
                                <div style={{ color: 'var(--fin-tx3)', fontSize: 13 }}>No orders in this period yet.</div>
                            )}
                        </div>
                        <div className="fin-cb" style={{ borderTop: '1px solid var(--fin-line)', paddingTop: 14 }}>
                            <div className="fin-kv"><span className="fin-k">Total collected</span><span className="fin-v">{money(data.grossSales - data.refunds)}</span></div>
                            <div className="fin-kv"><span className="fin-k">Gateway fees paid</span><span className="fin-v" style={{ color: 'var(--fin-neg)' }}>{signedMoney(-data.gatewayFees)}</span></div>
                            <div className="fin-kv"><span className="fin-k">Blended fee rate</span><span className="fin-v">{data.grossSales ? ((data.gatewayFees / data.grossSales) * 100).toFixed(2) : '0.00'}%</span></div>
                        </div>
                    </div>
                </div>

                {/* recent + cost split */}
                <div className="fin-split">
                    <div className="fin-card">
                        <div className="fin-ch">
                            <div><h3>Latest transactions</h3></div>
                            <div className="fin-sp" />
                            <button className="fin-btn sm" onClick={() => navigate('transactions')}>View all<ChevronRight size={14} /></button>
                        </div>
                        <div className="fin-tw">
                            <table className="fin-table">
                                <thead>
                                <tr><th>Order</th><th>Customer</th><th>Method</th><th className="r">Gross</th><th className="r">Net to you</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                {data.recentTransactions.length === 0 && (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20, color: 'var(--fin-tx3)' }}>No transactions yet.</td></tr>
                                )}
                                {data.recentTransactions.map((t) => {
                                    const g = GW_DISPLAY[t.gateway] || GW_DISPLAY.cod;
                                    const st = ST[t.status] || ['mute', t.status];
                                    return (
                                        <tr key={t.orderId}>
                                            <td className="fin-oid">{t.invoice || `#${t.orderId}`}<small>{formatOrderDate(t.date)}</small></td>
                                            <td className="fin-cust">{t.customer || 'Guest'}<small>{t.phone}</small></td>
                                            <td><span className="fin-gw"><span className="fin-gwi" style={{ background: g.bg, color: g.fg }}>{g.s}</span>{g.n}</span></td>
                                            <td className="r fin-money">{money(t.gross)}</td>
                                            <td className="r fin-money">{t.status === 'failed' ? '—' : money(t.net)}</td>
                                            <td><span className={`fin-pill ${st[0]}`}>{st[1]}</span></td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="fin-card">
                        <div className="fin-ch"><div><h3>Cost breakdown</h3><p>This period, all categories</p></div></div>
                        <div className="fin-cb">
                            {costRows.length > 0 ? (
                                <BarList rows={costRows} total={costTotal} />
                            ) : (
                                <div style={{ color: 'var(--fin-tx3)', fontSize: 13 }}>No costs recorded in this period yet.</div>
                            )}
                        </div>
                        <div className="fin-cb" style={{ borderTop: '1px solid var(--fin-line)' }}>
                            <div style={{ fontSize: 12, color: 'var(--fin-tx2)', marginBottom: 10 }}>Recent recurring costs</div>
                            {data.recentRecurringExpenses.length === 0 ? (
                                <div style={{ color: 'var(--fin-tx3)', fontSize: 13 }}>No recurring costs recorded yet.</div>
                            ) : (
                                <div className="fin-feed">
                                    {data.recentRecurringExpenses.map((e) => (
                                        <div key={e.id} className="fin-fi">
                                            <div className="fin-fi-ic" style={{ background: 'var(--fin-info-bg)', color: 'var(--fin-info)' }}><Calendar size={14} /></div>
                                            <div className="fin-fi-b"><p><b>{e.vendor || catLabel(e.category)}</b> — {catLabel(e.category)}</p><span>Recorded {e.expenseDate} · repeats monthly</span></div>
                                            <div className="fin-fi-m">{money(e.amount)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default FinanceOverview;