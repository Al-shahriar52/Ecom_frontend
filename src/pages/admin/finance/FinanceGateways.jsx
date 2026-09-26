import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, AlertTriangle } from './financeIcons';
import { money } from './financeUtils';
import { fetchGateways, updateGatewayRate } from './financeApi';

const GW_DISPLAY = {
    BKASH: { n: 'bKash', s: 'bK', bg: '#F3E3EA', fg: '#8A2C4E' },
    NAGAD: { n: 'Nagad', s: 'Ng', bg: '#F6E7DE', fg: '#8A4520' },
    ROCKET: { n: 'Rocket', s: 'Rk', bg: '#EAE5F2', fg: '#4A3B7A' },
    CARD: { n: 'Card · SSLCommerz', s: 'SSL', bg: '#E4EDF5', fg: '#1B5788' },
    COD: { n: 'Cash on delivery', s: 'COD', bg: '#EDF1EF', fg: '#566A62' },
};

const FinanceGateways = () => {
    const [gateways, setGateways] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [drafts, setDrafts] = useState({});
    const [saving, setSaving] = useState({});

    useEffect(() => {
        fetchGateways()
            .then((data) => {
                setGateways(data);
                setDrafts(Object.fromEntries(data.map((g) => [g.paymentMethod, g.feeRatePct.toFixed(2)])));
            })
            .catch((err) => { console.error('Error fetching gateways:', err); setError('Could not load this view.'); })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="fin-wrap"><div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--fin-tx3)' }}>Loading…</div></div>;
    }
    if (error || !gateways) {
        return <div className="fin-wrap"><div className="fin-note w"><AlertTriangle size={18} style={{ flex: 'none', marginTop: 1 }} /><div>{error || 'No data available.'}</div></div></div>;
    }

    const handleSave = async (method) => {
        const val = parseFloat(drafts[method]);
        if (isNaN(val) || val < 0 || val > 100) {
            toast.error('Enter a rate between 0 and 100');
            return;
        }
        setSaving((s) => ({ ...s, [method]: true }));
        try {
            const updated = await updateGatewayRate(method, val);
            setGateways((prev) => prev.map((g) => (g.paymentMethod === method ? { ...g, feeRatePct: updated.feeRatePct } : g)));
            toast.success(`${GW_DISPLAY[method]?.n || method} fee rate updated`);
        } catch (err) {
            console.error('Error updating gateway rate:', err);
            toast.error(err.response?.data?.message || 'Failed to update rate');
        } finally {
            setSaving((s) => ({ ...s, [method]: false }));
        }
    };

    return (
        <>
            <div className="fin-pbar">
                <div><div className="fin-h1">Payment gateways</div><div className="fin-sub">Fee rates here drive every net figure across this workspace</div></div>
                <div className="fin-sp" />
                <button className="fin-btn pri" disabled title="Not built yet"><Plus size={14} />Connect a gateway</button>
            </div>
            <div className="fin-wrap">
                <div className="fin-g2">
                    {gateways.map((g) => {
                        const display = GW_DISPLAY[g.paymentMethod] || { n: g.paymentMethod, s: g.paymentMethod.slice(0, 3), bg: '#eee', fg: '#666' };
                        const draftChanged = drafts[g.paymentMethod] !== g.feeRatePct.toFixed(2);
                        return (
                            <div key={g.paymentMethod} className="fin-card">
                                <div className="fin-ch">
                                    <span className="fin-gwi" style={{ width: 32, height: 32, background: display.bg, color: display.fg, fontSize: 11 }}>{display.s}</span>
                                    <div><h3>{display.n}</h3><p>{g.orderCount} orders this month</p></div>
                                    <div className="fin-sp" />
                                    <span className={`fin-pill ${g.connected ? 'ok' : 'mute'}`}>{g.connected ? 'Connected' : 'Manual'}</span>
                                </div>
                                <div className="fin-cb">
                                    <div className="fin-kv"><span className="fin-k">Collected this month</span><span className="fin-v">{money(g.collectedThisMonth)}</span></div>
                                    <div className="fin-kv"><span className="fin-k">Orders</span><span className="fin-v">{g.orderCount}</span></div>
                                    <div className="fin-kv"><span className="fin-k">Settlement cycle</span><span className="fin-v">{g.settlementCycle}</span></div>
                                    <div className="fin-f" style={{ margin: '12px 0 0' }}>
                                        <label>Fee charged per transaction</label>
                                        <div className="fin-pre">
                                            <input
                                                value={drafts[g.paymentMethod] ?? ''}
                                                onChange={(e) => setDrafts((d) => ({ ...d, [g.paymentMethod]: e.target.value }))}
                                                aria-label={`${display.n} fee rate`}
                                            />
                                            <span style={{ borderRight: 'none', borderLeft: '1px solid var(--fin-line-2)' }}>%</span>
                                        </div>
                                        <div className="fin-hint">Applied to every order using this method, everywhere in this workspace</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                        <button className="fin-btn sm pri" disabled={!draftChanged || saving[g.paymentMethod]} onClick={() => handleSave(g.paymentMethod)}>
                                            {saving[g.paymentMethod] ? 'Saving…' : 'Save rate'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default FinanceGateways;