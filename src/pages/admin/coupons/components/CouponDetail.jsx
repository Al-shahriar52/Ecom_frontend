import React from 'react';

const DETAIL_METRICS = [
    { lbl: 'Redemptions', val: '4,880', delta: <>of 5,000 limit · <b className="down">97.6% used</b></> },
    { lbl: 'Discount given', val: '৳4.8L', delta: '৳98.4 average per order' },
    { lbl: 'Revenue influenced', val: '৳3.1Cr', delta: '৳6,352 average cart' },
    { lbl: 'New customers', val: '1,204', delta: '24.7% of redemptions' },
];

const REJECTION_REASONS = [
    { reason: 'Cart below ৳5,000', attempts: 184, pct: 59, customers: 171 },
    { reason: 'Already used once', attempts: 78, pct: 25, customers: 78 },
    { reason: 'City not eligible', attempts: 34, pct: 11, customers: 31 },
    { reason: 'Blackout period active', attempts: 16, pct: 5, customers: 15 },
];

const CHART_BARS = [
    { outer: 44, inner: 60 }, { outer: 52, inner: 55 }, { outer: 38, inner: 70 }, { outer: 61, inner: 48 },
    { outer: 70, inner: 52 }, { outer: 88, inner: 66 }, { outer: 95, inner: 71 }, { outer: 57, inner: 44 },
    { outer: 49, inner: 51 }, { outer: 63, inner: 58 }, { outer: 72, inner: 62 }, { outer: 80, inner: 69 },
    { outer: 91, inner: 74 }, { outer: 66, inner: 53 }, { outer: 58, inner: 49 }, { outer: 74, inner: 61 },
    { outer: 86, inner: 70 }, { outer: 100, inner: 78 },
];

const CAL_CELLS = [
    { l: 'S', cls: 'hd' }, { l: 'M', cls: 'hd' }, { l: 'T', cls: 'hd' }, { l: 'W', cls: 'hd' }, { l: 'T', cls: 'hd' }, { l: 'F', cls: 'hd' }, { l: 'S', cls: 'hd' },
    { l: 26, cls: 'off' }, { l: 27, cls: 'off' }, { l: 28, cls: 'off' }, { l: 29, cls: 'off' }, { l: 30, cls: 'off' }, { l: 31, cls: 'off' }, { l: 1, cls: 'act' },
    { l: 2, cls: 'act' }, { l: 3, cls: 'act' }, { l: 4, cls: 'act' }, { l: 5, cls: 'act' }, { l: 6, cls: 'act' }, { l: 7, cls: 'blk' }, { l: 8, cls: 'blk' },
    { l: 9, cls: 'act' }, { l: 10, cls: 'act' }, { l: 11, cls: 'act' }, { l: 12, cls: 'act' }, { l: 13, cls: 'act' }, { l: 14, cls: 'blk' }, { l: 15, cls: 'blk' },
    { l: 16, cls: 'act' }, { l: 17, cls: 'act' }, { l: 18, cls: 'act' }, { l: 19, cls: 'act' }, { l: 20, cls: 'act' }, { l: 21, cls: 'blk' }, { l: 22, cls: 'blk' },
    { l: 23, cls: 'act' }, { l: 24, cls: 'act' }, { l: 25, cls: 'act' }, { l: 26, cls: 'blk' }, { l: 27, cls: 'blk' }, { l: 28, cls: 'act' }, { l: 29, cls: 'act' },
    { l: 30, cls: 'act' }, { l: 31, cls: 'act' }, { l: 1, cls: 'off' }, { l: 2, cls: 'off' }, { l: 3, cls: 'off' }, { l: 4, cls: 'off' }, { l: 5, cls: 'off' },
];

const ACTIVITY_LOG = [
    { dot: 'b', text: 'Redemption limit raised to 5,000', meta: 'A. Karim · 14 Aug 11:20' },
    { dot: '', text: 'Blackout added — Independence Day sale', meta: 'S. Rahman · 9 Aug 16:04' },
    { dot: '', text: 'Published', meta: 'S. Rahman · 1 Aug 00:00' },
    { dot: '', text: 'Created as draft', meta: 'S. Rahman · 28 Jul 15:41' },
];

