// Ported 1:1 from the original prototype's data so every view shows
// numbers that are internally consistent with each other.

export const GW = {
    bkash: { n: 'bKash', s: 'bK', bg: '#F3E3EA', fg: '#8A2C4E', fee: 1.85, pay: 'T+2' },
    nagad: { n: 'Nagad', s: 'Ng', bg: '#F6E7DE', fg: '#8A4520', fee: 1.99, pay: 'T+2' },
    rocket: { n: 'Rocket', s: 'Rk', bg: '#EAE5F2', fg: '#4A3B7A', fee: 1.80, pay: 'T+3' },
    card: { n: 'Card · SSLCommerz', s: 'SSL', bg: '#E4EDF5', fg: '#1B5788', fee: 2.75, pay: 'T+3' },
    bank: { n: 'Bank transfer', s: 'BT', bg: '#E4F2EC', fg: '#0B7A55', fee: 0, pay: 'Same day' },
    cod: { n: 'Cash on delivery', s: 'COD', bg: '#EDF1EF', fg: '#566A62', fee: 1.20, pay: 'On remit' },
};

export const TX = [
    { id: '#RD-24817', trx: 'BKA7X2M4Q', d: '29 Aug, 14:22', c: 'Nusrat Jahan', p: '01711 042 118', g: 'bkash', gr: 3240, st: 'settled', b: 'BK-0829-A' },
    { id: '#RD-24816', trx: 'SSL9920417', d: '29 Aug, 13:58', c: 'Tanvir Hasan', p: '01819 776 220', g: 'card', gr: 8750, st: 'await', b: '—' },
    { id: '#RD-24815', trx: '—', d: '29 Aug, 12:40', c: 'Rafiqul Islam', p: '01521 330 914', g: 'cod', gr: 2190, st: 'transit', b: '—' },
    { id: '#RD-24814', trx: 'NGD5512883', d: '29 Aug, 11:15', c: 'Sadia Afrin', p: '01911 208 447', g: 'nagad', gr: 1480, st: 'settled', b: 'NG-0829-C' },
    { id: '#RD-24813', trx: 'BKA7X1F8L', d: '29 Aug, 10:04', c: 'Mehedi Hasan', p: '01684 551 072', g: 'bkash', gr: 5620, st: 'unmatched', b: 'BK-0828-B' },
    { id: '#RD-24812', trx: 'BNK-CTB-4471', d: '28 Aug, 19:33', c: 'Farzana Rahman', p: '01755 619 388', g: 'bank', gr: 14200, st: 'settled', b: 'Direct' },
    { id: '#RD-24811', trx: 'RKT2209117', d: '28 Aug, 17:51', c: 'Imran Kabir', p: '01312 447 906', g: 'rocket', gr: 2860, st: 'await', b: '—' },
    { id: '#RD-24810', trx: 'SSL9920388', d: '28 Aug, 16:12', c: 'Shahana Begum', p: '01977 130 265', g: 'card', gr: 6340, st: 'refunded', b: 'BK-0828-B' },
    { id: '#RD-24809', trx: 'BKA7W9K2D', d: '28 Aug, 15:40', c: 'Arif Chowdhury', p: '01611 882 543', g: 'bkash', gr: 1990, st: 'settled', b: 'BK-0828-B' },
    { id: '#RD-24808', trx: '—', d: '28 Aug, 14:07', c: 'Rumana Akter', p: '01881 006 771', g: 'cod', gr: 3450, st: 'delivered', b: '—' },
    { id: '#RD-24807', trx: 'NGD5512701', d: '28 Aug, 12:26', c: 'Jahidul Haque', p: '01733 519 084', g: 'nagad', gr: 2740, st: 'settled', b: 'NG-0828-A' },
    { id: '#RD-24806', trx: 'SSL9920214', d: '28 Aug, 09:55', c: 'Tasnim Sultana', p: '01925 664 130', g: 'card', gr: 11480, st: 'failed', b: '—' },
];

export const ST = {
    settled: ['ok', 'Settled'], await: ['pend', 'Awaiting settlement'], unmatched: ['fail', 'Unmatched'],
    refunded: ['info', 'Refunded'], failed: ['fail', 'Failed'], transit: ['info', 'In transit'], delivered: ['pend', 'Delivered, unpaid'],
};
export const STS = { settled: 'Settled', await: 'Awaiting', unmatched: 'Unmatched', refunded: 'Refunded', failed: 'Failed', transit: 'In transit', delivered: 'Delivered' };

