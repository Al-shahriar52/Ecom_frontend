import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/AxiosInstance';
import ProductCard from '../ProductCard';
import './ProductCarouselSection.css';

/**
 * Generic horizontal product carousel. Fetches `endpoint` on mount (and
 * whenever it changes) and renders a ProductCard for each result.
 * Renders nothing once loaded if there are no products, so it's always
 * safe to drop onto a page unconditionally.
 */
const ProductCarouselSection = ({ title, endpoint }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!endpoint) return;
        let cancelled = false;

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(endpoint);
                if (!cancelled) setProducts(response.data.data || []);
            } catch (error) {
                console.error(`Failed to fetch products for "${title}":`, error);
                if (!cancelled) setProducts([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchProducts();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint]);

    if (!loading && products.length === 0) {
        return null;
    }

    return (
        <div className="product-carousel-container">
            <h2 className="product-carousel-title">{title}</h2>
            <div className="product-carousel-list">
                {loading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="pcs-skeleton-card">
                            <div className="pcs-skeleton-box pcs-skeleton-image"></div>
                            <div className="pcs-skeleton-content">
                                <div className="pcs-skeleton-box pcs-skeleton-brand"></div>
                                <div className="pcs-skeleton-box pcs-skeleton-name"></div>
                                <div className="pcs-skeleton-box pcs-skeleton-price"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    products.map(product => (
                        <ProductCard key={product.productId || product.id} product={product} />
                    ))
                )}
            </div>
        </div>
    );
};

export default ProductCarouselSection;
