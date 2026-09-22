// BDT currency formatting helpers, mirroring the original prototype's
// T / nf / nf2 / m / m2 / sgn helpers exactly.
const T = '৳';
const nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// e.g. ৳3,03,960
export const money = (v) => T + nf.format(Math.round(v));

// e.g. ৳3,03,960.00
export const money2 = (v) => T + nf2.format(v);

// Signed money, with a minus sign for negatives: e.g. −৳86,400
export const signedMoney = (v) => (v < 0 ? '−' : '') + T + nf.format(Math.abs(Math.round(v)));

export const CURRENCY_SYMBOL = T;
