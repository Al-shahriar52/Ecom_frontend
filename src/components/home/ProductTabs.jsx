import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard';
import { SectionHead } from './homeUtils';

const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-image skeleton-animate" />
        <div className="skeleton-text skeleton-animate" />
        <div className="skeleton-text short skeleton-animate" />
        <div className="skeleton-button skeleton-animate" />
    </div>
);

/** One section, three product lists: new arrivals, best deals, top rated. */
export default function ProductTabs({ tabs, loading }) {
    const [active, setActive] = useState(0);
    const shown = tabs.filter((t) => loading || t.products.length > 0);
    const cur = shown[Math.min(active, shown.length - 1)];

    if (!loading && shown.length === 0) return null;

    return (
        <section className="hp-sec">
            <SectionHead eyebrow="Picked for you" title="Top picks" to="/shop" linkText="Shop all" />
            <div className="hp-tabs" role="tablist">
                {(loading ? [{ key: 'a', label: 'New arrivals' }, { key: 'b', label: 'Best deals' }, { key: 'c', label: 'Top rated' }] : shown).map((t, i) => (
                    <button key={t.key} role="tab" aria-selected={i === active} className={i === active ? 'on' : ''} onClick={() => setActive(i)}>
                        {t.label}
                    </button>
                ))}
            </div>
            <div className="hp-grid">
                {loading
                    ? [...Array(10)].map((_, i) => <SkeletonCard key={i} />)
                    : cur.products.map((p) => <ProductCard key={p.productId} product={p} />)}
            </div>
            {!loading && (
                <div className="hp-more"><Link to="/shop" className="hp-more-btn">Explore all products</Link></div>
            )}
        </section>
    );
}
