import React, { useEffect, useState } from 'react';
import { money } from './financeUtils';
import { fetchSteadfastPayouts } from '../courier/courierApi';

const fmtDate = (s) => (s ? s.slice(0, 16).replace('T', ' ') : '—');

/** Real data: what Steadfast owes you and the payouts it has made. */
const CourierPayouts = () => {
    const [data, setData] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                            <thead><tr><th>Payout</th><th>Method</th><th className="r">Amount</th><th className="r">Charges</th><th>Status</th><th>Paid</th></tr></thead>
                            <tbody>
                            {data.payouts.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20, color: 'var(--fin-tx3)' }}>{data.payoutsError || 'No payouts on this page.'}</td></tr>
                            )}
                            {data.payouts.map((p) => (
                                <tr key={p.paymentId}>
                                    <td className="fin-oid">{p.paymentId}</td>
                                    <td>{p.method || '—'}</td>
                                    <td className="r fin-money">{money(p.amount)}</td>
                                    <td className="r" style={{ color: 'var(--fin-tx2)' }}>{money(p.charges)}</td>
                                    <td><span className={`fin-pill ${p.paidAt ? 'ok' : 'pend'}`}>{p.status || '—'}</span></td>
                                    <td style={{ whiteSpace: 'nowrap', color: 'var(--fin-tx2)' }}>{fmtDate(p.paidAt)}</td>
                                </tr>
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