export default function DetailView({ chartRange, setChartRange, onEdit }) {
    return (
        <div className="wrap">
            <div className="detail-head">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <h1 className="h1 mono" style={{ letterSpacing: '.03em' }}>SAVE10</h1>
                        <span className="pill p-live">Running</span>
                        <span className="tag">Ends in 13 days</span>
                    </div>
                    <p className="sub">Cart value booster — August · created by Sabrina Rahman on 28 Jul</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button type="button" className="btn">Duplicate</button>
                    <button type="button" className="btn">Pause</button>
                    <button type="button" className="btn btn-primary" onClick={onEdit}>Edit coupon</button>
                </div>
            </div>

            <div className="metrics">
                {DETAIL_METRICS.map((m) => (
                    <div className="metric" key={m.lbl}>
                        <div className="lbl">{m.lbl}</div>
                        <div className="val">{m.val}</div>
                        <div className="delta">{m.delta}</div>
                    </div>
                ))}
            </div>

            <div className="detail-grid">
                <div>
                    <div className="card chart">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: 14.5, fontWeight: 600 }}>Daily redemptions</div>
                                <div className="sub" style={{ fontSize: 12.5 }}>1 – 18 August</div>
                            </div>
                            <div className="seg">
                                <button type="button" className={chartRange === 'daily' ? 'on' : ''} onClick={() => setChartRange('daily')}>Daily</button>
                                <button type="button" className={chartRange === 'weekly' ? 'on' : ''} onClick={() => setChartRange('weekly')}>Weekly</button>
                            </div>
                        </div>
                        <div className="chart-bars">
                            {CHART_BARS.map((b, i) => (
                                <div key={i} style={{ height: `${b.outer}%` }}><i style={{ height: `${b.inner}%` }} /></div>
                            ))}
                        </div>
                        <div className="axis"><span>1 Aug</span><span>6 Aug</span><span>11 Aug</span><span>18 Aug</span></div>
                        <div className="legend"><span><i style={{ background: 'var(--primary)' }} />Redeemed</span><span><i style={{ background: 'var(--primary-wash)' }} />Applied but not checked out</span></div>
                    </div>

                    <div className="card panel" style={{ marginTop: 16 }}>
                        <h2 className="panel-h">Why the code was rejected</h2>
                        <p className="panel-s">312 blocked attempts in the last 7 days. Large numbers here usually mean the rule needs loosening or the messaging is unclear.</p>
                        <table>
                            <thead><tr><th>Reason</th><th>Attempts</th><th>Share</th><th>Distinct customers</th></tr></thead>
                            <tbody>
                            {REJECTION_REASONS.map((r) => (
                                <tr key={r.reason}>
                                    <td>{r.reason}</td>
                                    <td className="num">{r.attempts}</td>
                                    <td><div className="bar" style={{ margin: 0 }}><i style={{ width: `${r.pct}%` }} /></div></td>
                                    <td className="num">{r.customers}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rail">
                    <div className="card cal">
                        <div className="rail-h">August schedule</div>
                        <div className="cal-grid">
                            {CAL_CELLS.map((c, i) => (
                                <span key={i} className={c.cls}>{c.l}</span>
                            ))}
                        </div>
                        <div className="legend" style={{ fontSize: 11.5 }}>
                            <span><i style={{ background: 'var(--green-wash)', border: '1px solid #bfe0d2' }} />Active</span>
                            <span><i style={{ background: 'var(--red-wash)', border: '1px solid #f0d0ce' }} />Blackout</span>
                        </div>
                    </div>

                    <div className="card receipt">
                        <div className="rail-h">Rule</div>
                        <div className="receipt-line"><span className="k">Gives</span><span className="v">10% off, capped at ৳100</span></div>
                        <div className="receipt-line"><span className="k">Requires</span><span className="v">Cart ৳5,000+, card or mobile wallet</span></div>
                        <div className="receipt-line"><span className="k">Products</span><span className="v">All products</span></div>
                        <div className="receipt-line"><span className="k">Cities</span><span className="v">All cities</span></div>
                        <div className="receipt-line"><span className="k">Limits</span><span className="v">1 per customer · 5,000 total</span></div>
                    </div>

                    <div className="card receipt">
                        <div className="rail-h">Activity</div>
                        {ACTIVITY_LOG.map((l, i) => (
                            <div className="log" key={i}>
                                <span className={`lt ${l.dot}`} />
                                <span><span className="ll">{l.text}</span><span className="lm">{l.meta}</span></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}