import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/AxiosInstance';
import ProductCard from '../ProductCard';
import './SimilarProducts.css';

const SimilarProducts = ({ productId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!productId) return;

        const fetchSimilarProducts = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(`/api/v1/product/similar/${productId}`);
                setProducts(response.data.data || []);
            } catch (error) {
                console.error("Failed to fetch similar products:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSimilarProducts();
    }, [productId]);

    // Return null if loading is complete and no similar products exist
    if (!loading && products.length === 0) {
        return null;
    }

    return (
        <div className="similar-products-container">
            <h2 className="similar-products-title">SIMILAR PRODUCTS</h2>
            <div className="similar-products-list">
                {loading ? (
                    /* Render 4 Skeleton Product Cards while loading */
                    Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="similar-product-skeleton-card">
                            <div className="sp-skeleton-box sp-skeleton-image"></div>
                            <div className="sp-skeleton-content">
                                <div className="sp-skeleton-box sp-skeleton-brand"></div>
                                <div className="sp-skeleton-box sp-skeleton-name"></div>
                                <div className="sp-skeleton-box sp-skeleton-price"></div>
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

export default SimilarProducts;