import React, { useEffect, useState } from 'react';
import { Download, Info, AlertTriangle } from './financeIcons';
import { signedMoney } from './financeUtils';
import { fetchProfitLoss } from './financeApi';

const BREAKDOWN_COLORS = ['#B0654F', '#5C4B8A', '#9E3320', '#1B5788', '#C58A7A', '#D8B4A6', 'var(--fin-brand-dark)', '#8A6D3B', '#8A5D06', '#2F7D8A', '#8A9A93'];

const FinanceProfitLoss = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        fetchProfitLoss()
            .then((d) => { if (!cancelled) setData(d); })
            .catch((err) => { console.error('Error fetching P&L:', err); if (!cancelled) setError('Could not load this view.'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return <div className="fin-wrap"><div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--fin-tx3)' }}>Loading…</div></div>;
    }
    if (error || !data) {
        return <div className="fin-wrap"><div className="fin-note w"><AlertTriangle size={18} style={{ flex: 'none', marginTop: 1 }} /><div>{error || 'No data available.'}</div></div></div>;
    }

    return (
        <>
            <div className="fin-pbar">
                <div><div className="fin-h1">Profit &amp; loss</div><div className="fin-sub">This period vs the same length period before · accrual basis · BDT</div></div>
                <div className="fin-sp" />
                <button className="fin-btn" disabled title="Not built yet"><Download size={14} />Export</button>
            </div>
            <div className="fin-wrap">
                <div className="fin-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div className="fin-card" style={{ flex: 1, minWidth: 420 }}>
                        <div className="fin-ch"><div><h3>Statement</h3></div></div>
                        <div className="fin-tw">
                            <table className="fin-table">
                                <thead><tr><th></th><th className="r">This period</th><th className="r">Previous</th><th className="r">Change</th><th className="r">% of sales</th></tr></thead>
                                <tbody>
                                {data.lines.map((r) => {
                                    const gr = Math.abs(r.current) - Math.abs(r.previous);
                                    const pc = r.previous ? Math.abs((gr / r.previous) * 100) : 0;
                                    const good = r.current >= 0 ? gr >= 0 : gr <= 0;
                                    const rowStyle = r.highlight === 2
                                        ? { background: 'var(--fin-brand-dark)', color: '#fff' }
                                        : r.highlight === 1 ? { background: 'var(--fin-card-2)' } : undefined;
                                    return (
                                        <tr key={r.label} style={rowStyle}>
                                            <td style={{ fontWeight: r.bold ? 600 : 400, paddingLeft: r.bold ? undefined : 24, color: r.bold ? undefined : (r.highlight === 2 ? undefined : 'var(--fin-tx2)') }}>{r.label}</td>
                                            <td className="r" style={{ fontWeight: r.bold ? 600 : 500 }}>{signedMoney(r.current)}</td>
                                            <td className="r" style={{ color: r.highlight === 2 ? '#E3C9D8' : 'var(--fin-tx2)' }}>{signedMoney(r.previous)}</td>
                                            <td className="r" style={{ color: r.highlight === 2 ? '#fff' : (good ? 'var(--fin-pos)' : 'var(--fin-neg)'), fontWeight: 500 }}>
                                                {r.previous ? `${gr >= 0 ? '+' : '−'}${pc.toFixed(pc < 10 ? 1 : 0)}%` : '—'}
                                            </td>
                                            <td className="r" style={{ color: r.highlight === 2 ? '#E3C9D8' : 'var(--fin-tx3)' }}>{r.pctOfSales.toFixed(1)}%</td>
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
                                    {data.breakdownOf100.map((r, i) => (
                                        <div key={r.label}>
                                            <div className="fin-bl-top"><b>{r.label}</b><div className="fin-sp" /><b>৳{r.amountPer100.toFixed(1)}</b></div>
                                            <div className="fin-track"><span style={{ width: `${Math.min(100, (r.amountPer100 / 70) * 100).toFixed(1)}%`, background: BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length] }} /></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="fin-note i">
                            <Info size={18} style={{ flex: 'none', marginTop: 1 }} />
                            <div>Figures are computed live from your orders and recorded expenses for this period, compared with the same length period immediately before.</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FinanceProfitLoss;