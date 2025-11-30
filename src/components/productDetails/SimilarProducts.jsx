// src/components/productDetails/SimilarProducts.jsx

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

    // This logic handles your requirement:
    // If loading is done and there are no products, the component returns null.
    if (!loading && products.length === 0) {
        return null;
    }

    return (
        <div className="similar-products-container">
            <h2 className="similar-products-title">SIMILAR PRODUCTS</h2>
            <div className="similar-products-list">
                {loading ? (
                    <p>Loading...</p>
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