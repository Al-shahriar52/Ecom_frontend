import React, { useEffect, useState } from 'react';
import { SlidersHorizontal, Download, Check, ChevronLeft, ChevronRight } from './financeIcons';
import { money, money2, signedMoney } from './financeUtils';
import { fetchTransactions } from './financeApi';

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

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'settled', label: 'Settled' },
    { key: 'await', label: 'Awaiting' },
    { key: 'transit', label: 'In transit' },
    { key: 'delivered', label: 'Delivered, unpaid' },
    { key: 'refunded', label: 'Refunded' },
    { key: 'failed', label: 'Failed' },
];

const formatDate = (dateArray) => {
    if (!Array.isArray(dateArray)) return '—';
    const d = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], dateArray[3] || 0, dateArray[4] || 0);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + ', ' +
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const PAGE_SIZE = 20;

const FinanceTransactions = () => {
    const [tab, setTab] = useState('all');
    const [search, setSearch] = useState('');
    const [gateway, setGateway] = useState('All');
    const [page, setPage] = useState(0);
    const [selected, setSelected] = useState(new Set());
    const [data, setData] = useState(null); // Spring Page
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchTransactions({
            page, size: PAGE_SIZE,
            search: search || undefined,
            method: gateway === 'All' ? undefined : gateway.toUpperCase(),
        })
            .then((d) => { if (!cancelled) setData(d); })
            .catch((err) => { console.error('Error fetching transactions:', err); if (!cancelled) setData(null); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [page, search, gateway]);

    const allRows = data?.content || [];
    const filtered = tab === 'all' ? allRows : allRows.filter((t) => t.status === tab);

    const gross = filtered.reduce((sum, t) => sum + (t.status === 'failed' ? 0 : t.gross), 0);
    const feeTotal = filtered.reduce((sum, t) => sum + (t.status === 'failed' ? 0 : t.fee), 0);

    const allSelected = filtered.length > 0 && filtered.every((t) => selected.has(t.orderId));
    const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map((t) => t.orderId)));
    const toggleRow = (id) => setSelected((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const totalPages = data?.totalPages ?? 0;

    return (
        <>
            <div className="fin-pbar">
                <div>
                    <div className="fin-h1">Transactions</div>
                    <div className="fin-sub">Every order, live from your store's real data</div>
                </div>
                <div className="fin-sp" />
                <button className="fin-btn" disabled title="Not built yet"><Download size={14} />Export CSV</button>
                <button className="fin-btn pri" disabled title="Needs the Settlements module"><Check size={14} />Reconcile</button>
            </div>

            <div className="fin-wrap">
                <div className="fin-card">
                    <div className="fin-tbar" style={{ borderBottom: '1px solid var(--fin-line)', gap: 2, paddingBottom: 0 }}>
                        {TABS.map((t) => (
                            <button
                                key={t.key}
                                className="fin-chip"
                                onClick={() => setTab(t.key)}
                                style={{
                                    border: 'none', borderRadius: 0, background: 'none', height: 34,
                                    borderBottom: tab === t.key ? '2px solid var(--fin-brand-dark)' : '2px solid transparent',
                                    color: tab === t.key ? 'var(--fin-tx)' : 'var(--fin-tx2)',
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="fin-tbar">
                        <div className="fin-search" style={{ width: 250, background: 'var(--fin-card)' }}>
                            <input placeholder="Customer name, phone or invoice" aria-label="Search transactions"
                                   value={search} onChange={(e) => { setPage(0); setSearch(e.target.value); }} />
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button className={`fin-chip ${gateway === 'All' ? 'on' : ''}`} onClick={() => { setPage(0); setGateway('All'); }}>All methods</button>
                            {Object.keys(GW_DISPLAY).map((k) => (
                                <button key={k} className={`fin-chip ${gateway === k ? 'on' : ''}`} onClick={() => { setPage(0); setGateway(k); }}>
                                    <span className="fin-gwi" style={{ width: 16, height: 16, fontSize: 8, background: GW_DISPLAY[k].bg, color: GW_DISPLAY[k].fg }}>{GW_DISPLAY[k].s}</span>
                                    {GW_DISPLAY[k].n}
                                </button>
                            ))}
                        </div>
                        <div className="fin-sp" />
                        <button className="fin-chip" disabled title="Not built yet"><SlidersHorizontal size={14} />More filters</button>
                    </div>

                    {selected.size > 0 && (
                        <div className="fin-selbar show">
                            <b>{selected.size} transaction{selected.size === 1 ? '' : 's'} selected</b>
                            <div className="fin-sp" />
                            <button onClick={() => setSelected(new Set())}>Clear</button>
                        </div>
                    )}

                    <div className="fin-tw">
                        <table className="fin-table">
                            <thead>
                            <tr>
                                <th style={{ width: 34 }}><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" /></th>
                                <th>Order</th><th>Date</th><th>Customer</th><th>Method</th>
                                <th className="r">Gross</th><th className="r">Fee</th><th className="r">Net to you</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading && (
                                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 24, color: 'var(--fin-tx3)' }}>Loading…</td></tr>
                            )}
                            {!loading && filtered.length === 0 && (
                                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 24, color: 'var(--fin-tx3)' }}>No transactions match these filters.</td></tr>
                            )}
                            {!loading && filtered.map((t) => {
                                const g = GW_DISPLAY[t.gateway] || GW_DISPLAY.cod;
                                const st = ST[t.status] || ['mute', t.status];
                                return (
                                    <tr key={t.orderId}>
                                        <td><input type="checkbox" checked={selected.has(t.orderId)} onChange={() => toggleRow(t.orderId)} aria-label={`Select order ${t.orderId}`} /></td>
                                        <td className="fin-oid">{t.invoice || `#${t.orderId}`}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(t.date)}</td>
                                        <td className="fin-cust">{t.customer || 'Guest'}<small>{t.phone}</small></td>
                                        <td><span className="fin-gw"><span className="fin-gwi" style={{ background: g.bg, color: g.fg }}>{g.s}</span>{g.n}</span></td>
                                        <td className="r fin-money">{money(t.gross)}</td>
                                        <td className="r" style={{ color: 'var(--fin-tx2)' }}>
                                            {t.fee ? <>−{money2(t.fee)}<br /><span style={{ fontSize: 11, color: 'var(--fin-tx3)' }}>{t.feeRate.toFixed(2)}%</span></> : '—'}
                                        </td>
                                        <td className={`r fin-money ${t.status === 'failed' ? 'neg' : ''}`}>{t.status === 'failed' ? '—' : money(t.net)}</td>
                                        <td><span className={`fin-pill ${st[0]}`}>{st[1]}</span></td>
                                    </tr>
                                );
                            })}
                            </tbody>
                            {!loading && filtered.length > 0 && (
                                <tfoot>
                                <tr>
                                    <td colSpan={5}>Showing {filtered.length} of {data?.totalElements ?? 0} · this page only, totals exclude failed</td>
                                    <td className="r">{money(gross)}</td>
                                    <td className="r">{signedMoney(-feeTotal)}</td>
                                    <td className="r">{money(gross - feeTotal)}</td>
                                    <td></td>
                                </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    <div className="fin-tfoot">
                        <span>{PAGE_SIZE} per page</span>
                        <div className="fin-sp" />
                        <span>Page {page + 1} of {Math.max(totalPages, 1)}</span>
                        <div className="fin-pg">
                            <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} aria-label="Previous page"><ChevronLeft size={14} style={{ margin: 'auto' }} /></button>
                            <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} aria-label="Next page"><ChevronRight size={14} style={{ margin: 'auto' }} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FinanceTransactions;
