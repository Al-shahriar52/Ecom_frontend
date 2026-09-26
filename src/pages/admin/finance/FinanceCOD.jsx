import React, { useEffect, useState } from 'react';
import { AlertTriangle } from './financeIcons';
import { money, signedMoney } from './financeUtils';
import { BarList } from './financeCharts';
import { fetchCodSummary } from './financeApi';

const CODS = {
    PENDING: ['info', 'Pending'], READY_FOR_PICKUP: ['pend', 'Ready for pickup'], IN_TRANSIT: ['info', 'Out for delivery'],
    DELIVERED: ['pend', 'Delivered'], RETURNED: ['fail', 'Returned'], CANCELLED: ['fail', 'Cancelled'],
};
const COURIER_COLORS = ['#0B7A55', '#1B5788', '#8A5D06', '#5C4B8A', '#8A6D3B'];

const FinanceCOD = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        fetchCodSummary()
            .then((d) => { if (!cancelled) setData(d); })
            .catch((err) => { console.error('Error fetching COD summary:', err); if (!cancelled) setError('Could not load this view.'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return <div className="fin-wrap"><div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--fin-tx3)' }}>Loading…</div></div>;
    }
    if (error || !data) {
        return <div className="fin-wrap"><div className="fin-note w"><AlertTriangle size={18} style={{ flex: 'none', marginTop: 1 }} /><div>{error || 'No data available.'}</div></div></div>;
    }

    const courierRows = data.courierMix.map((c, i) => ({
        n: c.courier, v: c.amount, c: COURIER_COLORS[i % COURIER_COLORS.length], s: `${c.count} orders`,
    }));
    const courierTotal = data.courierMix.reduce((sum, c) => sum + c.amount, 0) || 1;

    return (
        <>
            <div className="fin-pbar">
                <div><div className="fin-h1">Cash on delivery</div><div className="fin-sub">Cash your couriers are holding, live from your orders</div></div>
            </div>
            <div className="fin-wrap">
                <div className="fin-g3 fin-mb">
                    <div className="fin-tile"><div className="fin-k">Out for delivery</div><div className="fin-v">{money(data.outForDeliveryAmount)}</div><div className="fin-r"><span>{data.outForDeliveryCount} parcels</span></div></div>
                    <div className="fin-tile"><div className="fin-k">Delivered, not yet paid</div><div className="fin-v">{money(data.deliveredUnpaidAmount)}</div><div className="fin-r"><span className="fin-pill pend">{data.deliveredUnpaidCount} parcels</span></div></div>
                    <div className="fin-tile"><div className="fin-k">Returned to you</div><div className="fin-v" style={{ color: 'var(--fin-neg)' }}>{signedMoney(-data.returnedAmount)}</div><div className="fin-r"><span>{data.returnedCount} parcels · {data.returnRatePct.toFixed(1)}% return rate</span></div></div>
                </div>
                <div className="fin-split">
                    <div className="fin-card">
                        <div className="fin-ch"><div><h3>Recent COD parcels</h3></div></div>
                        <div className="fin-tw">
                            <table className="fin-table">
                                <thead><tr><th>Consignment</th><th>Courier</th><th>Customer</th><th className="r">Collectable</th><th>Status</th></tr></thead>
                                <tbody>
                                {data.parcels.length === 0 && (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20, color: 'var(--fin-tx3)' }}>No COD parcels yet.</td></tr>
                                )}
                                {data.parcels.map((p) => {
                                    const st = CODS[p.deliveryStatus] || ['mute', p.deliveryStatus || '—'];
                                    return (
                                        <tr key={p.orderId}>
                                            <td className="fin-oid">{p.consignmentId || `#${p.orderId}`}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>{p.courierName || '—'}</td>
                                            <td className="fin-cust">{p.customer || 'Guest'}</td>
                                            <td className="r fin-money">{money(p.collectable)}</td>
                                            <td><span className={`fin-pill ${st[0]}`}>{st[1]}</span></td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="fin-card">
                        <div className="fin-ch"><div><h3>Courier performance</h3><p>All COD orders</p></div></div>
                        <div className="fin-cb">
                            {courierRows.length > 0 ? (
                                <BarList rows={courierRows} total={courierTotal} />
                            ) : (
                                <div style={{ color: 'var(--fin-tx3)', fontSize: 13 }}>No COD orders yet.</div>
                            )}
                        </div>
                        <div className="fin-cb" style={{ borderTop: '1px solid var(--fin-line)' }}>
                            <div className="fin-kv"><span className="fin-k">Return rate</span><span className="fin-v">{data.returnRatePct.toFixed(1)}%</span></div>
                            <div className="fin-kv"><span className="fin-k">Cash tied up right now</span><span className="fin-v">{money(data.outForDeliveryAmount + data.deliveredUnpaidAmount)}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FinanceCOD;