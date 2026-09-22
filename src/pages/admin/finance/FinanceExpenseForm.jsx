import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Download, Upload, Info } from './financeIcons';
import { money, signedMoney } from './financeUtils';
import { ColumnChart } from './financeCharts';
import { createExpense, fetchExpenseMonthlyTrend, fetchExpenseSummary } from './financeApi';

const CATEGORIES = [
    { key: 'STOCK_PURCHASE', label: 'Stock purchase (COGS)', color: '#0B7A55' },
    { key: 'ADVERTISING', label: 'Advertising', color: 'var(--fin-neg)' },
    { key: 'COURIER_DELIVERY', label: 'Courier & delivery', color: '#1B5788' },
    { key: 'PACKAGING', label: 'Packaging', color: '#8A5D06' },
    { key: 'SALARIES', label: 'Salaries', color: '#5C4B8A' },
    { key: 'RENT_UTILITIES', label: 'Rent & utilities', color: '#8A6D3B' },
    { key: 'SOFTWARE', label: 'Software', color: '#2F7D8A' },
    { key: 'OTHER', label: 'Other', color: '#8A9A93' },
];

const todayIso = () => new Date().toISOString().slice(0, 10);
const monthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    return { start, end };
};

const FinanceExpenseForm = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [category, setCategory] = useState('STOCK_PURCHASE');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(todayIso());
    const [vendor, setVendor] = useState('');
    const [source, setSource] = useState('City Bank — current ····8841');
    const [ref, setRef] = useState('');
    const [vat, setVat] = useState('');
    const [ait, setAit] = useState('');
    const [note, setNote] = useState('');
    const [repeat, setRepeat] = useState(false);
    const [isCogs, setIsCogs] = useState(true);
    const [receiptFile, setReceiptFile] = useState(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const [monthTotalBefore, setMonthTotalBefore] = useState(null);
    const [trend, setTrend] = useState(null);
    const [trendLoading, setTrendLoading] = useState(true);

    const { start, end } = monthRange();

    useEffect(() => {
        fetchExpenseSummary(start, end)
            .then((s) => setMonthTotalBefore(s.grandTotal))
            .catch(() => setMonthTotalBefore(null));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let cancelled = false;
        setTrendLoading(true);
        fetchExpenseMonthlyTrend(category, 6)
            .then((data) => { if (!cancelled) setTrend(data); })
            .catch(() => { if (!cancelled) setTrend(null); })
            .finally(() => { if (!cancelled) setTrendLoading(false); });
        return () => { cancelled = true; };
    }, [category]);

    const parsedAmount = parseFloat(String(amount).replace(/,/g, '')) || 0;
    const parsedVat = parseFloat(String(vat).replace(/,/g, '')) || 0;
    const parsedAit = parseFloat(String(ait).replace(/,/g, '')) || 0;

    const afterTotal = monthTotalBefore === null ? null : monthTotalBefore + parsedAmount - parsedVat;

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
        setError('');
    };

    const resetForm = () => {
        setAmount(''); setVendor(''); setRef(''); setVat(''); setAit(''); setNote('');
        setReceiptFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSave = async (e, addAnother = false) => {
        e.preventDefault();
        const v = parseFloat(String(amount).replace(/,/g, ''));
        if (!String(amount).trim() || isNaN(v) || v <= 0) {
            setError('Enter an amount greater than zero');
            return;
        }
        setError('');
        setSaving(true);
        try {
            await createExpense({
                category,
                vendor,
                reference: ref,
                paidFrom: source,
                amount: v,
                vatAmount: parsedVat,
                aitAmount: parsedAit,
                note,
                recurring: repeat,
                cogs: isCogs,
                expenseDate: date,
            }, receiptFile);

            toast.success('Expense recorded');
            fetchExpenseSummary(start, end).then((s) => setMonthTotalBefore(s.grandTotal)).catch(() => {});

            if (addAnother) {
                resetForm();
            } else {
                navigate('/admin/accounting/expenses');
            }
        } catch (err) {
            console.error('Error saving expense:', err);
            toast.error(err.response?.data?.message || 'Failed to save expense');
        } finally {
            setSaving(false);
        }
    };

    const categoryLabel = CATEGORIES.find((c) => c.key === category)?.label || category;
    const trendValues = trend ? Object.values(trend) : [];
    const trendLabels = trend ? Object.keys(trend) : [];
    const trendAvg = trendValues.length ? trendValues.reduce((a, b) => a + b, 0) / trendValues.length : 0;

    return (
        <>
            <div className="fin-pbar">
                <div>
                    <div className="fin-h1">Record a cost</div>
                    <div className="fin-sub">Anything you spend — stock, ads, courier, salary, rent, fees</div>
                </div>
                <div className="fin-sp" />
                <button className="fin-btn" disabled title="Not built yet"><Download size={14} />Import from bank statement</button>
                <button className="fin-btn" onClick={() => navigate('/admin/accounting/expenses')}>See all expenses</button>
            </div>

            <div className="fin-wrap">
                <div className="fin-split">
                    <div className="fin-card">
                        <div className="fin-ch"><div><h3>New expense</h3><p>Saved for real — this updates your actual records straight away</p></div></div>
                        <form className="fin-cb" onSubmit={handleSave}>

                            <div className="fin-f">
                                <label>What was it for?</label>
                                <div className="fin-catgrid">
                                    {CATEGORIES.map((c) => (
                                        <button
                                            key={c.key}
                                            type="button"
                                            className={`fin-cat ${category === c.key ? 'on' : ''}`}
                                            onClick={() => setCategory(c.key)}
                                        >
                                            <i style={{ background: c.color }} />{c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="fin-f2">
                                <div className="fin-f">
                                    <label htmlFor="exAmt">Amount</label>
                                    <div className="fin-pre" style={error ? { borderColor: 'var(--fin-neg)' } : undefined}>
                                        <span>৳</span>
                                        <input id="exAmt" type="text" inputMode="decimal" placeholder="0.00" value={amount} onChange={handleAmountChange} />
                                    </div>
                                    {error && <div className="fin-hint" style={{ color: 'var(--fin-neg)' }}>{error}</div>}
                                </div>
                                <div className="fin-f">
                                    <label htmlFor="exDate">Date</label>
                                    <input id="exDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                                </div>
                            </div>

                            <div className="fin-f">
                                <label htmlFor="exVendor">Paid to <em>· supplier or vendor</em></label>
                                <input id="exVendor" placeholder="Start typing a name" value={vendor} onChange={(e) => setVendor(e.target.value)} />
                            </div>

                            <div className="fin-f2">
                                <div className="fin-f">
                                    <label htmlFor="exSrc">Paid from</label>
                                    <select id="exSrc" value={source} onChange={(e) => setSource(e.target.value)}>
                                        <option>City Bank — current ····8841</option>
                                        <option>bKash merchant — 01711······</option>
                                        <option>Nagad merchant</option>
                                        <option>Petty cash</option>
                                        <option>Company card ····4412</option>
                                    </select>
                                </div>
                                <div className="fin-f">
                                    <label htmlFor="exRef">Reference <em>· optional</em></label>
                                    <input id="exRef" placeholder="Invoice or TrxID" value={ref} onChange={(e) => setRef(e.target.value)} />
                                </div>
                            </div>

                            <div className="fin-f">
                                <label>VAT / AIT withheld <em>· optional</em></label>
                                <div className="fin-f2">
                                    <div className="fin-pre"><span>VAT</span><input value={vat} onChange={(e) => setVat(e.target.value)} placeholder="0" aria-label="VAT amount" /></div>
                                    <div className="fin-pre"><span>AIT</span><input value={ait} onChange={(e) => setAit(e.target.value)} placeholder="0" aria-label="AIT amount" /></div>
                                </div>
                            </div>

                            <div className="fin-f">
                                <label htmlFor="exNote">Note</label>
                                <textarea id="exNote" placeholder="Anything your accountant should know" value={note} onChange={(e) => setNote(e.target.value)} />
                            </div>

                            <div className="fin-tog">
                                <button type="button" className={`fin-sw ${repeat ? 'on' : ''}`} role="switch" aria-checked={repeat} aria-label="Repeat this cost" onClick={() => setRepeat(!repeat)} />
                                <span>Repeat this cost every month</span>
                            </div>
                            <div className="fin-tog" style={{ paddingTop: 0 }}>
                                <button type="button" className={`fin-sw ${isCogs ? 'on' : ''}`} role="switch" aria-checked={isCogs} aria-label="Count in cost of goods sold" onClick={() => setIsCogs(!isCogs)} />
                                <span>Count in cost of goods sold, not operating cost</span>
                            </div>

                            <div className="fin-f" style={{ marginTop: 12 }}>
                                <label>Receipt</label>
                                <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
                                       onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
                                <div className="fin-drop" onClick={() => fileInputRef.current?.click()} role="button" tabIndex={0}>
                                    <Upload size={18} style={{ margin: '0 auto 6px' }} />
                                    {receiptFile ? receiptFile.name : <>Drop a photo or PDF, or <u>browse</u></>}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--fin-line)' }}>
                                <button type="submit" className="fin-btn pri" disabled={saving}>{saving ? 'Saving...' : 'Save expense'}</button>
                                <button type="button" className="fin-btn" disabled={saving} onClick={(e) => handleSave(e, true)}>Save and add another</button>
                                <div className="fin-sp" />
                                <button type="button" className="fin-btn" style={{ border: 'none' }} onClick={() => navigate('/admin/accounting')}>Cancel</button>
                            </div>
                        </form>
                    </div>

                    <div>
                        <div className="fin-card fin-mb">
                            <div className="fin-ch"><div><h3>Effect on this month</h3></div></div>
                            <div className="fin-cb">
                                {monthTotalBefore === null ? (
                                    <div style={{ color: 'var(--fin-tx3)', fontSize: 13 }}>Loading current totals…</div>
                                ) : (
                                    <>
                                        <div className="fin-kv"><span className="fin-k">Total spend before</span><span className="fin-v">{money(monthTotalBefore)}</span></div>
                                        <div className="fin-kv"><span className="fin-k">This expense</span><span className="fin-v" style={{ color: 'var(--fin-neg)' }}>{signedMoney(-parsedAmount)}</span></div>
                                        {parsedVat > 0 && <div className="fin-kv"><span className="fin-k">VAT reclaimable</span><span className="fin-v" style={{ color: 'var(--fin-pos)' }}>+{money(parsedVat)}</span></div>}
                                        <div className="fin-kv tot"><span className="fin-k">Total spend after</span><span className="fin-v">{money(afterTotal)}</span></div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="fin-card fin-mb">
                            <div className="fin-ch"><div><h3>{categoryLabel}, last 6 months</h3></div></div>
                            <div className="fin-cb">
                                {trendLoading ? (
                                    <div style={{ color: 'var(--fin-tx3)', fontSize: 13, padding: '20px 0' }}>Loading trend…</div>
                                ) : trendValues.some((v) => v > 0) ? (
                                    <>
                                        <ColumnChart values={trendValues} labels={trendLabels} color="#0B7A55" />
                                        <div style={{ fontSize: 12, color: 'var(--fin-tx2)', marginTop: 10 }}>Averaging {money(trendAvg)} a month in this category.</div>
                                    </>
                                ) : (
                                    <div style={{ color: 'var(--fin-tx3)', fontSize: 13 }}>No recorded expenses in this category yet.</div>
                                )}
                            </div>
                        </div>

                        <div className="fin-note i">
                            <Info size={18} style={{ flex: 'none', marginTop: 1 }} />
                            <div>Costs marked as cost of goods sold are counted separately from operating cost in your Profit &amp; Loss statement.</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FinanceExpenseForm;
