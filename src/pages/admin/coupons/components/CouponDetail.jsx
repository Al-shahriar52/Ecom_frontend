
import React, { useEffect, useState } from 'react';
import { couponService } from '../../../../services/couponService';

// --- UTILITIES ---

const parseDate = (d) => {
    if (!d) return null;
    if (Array.isArray(d)) {
        return new Date(d[0], d[1] - 1, d[2], d[3] || 0, d[4] || 0, d[5] || 0);
    }
    return new Date(d);
};

const ExpandableList = ({ items, prefix = '', defaultLabel = 'All' }) => {
    const [expanded, setExpanded] = useState(false);

    if (!items || items.length === 0) return <span>{defaultLabel}</span>;

    const formattedItems = items.map(item => `${prefix}${item}`.trim());

    if (formattedItems.length <= 2) {
        return <span>{formattedItems.join(', ')}</span>;
    }

    return (
        <span>
            {expanded ? formattedItems.join(', ') : formattedItems.slice(0, 2).join(', ')}
            <span
                onClick={() => setExpanded(!expanded)}
                style={{ marginLeft: 6, color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9em', userSelect: 'none' }}
            >
                {expanded ? ' - show less' : ` +${formattedItems.length - 2} more`}
            </span>
        </span>
    );
};

const generateCalendar = (rawStart, rawEnd, blackouts) => {
    const startDate = parseDate(rawStart);
    const endDate = parseDate(rawEnd);

    const baseDate = startDate || new Date();
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [
        { l: 'S', cls: 'hd' }, { l: 'M', cls: 'hd' }, { l: 'T', cls: 'hd' },
        { l: 'W', cls: 'hd' }, { l: 'T', cls: 'hd' }, { l: 'F', cls: 'hd' }, { l: 'S', cls: 'hd' }
    ];

    for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({ l: prevMonthDays - i, cls: 'off' });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dateObj = new Date(year, month, i);
        let cls = 'act';

        if (startDate && dateObj < new Date(year, month, startDate.getDate()).setHours(0, 0, 0, 0)) cls = 'off';
        if (endDate && dateObj > new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).setHours(23, 59, 59, 999)) cls = 'off';

        if (blackouts && blackouts.length > 0) {
            const isBlackout = blackouts.some(b => {
                if (!b.start || !b.end) return false;
                const bStart = new Date(b.start).setHours(0, 0, 0, 0);
                const bEnd = new Date(b.end).setHours(23, 59, 59, 999);
                return dateObj >= bStart && dateObj <= bEnd;
            });
            if (isBlackout) cls = 'blk';
        }

        cells.push({ l: i, cls });
    }

    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
        for (let i = 1; i <= remaining; i++) {
            cells.push({ l: i, cls: 'off' });
        }
    }
    return cells;
};

