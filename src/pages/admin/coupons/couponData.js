export const COUPON_ROWS = [
    {
        id: 'FREEDEL1ST',
        code: 'FREEDEL1ST',
        meta: 'First order free delivery',
        ruleTitle: 'Free delivery',
        ruleCond: 'no minimum',
        tags: ['All products', 'All cities'],
        scheduleTop: 'Always on',
        scheduleSub: 'No end date',
        usage: '6,204',
        usagePct: 62,
        usageWarn: false,
        status: 'live',
        statusLabel: 'Running',
    },
    {
        id: 'SAVE10',
        code: 'SAVE10',
        meta: 'Cart value booster',
        ruleTitle: '10% off, max ৳100',
        ruleCond: 'cart ৳5,000+',
        tags: ['All products', 'All cities'],
        scheduleTop: '1 Aug – 31 Aug',
        scheduleSub: 'Ends in 13 days',
        scheduleWarn: true,
        usage: '4,880 / 5,000',
        usagePct: 97,
        usageWarn: true,
        status: 'live',
        statusLabel: 'Running',
    },
    {
        id: 'NEXT100',
        code: 'NEXT100',
        meta: 'Spend ৳5,000, unlock ৳100 item',
        ruleTitle: 'Any item for ৳100',
        ruleCond: 'auto-issued after ৳5,000 spent',
        tags: [{ label: 'Reward coupon', v: true }, 'Curated list · 240'],
        scheduleTop: 'Rolling',
        scheduleSub: 'Valid 30d from issue',
        usage: '912 issued',
        usagePct: 34,
        usageWarn: false,
        status: 'live',
        statusLabel: 'Running',
    },
];

export const STATUS_PILL_CLASS = {
    live: 'p-live',
    sched: 'p-sched',
    paused: 'p-paused',
    draft: 'p-draft',
    expired: 'p-expired',
};

export const STATUS_TABS = [
    { key: 'all', label: 'All 47' },
    { key: 'live', label: 'Running 12' },
    { key: 'sched', label: 'Scheduled 5' },
    { key: 'paused', label: 'Paused 3' },
    { key: 'draft', label: 'Drafts 9' },
];

export const METRICS = [
    { lbl: 'Redemptions · 30d', val: '18,412', delta: '▲ 12.4% vs previous 30 days', spark: [40, 55, 38, 62, 71, 58, 88] },
    { lbl: 'Discount given', val: '৳9.4L', delta: '▲ 8.1% · ৳51 average per order', spark: [52, 44, 60, 49, 66, 73, 80] },
    { lbl: 'Revenue influenced', val: '৳2.1Cr', delta: '22.4× return on discount spend', spark: [35, 48, 56, 52, 69, 64, 78] },
    { lbl: 'Blocked attempts', val: '1,027', delta: '▼ 3.2% · mostly expired codes', spark: [72, 60, 66, 48, 41, 38, 33] },
];

export function fmt(n) {
    const x = String(n).replace(/[^\d]/g, '');
    if (!x) return '0';
    const last3 = x.slice(-3);
    const rest = x.slice(0, -3);
    return rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3;
}