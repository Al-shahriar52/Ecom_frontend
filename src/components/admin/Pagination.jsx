import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

/** 1 ... 4 5 [6] 7 8 ... 20  (never more than 7 slots, so it fits any screen). */
const pagesToShow = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const out = [0];
    const from = Math.max(1, current - 1);
    const to = Math.min(total - 2, current + 1);
    if (from > 1) out.push('gap-l');
    for (let i = from; i <= to; i += 1) out.push(i);
    if (to < total - 2) out.push('gap-r');
    out.push(total - 1);
    return out;
};

/**
 * page is 0-based.
 * Desktop: numbered buttons. Phone: "Previous  Page 3 of 12  Next".
 */
export default function Pagination({ page, totalPages, totalElements, pageSize, onPage, onPageSize, sizes = [10, 20, 50] }) {
    if (totalPages < 1 && !totalElements) return null;
    const pages = Math.max(totalPages, 1);
    const from = totalElements ? page * pageSize + 1 : 0;
    const to = Math.min((page + 1) * pageSize, totalElements || 0);

    return (
        <nav className="pg" aria-label="Pagination">
            <div className="pg-info">
                {totalElements ? <>Showing <b>{from}-{to}</b> of <b>{totalElements}</b></> : 'No results'}
                {onPageSize && (
                    <label className="pg-size">
                        <span>Rows</span>
                        <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>
                            {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </label>
                )}
            </div>

            <div className="pg-ctrl">
                <button type="button" className="pg-btn pg-nav" onClick={() => onPage(page - 1)} disabled={page <= 0} aria-label="Previous page">
                    <ChevronLeft size={16} /><span>Previous</span>
                </button>

                <div className="pg-nums">
                    {pagesToShow(page, pages).map((p) => (typeof p === 'string'
                        ? <span key={p} className="pg-gap">...</span>
                        : <button type="button" key={p} className={`pg-btn pg-num ${p === page ? 'on' : ''}`} onClick={() => onPage(p)}
                                  aria-current={p === page ? 'page' : undefined} aria-label={`Page ${p + 1}`}>{p + 1}</button>))}
                </div>

                <span className="pg-compact">Page <b>{page + 1}</b> of {pages}</span>

                <button type="button" className="pg-btn pg-nav" onClick={() => onPage(page + 1)} disabled={page >= pages - 1} aria-label="Next page">
                    <span>Next</span><ChevronRight size={16} />
                </button>
            </div>
        </nav>
    );
}
