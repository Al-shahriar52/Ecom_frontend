import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, Eye, Copy, PauseCircle, PlayCircle, Trash2, Download } from 'lucide-react';
import { STATUS_PILL_CLASS, STATUS_TABS, METRICS } from '../couponData';

export default function CouponList({
                                       rows, setRows, searchQuery, statusTab, setStatusTab,
                                       selectedType, setSelectedType, selectedCity, setSelectedCity,
                                       sortBy, setSortBy, endingSoonActive, setEndingSoonActive,
                                       onNewCoupon, onOpenRow
                                   }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Close action menu on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
        }
        if (openMenuId) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenuId]);

    // Filter and Sort Logic
    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            // Search query filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchCode = row.code.toLowerCase().includes(query);
                const matchMeta = row.meta.toLowerCase().includes(query);
                const matchRule = row.ruleTitle && row.ruleTitle.toLowerCase().includes(query);
                if (!matchCode && !matchMeta && !matchRule) return false;
            }

            // Status tab filter
            if (statusTab !== 'all' && row.status !== statusTab) {
                return false;
            }

            // Ending soon filter toggle
            if (endingSoonActive && !row.scheduleWarn) {
                return false;
            }

            // Type filter
            if (selectedType !== 'all') {
                const isMatch = row.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(selectedType.toLowerCase()));
                if (!isMatch) return false;
            }

            // City filter
            if (selectedCity !== 'all') {
                const isCityMatch = row.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(selectedCity.toLowerCase()));
                if (!isCityMatch) return false;
            }

            return true;
        }).sort((a, b) => {
            if (sortBy === 'code') return a.code.localeCompare(b.code);
            return 0; // default recent order
        });
    }, [rows, searchQuery, statusTab, endingSoonActive, selectedType, selectedCity, sortBy]);

    // Pagination calculations based on filtered results
    const totalFiltered = filteredRows.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

    // Reset to page 1 if current page exceeds total pages
    useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [totalPages, page]);

    const paginatedRows = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredRows.slice(start, start + pageSize);
    }, [filteredRows, page, pageSize]);

    const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
    const rangeEnd = Math.min(page * pageSize, totalFiltered);

    function getVisiblePages() {
        const pages = [];
        if (totalPages <= 6) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }
        const left = Math.max(2, page - 1);
        const right = Math.min(totalPages - 1, page + 1);
        pages.push(1);
        if (left > 2) pages.push('...');
        for (let i = left; i <= right; i++) pages.push(i);
        if (right < totalPages - 1) pages.push('...');
        pages.push(totalPages);
        return pages;
    }

    function handleSelectAll(e) {
        if (e.target.checked) {
            setSelectedIds(paginatedRows.map((r) => r.id));
        } else {
            setSelectedIds([]);
        }
    }

    function handleSelectRow(e, id) {
        e.stopPropagation();
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    }

    function handleBulkPause() {
        setRows((r) => r.map((x) => selectedIds.includes(x.id) ? { ...x, status: 'paused', statusLabel: 'Paused' } : x));
        setSelectedIds([]);
    }

    function handleBulkResume() {
        setRows((r) => r.map((x) => selectedIds.includes(x.id) ? { ...x, status: 'live', statusLabel: 'Running' } : x));
        setSelectedIds([]);
    }

    function handleBulkDelete() {
        setRows((r) => r.filter((x) => !selectedIds.includes(x.id)));
        setSelectedIds([]);
    }

    function handleBulkExport() {
        const selectedData = rows.filter(r => selectedIds.includes(r.id));
        const csvContent = "data:text/csv;charset=utf-8," +
            ["Code,Meta,Rule,Status,Usage"].join(",") + "\n" +
            selectedData.map(e => `"${e.code}","${e.meta}","${e.ruleTitle || ''}","${e.statusLabel}","${e.usage}"`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "selected_coupons.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function handleDuplicate(row) {
        const copy = { ...row, id: `${row.id}-COPY-${Date.now()}`, code: `${row.code}COPY`, statusLabel: 'Draft', status: 'draft' };
        setRows((r) => {
            const idx = r.findIndex((x) => x.id === row.id);
            const next = [...r];
            next.splice(idx + 1, 0, copy);
            return next;
        });
        setOpenMenuId(null);
    }

    function handleTogglePause(row) {
        setRows((r) => r.map((x) => {
            if (x.id !== row.id) return x;
            const paused = x.status === 'paused';
            return { ...x, status: paused ? 'live' : 'paused', statusLabel: paused ? 'Running' : 'Paused' };
        }));
        setOpenMenuId(null);
    }

    function handleDelete(row) {
        setRows((r) => r.filter((x) => x.id !== row.id));
        setOpenMenuId(null);
    }

    const allVisibleSelected = paginatedRows.length > 0 && paginatedRows.every((r) => selectedIds.includes(r.id));

    // Dynamic tab counts calculation
    const counts = useMemo(() => {
        return {
            all: rows.length,
            live: rows.filter(r => r.status === 'live').length,
            sched: rows.filter(r => r.status === 'sched').length,
            paused: rows.filter(r => r.status === 'paused').length,
            draft: rows.filter(r => r.status === 'draft').length,
        };
    }, [rows]);

    return (
        <div className="wrap">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
                <div>
                    <h1 className="h1">Coupons</h1>
                    <p className="sub">Discount rules customers can apply at checkout. {counts.live} running now.</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button type="button" className="btn btn-primary" onClick={onNewCoupon}>＋ New coupon</button>
                </div>
            </div>

            <div className="metrics">
                {METRICS.map((m) => (
                    <div className="metric" key={m.lbl}>
                        <div className="lbl">{m.lbl}</div>
                        <div className="val">{m.val}</div>
                        <div className="delta">{m.delta}</div>
                        <div className="spark">
                            {m.spark.map((h, i) => (
                                <i key={i} className={i === m.spark.length - 1 ? 'hi' : ''} style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="card">
                <div className="toolbar">
                    <div className="seg">
                        {STATUS_TABS.map((t) => (
                            <button key={t.key} type="button" className={statusTab === t.key ? 'on' : ''} onClick={() => setStatusTab(t.key)}>
                                {t.label.split(' ')[0]} {counts[t.key] !== undefined ? counts[t.key] : ''}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <select
                            className="filter"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            style={{ border: 'none', background: '#fff', outline: 'none' }}
                        >
                            <option value="all">Type: Any</option>
                            <option value="products">Products</option>
                            <option value="delivery">Delivery</option>
                            <option value="grocery">Grocery</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <select
                            className="filter"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            style={{ border: 'none', background: '#fff', outline: 'none' }}
                        >
                            <option value="all">City: Any</option>
                            <option value="dhaka">Dhaka</option>
                            <option value="chattogram">Chattogram</option>
                            <option value="gazipur">Gazipur</option>
                        </select>
                    </div>

                    {endingSoonActive && (
                        <span className="filter active">
                            Ends within <b>7 days</b>{' '}
                            <span className="x" style={{ cursor: 'pointer' }} onClick={() => setEndingSoonActive(false)}>✕</span>
                        </span>
                    )}

                    <select
                        className="btn btn-sm"
                        style={{ marginLeft: 'auto', background: '#fff' }}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="recent">Sort: Recently edited</option>
                        <option value="code">Sort: Code (A-Z)</option>
                    </select>
                </div>

                {selectedIds.length > 0 && (
                    <div style={{ padding: '12px 16px 0 16px', background: '#F8F9FB' }}>
                        <div className="bulk-toolbar">
                            <span><b>{selectedIds.length}</b> coupons selected</span>
                            <div className="bulk-actions">
                                <button type="button" className="btn-dark-action" onClick={handleBulkExport}>
                                    <Download size={14} /> Export CSV
                                </button>
                                <button type="button" className="btn-dark-action" onClick={handleBulkResume}>
                                    <PlayCircle size={14} /> Resume
                                </button>
                                <button type="button" className="btn-dark-action" onClick={handleBulkPause}>
                                    <PauseCircle size={14} /> Pause
                                </button>
                                <button type="button" className="btn-dark-action danger" onClick={handleBulkDelete}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <table>
                    <thead>
                    <tr>
                        <th style={{ width: 32 }}>
                            <input
                                type="checkbox"
                                aria-label="Select all"
                                checked={allVisibleSelected}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th>Code</th>
                        <th>Rule</th>
                        <th>Applies to</th>
                        <th>Schedule</th>
                        <th>Usage</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedRows.length === 0 ? (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                                No coupons found matching your filters.
                            </td>
                        </tr>
                    ) : (
                        paginatedRows.map((row) => {
                            const isSelected = selectedIds.includes(row.id);
                            return (
                                <tr
                                    key={row.id}
                                    style={{ cursor: 'pointer', background: isSelected ? 'var(--bh-pink-soft)' : undefined }}
                                    onClick={(e) => {
                                        if (e.target.closest('input,button')) return;
                                        onOpenRow(row);
                                    }}
                                >
                                    <td>
                                        <input
                                            type="checkbox"
                                            aria-label="Select"
                                            checked={isSelected}
                                            onChange={(e) => handleSelectRow(e, row.id)}
                                        />
                                    </td>
                                    <td>
                                        <div className="code">{row.code} <span className="copy">⧉</span></div>
                                        <div className="cmeta">{row.meta}</div>
                                    </td>
                                    <td className="rule">
                                        {row.ruleTitle ? <><b>{row.ruleTitle}</b> <span className="cond">— {row.ruleCond}</span></> : <span className="cond">{row.ruleCond}</span>}
                                    </td>
                                    <td>
                                        {row.tags.map((t, i) =>
                                            typeof t === 'string'
                                                ? <span className="tag" key={i}>{t}</span>
                                                : <span className="tag-v tag" key={i}>{t.label}</span>
                                        )}
                                    </td>
                                    <td className="num" style={{ fontSize: 12 }}>
                                        {row.scheduleTop}
                                        {row.scheduleSub && (
                                            <div className="cmeta" style={row.scheduleWarn ? { color: 'var(--amber)' } : undefined}>{row.scheduleSub}</div>
                                        )}
                                    </td>
                                    <td>
                                        <span className="num" style={{ fontSize: 12.5 }}>{row.usage}</span>
                                        {row.usagePct > 0 && (
                                            <div className="bar"><i className={row.usageWarn ? 'warn' : ''} style={{ width: `${row.usagePct}%` }} /></div>
                                        )}
                                    </td>
                                    <td><span className={`pill ${STATUS_PILL_CLASS[row.status]}`}>{row.statusLabel}</span></td>
                                    <td className="row-actions">
                                        <div className="um-row-menu" ref={openMenuId === row.id ? menuRef : null}>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-ghost"
                                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === row.id ? null : row.id); }}
                                                aria-haspopup="true"
                                                aria-expanded={openMenuId === row.id}
                                            >
                                                <MoreHorizontal size={16} />
                                            </button>
                                            {openMenuId === row.id && (
                                                <div className="um-row-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                                                    <button type="button" onClick={() => { setOpenMenuId(null); onOpenRow(row); }}>
                                                        <Eye size={14} /> View details
                                                    </button>
                                                    <button type="button" onClick={() => handleDuplicate(row)}>
                                                        <Copy size={14} /> Duplicate
                                                    </button>
                                                    <button type="button" onClick={() => { setOpenMenuId(null); handleTogglePause(row); }}>
                                                        {row.status === 'paused' ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                                                        {row.status === 'paused' ? 'Resume' : 'Pause'}
                                                    </button>
                                                    <button type="button" className="is-danger" onClick={() => { setOpenMenuId(null); handleDelete(row); }}>
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>

                <div className="um-pagination">
                    <div className="um-pagination-info">
                        <div className="um-pagination-size">
                            <span className="um-text-muted um-pagination-size-label">Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="um-pagination-select"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <span className="um-text-muted um-pagination-summary">
                            Showing {rangeStart} to {rangeEnd} of <strong>{totalFiltered}</strong> coupons
                        </span>
                    </div>

                    <div className="um-pagination-controls">
                        <button
                            type="button"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="um-pagination-btn um-pagination-btn--icon"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {getVisiblePages().map((p, index) => (
                            <button
                                type="button"
                                key={index}
                                onClick={() => p !== '...' && setPage(p)}
                                disabled={p === '...'}
                                className={`um-pagination-btn ${p === page ? 'is-active' : ''} ${p === '...' ? 'is-ellipsis' : ''}`}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            type="button"
                            disabled={page === totalPages || totalPages === 0}
                            onClick={() => setPage((p) => p + 1)}
                            className="um-pagination-btn um-pagination-btn--icon"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}