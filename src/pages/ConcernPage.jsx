import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axiosInstance from '../api/AxiosInstance';
import ProductCard from '../components/ProductCard';
import { DEFAULT_CONCERNS } from '../components/home/concernData';
import { slugify } from '../utils/slugify';
import '../components/home/HomeSections.css';

const SIZE = 24;

/** Products that help with one concern. Keywords come from the link (set by the admin). */
export default function ConcernPage() {
    const { slug } = useParams();
    const [sp] = useSearchParams();
    const known = DEFAULT_CONCERNS.find((c) => slugify(c.title) === slug);
    const keywords = sp.get('kw') || (known && known.keywords) || '';
    const title = sp.get('t') || (known && known.title) || 'Products';
    const desc = sp.get('d') || (known && known.subtitle) || '';
    const bg = known ? known.bgColor : '#f9e1e6';
    const ink = known ? known.textColor : '#7a2e43';

    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async (p) => {
        if (!keywords) { setLoading(false); return; }
        setLoading(true);
        try {
            const res = await axiosInstance.get('/api/v1/home/concern-products', { params: { keywords, page: p, size: SIZE } });
            const d = res.data?.data || {};
            setProducts((prev) => (p === 0 ? d.products || [] : [...prev, ...(d.products || [])]));
            setHasMore(!!d.hasMore);
            setTotal(d.total || 0);
            setPage(p);
        } catch (e) {
            if (p === 0) setProducts([]);
        } finally { setLoading(false); }
    }, [keywords]);

    useEffect(() => { window.scrollTo(0, 0); load(0); }, [load]);

    return (
        <div className="hp hp-cpage">
            <Helmet>
                <title>{`${title} solutions | BeautyHaat`}</title>
                <meta name="description" content={`Shop products for ${title.toLowerCase()} at BeautyHaat. Genuine products, delivered across Bangladesh.`} />
            </Helmet>
            <div className="hp-cp-head" style={{ background: `linear-gradient(120deg, ${bg}, #fff)`, color: ink }}>
                <div className="hp-cp-in">
                    <nav className="hp-cp-crumb"><Link to="/" style={{ color: ink }}>Home</Link> / Shop by concern</nav>
                    <h1>{title}</h1>
                    {desc && <p>{desc}</p>}
                    {!loading && <small>{total} product{total === 1 ? '' : 's'} found</small>}
                </div>
            </div>

            <div className="hp-sec" style={{ marginTop: 28 }}>
                {loading && products.length === 0 ? (
                    <div className="hp-grid">{[...Array(10)].map((_, i) => (
                        <div key={i} className="skeleton-card"><div className="skeleton-image skeleton-animate" /><div className="skeleton-text skeleton-animate" /><div className="skeleton-button skeleton-animate" /></div>
                    ))}</div>
                ) : products.length === 0 ? (
                    <div className="hp-cp-empty">
                        <b>No products found for this concern yet.</b>
                        <span>We add new products every week. Meanwhile, browse everything we have.</span>
                        <Link to="/shop" className="hp-more-btn">Browse all products</Link>
                    </div>
                ) : (
                    <>
                        <div className="hp-grid">{products.map((p) => <ProductCard key={p.productId} product={p} />)}</div>
                        {hasMore && (
                            <div className="hp-more">
                                <button className="hp-more-btn" onClick={() => load(page + 1)} disabled={loading}>{loading ? 'Loading...' : 'Load more'}</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
