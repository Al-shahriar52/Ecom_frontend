import React, { useEffect, useState } from 'react';
import { money } from './financeUtils';
import toast from 'react-hot-toast';
import { fetchSteadfastPayouts, reconcilePayout } from '../courier/courierApi';

const fmtDate = (s) => (s ? s.slice(0, 16).replace('T', ' ') : '—');

/** Real data: what Steadfast owes you and the payouts it has made. */
const CourierPayouts = () => {
    const [data, setData] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rec, setRec] = useState({}); // paymentId -> reconciliation result
    const [recBusy, setRecBusy] = useState(null);

    const reconcile = async (id) => {
        if (rec[id]) { setRec((r) => { const n = { ...r }; delete n[id]; return n; }); return; }
        setRecBusy(id);
        try {
            const res = await reconcilePayout(id);
            setRec((r) => ({ ...r, [id]: res }));
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not reconcile this payout.');
        } finally {
            setRecBusy(null);
        }
    };

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchSteadfastPayouts(page)
            .then((d) => { if (!cancelled) { setData(d); setError(null); } })
            .catch(() => { if (!cancelled) setError('Could not reach Steadfast.'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [page]);

    return (
        <div className="fin-card fin-mb">
            <div className="fin-ch"><div><h3>Courier payouts · Steadfast</h3><p>Live from Steadfast, not estimated</p></div></div>
            {loading && !data && <div className="fin-cb" style={{ color: 'var(--fin-tx3)' }}>Loading…</div>}
            {error && <div className="fin-cb" style={{ color: 'var(--fin-neg)' }}>{error}</div>}
            {data && (
                <>
                    <div className="fin-cb">
                        <div className="fin-kv">
                            <span className="fin-k">Steadfast owes you right now</span>
                            <span className="fin-v">{data.balance != null ? money(data.balance) : '—'}</span>
                        </div>
                        {data.balanceError && <div style={{ color: 'var(--fin-neg)', fontSize: 12.5 }}>{data.balanceError}</div>}
                        <div style={{ color: 'var(--fin-tx3)', fontSize: 12.5 }}>Delivered COD less delivery charges and Steadfast's collection charge.</div>
                    </div>
                    <div className="fin-tw">
                        <table className="fin-table">
                            <thead><tr><th>Payout</th><th>Method</th><th className="r">Amount</th><th className="r">Charges</th><th>Status</th><th>Paid</th><th></th></tr></thead>
                            <tbody>
                            {data.payouts.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20, color: 'var(--fin-tx3)' }}>{data.payoutsError || 'No payouts on this page.'}</td></tr>
                            )}
                            {data.payouts.map((p) => (
                                <React.Fragment key={p.paymentId}>
                                    <tr>
                                        <td className="fin-oid">{p.paymentId}</td>
                                        <td>{p.method || '—'}</td>
                                        <td className="r fin-money">{money(p.amount)}</td>
                                        <td className="r" style={{ color: 'var(--fin-tx2)' }}>{money(p.charges)}</td>
                                        <td><span className={`fin-pill ${p.paidAt ? 'ok' : 'pend'}`}>{p.status || '—'}</span></td>
                                        <td style={{ whiteSpace: 'nowrap', color: 'var(--fin-tx2)' }}>{fmtDate(p.paidAt)}</td>
                                        <td><button className="fin-btn" disabled={recBusy === p.paymentId} onClick={() => reconcile(p.paymentId)}>{recBusy === p.paymentId ? 'Checking…' : rec[p.paymentId] ? 'Hide' : 'Match orders'}</button></td>
                                    </tr>
                                    {rec[p.paymentId] && (
                                        <tr>
                                            <td colSpan={7} style={{ background: 'var(--fin-card-2)' }}>
                                                <div style={{ fontSize: 12.5, margin: '6px 0' }}>
                                                    {rec[p.paymentId].matchedCount} of {rec[p.paymentId].parcelCount} parcels matched to your invoices.
                                                    Steadfast lists {money(rec[p.paymentId].settledTotal)} against {money(rec[p.paymentId].expectedTotal)} on your invoices.
                                                    Small gaps are normally delivery charges and Steadfast's collection fee.
                                                </div>
                                                <table className="fin-table">
                                                    <thead><tr><th>Invoice</th><th>Consignment</th><th>Steadfast status</th><th className="r">Steadfast amount</th><th className="r">Your invoice</th><th className="r">Difference</th><th>Your status</th></tr></thead>
                                                    <tbody>
                                                    {rec[p.paymentId].lines.map((l, i) => (
                                                        <tr key={`${l.invoice}-${i}`}>
                                                            <td className="fin-oid">{l.invoice || '—'}{l.orderId == null && <span className="fin-pill fail" style={{ marginLeft: 6 }}>no order</span>}</td>
                                                            <td>{l.consignmentId || '—'}</td>
                                                            <td>{l.courierStatus || '—'}</td>
                                                            <td className="r">{l.settledAmount != null ? money(l.settledAmount) : '—'}</td>
                                                            <td className="r">{l.invoiceTotal != null ? money(l.invoiceTotal) : '—'}</td>
                                                            <td className="r" style={{ color: l.difference ? 'var(--fin-neg)' : undefined }}>{l.difference != null ? money(l.difference) : '—'}</td>
                                                            <td>{l.ourDeliveryStatus || '—'}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="fin-tfoot">
                        <button className="fin-btn" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Newer</button>
                        <span style={{ margin: '0 10px' }}>Page {page}</span>
                        <button className="fin-btn" disabled={data.payouts.length < 10 || loading} onClick={() => setPage((p) => p + 1)}>Older</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CourierPayouts;
