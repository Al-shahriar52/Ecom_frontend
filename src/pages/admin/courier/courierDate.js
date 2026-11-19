// The backend sends LocalDateTime as an array [year, month, day, hour, minute, second, nano]
// (same as the rest of the admin: orders, finance, coupons). Plain `new Date(array)` gives "Invalid Date".
export const toDate = (v) => {
    if (!v) return null;
    if (Array.isArray(v)) {
        const [y, mo, d, h = 0, mi = 0, s = 0] = v;
        return new Date(y, mo - 1, d, h, mi, s);
    }
    const dt = new Date(v); // ISO string / timestamp
    return Number.isNaN(dt.getTime()) ? null : dt;
};

export const fmtDateTime = (v) => {
    const d = toDate(v);
    return d ? d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '\u2014';
};
