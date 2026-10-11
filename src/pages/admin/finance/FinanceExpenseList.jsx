import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, ChevronDown } from './financeIcons';
import { money, signedMoney } from './financeUtils';
import { fetchExpenses, fetchExpenseSummary } from './financeApi';
import DateRangeBar, { presetRange, rangeLabel } from './DateRangeBar';

const CATC = {
    STOCK_PURCHASE: '#0B7A55', ADVERTISING: 'var(--fin-neg)', COURIER_DELIVERY: '#1B5788',
    PACKAGING: '#8A5D06', SALARIES: '#5C4B8A', RENT_UTILITIES: '#8A6D3B', SOFTWARE: '#2F7D8A', OTHER: '#8A9A93',
};
const catLabel = (c) => (c || '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase());

const PAGE_SIZE = 50;

const FinanceExpenseList = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [receiptOnly, setReceiptOnly] = useState(false);
    const [rows, setRows] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const [range, setRange] = useState(presetRange('month'));
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const { start, end } = range;

    // A new period, category or search always starts from the first page.
    useEffect(() => { setPage(0); }, [start, end, category, search, receiptOnly]);

    useEffect(() => {
        fetchExpenseSummary(start, end).then(setSummary).catch(() => setSummary(null));
    }, [start, end]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchExpenses({ pageNo: page, pageSize: PAGE_SIZE, start, end, category: category || undefined, hasReceipt: receiptOnly || undefined, query: search || undefined })
            .then((pg) => {
                if (cancelled) return;
                setRows(pg.content || []);
                setTotalElements(pg.totalElements || 0);
                setTotalPages(pg.totalPages || 1);
            })
            .catch((err) => { console.error('Error fetching expenses:', err); if (!cancelled) setRows([]); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, receiptOnly, start, end, category, page]);

    const total = rows.reduce((sum, e) => sum + e.amount, 0);
    const vatTotal = rows.reduce((sum, e) => sum + (e.vatAmount || 0), 0);
    const grandTotal = summary?.grandTotal ?? 0;
    const cogsPct = grandTotal ? ((summary.categoryTotals.find((c) => c.category === 'STOCK_PURCHASE')?.total || 0) / grandTotal) * 100 : 0;

    const findCat = (key) => summary?.categoryTotals.find((c) => c.category === key)?.total || 0;

    return (
        <>
            <div className="fin-pbar">
                <div><div className="fin-h1">All expenses</div><div className="fin-sub">{rangeLabel(range)} · {totalElements} entries · {money(grandTotal)}</div></div>
                <div className="fin-sp" />
                <button className="fin-btn pri" onClick={() => navigate('/admin/accounting/expenses/new')}><Plus size={14} />Record a cost</button>
            </div>
            <div className="fin-wrap">
                <div className="fin-g4 fin-mb">
                    <div className="fin-tile"><div className="fin-k">Cost of goods sold</div><div className="fin-v">{money(findCat('STOCK_PURCHASE'))}</div><div className="fin-r"><span>{cogsPct.toFixed(1)}% of spend</span></div></div>
                    <div className="fin-tile"><div className="fin-k">Advertising</div><div className="fin-v">{money(findCat('ADVERTISING'))}</div><div className="fin-r"><span>{rangeLabel(range)}</span></div></div>
                    <div className="fin-tile"><div className="fin-k">Courier &amp; delivery</div><div className="fin-v">{money(findCat('COURIER_DELIVERY'))}</div><div className="fin-r"><span>{rangeLabel(range)}</span></div></div>
                    <div className="fin-tile"><div className="fin-k">Everything else</div><div className="fin-v">{money(grandTotal - findCat('STOCK_PURCHASE') - findCat('ADVERTISING') - findCat('COURIER_DELIVERY'))}</div><div className="fin-r"><span>rent, salary, software, packaging</span></div></div>
                </div>
                <div className="fin-mb"><DateRangeBar value={range} onChange={setRange} /></div>
                <div className="fin-card">
                    <div className="fin-tbar">
                        <div className="fin-search" style={{ width: 230, background: 'var(--fin-card)' }}>
                            <input placeholder="Vendor or reference" aria-label="Search expenses" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}
                                style={{ height: 30, border: '1px solid var(--fin-line-2)', borderRadius: 6, padding: '0 6px', background: 'var(--fin-card)' }}>
                            <option value="">All categories</option>
                            {Object.keys(CATC).map((c) => <option key={c} value={c}>{catLabel(c)}</option>)}
                        </select>
                        <button className={`fin-chip ${receiptOnly ? 'on' : ''}`} onClick={() => setReceiptOnly(!receiptOnly)}>
                            Has receipt {receiptOnly && <span className="fin-x">×</span>}
                        </button>
                        <div className="fin-sp" />
                        <button className="fin-btn sm" disabled title="Not built yet"><Download size={14} />Export</button>
                    </div>
                    <div className="fin-tw">
                        <table className="fin-table">
                            <thead><tr><th>Date</th><th>Category</th><th>Paid to</th><th>Reference</th><th>Paid from</th><th className="r">VAT</th><th className="r">Amount</th><th>Receipt</th></tr></thead>
                            <tbody>
                            {loading && (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--fin-tx3)' }}>Loading…</td></tr>
                            )}
                            {!loading && rows.length === 0 && (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--fin-tx3)' }}>No expenses found for this period and filters.</td></tr>
                            )}
                            {!loading && rows.map((e) => (
                                <tr key={e.id}>
                                    <td style={{ whiteSpace: 'nowrap' }}>{e.expenseDate}</td>
                                    <td><span className="fin-gw"><span style={{ width: 8, height: 8, borderRadius: 2, background: CATC[e.category], display: 'inline-block' }} />{catLabel(e.category)}</span></td>
                                    <td className="fin-cust" style={{ maxWidth: 180 }}>{e.vendor || '—'}</td>
                                    <td style={{ color: 'var(--fin-tx2)' }}>{e.reference || '—'}</td>
                                    <td style={{ color: 'var(--fin-tx2)', whiteSpace: 'nowrap' }}>{e.paidFrom || '—'}</td>
                                    <td className="r" style={{ color: 'var(--fin-tx2)' }}>{e.vatAmount ? money(e.vatAmount) : '—'}</td>
                                    <td className="r fin-money neg">{signedMoney(-e.amount)}</td>
                                    <td>
                                        {e.receiptUrl
                                            ? <a href={e.receiptUrl} target="_blank" rel="noreferrer" className="fin-pill ok np" style={{ textDecoration: 'none' }}>Attached</a>
                                            : <span className="fin-pill fail">Missing</span>}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                            {!loading && rows.length > 0 && (
                                <tfoot>
                                <tr>
                                    <td colSpan={5}>{rows.length} of {totalElements} entries on this page · page total</td>
                                    <td className="r">{money(vatTotal)}</td>
                                    <td className="r">{signedMoney(-total)}</td>
                                    <td></td>
                                </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="fin-tfoot">
                            <button className="fin-btn sm" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Previous</button>
                            <span style={{ margin: '0 10px' }}>Page {page + 1} of {totalPages}</span>
                            <button className="fin-btn sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FinanceExpenseList;
