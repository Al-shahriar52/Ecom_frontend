import React, { useEffect, useState } from 'react';
import { fetchWebhookEvents } from './courierApi';

/** What Steadfast has pushed to us lately. Handy for checking the webhook really works. */
const WebhookEvents = () => {
    const [rows, setRows] = useState(null);
    const [open, setOpen] = useState(null);

    const load = () => fetchWebhookEvents().then(setRows).catch(() => setRows([]));
    useEffect(() => { load(); }, []);

    return (
        <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: 15 }}>Steadfast webhook activity</h3>
                <button className="cp-btn" onClick={load} style={{ marginLeft: 'auto' }}>Refresh</button>
            </div>
            <p style={{ color: '#64748b', fontSize: 13, margin: '6px 0 10px' }}>
                Callback URL to give Steadfast: <code>https://YOUR-BACKEND-DOMAIN/api/v1/webhooks/steadfast</code>
            </p>
            {rows === null && <div style={{ color: '#64748b' }}>Loading…</div>}
            {rows && rows.length === 0 && <div style={{ color: '#64748b', fontSize: 13 }}>Nothing received yet.</div>}
            {rows && rows.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                        <thead><tr style={{ textAlign: 'left', color: '#64748b' }}><th>When</th><th>Event</th><th>Consignment</th><th>Result</th><th></th></tr></thead>
                        <tbody>
                        {rows.map((r) => (
                            <React.Fragment key={r.id}>
                                <tr style={{ borderTop: '1px solid #f1f5f9' }}>
                                    <td style={{ whiteSpace: 'nowrap' }}>{r.receivedAt ? new Date(r.receivedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                    <td>{r.eventType || '—'}</td>
                                    <td>{r.consignmentId || '—'}</td>
                                    <td>{r.outcome}</td>
                                    <td><button className="cp-btn" onClick={() => setOpen(open === r.id ? null : r.id)}>{open === r.id ? 'Hide' : 'Raw'}</button></td>
                                </tr>
                                {open === r.id && (
                                    <tr><td colSpan={5}><pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#f8fafc', padding: 8, borderRadius: 6, margin: '4px 0' }}>{r.payload}</pre></td></tr>
                                )}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default WebhookEvents;
