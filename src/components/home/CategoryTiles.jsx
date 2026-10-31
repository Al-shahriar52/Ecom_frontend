import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { slugify } from '../../utils/slugify';
import { SectionHead } from './homeUtils';

const THEMES = [
    ['#f9e1e6', '#f3c4cf', '#7a2e43'],
    ['#fdf0d5', '#f6dba0', '#7a5a10'],
    ['#e3efe6', '#c3dfca', '#2f5a3b'],
    ['#e6e4f5', '#cdc8ec', '#3f3a7a'],
    ['#fde4d8', '#f8c7b0', '#8a3f1f'],
];

/**
 * Editorial "collections" mosaic. Different from the header menu: big tiles with real
 * product photos, built from the categories that actually have products in stock.
 */
export default function CategoryTiles({ categories, products, loading }) {
    const tiles = useMemo(() => {
        if (!categories || !products) return [];
        return categories
            .map((c) => {
                const items = products.filter((p) => p.categoryName === c.name && p.quantity > 0 && p.imageUrl);
                const maxOff = items.reduce((m, p) => (p.originalPrice > p.discountedPrice
                    ? Math.max(m, Math.round(((p.originalPrice - p.discountedPrice) / p.originalPrice) * 100)) : m), 0);
                return { c, items, maxOff };
            })
            .filter((t) => t.items.length > 0)
            .sort((a, b) => b.items.length - a.items.length)
            .slice(0, 5);
    }, [categories, products]);

    if (loading) {
        return (
            <section className="hp-sec">
                <div className="hp-mosaic">{[...Array(5)].map((_, i) => <div key={i} className={`hp-tile skel ${i === 0 ? 'big' : ''}`} />)}</div>
            </section>
        );
    }
    if (tiles.length === 0) return null;

    return (
        <section className="hp-sec">
            <SectionHead eyebrow="Collections" title="Find your favourites" to="/shop" linkText="Shop everything" />
            <div className="hp-mosaic">
                {tiles.map(({ c, items, maxOff }, i) => {
                    const [a, b, ink] = THEMES[i % THEMES.length];
                    const big = i === 0;
                    return (
                        <Link key={c.id} to={`/category/${slugify(c.name)}`}
                              className={`hp-tile ${big ? 'big' : ''}`}
                              style={{ background: `linear-gradient(135deg, ${a}, ${b})`, color: ink }}>
                            <div className="hp-tile-t">
                                {maxOff > 0 && <em>Up to {maxOff}% off</em>}
                                <h3>{c.name}</h3>
                                <small>{items.length}+ products</small>
                                <span className="hp-tile-cta" style={{ background: ink }}>Shop now →</span>
                            </div>
                            <div className="hp-tile-img">
                                {items.slice(0, big ? 3 : 1).map((p, k) => (
                                    <img key={p.productId} src={p.imageUrl} alt="" loading="lazy" className={`i${k}`} />
                                ))}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
