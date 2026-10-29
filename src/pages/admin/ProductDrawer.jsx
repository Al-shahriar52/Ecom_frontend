import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { X, Pencil, Trash2, ExternalLink, Package, Star } from 'lucide-react';
import axiosInstance from '../../api/AxiosInstance';
import './ProductDrawer.css';

const money = (n) => `৳${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const stockInfo = (q) => {
    if (q <= 0) return { text: 'Out of stock', cls: 'out' };
    if (q < 5) return { text: `Low stock · ${q} left`, cls: 'low' };
    return { text: `In stock · ${q} units`, cls: 'ok' };
};

/** Slide-over with everything about one product, plus Edit / Delete. `summary` is the list row (shown instantly). */
export default function ProductDrawer({ summary, onClose, onDeleted }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [img, setImg] = useState(0);
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [more, setMore] = useState(false);

    const id = summary.productId;

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setDetail(null);
        setImg(0);
        setConfirming(false);
        setMore(false);
        axiosInstance.get(`/api/v1/product/detail/${id}`)
            .then((r) => { if (alive) setDetail(r.data?.data || null); })
            .catch(() => { if (alive) toast.error('Could not load full product details.'); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [id]);

    useEffect(() => {
        const h = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', h);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', h); document.body.style.overflow = prev; };
    }, [onClose]);

    const p = {
        name: detail?.name || summary.name,
        sku: detail?.sku || summary.sku,
        brand: detail?.brandName || summary.brandName,
        category: detail?.categoryNames || summary.categoryName,
        sub: detail?.subCategoryNames || summary.subCategoryName,
        tag: detail?.tagNames || summary.tagName,
        price: detail?.discountedPrice ?? summary.discountedPrice,
        mrp: detail?.originalPrice ?? summary.originalPrice,
        qty: detail?.quantity ?? summary.quantity,
        rating: detail?.rating ?? summary.rating,
        reviews: detail?.numReviews ?? summary.numReviews,
        description: detail?.description ?? summary.description,
        images: (detail?.imageUrls && detail.imageUrls.length ? detail.imageUrls : (summary.imageUrl ? [summary.imageUrl] : [])),
        variations: detail?.variations || (summary.size ? [{ size: summary.size }] : []),
    };
    const off = p.mrp > p.price && p.mrp > 0 ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
    const stock = stockInfo(p.qty ?? 0);
    const desc = p.description || '';
    const long = desc.length > 260;

    const doDelete = async () => {
        setDeleting(true);
        try {
            await axiosInstance.delete(`/api/v1/product/delete/${id}`);
            toast.success('Product deleted');
            onDeleted(id);
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Failed to delete product.');
            setDeleting(false);
            setConfirming(false);
        }
    };

    const rows = [
        ['Brand', p.brand], ['Category', p.category], ['Sub-category', p.sub], ['Tag', p.tag], ['SKU', p.sku],
    ].filter(([, v]) => v);

    return ReactDOM.createPortal(
        <div className="pd-overlay" onClick={onClose}>
            <aside className="pd" role="dialog" aria-label="Product details" onClick={(e) => e.stopPropagation()}>
                <header className="pd-h">
                    <div className="pd-h-t">
                        <span className="pd-eyebrow">Product #{id}</span>
                        <h2>{p.name}</h2>
                    </div>
                    <button className="pd-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
                </header>

                <div className="pd-body">
                    <div className="pd-gallery">
                        <div className="pd-main">
                            {p.images[img] ? <img src={p.images[img]} alt={p.name} /> : <span className="pd-noimg"><Package size={40} /></span>}
                        </div>
                        {p.images.length > 1 && (
                            <div className="pd-thumbs">
                                {p.images.map((u, i) => (
                                    <button key={u + i} className={i === img ? 'on' : ''} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`}><img src={u} alt="" /></button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pd-price">
                        <b>{money(p.price)}</b>
                        {off > 0 && <><s>{money(p.mrp)}</s><span className="pd-off">{off}% off</span></>}
                        <span className={`pd-stock ${stock.cls}`}>{stock.text}</span>
                    </div>

                    <div className="pd-rating">
                        <Star size={15} /> <b>{Number(p.rating || 0).toFixed(1)}</b>
                        <span>({p.reviews || 0} review{p.reviews === 1 ? '' : 's'})</span>
                    </div>

                    <dl className="pd-grid">
                        {rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
                        {p.variations.filter((v) => v.size || v.color).map((v, i) => (
                            <div key={i}><dt>Variation</dt><dd>{[v.size, v.color].filter(Boolean).join(' · ')}</dd></div>
                        ))}
                        {p.mrp > 0 && <div><dt>MRP</dt><dd>{money(p.mrp)}</dd></div>}
                        <div><dt>Selling price</dt><dd>{money(p.price)}</dd></div>
                    </dl>

                    <section className="pd-desc">
                        <h3>Description</h3>
                        {loading && !desc ? <div className="pd-skel" /> : (
                            desc ? (<>
                                <p className={!more && long ? 'clamp' : ''}>{desc}</p>
                                {long && <button className="pd-more" onClick={() => setMore((m) => !m)}>{more ? 'Show less' : 'Show more'}</button>}
                            </>) : <p className="pd-muted">No description added.</p>
                        )}
                    </section>
                </div>

                <footer className="pd-f">
                    {!confirming ? (
                        <>
                            <button className="pd-btn danger" onClick={() => setConfirming(true)}><Trash2 size={16} /> Delete</button>
                            {summary.slug && (
                                <a className="pd-btn ghost" href={`/product/${summary.slug}`} target="_blank" rel="noreferrer"><ExternalLink size={16} /> View in store</a>
                            )}
                            <Link className="pd-btn primary" to={`/admin/products/edit/${id}`} state={{ product: summary }}><Pencil size={16} /> Edit product</Link>
                        </>
                    ) : (
                        <div className="pd-confirm">
                            <span>Delete <b>{p.name}</b>? This can't be undone.</span>
                            <div>
                                <button className="pd-btn ghost" onClick={() => setConfirming(false)} disabled={deleting}>Cancel</button>
                                <button className="pd-btn danger solid" onClick={doDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Yes, delete'}</button>
                            </div>
                        </div>
                    )}
                </footer>
            </aside>
        </div>,
        document.body
    );
}
