import React, { useState } from 'react';
import { Plus } from './financeIcons';
import { money } from './financeUtils';
import { GW } from './financeData';

const ROWS = [
    { k: 'bkash', st: 'Connected', vol: 1109100, n: 541, note: 'Rate mismatch found on 3 batches' },
    { k: 'nagad', st: 'Connected', vol: 290700, n: 161, note: 'All batches matched' },
    { k: 'card', st: 'Connected', vol: 449300, n: 182, note: 'All batches matched' },
    { k: 'rocket', st: 'Connected', vol: 54000, n: 60, note: 'Low volume — review whether to keep' },
    { k: 'bank', st: 'Manual', vol: 105700, n: 42, note: 'Entered by hand from bank statement' },
    { k: 'cod', st: 'Via courier', vol: 634300, n: 298, note: 'Charges vary by courier and weight' },
];

const FinanceGateways = () => {
    const [fees, setFees] = useState(() => Object.fromEntries(Object.keys(GW).map((k) => [k, GW[k].fee.toFixed(2)])));

    const setFee = (k, v) => setFees((prev) => ({ ...prev, [k]: v }));

    return (
        <>
            <div className="fin-pbar">
                <div><div className="fin-h1">Payment gateways</div><div className="fin-sub">Fee rates here drive every net figure in the app</div></div>
                <div className="fin-sp" />
                <button className="fin-btn pri"><Plus size={14} />Connect a gateway</button>
            </div>
            <div className="fin-wrap">
                <div className="fin-g2">
                    {ROWS.map((r) => {
                        const g = GW[r.k];
                        const warn = r.k === 'bkash';
                        return (
                            <div key={r.k} className="fin-card">
                                <div className="fin-ch">
                                    <span className="fin-gwi" style={{ width: 32, height: 32, background: g.bg, color: g.fg, fontSize: 11 }}>{g.s}</span>
                                    <div><h3>{g.n}</h3><p>{r.note}</p></div>
                                    <div className="fin-sp" />
                                    <span className={`fin-pill ${r.st === 'Connected' ? 'ok' : 'mute'}`}>{r.st}</span>
                                </div>
                                <div className="fin-cb">
                                    <div className="fin-kv"><span className="fin-k">Collected in August</span><span className="fin-v">{money(r.vol)}</span></div>
                                    <div className="fin-kv"><span className="fin-k">Orders</span><span className="fin-v">{r.n}</span></div>
                                    <div className="fin-kv"><span className="fin-k">Settlement cycle</span><span className="fin-v">{g.pay}</span></div>
                                    <div className="fin-f" style={{ margin: '12px 0 0' }}>
                                        <label>Fee charged per transaction</label>
                                        <div className="fin-pre" style={warn ? { borderColor: 'var(--fin-neg)' } : undefined}>
                                            <input
                                                value={fees[r.k]}
                                                onChange={(e) => setFee(r.k, e.target.value)}
                                                aria-label={`${g.n} fee rate`}
                                            />
                                            <span style={{ borderRight: 'none', borderLeft: '1px solid var(--fin-line-2)' }}>%</span>
                                        </div>
                                        {warn ? (
                                            <div className="fin-hint" style={{ color: 'var(--fin-neg)' }}>Settlements suggest the real rate is 1.90%</div>
                                        ) : (
                                            <div className="fin-hint">Applied to every new transaction</div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                        <button className="fin-btn sm">Fee history</button>
                                        <button className="fin-btn sm">Test connection</button>
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
