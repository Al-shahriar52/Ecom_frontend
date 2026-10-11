import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { checkCustomer } from './courierApi';

const COLORS = {
    GOOD: ['#e6f6ee', '#0b7a55', 'Good record'],
    CAUTION: ['#fdf3e0', '#8a5d06', 'Be careful'],
    RISKY: ['#fdeaea', '#b42318', 'High risk'],
    UNKNOWN: ['#eef1f5', '#475467', 'No history'],
};
const VOLUME = { none: 'no parcels', low: '1–5 parcels', medium: '6–20 parcels', high: '21–200 parcels', very_high: '200+ parcels' };

/** On-demand customer delivery record from Steadfast (rate limited, so never auto-run). */
const CustomerCheck = ({ phone }) => {
    const [res, setRes] = useState(null);
    const [busy, setBusy] = useState(false);

    const run = async () => {
        setBusy(true);
        try {
            setRes(await checkCustomer(phone));
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not check this customer.');
        } finally {
            setBusy(false);
        }
    };

    if (!phone) return null;
    const c = res && COLORS[res.verdict];
    return (
        <div style={{ marginTop: 6 }}>
            {!res && (
                <button type="button" onClick={run} disabled={busy}
                        style={{ fontSize: 12.5, padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
                    {busy ? 'Checking…' : 'Check delivery record'}
                </button>
            )}
            {res && (
                <div style={{ background: c[0], color: c[1], borderRadius: 8, padding: '8px 10px', fontSize: 12.5, lineHeight: 1.45 }}>
                    <strong>{c[2]}</strong> · {res.summary}
                    <div style={{ opacity: 0.85 }}>
                        {res.volumeBand ? `Seen on ${VOLUME[res.volumeBand] || res.volumeBand} across merchants` : ''}
                        {Object.keys(res.reportCategories || {}).length > 0 && ` · Reports: ${Object.entries(res.reportCategories).map(([k, v]) => `${k.replace(/_/g, ' ')} ×${v}`).join(', ')}`}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerCheck;
