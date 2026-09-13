
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, Eye, Copy, PauseCircle, PlayCircle, Trash2, Download } from 'lucide-react';
import { STATUS_PILL_CLASS, STATUS_TABS } from '../couponData';
import { couponService } from '../../../../services/couponService';
import toast from 'react-hot-toast';

export default function CouponList({
                                       searchQuery, statusTab, setStatusTab,
                                       selectedType, setSelectedType, selectedCity, setSelectedCity,
                                       sortBy, setSortBy, endingSoonActive, setEndingSoonActive,
                                       onNewCoupon, onOpenRow, onEditCoupon
                                   }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [counts, setCounts] = useState({ all: 0, live: 0, sched: 0, paused: 0, draft: 0 });
    const [stats, setStats] = useState({ totalCoupons: 0, runningCoupons: 0, pausedCoupons: 0, scheduledCoupons: 0, totalRedemptionsAllowed: 0 });
    const [citiesList, setCitiesList] = useState([]);

    const [selectedIds, setSelectedIds] = useState([]);
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Fetch stats helper so it can be re-triggered after mutations
    const fetchStats = useCallback(async () => {
        try {
            const res = await couponService.getCouponStats();
            setStats(res || {});
        } catch (err) {
            console.error('Failed to load coupon stats', err);
        }
    }, []);

    // Fetch cities and stats on mount
    useEffect(() => {
        couponService.getCities()
            .then(res => setCitiesList(res || []))
            .catch(err => console.error('Failed to load cities', err));

        fetchStats();
    }, [fetchStats]);

    const fetchCounts = useCallback(async () => {
        try {
            const [allRes, liveRes, schedRes, pausedRes, draftRes] = await Promise.all([
                couponService.getCoupons({ size: 1, status: 'all', search: searchQuery }),
                couponService.getCoupons({ size: 1, status: 'live', search: searchQuery }),
                couponService.getCoupons({ size: 1, status: 'sched', search: searchQuery }),
                couponService.getCoupons({ size: 1, status: 'paused', search: searchQuery }),
                couponService.getCoupons({ size: 1, status: 'draft', search: searchQuery })
            ]);
            setCounts({
                all: allRes.totalElements || allRes.data?.totalElements || 0,
                live: liveRes.totalElements || liveRes.data?.totalElements || 0,
                sched: schedRes.totalElements || schedRes.data?.totalElements || 0,
                paused: pausedRes.totalElements || pausedRes.data?.totalElements || 0,
                draft: draftRes.totalElements || draftRes.data?.totalElements || 0,
            });
        } catch (err) {
            console.error('Failed to load status counts', err);
        }
    }, [searchQuery]);

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const response = await couponService.getCoupons({
                page: page - 1,
                size: pageSize,
                status: statusTab,
                search: searchQuery,
                sortBy: sortBy
            });

            const pageData = response.content ? response : (response.data || {});
            let fetchedRows = pageData.content || [];

            if (selectedType !== 'all') {
                fetchedRows = fetchedRows.filter(r => r.discountType?.toLowerCase() === selectedType.toLowerCase());
            }
            if (selectedCity !== 'all') {
                fetchedRows = fetchedRows.filter(r => r.targetCityIds && r.targetCityIds.map(String).includes(String(selectedCity)));
            }

            setRows(fetchedRows);
            setTotalElements(pageData.totalElements || 0);
            setTotalPages(pageData.totalPages || 1);
            fetchCounts();
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, statusTab, searchQuery, sortBy, selectedType, selectedCity, fetchCounts]);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    // Close action menu on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
        }
        if (openMenuId) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenuId]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, statusTab, selectedType, selectedCity, sortBy]);

    const rangeStart = totalElements === 0 ? 0 : (page - 1) * pageSize + 1;
    const rangeEnd = Math.min(page * pageSize, totalElements);

    function formatDate(dateInput) {
        if (!dateInput) return '';
        let date;
        if (Array.isArray(dateInput)) {
            const [y, m, d, h = 0, min = 0] = dateInput;
            date = new Date(y, m - 1, d, h, min);
        } else {
            date = new Date(dateInput);
        }
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function formatAppliesTo(row) {
        const parts = [];
        if (row.targetCityIds && row.targetCityIds.length > 0) {
            parts.push(`${row.targetCityIds.length} ${row.targetCityIds.length === 1 ? 'City' : 'Cities'}`);
        }
        if (row.targetProductIds && row.targetProductIds.length > 0) {
            parts.push(`${row.targetProductIds.length} ${row.targetProductIds.length === 1 ? 'Product' : 'Products'}`);
        }
        if (row.targetCategoryIds && row.targetCategoryIds.length > 0) {
            parts.push(`${row.targetCategoryIds.length} ${row.targetCategoryIds.length === 1 ? 'Category' : 'Categories'}`);
        }
        if (row.targetBrandIds && row.targetBrandIds.length > 0) {
            parts.push(`${row.targetBrandIds.length} ${row.targetBrandIds.length === 1 ? 'Brand' : 'Brands'}`);
        }
        return parts.length > 0 ? parts.join(', ') : 'Global (All)';
    }

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
            setSelectedIds(rows.map((r) => r.id));
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

    // Updated bulk handlers to refresh both coupons list and top stats cards simultaneously
    async function handleBulkResume() {
        try {
            await couponService.performBulkAction('resume', selectedIds);
            toast.success('Coupons resumed successfully');
            setSelectedIds([]);
            fetchCoupons();
            fetchStats();
        } catch (err) {
            toast.error('Failed to resume coupons');
        }
    }

    async function handleBulkPause() {
        try {
            await couponService.performBulkAction('pause', selectedIds);
            toast.success('Coupons paused successfully');
            setSelectedIds([]);
            fetchCoupons();
            fetchStats();
        } catch (err) {
            toast.error('Failed to pause coupons');
        }
    }

    async function handleBulkDelete() {
        if (!window.confirm('Are you sure you want to delete selected coupons?')) return;
        try {
            await couponService.performBulkAction('delete', selectedIds);
            toast.success('Coupons deleted successfully');
            setSelectedIds([]);
            fetchCoupons();
            fetchStats();
        } catch (err) {
            toast.error('Failed to delete coupons');
        }
    }

    function handleBulkExport() {
        const selectedData = rows.filter(r => selectedIds.includes(r.id));

        const headers = [
            "Code",
            "Internal Name",
            "Checkout Message",
            "Discount Type",
            "Discount Value",
            "Min Cart Value",
            "Max Cap",
            "Eligibility",
            "Total Redemptions",
            "Per Customer Limit",
            "Start Date",
            "End Date",
            "Status"
        ];

        const csvRows = [headers.join(",")];

        selectedData.forEach(e => {
            const formattedStart = Array.isArray(e.startDate) ? e.startDate.join('-') : (e.startDate || '');
            const formattedEnd = e.noEndDate ? 'No end date' : (Array.isArray(e.endDate) ? e.endDate.join('-') : (e.endDate || ''));

            const rowValues = [
                `"${e.code || ''}"`,
                `"${(e.internalName || '').replace(/"/g, '""')}"`,
                `"${(e.checkoutMsg || '').replace(/"/g, '""')}"`,
                `"${e.discountType || ''}"`,
                e.discountValue ?? '',
                e.minCartValue ?? '',
                e.maxCap ?? '',
                `"${e.eligibility || ''}"`,
                e.totalRedemptions ?? 'Unlimited',
                e.perCustomerLimit ?? 'Unlimited',
                `"${formattedStart}"`,
                `"${formattedEnd}"`,
                `"${e.statusLabel || e.status || ''}"`
            ];
            csvRows.push(rowValues.join(","));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "comprehensive_coupons_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Functional duplicate handler that maps row data into the builder view
    function handleDuplicate(row) {
        setOpenMenuId(null);
        if (!onEditCoupon) return;

        const duplicatedCoupon = {
            ...row,
            id: null,
            code: `${row.code}_COPY`,
            internalName: `${row.internalName} (Copy)`,
            status: 'draft',
            statusLabel: 'Draft',
            usageCount: 0,
            discountGiven: 0,
            revenueInfluenced: 0,
            newCustomers: 0,
            chartData: [],
            rejectionReasons: []
        };

        onEditCoupon(duplicatedCoupon);
    }

    async function handleTogglePause(row) {
        try {
            const action = row.status === 'paused' ? 'resume' : 'pause';
            await couponService.performBulkAction(action, [row.id]);
            toast.success(`Coupon ${action}d successfully`);
            setOpenMenuId(null);
            fetchCoupons();
            fetchStats();
        } catch (err) {
            toast.error('Failed to update coupon status');
        }
    }

    async function handleDelete(row) {
        if (!window.confirm(`Delete coupon ${row.code}?`)) return;
        try {
            await couponService.performBulkAction('delete', [row.id]);
            toast.success('Coupon deleted successfully');
            setOpenMenuId(null);
            fetchCoupons();
            fetchStats();
        } catch (err) {
            toast.error('Failed to delete coupon');
        }
    }

    const allVisibleSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));

    // Dynamic metrics matching original card visual structure and sparklines
    const dynamicMetrics = useMemo(() => [
        {
            lbl: 'TOTAL COUPONS',
            val: stats.totalCoupons,
            delta: 'Active database records',
            spark: [40, 30, 45, 50, 60, 40, 75]
        },
        {
            lbl: 'RUNNING NOW',
            val: stats.runningCoupons,
            delta: `${stats.scheduledCoupons} scheduled`,
            spark: [30, 40, 35, 60, 55, 70, 85]
        },
        {
            lbl: 'PAUSED COUPONS',
            val: stats.pausedCoupons,
            delta: 'Inactive rule sets',
            spark: [50, 45, 60, 55, 70, 65, 90]
        },
        {
            lbl: 'REDEMPTION CAPACITY',
            val: stats.totalRedemptionsAllowed?.toLocaleString() || 0,
            delta: 'Max allowed uses',
            spark: [60, 50, 40, 30, 25, 20, 15]
        }
    ], [stats]);

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
                {dynamicMetrics.map((m) => (
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
                                {t.label.split(' ')[0]} {counts[t.key] !== undefined ? `(${counts[t.key]})` : ''}
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
                            <option value="PERCENT">Percentage</option>
                            <option value="FIXED">Fixed Amount</option>
                            <option value="DELIVERY">Delivery</option>
                            <option value="PRICE">Set Price</option>
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
                            {citiesList.map(city => (
                                <option key={city.id} value={city.id}>{city.name || city.cityName}</option>
                            ))}
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
                                <button type="button" className="btn-dark-action" onClick={handleBulkResume}>
                                    <PlayCircle size={14} /> Resume
                                </button>
                                <button type="button" className="btn-dark-action" onClick={handleBulkPause}>
                                    <PauseCircle size={14} /> Pause
                                </button>
                                <button type="button" className="btn-dark-action danger" onClick={handleBulkDelete}>
                                    <Trash2 size={14} /> Delete
                                </button>
                                <button type="button" className="btn-dark-action" onClick={handleBulkExport}>
                                    <Download size={14} /> Export CSV
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
                    {loading ? (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                                Loading coupons...
                            </td>
                        </tr>
                    ) : rows.length === 0 ? (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                                No coupons found matching your filters.
                            </td>
                        </tr>
                    ) : (
                        rows.map((row) => {
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
                                        <div className="cmeta">{row.internalName}</div>
                                    </td>
                                    <td className="rule">
                                        {row.discountType ? <><b>{row.discountType}</b> <span className="cond">— ৳{row.minCartValue || 0} min</span></> : <span>-</span>}
                                    </td>
                                    <td>
                                        {formatAppliesTo(row)}
                                    </td>
                                    <td className="num" style={{ fontSize: 12 }}>
                                        {row.startDate ? `${formatDate(row.startDate)} → ${row.noEndDate ? 'No end' : (row.endDate ? formatDate(row.endDate) : 'No end')}` : '-'}
                                    </td>
                                    <td>
                                        <span className="num" style={{ fontSize: 12.5 }}>{row.totalRedemptions || '∞'}</span>
                                    </td>
                                    <td><span className={`pill ${STATUS_PILL_CLASS[row.status] || 'p-draft'}`}>{row.statusLabel || row.status}</span></td>
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
                                                        <PauseCircle size={14} /> {row.status === 'paused' ? 'Resume' : 'Pause'}
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
                            Showing {rangeStart} to {rangeEnd} of <strong>{totalElements}</strong> coupons
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
