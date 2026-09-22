import React from 'react';
import { money, signedMoney } from './financeUtils';
import { BarList } from './financeCharts';
import { COD, CODS, CODMIX } from './financeData';

const FinanceCOD = () => (
    <>
        <div className="fin-pbar">
            <div><div className="fin-h1">Cash on delivery</div><div className="fin-sub">Cash your couriers are holding, and what they have remitted</div></div>
            <div className="fin-sp" />
            <button className="fin-btn">Courier statement</button>
            <button className="fin-btn pri">Record a remittance</button>
        </div>
        <div className="fin-wrap">
            <div className="fin-g4 fin-mb">
                <div className="fin-tile"><div className="fin-k">Out for delivery</div><div className="fin-v">৳1,46,700</div><div className="fin-r"><span>62 parcels</span></div></div>
                <div className="fin-tile"><div className="fin-k">Delivered, not remitted</div><div className="fin-v">৳84,300</div><div className="fin-r"><span className="fin-pill pend">31 parcels</span></div></div>
                <div className="fin-tile"><div className="fin-k">Returned to you</div><div className="fin-v" style={{ color: 'var(--fin-neg)' }}>৳38,900</div><div className="fin-r"><span>17 parcels · 12.4% return rate</span></div></div>
                <div className="fin-tile"><div className="fin-k">Courier charges owed</div><div className="fin-v">৳14,820</div><div className="fin-r"><span>deducted at remittance</span></div></div>
            </div>
            <div className="fin-split">
                <div className="fin-card">
                    <div className="fin-ch"><div><h3>Parcels by courier</h3></div><div className="fin-sp" /><button className="fin-btn sm">All 110</button></div>
                    <div className="fin-tw">
                        <table className="fin-table">
                            <thead><tr><th>Consignment</th><th>Courier</th><th>Customer</th><th className="r">Collectable</th><th className="r">Charge</th><th>Status</th></tr></thead>
                            <tbody>
                            {COD.map((c) => (
                                <tr key={c.c}>
                                    <td className="fin-oid">{c.c}</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>{c.k}</td>
                                    <td className="fin-cust">{c.n}</td>
                                    <td className={`r fin-money ${c.s === 'returned' ? 'neg' : ''}`}>{money(c.v)}</td>
                                    <td className="r" style={{ color: 'var(--fin-tx2)' }}>{signedMoney(-c.f)}</td>
                                    <td><span className={`fin-pill ${CODS[c.s][0]}`}>{CODS[c.s][1]}</span></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="fin-card">
                    <div className="fin-ch"><div><h3>Courier performance</h3><p>Last 90 days</p></div></div>
                    <div className="fin-cb"><BarList rows={CODMIX} total={CODMIX.reduce((a, b) => a + b.v, 0)} /></div>
                    <div className="fin-cb" style={{ borderTop: '1px solid var(--fin-line)' }}>
                        <div className="fin-kv"><span className="fin-k">Average days to remit</span><span className="fin-v">4.2 days</span></div>
                        <div className="fin-kv"><span className="fin-k">Blended courier charge</span><span className="fin-v">৳67 / parcel</span></div>
                        <div className="fin-kv"><span className="fin-k">Cash tied up right now</span><span className="fin-v">৳2,31,000</span></div>
                    </div>
                </div>
            </div>
        </div>
    </>
);

export default FinanceCOD;