export const feeFor = (t) => (t.st === 'failed' ? 0 : Math.round(t.gr * GW[t.g].fee / 100));

export const WF = [
    { t: 'Gross sales', v: 2755400, c: 'var(--fin-pos)', p: '1,284 paid orders' },
    { t: 'Refunds & returns', v: -112300, c: '#C58A7A', p: '46 orders · 4.1%' },
    { t: 'Gateway fees', v: -52840, c: '#D8B4A6', p: 'blended 2.00%' },
    { t: 'Cost of goods', v: -1790100, c: '#B0654F', p: '65% of sales' },
    { t: 'Operating cost', v: -496200, c: 'var(--fin-neg)', p: 'ads, courier, rent, salary' },
    { t: 'Net profit', v: 303960, c: 'var(--fin-brand-dark)', p: '11.0% net margin' },
];

export const SERIES = {
    week: {
        lab: ['W22', 'W23', 'W24', 'W25', 'W26', 'W27', 'W28', 'W29', 'W30', 'W31', 'W32', 'W33'],
        rev: [512, 468, 596, 541, 625, 588, 712, 668, 702, 843, 818, 776],
        cost: [481, 444, 550, 528, 572, 544, 641, 606, 640, 746, 734, 708],
    },
    month: {
        lab: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        rev: [1840, 1962, 2210, 2648, 1988, 2104, 2386, 2892, 2540, 2318, 2412, 2755],
        cost: [1665, 1776, 2000, 2380, 1810, 1915, 2160, 2590, 2300, 2118, 2217, 2451],
    },
};

export const GWMIX = [
    { n: 'bKash', v: 1109100, c: '#8A2C4E', s: '541 orders' },
    { n: 'Cash on delivery', v: 634300, c: '#566A62', s: '298 orders' },
    { n: 'Card · SSLCommerz', v: 449300, c: '#1B5788', s: '182 orders' },
    { n: 'Nagad', v: 290700, c: '#8A4520', s: '161 orders' },
    { n: 'Bank transfer', v: 105700, c: '#0B7A55', s: '42 orders' },
    { n: 'Rocket', v: 54000, c: '#4A3B7A', s: '60 orders' },
];

export const COSTMIX = [
    { n: 'Stock purchase', v: 1790100, c: '#0B7A55' },
    { n: 'Advertising', v: 164200, c: 'var(--fin-neg)' },
    { n: 'Courier & delivery', v: 86400, c: '#1B5788' },
    { n: 'Salaries', v: 142000, c: '#5C4B8A' },
    { n: 'Rent & utilities', v: 54850, c: '#8A6D3B' },
    { n: 'Packaging', v: 38900, c: '#8A5D06' },
    { n: 'Software', v: 9850, c: '#2F7D8A' },
];

export const SPARKS = {
    collected: { data: [62, 55, 71, 58, 66, 74, 80, 72, 85, 79, 88, 96], color: 'var(--fin-pos)' },
    awaiting: { data: [30, 44, 38, 52, 49, 61, 55, 68, 62, 74, 70, 82], color: 'var(--fin-warn)' },
    codPending: { data: [80, 74, 78, 66, 70, 58, 62, 54, 49, 52, 44, 38], color: 'var(--fin-info)' },
    opCost: { data: [40, 46, 44, 52, 58, 55, 64, 68, 66, 74, 78, 84], color: 'var(--fin-neg)' },
};

export const gwLabel = (k) => GW[k].n.split(' · ')[0];

export const CODMIX = [
    { n: 'Steadfast', v: 412800, c: '#0B7A55', s: '68 parcels' },
    { n: 'Pathao', v: 198400, c: '#1B5788', s: '31 parcels' },
    { n: 'RedX', v: 71600, c: '#8A5D06', s: '11 parcels' },
];

export const PLMIX = [
    { n: 'Cost of goods', v: 65.0, c: '#B0654F' },
    { n: 'Salaries, rent & software', v: 7.6, c: '#5C4B8A' },
    { n: 'Advertising', v: 6.0, c: 'var(--fin-neg)' },
    { n: 'Courier & packaging', v: 4.5, c: '#1B5788' },
    { n: 'Refunds', v: 4.1, c: '#C58A7A' },
    { n: 'Gateway fees', v: 1.9, c: '#D8B4A6' },
    { n: 'Kept as profit', v: 10.9, c: 'var(--fin-brand-dark)' },
];

