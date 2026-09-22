import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, ChevronDown, Plus, Info, AlertTriangle, ArrowUp, ChevronRight,
} from './financeIcons';
import { money, signedMoney } from './financeUtils';
import { Sparkline, RevenueCostChart, BarList } from './financeCharts';
import { WF, SERIES, GWMIX, COSTMIX, TX, ST, STS, GW, feeFor, SPARKS } from './financeData';

const RANGE_OPTIONS = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This week' },
    { key: 'month', label: 'This month' },
    { key: 'quarter', label: 'Quarter' },
];

const FinanceOverview = () => {
    const navigate = useNavigate();
    const [range, setRange] = useState('month');
    const [grain, setGrain] = useState('week');

    const wfMax = Math.max(...WF.map((w) => Math.abs(w.v)));
    const recentTx = TX.slice(0, 6);

    return (
        <>
            <div className="fin-pbar">
                <div>
                    <div className="fin-h1">Dashboard</div>
                    <div className="fin-sub">1–31 August 2026 · compared with July 2026</div>
                </div>
                <div className="fin-sp" />
                <div className="fin-seg">
                    {RANGE_OPTIONS.map((r) => (
                        <button key={r.key} className={range === r.key ? 'on' : ''} onClick={() => setRange(r.key)}>
                            {r.label}
                        </button>
                    ))}
                </div>
                <button className="fin-date"><Calendar size={14} /><b>1 Aug – 31 Aug</b><ChevronDown size={14} /></button>
                <button className="fin-btn pri" onClick={() => navigate('expenses/new')}><Plus size={14} />Record a cost</button>
            </div>

            <div className="fin-wrap">

                <div className="fin-note w fin-mb">
                    <AlertTriangle size={18} style={{ flex: 'none', marginTop: 1 }} />
                    <div className="fin-sp">
                        <b>3 bKash settlements don't match your ledger.</b> ৳48,220 was received on 28 Aug but only
                        ৳46,905 of transactions are matched to it. Fee rates may have changed.
                    </div>
                    <button onClick={() => navigate('settlements')}>Reconcile now</button>
                </div>

                {/* waterfall hero */}
                <div className="fin-hero">
                    <div className="fin-hero-top">
                        <div className="fin-hero-net">
                            <div className="fin-lab">Net profit <Info size={14} style={{ color: 'var(--fin-tx3)' }} /></div>
                            <div className="fin-big">৳3,03,960</div>
                            <div className="fin-delta up"><ArrowUp size={14} />55.6% vs July</div>
                            <div className="fin-foot">After all gateway fees, refunds, COGS and operating cost</div>
                        </div>
                        <div className="fin-hero-side">
                            <div className="fin-hs"><div className="fin-k">Orders paid</div><div className="fin-v">1,284</div><div className="fin-m">+142 vs July</div></div>
                            <div className="fin-hs"><div className="fin-k">Average order</div><div className="fin-v">৳2,146</div><div className="fin-m">−৳58 vs July</div></div>
                            <div className="fin-hs"><div className="fin-k">Net margin</div><div className="fin-v">11.0%</div><div className="fin-m">8.7% in July</div></div>
                            <div className="fin-hs"><div className="fin-k">Cash in bank</div><div className="fin-v">৳11,82,400</div><div className="fin-m">3 accounts</div></div>
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
                        <div className="fin-v">৳92,340</div>
                        <div className="fin-r"><span className="fin-trend up">+14%</span><span>vs same day last week</span></div>
                        <Sparkline data={SPARKS.collected.data} color="#0B7A55" />
                    </div>
                    <div className="fin-tile">
                        <div className="fin-k">Awaiting settlement</div>
                        <div className="fin-v">৳3,47,000</div>
                        <div className="fin-r"><span className="fin-pill pend">2 batches</span><span>next payout 2 Sep</span></div>
                        <Sparkline data={SPARKS.awaiting.data} color="#8A5D06" />
                    </div>
                    <div className="fin-tile">
                        <div className="fin-k">Cash on delivery pending</div>
                        <div className="fin-v">৳1,46,700</div>
                        <div className="fin-r"><span className="fin-trend dn">62 parcels</span><span>with Steadfast &amp; Pathao</span></div>
                        <Sparkline data={SPARKS.codPending.data} color="#1B5788" />
                    </div>
                    <div className="fin-tile">
                        <div className="fin-k">Operating cost this month</div>
                        <div className="fin-v">৳4,96,200</div>
                        <div className="fin-r"><span className="fin-trend dn">+8.2%</span><span>ads are the biggest driver</span></div>
                        <Sparkline data={SPARKS.opCost.data} color="#9E3320" />
                    </div>
                </div>

                {/* chart + gateway mix */}
                <div className="fin-split fin-mb">
                    <div className="fin-card">
                        <div className="fin-ch">
                            <div><h3>Revenue against cost</h3><p>Gross revenue against total cost, with what you kept shown underneath</p></div>
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
                            <RevenueCostChart series={SERIES[grain]} />
                        </div>
                    </div>

                    <div className="fin-card">
                        <div className="fin-ch"><div><h3>Where the money came in</h3><p>Share of collected revenue</p></div></div>
                        <div className="fin-cb">
                            <BarList rows={GWMIX} total={GWMIX.reduce((a, b) => a + b.v, 0)} />
                        </div>
                        <div className="fin-cb" style={{ borderTop: '1px solid var(--fin-line)', paddingTop: 14 }}>
                            <div className="fin-kv"><span className="fin-k">Total collected</span><span className="fin-v">৳26,43,100</span></div>
                            <div className="fin-kv"><span className="fin-k">Gateway fees paid</span><span className="fin-v" style={{ color: 'var(--fin-neg)' }}>−৳52,840</span></div>
                            <div className="fin-kv"><span className="fin-k">Blended fee rate</span><span className="fin-v">2.00%</span></div>
                        </div>
                    </div>
                </div>

                {/* recent + cost split */}
                <div className="fin-split">
                    <div className="fin-card">
                        <div className="fin-ch">
                            <div><h3>Latest transactions</h3></div>
                            <div className="fin-sp" />
                            <button className="fin-btn sm" onClick={() => navigate('transactions')}>View all 1,284<ChevronRight size={14} /></button>
                        </div>
                        <div className="fin-tw">
                            <table className="fin-table">
                                <thead>
                                <tr><th>Order</th><th>Customer</th><th>Method</th><th className="r">Gross</th><th className="r">Net to you</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                {recentTx.map((t) => {
                                    const f = feeFor(t);
                                    const g = GW[t.g];
                                    return (
                                        <tr key={t.id}>
                                            <td className="fin-oid">{t.id}<small>{t.d.split(',')[0]}</small></td>
                                            <td className="fin-cust">{t.c}<small>{t.p}</small></td>
                                            <td><span className="fin-gw"><span className="fin-gwi" style={{ background: g.bg, color: g.fg }}>{g.s}</span>{g.n.split(' · ')[0]}</span></td>
                                            <td className="r fin-money">{money(t.gr)}</td>
                                            <td className="r fin-money">{t.st === 'failed' ? '—' : money(t.gr - f)}</td>
                                            <td><span className={`fin-pill ${ST[t.st][0]}`}>{STS[t.st]}</span></td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="fin-card">
                        <div className="fin-ch"><div><h3>Cost breakdown</h3><p>August, all categories</p></div></div>
                        <div className="fin-cb"><BarList rows={COSTMIX} total={COSTMIX.reduce((a, b) => a + b.v, 0)} /></div>
                        <div className="fin-cb" style={{ borderTop: '1px solid var(--fin-line)' }}>
                            <div style={{ fontSize: 12, color: 'var(--fin-tx2)', marginBottom: 10 }}>Recurring costs due soon</div>
                            <div className="fin-feed">
                                <div className="fin-fi">
                                    <div className="fin-fi-ic" style={{ background: 'var(--fin-info-bg)', color: 'var(--fin-info)' }}><Calendar size={14} /></div>
                                    <div className="fin-fi-b"><p><b>Warehouse rent</b> — Mirpur DOHS</p><span>Due 1 Sep · every month</span></div>
                                    <div className="fin-fi-m">৳45,000</div>
                                </div>
                                <div className="fin-fi">
                                    <div className="fin-fi-ic" style={{ background: 'var(--fin-info-bg)', color: 'var(--fin-info)' }}><Calendar size={14} /></div>
                                    <div className="fin-fi-b"><p><b>Staff salaries</b> — 6 people</p><span>Due 5 Sep · every month</span></div>
                                    <div className="fin-fi-m">৳1,42,000</div>
                                </div>
                                <div className="fin-fi">
                                    <div className="fin-fi-ic" style={{ background: 'var(--fin-warn-bg)', color: 'var(--fin-warn)' }}><AlertTriangle size={14} /></div>
                                    <div className="fin-fi-b"><p><b>Shopify + apps</b></p><span>Due 7 Sep · card ending 4412</span></div>
                                    <div className="fin-fi-m">৳9,850</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default FinanceOverview;
