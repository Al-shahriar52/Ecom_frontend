import React from 'react';
import { Download, Info } from './financeIcons';
import { signedMoney } from './financeUtils';
import { PL, PLMIX } from './financeData';

const FinanceProfitLoss = () => (
    <>
        <div className="fin-pbar">
            <div><div className="fin-h1">Profit &amp; loss</div><div className="fin-sub">August 2026 · accrual basis · BDT</div></div>
            <div className="fin-sp" />
            <div className="fin-seg"><button className="on">This month</button><button>Quarter</button><button>Year to date</button></div>
            <button className="fin-btn">Compare periods</button>
            <button className="fin-btn"><Download size={14} />Export</button>
        </div>
        <div className="fin-wrap">
            <div className="fin-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div className="fin-card" style={{ flex: 1, minWidth: 420 }}>
                    <div className="fin-ch"><div><h3>Statement</h3></div><div className="fin-sp" /><span style={{ fontSize: 12, color: 'var(--fin-tx3)' }}>Aug 2026 · vs Jul 2026</span></div>
                    <div className="fin-tw">
                        <table className="fin-table">
                            <thead><tr><th></th><th className="r">August</th><th className="r">July</th><th className="r">Change</th><th className="r">% of sales</th></tr></thead>
                            <tbody>
                            {PL.map((r) => {
                                const gr = Math.abs(r.a) - Math.abs(r.j);
                                const pc = r.j ? Math.abs((gr / r.j) * 100) : 0;
                                const good = r.a >= 0 ? gr >= 0 : gr <= 0;
                                const rowStyle = r.hi === 2
                                    ? { background: 'var(--fin-brand-dark)', color: '#fff' }
                                    : r.hi ? { background: 'var(--fin-card-2)' } : undefined;
                                return (
                                    <tr key={r.l} style={rowStyle}>
                                        <td style={{ fontWeight: r.b ? 600 : 400, paddingLeft: r.b ? undefined : 24, color: r.b ? undefined : (r.hi === 2 ? undefined : 'var(--fin-tx2)') }}>{r.l}</td>
                                        <td className="r" style={{ fontWeight: r.b ? 600 : 500 }}>{signedMoney(r.a)}</td>
                                        <td className="r" style={{ color: r.hi === 2 ? '#E3C9D8' : 'var(--fin-tx2)' }}>{signedMoney(r.j)}</td>
                                        <td className="r" style={{ color: r.hi === 2 ? '#fff' : (good ? 'var(--fin-pos)' : 'var(--fin-neg)'), fontWeight: 500 }}>
                                            {gr >= 0 ? '+' : '−'}{pc.toFixed(pc < 10 ? 1 : 0)}%
                                        </td>
                                        <td className="r" style={{ color: r.hi === 2 ? '#E3C9D8' : 'var(--fin-tx3)' }}>{r.s.toFixed(1)}%</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div style={{ width: 300, flex: 'none' }}>
                    <div className="fin-card fin-mb">
                        <div className="fin-ch"><div><h3>Where every ৳100 goes</h3></div></div>
                        <div className="fin-cb">
                            <div className="fin-bar-list">
                                {PLMIX.map((r) => (
                                    <div key={r.n}>
                                        <div className="fin-bl-top"><b>{r.n}</b><div className="fin-sp" /><b>৳{r.v.toFixed(1)}</b></div>
                                        <div className="fin-track"><span style={{ width: `${((r.v / 70) * 100).toFixed(1)}%`, background: r.c }} /></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="fin-note i">
                        <Info size={18} style={{ flex: 'none', marginTop: 1 }} />
                        <div>Gross margin held at 31%, but advertising rose 18% while sales rose 22% — so the extra volume is roughly paying for itself. Ad spend is ৳128 per order.</div>
                    </div>
                </div>
            </div>
        </div>
    </>
);

export default FinanceProfitLoss;
