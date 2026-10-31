import React from 'react';
import { Link } from 'react-router-dom';
import { slugify } from '../../utils/slugify';
import { SectionHead } from './homeUtils';

export default function BrandStrip({ brands }) {
    if (!brands || brands.length === 0) return null;
    return (
        <section className="hp-sec">
            <SectionHead eyebrow="Trusted names" title="Shop by brand" to="/brands" linkText="All brands" />
            <div className="hp-brands">
                {brands.map((b) => (
                    <Link key={b.id} to={`/brand/${slugify(b.name)}`} state={{ brandName: b.name, brandId: b.id }} className="hp-brand" title={b.name}>
                        {b.logoUrl ? <img src={b.logoUrl} alt={b.name} loading="lazy" /> : <span>{b.name}</span>}
                    </Link>
                ))}
            </div>
        </section>
    );
}