const formatCurrency = (val) => {
    if (!val) return '৳0';
    if (val >= 10000000) return `৳${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `৳${(val / 100000).toFixed(2)}L`;
    return `৳${val.toLocaleString()}`;
};


// --- MAIN COMPONENT ---

export default function DetailView({ couponId, coupon, chartRange, setChartRange, onEdit, onBack }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        if (couponId) {
            if (coupon) setData(coupon);
            setLoading(true);
            couponService.getCouponById(couponId)
                .then(res => setData(res))
                .catch(err => console.error('Failed to load coupon details', err))
                .finally(() => setLoading(false));
        } else if (coupon) {
            setData(coupon);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [couponId, coupon]);

    // --- ACTION HANDLERS ---

    const handleDuplicate = () => {
        if (!onEdit) return;
        const duplicatedCoupon = {
            ...data,
            id: null,
            code: `${data.code}_COPY`,
            internalName: `${data.internalName} (Copy)`,
            status: 'draft',
            statusLabel: 'Draft',
            // Reset statistics
            usageCount: 0, discountGiven: 0, revenueInfluenced: 0, newCustomers: 0,
            chartData: [], rejectionReasons: []
        };
        onEdit(duplicatedCoupon);
    };

    const handleToggleStatus = () => {
        if (!data.id) return;

        const isPaused = data.status === 'paused';
        const targetAction = isPaused ? 'resume' : 'pause';

        setStatusUpdating(true);

        // Matches the updated couponService signature
        couponService.performBulkAction(targetAction, [data.id])
            .then(() => {
                setData(prev => ({
                    ...prev,
                    status: targetAction === 'pause' ? 'paused' : 'live',
                    statusLabel: targetAction === 'pause' ? 'Paused' : 'Running'
                }));
            })
            .catch(err => {
                console.error(`Failed to ${targetAction} coupon`, err);
                alert(`Failed to change coupon status.`);
            })
            .finally(() => {
                setStatusUpdating(false);
            });
    };

    if (loading) return <div className="wrap" style={{ padding: '40px', textAlign: 'center' }}>Loading coupon details...</div>;
    if (!data) return <div className="wrap" style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Coupon data could not be found.</div>;

    const redemptionsUsed = data.usageCount || 0;
    const redemptionLimit = data.totalRedemptions || 0;
    const redemptionPct = redemptionLimit > 0 ? ((redemptionsUsed / redemptionLimit) * 100).toFixed(1) : 0;
    const discountGiven = data.discountGiven || 0;
    const revenueInfluenced = data.revenueInfluenced || 0;
    const newCustomers = data.newCustomers || 0;

    const DETAIL_METRICS = [
        { lbl: 'Redemptions', val: redemptionsUsed.toLocaleString(), delta: redemptionLimit > 0 ? <>of {redemptionLimit.toLocaleString()} limit · <b className="down">{redemptionPct}% used</b></> : 'Unlimited usage' },
        { lbl: 'Discount given', val: `৳${discountGiven.toLocaleString()}`, delta: redemptionsUsed > 0 ? `৳${(discountGiven / redemptionsUsed).toFixed(1)} average per order` : '৳0 average per order' },
        { lbl: 'Revenue influenced', val: formatCurrency(revenueInfluenced), delta: redemptionsUsed > 0 ? `৳${Math.round(revenueInfluenced / redemptionsUsed).toLocaleString()} average cart` : '৳0 average cart' },
        { lbl: 'New customers', val: newCustomers.toLocaleString(), delta: redemptionsUsed > 0 ? `${((newCustomers / redemptionsUsed) * 100).toFixed(1)}% of redemptions` : '0% of redemptions' },
    ];

    const getGivesText = () => {
        if (data.discountType === 'PERCENT') return `${data.discountValue || 0}% off${data.maxCap ? `, max ৳${data.maxCap}` : ''}`;
        if (data.discountType === 'FIXED') return `৳${data.discountValue || 0} off`;
        if (data.discountType === 'DELIVERY') return `Free Delivery`;
        return `Set price ৳${data.discountValue || 0}`;
    };

    const calendarCells = generateCalendar(data.startDate, data.endDate, data.blackouts);
    const calBaseDate = parseDate(data.startDate) || new Date();
    const calMonthName = calBaseDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const chartData = data.chartData || [];
    const rejectionReasons = data.rejectionReasons || [];

    const RuleLine = ({ label, value, condition }) => {
        if (!condition) return null;
        return (
            <div className="receipt-line">
                <span className="k">{label}</span>
                <span className="v" style={{ textAlign: 'right' }}>{value}</span>
            </div>
        );
    };

    return (
        <div className="wrap">
            <div className="detail-head">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <h1 className="h1 mono" style={{ letterSpacing: '.03em', margin: 0 }}>{data.code}</h1>
                        <span className={`pill p-${data.status || 'live'}`}>{data.statusLabel || data.status || 'Running'}</span>
                        <span className="tag">Type: {data.discountType}</span>
                        {data.publicCoupon && <span className="tag" style={{ background: '#e3f2fd', color: '#0d47a1' }}>Public</span>}
                        {data.stackCoupons && <span className="tag" style={{ background: '#f3e5f5', color: '#4a148c' }}>Stackable</span>}
                    </div>
                    <p className="sub">{data.checkoutMsg || data.internalName}</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button type="button" className="btn" onClick={handleDuplicate}>Duplicate</button>
                    <button
                        type="button"
                        className="btn"
                        onClick={handleToggleStatus}
                        disabled={statusUpdating || data.status === 'expired'}
                    >
                        {statusUpdating ? 'Updating...' : (data.status === 'paused' ? 'Resume' : 'Pause')}
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => onEdit && onEdit(data)}>Edit coupon</button>
                </div>
            </div>

            <div className="metrics">
                {DETAIL_METRICS.map((m) => (
                    <div className="metric" key={m.lbl}>
                        <div className="lbl">{m.lbl}</div>
                        <div className="val">{m.val}</div>
                        <div className="delta">{m.delta}</div>
                    </div>
                ))}
            </div>

            <div className="detail-grid">
                <div>
                    <div className="card chart">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: 14.5, fontWeight: 600 }}>Redemptions trends</div>
                                <div className="sub" style={{ fontSize: 12.5 }}>Real-time activity</div>
                            </div>
                            <div className="seg">
                                <button type="button" className={chartRange === 'daily' ? 'on' : ''} onClick={() => setChartRange('daily')}>Daily</button>
                                <button type="button" className={chartRange === 'weekly' ? 'on' : ''} onClick={() => setChartRange('weekly')}>Weekly</button>
                            </div>
                        </div>

                        {chartData.length > 0 ? (
                            <div className="chart-bars">
                                {chartData.map((b, i) => (
                                    <div key={i} style={{ height: `${b.outer}%` }}><i style={{ height: `${b.inner}%` }} /></div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                                No redemption graph data available yet.
                            </div>
                        )}
                        <div className="legend" style={{ marginTop: '16px' }}>
                            <span><i style={{ background: 'var(--primary)' }} />Redeemed</span>
                            <span><i style={{ background: 'var(--primary-wash)' }} />Applied but not checked out</span>
                        </div>
                    </div>

                    <div className="card panel" style={{ marginTop: 16 }}>
                        <h2 className="panel-h">Why the code was rejected</h2>
                        <p className="panel-s">Blocked attempts in recent history. Large numbers here usually mean the rule needs loosening.</p>
                        <table>
                            <thead><tr><th>Reason</th><th>Attempts</th><th>Share</th><th>Distinct customers</th></tr></thead>
                            <tbody>
                            {rejectionReasons.length > 0 ? (
                                rejectionReasons.map((r, i) => (
                                    <tr key={i}>
                                        <td>{r.reason}</td>
                                        <td className="num">{r.attempts}</td>
                                        <td><div className="bar" style={{ margin: 0 }}><i style={{ width: `${r.pct}%` }} /></div></td>
                                        <td className="num">{r.customers}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--muted)', fontSize: 13 }}>
                                        No rejection history recorded.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rail">
                    <div className="card cal">
                        <div className="rail-h">{calMonthName} schedule</div>
                        <div className="cal-grid">
                            {calendarCells.map((c, i) => (
                                <span key={i} className={c.cls}>{c.l}</span>
                            ))}
                        </div>
                        <div className="legend" style={{ fontSize: 11.5 }}>
                            <span><i style={{ background: 'var(--green-wash)', border: '1px solid #bfe0d2' }} />Active</span>
                            <span><i style={{ background: 'var(--red-wash)', border: '1px solid #f0d0ce' }} />Blackout</span>
                        </div>
                    </div>

                    <div className="card receipt">
                        <div className="rail-h">Rule Conditions</div>

                        <RuleLine label="Gives" value={getGivesText()} condition={true} />
                        <RuleLine label="Requires" value={`Cart ৳${data.minCartValue || 0}+`} condition={data.minCartValue > 0} />

                        {/* Render Transient Names From Database */}
                        <RuleLine label="Products" value={<ExpandableList items={data.targetProductNames} />} condition={data.targetProductNames?.length > 0} />
                        <RuleLine label="Categories" value={<ExpandableList items={data.targetCategoryNames} />} condition={data.targetCategoryNames?.length > 0} />
                        <RuleLine label="Sub-Categories" value={<ExpandableList items={data.targetSubCategoryNames} />} condition={data.targetSubCategoryNames?.length > 0} />
                        <RuleLine label="Brands" value={<ExpandableList items={data.targetBrandNames} />} condition={data.targetBrandNames?.length > 0} />

                        <RuleLine label="Cities" value={<ExpandableList items={data.targetCityNames} />} condition={data.targetCityNames?.length > 0} />
                        <RuleLine label="Areas" value={<ExpandableList items={data.targetAreaNames} />} condition={data.targetAreaNames?.length > 0} />

                        {/* Custom Audience Targets */}
                        <RuleLine label="Target Role" value={data.targetRole} condition={data.targetRole} />
                        <RuleLine label="Target Domain" value={data.targetDomain} condition={data.targetDomain} />
                        <RuleLine label="Target Email" value={data.targetEmail} condition={data.targetEmail} />
                        <RuleLine label="Target Phone" value={data.targetPhone} condition={data.targetPhone} />

                        <RuleLine label="Channels" value={data.channels?.join(', ')} condition={data.channels?.length > 0} />

                        {/* Limits Block */}
                        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
                            <RuleLine label="Per Customer" value={data.perCustomerLimit ? `${data.perCustomerLimit} uses` : 'Unlimited'} condition={true} />
                            <RuleLine label="Per Day" value={data.perDayLimit ? `${data.perDayLimit} uses` : 'Unlimited'} condition={true} />
                            <RuleLine label="Total Pool" value={data.totalRedemptions ? `${data.totalRedemptions} total` : 'Unlimited'} condition={true} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}