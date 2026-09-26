import React, { useEffect, useState } from 'react';
import { Download, Info, AlertTriangle } from './financeIcons';
import { money, signedMoney } from './financeUtils';
import { EarningsChart } from './financeCharts';
import { fetchReport } from './financeApi';

const FinanceReport = () => {
    const [grain, setGrain] = useState('week');
    const [rows, setRows] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchReport(grain, 12)
            .then((data) => { if (!cancelled) setRows(data); })
            .catch((err) => { console.error('Error fetching report:', err); if (!cancelled) setError('Could not load this view.'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [grain]);

    if (loading && !rows) {
        return <div className="fin-wrap"><div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--fin-tx3)' }}>Loading…</div></div>;
    }
    if (error || !rows) {
        return <div className="fin-wrap"><div className="fin-note w"><AlertTriangle size={18} style={{ flex: 'none', marginTop: 1 }} /><div>{error || 'No data available.'}</div></div></div>;
    }

    const chartRows = rows.map((r) => ({ p: r.period, net: r.netEarning }));
    const best = rows.reduce((a, b) => (b.netEarning > a.netEarning ? b : a), rows[0]);
    const worst = rows.reduce((a, b) => (b.netEarning < a.netEarning ? b : a), rows[0]);
    const avg = rows.reduce((sum, r) => sum + r.netEarning, 0) / rows.length;
    const totalOrders = rows.reduce((sum, r) => sum + r.orders, 0);
    const totalGross = rows.reduce((sum, r) => sum + r.grossSales, 0);
    const totalRefunds = rows.reduce((sum, r) => sum + r.refunds, 0);
    const totalFees = rows.reduce((sum, r) => sum + r.gatewayFees, 0);
    const totalCogs = rows.reduce((sum, r) => sum + r.cogs, 0);
    const totalOp = rows.reduce((sum, r) => sum + r.operatingCost, 0);
    const totalNet = rows.reduce((sum, r) => sum + r.netEarning, 0);
    const maxNet = Math.max(...rows.map((r) => r.netEarning), 1);

    return (
        <>
            <div className="fin-pbar">
                <div><div className="fin-h1">Earnings report</div><div className="fin-sub">What you actually earned, period by period, live from your orders</div></div>
                <div className="fin-sp" />
                <div className="fin-seg">
                    <button className={grain === 'week' ? 'on' : ''} onClick={() => setGrain('week')}>Weekly</button>
                    <button className={grain === 'month' ? 'on' : ''} onClick={() => setGrain('month')}>Monthly</button>
                </div>
                <button className="fin-btn" disabled title="Not built yet"><Download size={14} />Download PDF</button>
            </div>

            <div className="fin-wrap">
                <div className="fin-g3 fin-mb">
                    <div className="fin-tile">
                        <div className="fin-k">Best {grain}</div>
                        <div className="fin-v">{money(best.netEarning)}</div>
                        <div className="fin-r"><span>{best.period}</span></div>
                    </div>
                    <div className="fin-tile">
                        <div className="fin-k">Weakest {grain}</div>
                        <div className="fin-v">{money(worst.netEarning)}</div>
                        <div className="fin-r"><span>{worst.period}</span></div>
                    </div>
                    <div className="fin-tile">
                        <div className="fin-k">Average {grain === 'week' ? 'weekly' : 'monthly'} earning</div>
                        <div className="fin-v">{money(avg)}</div>
                        <div className="fin-r"><span>over the last {rows.length} {grain === 'week' ? 'weeks' : 'months'}</span></div>
                    </div>
                </div>

                <div className="fin-card fin-mb">
                    <div className="fin-ch"><div><h3>Net earning per {grain}</h3></div></div>
                    <div className="fin-cb"><EarningsChart rows={chartRows} breakEven={Math.max(1, avg * 0.4)} /></div>
                </div>

                <div className="fin-card">
                    <div className="fin-ch"><div><h3>Period breakdown</h3></div></div>
                    <div style={{ padding: '0 16px 12px' }}>
                        <div className="fin-note i" style={{ padding: '9px 12px' }}>
                            <Info size={14} style={{ flex: 'none', marginTop: 2 }} />
                            <div>Weeks run Monday to Sunday, so they can cross month boundaries.</div>
                        </div>
                    </div>
                    <div className="fin-tw">
                        <table className="fin-table">
                            <thead>
                            <tr>
                                <th>Period</th><th className="r">Orders</th><th className="r">Gross sales</th><th className="r">Refunds</th>
                                <th className="r">Gateway fees</th><th className="r">Cost of goods</th><th className="r">Operating cost</th>
                                <th className="r">Net earning</th><th className="r">Margin</th><th>Relative</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rows.map((r) => {
                                const mg = r.grossSales ? (r.netEarning / r.grossSales) * 100 : 0;
                                return (
                                    <tr key={r.period}>
                                        <td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{r.period}</td>
                                        <td className="r">{r.orders.toLocaleString('en-IN')}</td>
                                        <td className="r fin-money">{money(r.grossSales)}</td>
                                        <td className="r" style={{ color: 'var(--fin-tx2)' }}>{signedMoney(-r.refunds)}</td>
                                        <td className="r" style={{ color: 'var(--fin-tx2)' }}>{signedMoney(-r.gatewayFees)}</td>
                                        <td className="r" style={{ color: 'var(--fin-tx2)' }}>{signedMoney(-r.cogs)}</td>
                                        <td className="r" style={{ color: 'var(--fin-tx2)' }}>{signedMoney(-r.operatingCost)}</td>
                                        <td className="r fin-money" style={{ color: r.netEarning >= 0 ? 'var(--fin-pos)' : 'var(--fin-neg)' }}>{money(r.netEarning)}</td>
                                        <td className="r">{mg.toFixed(1)}%</td>
                                        <td style={{ width: 100 }}>
                                            <div className="fin-track"><span style={{ width: `${Math.max(0, (r.netEarning / maxNet) * 100).toFixed(0)}%`, background: r.netEarning >= 0 ? '#0B7A55' : '#C58A7A' }} /></div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                            <tfoot>
                            <tr>
                                <td>{rows.length} {grain === 'week' ? 'weeks' : 'months'}</td>
                                <td className="r">{totalOrders.toLocaleString('en-IN')}</td>
                                <td className="r">{money(totalGross)}</td>
                                <td className="r">{signedMoney(-totalRefunds)}</td>
                                <td className="r">{signedMoney(-totalFees)}</td>
                                <td className="r">{signedMoney(-totalCogs)}</td>
                                <td className="r">{signedMoney(-totalOp)}</td>
                                <td className="r">{money(totalNet)}</td>
                                <td className="r">{totalGross ? ((totalNet / totalGross) * 100).toFixed(1) : '0.0'}%</td>
                                <td></td>
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