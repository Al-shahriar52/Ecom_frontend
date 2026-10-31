import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../ProductCard';

/** Horizontal, swipeable row of product cards with desktop arrows. */
export default function ProductRail({ products }) {
    const ref = useRef(null);
    const [can, setCan] = useState({ l: false, r: false });

    const measure = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        setCan({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
    }, []);

    useEffect(() => {
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [measure, products]);

    const scroll = (d) => {
        const el = ref.current;
        if (el) el.scrollBy({ left: d * el.clientWidth * 0.85, behavior: 'smooth' });
    };

    return (
        <div className="hp-rail">
            {can.l && <button className="hp-rail-arrow l" onClick={() => scroll(-1)} aria-label="Scroll left"><ChevronLeft size={20} /></button>}
            <div className="hp-rail-track" ref={ref} onScroll={measure}>
                {products.map((p) => (
                    <div className="hp-rail-item" key={p.productId}><ProductCard product={p} /></div>
                ))}
            </div>
            {can.r && <button className="hp-rail-arrow r" onClick={() => scroll(1)} aria-label="Scroll right"><ChevronRight size={20} /></button>}
        </div>
    );
}
