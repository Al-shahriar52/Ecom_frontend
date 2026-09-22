import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Check } from './financeIcons';
import { money, signedMoney } from './financeUtils';
import { GW, SET, gwLabel } from './financeData';

const CHIP_OPTIONS = ['All gateways', 'bKash', 'Nagad', 'SSLCommerz', 'Bank transfer'];

const FinanceSettlements = () => {
    const navigate = useNavigate();
    const [activeChip, setActiveChip] = useState('All gateways');

    const filtered = useMemo(() => {
        if (activeChip === 'All gateways') return SET;
        const map = { bKash: 'bkash', Nagad: 'nagad', SSLCommerz: 'card', 'Bank transfer': 'bank' };
        return SET.filter((s) => s.g === map[activeChip]);
    }, [activeChip]);

    return (
        <>
            <div className="fin-pbar">
                <div><div className="fin-h1">Settlements</div><div className="fin-sub">Money each gateway has actually sent to your bank</div></div>
                <div className="fin-sp" />
                <button className="fin-btn"><RefreshCw size={14} />Sync gateways</button>
                <button className="fin-btn pri"><Check size={14} />Match 3 unresolved</button>
            </div>
            <div className="fin-wrap">
                <div className="fin-note w fin-mb">
                    <RefreshCw size={18} style={{ flex: 'none', marginTop: 1 }} />
                    <div className="fin-sp"><b>৳1,315 short across 3 batches.</b> bKash charged 1.90% on these, not the 1.85% saved in your settings. Update the rate and the gap closes.</div>
                    <button onClick={() => navigate('/admin/accounting/gateways')}>Open gateway settings</button>
                </div>
                <div className="fin-g3 fin-mb">
                    <div className="fin-tile"><div className="fin-k">Received this month</div><div className="fin-v">৳20,42,600</div><div className="fin-r"><span>11 batches</span></div></div>
                    <div className="fin-tile"><div className="fin-k">Still to arrive</div><div className="fin-v">৳3,47,000</div><div className="fin-r"><span className="fin-pill pend">2 batches</span></div></div>
                    <div className="fin-tile"><div className="fin-k">Unmatched difference</div><div className="fin-v" style={{ color: 'var(--fin-neg)' }}>−৳1,315</div><div className="fin-r"><span>needs your attention</span></div></div>
                </div>
                <div className="fin-card">
                    <div className="fin-tbar">
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {CHIP_OPTIONS.map((c) => (
                                <button key={c} className={`fin-chip ${activeChip === c ? 'on' : ''}`} onClick={() => setActiveChip(c)}>{c}</button>
                            ))}
                        </div>
                        <div className="fin-sp" />
                        <span style={{ fontSize: 12.5, color: 'var(--fin-tx2)' }}>Auto-sync every 6 hours · last 04:12</span>
                    </div>
                    <div className="fin-tw">
                        <table className="fin-table">
                            <thead><tr><th>Batch</th><th>Gateway</th><th>Period covered</th><th className="r">Transactions</th><th className="r">Expected</th><th className="r">Received</th><th className="r">Difference</th><th>Arrives</th><th>Reconciliation</th></tr></thead>
                            <tbody>
                            {filtered.map((s) => {
                                const g = GW[s.g];
                                const df = s.r === null ? null : s.r - s.e;
                                return (
                                    <tr key={s.b}>
                                        <td className="fin-oid">{s.b}</td>
                                        <td><span className="fin-gw"><span className="fin-gwi" style={{ background: g.bg, color: g.fg }}>{g.s}</span>{gwLabel(s.g)}</span></td>
                                        <td style={{ whiteSpace: 'nowrap', color: 'var(--fin-tx2)' }}>{s.p}</td>
                                        <td className="r">{s.n}</td>
                                        <td className="r fin-money">{money(s.e)}</td>
                                        <td className="r fin-money">{s.r === null ? <span style={{ color: 'var(--fin-tx3)' }}>—</span> : money(s.r)}</td>
                                        <td className={`r fin-money ${df && df < 0 ? 'neg' : ''}`}>{df === null ? '—' : df === 0 ? '৳0' : signedMoney(df)}</td>
                                        <td style={{ whiteSpace: 'nowrap', color: 'var(--fin-tx2)' }}>{s.a}</td>
                                        <td>
                                            {s.ok === 1 ? <span className="fin-pill ok">Matched</span>
                                                : s.ok === 0 ? <span className="fin-pill fail">Short by {money(Math.abs(df))}</span>
                                                    : <span className="fin-pill pend">Not yet due</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                    <div className="fin-tfoot">
                        <span>Showing the {filtered.length} most recent batches of 13 this month</span>
                        <div className="fin-sp" />
                        <span>Amounts are net of gateway fees, as the gateway sends them</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FinanceSettlements;
