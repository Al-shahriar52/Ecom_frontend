import React from 'react';
import { money } from './financeUtils';

/** Small inline trend line, e.g. inside a metric tile. */
export const Sparkline = ({ data, color }) => {
    const mn = Math.min(...data);
    const mx = Math.max(...data);
    const r = mx - mn || 1;
    const pts = data.map((y, i) => [(i / (data.length - 1)) * 198 + 1, 27 - ((y - mn) / r) * 24]);
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');

    return (
        <svg className="fin-spark" viewBox="0 0 200 30" preserveAspectRatio="none" aria-hidden="true">
            <path d={`${line} L199 30 L1 30 Z`} fill={color} opacity="0.10" />
            <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
    );
};

/**
 * Grouped column chart: revenue vs cost bars (in hundreds of taka, matching
 * the original data scale) plus a smaller net-profit bar row underneath on
 * its own axis.
 */
export const RevenueCostChart = ({ series }) => {
    const W = 720, L = 54, R = 14;
    const cT = 10, cH = 150, nT = 182, nH = 46, iw = W - L - R;

    const net = series.rev.map((v, i) => v - series.cost[i]);
    const mx = Math.ceil(Math.max(...series.rev) / 200) * 200;
    const nmx = Math.ceil(Math.max(...net) / 20) * 20;
    const y = (v) => cT + cH - (v / mx) * cH;
    const ny = (v) => nT + nH - (v / nmx) * nH;
    const step = iw / series.lab.length;
    const bw = Math.min(15, step * 0.30);
    const nbw = Math.min(20, step * 0.42);

    const gridLines = [];
    for (let i = 0; i <= 3; i++) {
        const gv = (mx / 3) * i;
        const yy = y(gv);
        gridLines.push(
            <React.Fragment key={i}>
                <line x1={L} y1={yy.toFixed(1)} x2={W - R} y2={yy.toFixed(1)} stroke="var(--fin-line)" />
                <text x={L - 8} y={(yy + 3.5).toFixed(1)} textAnchor="end" fontSize="10.5" fill="var(--fin-tx3)">
                    {gv ? (gv / 100).toFixed(1) + 'L' : '0'}
                </text>
            </React.Fragment>
        );
    }

    return (
        <svg viewBox={`0 0 ${W} 248`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img"
             aria-label="Grouped column chart comparing gross revenue and total cost per period, with a net profit line">
            {gridLines}
            {series.lab.map((lb, i) => {
                const cx = L + step * i + step / 2;
                return (
                    <React.Fragment key={lb}>
                        <rect x={(cx - bw - 1.5).toFixed(1)} y={y(series.rev[i]).toFixed(1)} width={bw}
                              height={(cH - (y(series.rev[i]) - cT)).toFixed(1)} rx="2.5" fill="var(--fin-pos)" />
                        <rect x={(cx + 1.5).toFixed(1)} y={y(series.cost[i]).toFixed(1)} width={bw}
                              height={(cH - (y(series.cost[i]) - cT)).toFixed(1)} rx="2.5" fill="#D8B4A6" />
                    </React.Fragment>
                );
            })}

            <text x="0" y={nT - 9} fontSize="10.5" fill="var(--fin-tx2)">Net profit kept</text>
            <line x1={L} y1={(nT + nH).toFixed(1)} x2={W - R} y2={(nT + nH).toFixed(1)} stroke="var(--fin-line-2)" />
            <text x={L - 8} y={(nT + 4).toFixed(1)} textAnchor="end" fontSize="10.5" fill="var(--fin-tx3)">{(nmx / 100).toFixed(1)}L</text>

            {series.lab.map((lb, i) => {
                const cx = L + step * i + step / 2;
                const top = ny(net[i]);
                return (
                    <React.Fragment key={lb}>
                        <rect x={(cx - nbw / 2).toFixed(1)} y={top.toFixed(1)} width={nbw}
                              height={(nH - (top - nT)).toFixed(1)} rx="2.5" fill="var(--fin-brand-dark)" />
                        <text x={cx.toFixed(1)} y={nT + nH + 15} textAnchor="middle" fontSize="10.5" fill="var(--fin-tx3)">{lb}</text>
                    </React.Fragment>
                );
            })}
        </svg>
    );
};

/**
 * Simple column chart used for single-series data (e.g. "stock purchase,
 * last 6 months"). The most recent bar is drawn at full opacity.
 */
export const ColumnChart = ({ values, labels, color, viewBox = '0 0 320 120' }) => {
    const [, , W, H] = viewBox.split(' ').map(Number);
    const B = 18;
    const mx = Math.max(...values);
    const step = W / values.length;
    const bw = Math.min(26, step * 0.52);

    return (
        <svg viewBox={viewBox} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Column chart">
            {values.map((v, i) => {
                const h = (v / mx) * (H - B - 14);
                const cx = step * i + step / 2;
                return (
                    <React.Fragment key={i}>
                        <rect x={(cx - bw / 2).toFixed(1)} y={(H - B - h).toFixed(1)} width={bw} height={h.toFixed(1)}
                              rx="3" fill={color} opacity={i === values.length - 1 ? 1 : 0.42} />
                        <text x={cx.toFixed(1)} y={H - 5} textAnchor="middle" fontSize="9.5" fill="var(--fin-tx3)">{labels[i]}</text>
                    </React.Fragment>
                );
            })}
        </svg>
    );
};

/**
 * Weekly net-earnings column chart with a shaded "below target" band and a
 * dashed break-even line, used by the Earnings Report view.
 */
export const EarningsChart = ({ rows, breakEven = 50000 }) => {
    const W = 720, H = 230, L = 54, R = 14, Tp = 14, B = 30;
    const iw = W - L - R, ih = H - Tp - B;
    const vals = rows.map((r) => r.net);
    const labs = rows.map((r) => r.p.split(' ')[0] + ' ' + r.p.split(' ')[1]);
    const mx = Math.ceil(Math.max(...vals) / 20000) * 20000;
    const y = (v) => Tp + ih - (v / mx) * ih;
    const step = iw / vals.length;
    const bw = Math.min(30, step * 0.5);

    const gridLines = [];
    for (let i = 0; i <= 4; i++) {
        const gv = (mx / 4) * i;
        const yy = y(gv);
        gridLines.push(
            <React.Fragment key={i}>
                <line x1={L} y1={yy.toFixed(1)} x2={W - R} y2={yy.toFixed(1)} stroke="var(--fin-line)" />
                <text x={L - 8} y={(yy + 3.5).toFixed(1)} textAnchor="end" fontSize="10.5" fill="var(--fin-tx3)">
                    {gv ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(gv / 1000) + 'k' : 0}
                </text>
            </React.Fragment>
        );
    }

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img"
             aria-label="Column chart of net earnings for each of the last twelve weeks against a break-even line">
            <rect x={L} y={y(breakEven).toFixed(1)} width={iw} height={(ih - (y(breakEven) - Tp)).toFixed(1)} fill="var(--fin-page)" />
            {gridLines}
            <line x1={L} y1={y(breakEven).toFixed(1)} x2={W - R} y2={y(breakEven).toFixed(1)} stroke="var(--fin-neg)" strokeWidth="1.4" strokeDasharray="5 4" />
            <text x={W - R} y={Tp + 10} textAnchor="end" fontSize="10.5" fill="var(--fin-neg)">weekly target {money(breakEven)}</text>
            {vals.map((v, i) => {
                const cx = L + step * i + step / 2;
                const top = y(v);
                return (
                    <React.Fragment key={i}>
                        <rect x={(cx - bw / 2).toFixed(1)} y={top.toFixed(1)} width={bw} height={(ih - (top - Tp)).toFixed(1)}
                              rx="3" fill={v >= breakEven ? '#0B7A55' : '#C58A7A'} />
                        <text x={cx.toFixed(1)} y={H - 10} textAnchor="middle" fontSize="10" fill="var(--fin-tx3)">{labs[i]}</text>
                    </React.Fragment>
                );
            })}
        </svg>
    );
};


export const BarList = ({ rows, total }) => (
    <div className="fin-bar-list">
        {rows.map((r) => {
            const pc = (r.v / total) * 100;
            return (
                <div key={r.n}>
                    <div className="fin-bl-top">
                        <b>{r.n}</b>
                        <div className="fin-sp" />
                        {r.s && <span>{r.s}</span>}
                        <b>{money(r.v)}</b>
                        <span style={{ minWidth: 42, textAlign: 'right' }}>{pc.toFixed(1)}%</span>
                    </div>
                    <div className="fin-track"><span style={{ width: `${pc.toFixed(1)}%`, background: r.c }} /></div>
                </div>
            );
        })}
    </div>
);
