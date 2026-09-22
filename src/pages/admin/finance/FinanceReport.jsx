import React, { useState } from 'react';
import { Calendar, ChevronDown, Download, Info } from './financeIcons';
import { money, signedMoney } from './financeUtils';
import { EarningsChart } from './financeCharts';
import { REP } from './financeData';

const FinanceReport = () => {
    const [grain, setGrain] = useState('week');
    const maxNet = Math.max(...REP.map((r) => r.net));

    return (
        <>
            <div className="fin-pbar">
                <div><div className="fin-h1">Earnings report</div><div className="fin-sub">What you actually earned, period by period</div></div>
                <div className="fin-sp" />
                <div className="fin-seg">
                    <button className={grain === 'week' ? 'on' : ''} onClick={() => setGrain('week')}>Weekly</button>
                    <button className={grain === 'month' ? 'on' : ''} onClick={() => setGrain('month')}>Monthly</button>
                </div>
                <button className="fin-date"><Calendar size={14} /><b>Last 12 weeks</b><ChevronDown size={14} /></button>
                <button className="fin-btn"><Download size={14} />Download PDF</button>
            </div>

            <div className="fin-wrap">
                <div className="fin-g3 fin-mb">
                    <div className="fin-tile">
                        <div className="fin-k">Best week</div>
                        <div className="fin-v">৳96,400</div>
                        <div className="fin-r"><span>week of 11 Aug · Eid-ul-Azha restock</span></div>
                    </div>
                    <div className="fin-tile">
                        <div className="fin-k">Weakest week</div>
                        <div className="fin-v">৳12,900</div>
                        <div className="fin-r"><span>week of 30 Jun · 4 days of heavy rain</span></div>
                    </div>
                    <div className="fin-tile">
                        <div className="fin-k">Average weekly earning</div>
                        <div className="fin-v">৳54,800</div>
                        <div className="fin-r"><span className="fin-trend up">+11.2%</span><span>against the previous 12 weeks</span></div>
                    </div>
                </div>

                <div className="fin-card fin-mb">
                    <div className="fin-ch"><div><h3>Net earning per week</h3><p>Bars show earnings, the band below your weekly target is shaded</p></div></div>
                    <div className="fin-cb"><EarningsChart rows={REP} /></div>
                </div>

                <div className="fin-card">
                    <div className="fin-ch">
                        <div><h3>Period breakdown</h3></div>
                    </div>
                    <div style={{ padding: '0 16px 12px' }}>
                        <div className="fin-note i" style={{ padding: '9px 12px' }}>
                            <Info size={14} style={{ flex: 'none', marginTop: 2 }} />
                            <div>Weeks run Monday to Sunday, so they cross month boundaries. Weekly totals won't add up exactly to the monthly report.</div>
                        </div>
                    </div>
                    <div className="fin-tw">
                        <table className="fin-table">
                            <thead>
                            <tr>
                                <th>Period</th><th className="r">Orders</th><th className="r">Gross sales</th><th className="r">Refunds</th>
                                <th className="r">Gateway fees</th><th className="r">Cost of goods</th><th className="r">Operating cost</th>
                                <th className="r">Net earning</th><th className="r">Margin</th><th>Trend</th>
                            </tr>
                            </thead>
                            <tbody>
                            {REP.map((r, i) => {
                                const mg = (r.net / r.gs) * 100;
                                const prev = REP[i + 1];
                                const dl = prev ? ((r.net - prev.net) / prev.net) * 100 : null;
                                return (
                                    <tr key={r.p}>
                                        <td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{r.p}</td>
                                        <td className="r">{r.o.toLocaleString('en-IN')}</td>
                                        <td className="r fin-money">{money(r.gs)}</td>
                                        <td className="r" style={{ color: 'var(--fin-tx2)' }}>{signedMoney(r.rf)}</td>
                                        <td className="r" style={{ color: 'var(--fin-tx2)' }}>{signedMoney(r.fe)}</td>
                                        <td className="r" style={{ color: 'var(--fin-tx2)' }}>{signedMoney(r.cg)}</td>
                                        <td className="r" style={{ color: 'var(--fin-tx2)' }}>{signedMoney(r.op)}</td>
                                        <td className="r fin-money" style={{ color: r.net >= 50000 ? 'var(--fin-pos)' : 'var(--fin-neg)' }}>{money(r.net)}</td>
                                        <td className="r">{mg.toFixed(1)}%</td>
                                        <td style={{ width: 130 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div className="fin-track" style={{ flex: 1 }}><span style={{ width: `${((r.net / maxNet) * 100).toFixed(0)}%`, background: r.net >= 50000 ? '#0B7A55' : '#C58A7A' }} /></div>
                                                {dl !== null ? (
                                                    <span className={`fin-trend ${dl >= 0 ? 'up' : 'dn'}`} style={{ minWidth: 44, textAlign: 'right' }}>{dl >= 0 ? '+' : '−'}{Math.abs(dl).toFixed(0)}%</span>
                                                ) : <span style={{ minWidth: 44 }} />}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                            <tfoot>
                            <tr>
                                <td>12 weeks</td><td className="r">3,512</td><td className="r">৳78,51,200</td><td className="r">−৳3,05,400</td>
                                <td className="r">−৳1,50,520</td><td className="r">−৳51,03,000</td><td className="r">−৳16,34,680</td>
                                <td className="r">৳6,57,600</td><td className="r">8.4%</td><td></td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FinanceReport;