export const EXP = [
    { d: '29 Aug', c: 'Stock purchase', v: 'Chattogram Textile Mills', r: 'INV-CTM-2214', s: 'City Bank ····8841', vat: 6480, a: 86400, rc: 1 },
    { d: '28 Aug', c: 'Advertising', v: 'Meta Platforms Ireland', r: 'AD-8827194', s: 'Card ····4412', vat: 0, a: 42600, rc: 1 },
    { d: '27 Aug', c: 'Courier & delivery', v: 'Steadfast Courier Ltd', r: 'SF-AUG-W4', s: 'bKash merchant', vat: 0, a: 18740, rc: 1 },
    { d: '26 Aug', c: 'Packaging', v: 'Bashundhara Paper Mills', r: 'BPM-9917', s: 'City Bank ····8841', vat: 1120, a: 14930, rc: 1 },
    { d: '25 Aug', c: 'Stock purchase', v: 'Narayanganj Knitwear', r: 'NK-4402', s: 'City Bank ····8841', vat: 9840, a: 131200, rc: 1 },
    { d: '24 Aug', c: 'Advertising', v: 'TikTok Ads', r: 'TT-559012', s: 'Card ····4412', vat: 0, a: 21400, rc: 0 },
    { d: '22 Aug', c: 'Software', v: 'Shopify + apps', r: 'SHP-AUG', s: 'Card ····4412', vat: 0, a: 9850, rc: 1 },
    { d: '20 Aug', c: 'Rent & utilities', v: 'Mirpur DOHS warehouse', r: 'RENT-AUG', s: 'City Bank ····8841', vat: 0, a: 45000, rc: 1 },
    { d: '18 Aug', c: 'Courier & delivery', v: 'Pathao Courier', r: 'PT-AUG-W3', s: 'Nagad merchant', vat: 0, a: 12280, rc: 0 },
    { d: '15 Aug', c: 'Salaries', v: 'Payroll — 6 staff', r: 'PR-2608', s: 'bKash disbursement', vat: 0, a: 142000, rc: 1 },
];

export const CATC = {
    'Stock purchase': '#0B7A55', 'Advertising': 'var(--fin-neg)', 'Courier & delivery': '#1B5788',
    'Packaging': '#8A5D06', 'Salaries': '#5C4B8A', 'Rent & utilities': '#8A6D3B', 'Software': '#2F7D8A', 'Other': '#8A9A93',
};

export const REP = [
    { p: 'Week 33 · 25–31 Aug', o: 342, gs: 776400, rf: -28900, fe: -14820, cg: -504700, op: -159080, net: 68900 },
    { p: 'Week 32 · 18–24 Aug', o: 358, gs: 818200, rf: -31400, fe: -15640, cg: -531800, op: -154660, net: 84700 },
    { p: 'Week 31 · 11–17 Aug', o: 371, gs: 842900, rf: -34100, fe: -16180, cg: -547800, op: -148420, net: 96400 },
    { p: 'Week 30 · 4–10 Aug', o: 318, gs: 702300, rf: -26800, fe: -13440, cg: -456400, op: -143660, net: 62000 },
    { p: 'Week 29 · 28 Jul–3 Aug', o: 296, gs: 668100, rf: -24200, fe: -12780, cg: -434200, op: -135020, net: 61900 },
    { p: 'Week 28 · 21–27 Jul', o: 312, gs: 712400, rf: -27600, fe: -13620, cg: -463100, op: -136480, net: 71600 },
    { p: 'Week 27 · 14–20 Jul', o: 271, gs: 588200, rf: -22400, fe: -11280, cg: -382300, op: -128120, net: 44100 },
    { p: 'Week 26 · 7–13 Jul', o: 284, gs: 624700, rf: -25100, fe: -11940, cg: -406100, op: -129260, net: 52300 },
    { p: 'Week 25 · 30 Jun–6 Jul', o: 246, gs: 541300, rf: -21800, fe: -10440, cg: -351800, op: -144360, net: 12900 },
    { p: 'Week 24 · 23–29 Jun', o: 268, gs: 596400, rf: -23600, fe: -11480, cg: -387700, op: -126820, net: 46800 },
    { p: 'Week 23 · 16–22 Jun', o: 214, gs: 468200, rf: -18900, fe: -9040, cg: -304300, op: -111360, net: 24600 },
    { p: 'Week 22 · 9–15 Jun', o: 232, gs: 512100, rf: -20600, fe: -9860, cg: -332800, op: -117440, net: 31400 },
];

