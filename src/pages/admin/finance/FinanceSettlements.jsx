import React, { useEffect, useState } from 'react';
import { AlertTriangle } from './financeIcons';
import { money } from './financeUtils';
import { fetchSettlements, fetchCodSummary } from './financeApi';
import DateRangeBar, { presetRange, rangeLabel } from './DateRangeBar';
import CourierPayouts from './CourierPayouts';

const label = (m) => (m || '').toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
const fmt = (s) => (s ? s.slice(0, 16).replace('T', ' ') : '—');

/** Everything here is calculated from your real orders, saved gateway rates, and Steadfast's own balance and payouts. */
const FinanceSettlements = () => {
    const [range, setRange] = useState(presetRange('month'));
    const [data, setData] = useState(null);
    const [cod, setCod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchSettlements(range.start, range.end)
            .then((d) => { if (!cancelled) setData(d); })
            .catch(() => { if (!cancelled) setError('Could not load settlements.'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [range]);

    useEffect(() => { fetchCodSummary().then(setCod).catch(() => setCod(null)); }, []);

    const withCouriers = cod ? cod.outForDeliveryAmount + cod.deliveredUnpaidAmount : null;

    return (
        <>
            <div className="fin-pbar">
                <div><div className="fin-h1">Settlements</div><div className="fin-sub">Money that has come in, and money still on its way · {rangeLabel(range)}</div></div>
            </div>
            <div className="fin-wrap">
                <div className="fin-mb"><DateRangeBar value={range} onChange={setRange} /></div>

                {error && <div className="fin-note w fin-mb"><AlertTriangle size={18} style={{ flex: 'none', marginTop: 1 }} /><div>{error}</div></div>}

                <div className="fin-g4 fin-mb">
                    <div className="fin-tile"><div className="fin-k">Online payments received</div><div className="fin-v">{data ? money(data.receivedGross) : '…'}</div><div className="fin-r"><span>{data ? `${data.paymentsTotal} payments` : ''}</span></div></div>
                    <div className="fin-tile"><div className="fin-k">Expected after gateway fees</div><div className="fin-v">{data ? money(data.expectedNet) : '…'}</div><div className="fin-r"><span>{data ? `${money(data.expectedFees)} in fees at your saved rates` : ''}</span></div></div>
                    <div className="fin-tile"><div className="fin-k">Online payments pending</div><div className="fin-v">{data ? money(data.awaitingAmount) : '…'}</div><div className="fin-r"><span className="fin-pill pend">{data ? `${data.awaitingCount} orders` : ''}</span></div></div>
                    <div className="fin-tile"><div className="fin-k">Cash still with couriers</div><div className="fin-v">{withCouriers == null ? '…' : money(withCouriers)}</div><div className="fin-r"><span>out for delivery + delivered, unpaid</span></div></div>
                </div>

                <CourierPayouts />

                <div className="fin-card fin-mb">
                    <div className="fin-ch"><div><h3>By gateway</h3><p>Fees use the rates saved under Gateways. Compare "expected" with each gateway's own statement.</p></div></div>
                    <div className="fin-tw">
                        <table className="fin-table">
                            <thead><tr><th>Gateway</th><th className="r">Fee rate</th><th className="r">Payments</th><th className="r">Received</th><th className="r">Expected fee</th><th className="r">Expected to receive</th><th className="r">Pending</th></tr></thead>
                            <tbody>
                            {data && data.gateways.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20, color: 'var(--fin-tx3)' }}>No online payments in this period.</td></tr>
                            )}
                            {data && data.gateways.map((g) => (
                                <tr key={g.method}>
                                    <td style={{ fontWeight: 500 }}>{label(g.method)}</td>
                                    <td className="r">{g.feeRatePct}%</td>
                                    <td className="r">{g.paidCount}</td>
                                    <td className="r fin-money">{money(g.paidGross)}</td>
                                    <td className="r" style={{ color: 'var(--fin-tx2)' }}>{money(g.expectedFee)}</td>
                                    <td className="r fin-money">{money(g.expectedNet)}</td>
                                    <td className="r">{g.awaitingCount ? `${money(g.awaitingAmount)} (${g.awaitingCount})` : '—'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="fin-card">
                    <div className="fin-ch"><div><h3>Online payments</h3><p>{data ? `Showing ${data.payments.length} of ${data.paymentsTotal}` : ''}</p></div></div>
                    <div className="fin-tw">
                        <table className="fin-table">
                            <thead><tr><th>Paid</th><th>Invoice</th><th>Customer</th><th>Gateway</th><th className="r">Amount</th><th className="r">Fee</th><th className="r">You receive</th></tr></thead>
                            <tbody>
                            {loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20, color: 'var(--fin-tx3)' }}>Loading…</td></tr>}
                            {!loading && data && data.payments.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20, color: 'var(--fin-tx3)' }}>No online payments in this period.</td></tr>
                            )}
                            {!loading && data && data.payments.map((p) => (
                                <tr key={p.orderId}>
                                    <td style={{ whiteSpace: 'nowrap', color: 'var(--fin-tx2)' }}>{fmt(p.paidAt)}</td>
                                    <td className="fin-oid">{p.invoice || `#${p.orderId}`}</td>
                                    <td className="fin-cust">{p.customer || 'Guest'}</td>
                                    <td>{label(p.method)}</td>
                                    <td className="r fin-money">{money(p.gross)}</td>
                                    <td className="r" style={{ color: 'var(--fin-tx2)' }}>{money(p.fee)}</td>
                                    <td className="r fin-money">{money(p.net)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FinanceSettlements;