export const SET = [
    { b: 'BK-0829-A', g: 'bkash', p: '27–28 Aug', n: 131, e: 268400, r: 268400, a: '30 Aug · received', ok: 1 },
    { b: 'NG-0829-C', g: 'nagad', p: '27–28 Aug', n: 44, e: 78400, r: 78400, a: '30 Aug · received', ok: 1 },
    { b: 'BK-0828-B', g: 'bkash', p: '25–26 Aug', n: 124, e: 251300, r: 250705, a: '29 Aug · received', ok: 0 },
    { b: 'SSL-0828', g: 'card', p: '24–26 Aug', n: 61, e: 148600, r: 148600, a: '29 Aug · received', ok: 1 },
    { b: 'BK-0826-A', g: 'bkash', p: '23–24 Aug', n: 115, e: 232700, r: 232288, a: '27 Aug · received', ok: 0 },
    { b: 'NG-0826-B', g: 'nagad', p: '23–24 Aug', n: 38, e: 68200, r: 67892, a: '27 Aug · received', ok: 0 },
    { b: 'BK-0830-C', g: 'bkash', p: '29–30 Aug', n: 106, e: 214600, r: null, a: '2 Sep · expected', ok: 2 },
    { b: 'SSL-0830', g: 'card', p: '27–29 Aug', n: 54, e: 132400, r: null, a: '3 Sep · expected', ok: 2 },
];

export const COD = [
    { c: 'SF-7742019', k: 'Steadfast', n: 'Rafiqul Islam', v: 2190, f: 65, s: 'transit' },
    { c: 'SF-7742018', k: 'Steadfast', n: 'Rumana Akter', v: 3450, f: 65, s: 'delivered' },
    { c: 'PT-2280441', k: 'Pathao', n: 'Kamrul Hasan', v: 1780, f: 70, s: 'transit' },
    { c: 'SF-7741987', k: 'Steadfast', n: 'Nazma Begum', v: 4120, f: 75, s: 'delivered' },
    { c: 'RX-5590112', k: 'RedX', n: 'Sohel Rana', v: 2640, f: 60, s: 'returned' },
    { c: 'PT-2280398', k: 'Pathao', n: 'Shirin Akhter', v: 5310, f: 80, s: 'remitted' },
    { c: 'SF-7741902', k: 'Steadfast', n: 'Abdul Karim', v: 1960, f: 65, s: 'returned' },
    { c: 'PT-2280377', k: 'Pathao', n: 'Habiba Sultana', v: 3880, f: 70, s: 'remitted' },
];
export const CODS = { transit: ['info', 'Out for delivery'], delivered: ['pend', 'Delivered, unpaid'], returned: ['fail', 'Returned'], remitted: ['ok', 'Cash received'] };

export const PL = [
    { l: 'Gross sales', a: 2755400, j: 2251800, b: 1, s: 100 },
    { l: 'Less returns & refunds', a: -112300, j: -96400, s: 4.1 },
    { l: 'Net sales', a: 2643100, j: 2155400, b: 1, s: 95.9, hi: 1 },
    { l: 'Cost of goods sold', a: -1790100, j: -1462700, s: 65.0 },
    { l: 'Gross profit', a: 853000, j: 692700, b: 1, s: 31.0, hi: 1 },
    { l: 'Advertising', a: -164200, j: -139100, s: 6.0 },
    { l: 'Courier & delivery', a: -86400, j: -74800, s: 3.1 },
    { l: 'Packaging', a: -38900, j: -33200, s: 1.4 },
    { l: 'Salaries', a: -142000, j: -142000, s: 5.2 },
    { l: 'Rent & utilities', a: -54850, j: -54850, s: 2.0 },
    { l: 'Software & subscriptions', a: -9850, j: -9850, s: 0.4 },
    { l: 'Gateway fees', a: -52840, j: -43600, s: 1.9 },
    { l: 'Total operating cost', a: -549040, j: -497400, b: 1, s: 19.9, hi: 1 },
    { l: 'Net profit', a: 303960, j: 195300, b: 1, s: 11.0, hi: 2 },
];
