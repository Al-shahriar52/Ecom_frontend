import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/AxiosInstance';
import './ProductDetailPage.css';
import ProductGallery from '../components/productDetails/ProductGallery';
import ProductInfo from '../components/productDetails/ProductInfo';
import { Tabs, Tab } from '../components/productDetails/Tabs';
import ProductReviews from '../components/review/ProductReviews';
const ProductDetailPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/api/v1/product/detail/${productId}`);
                setProduct(response.data.data);
            } catch (err) {
                setError('Failed to load product details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [productId]);

    if (loading) {
        return <div className="pdp-loading">Loading...</div>;
    }

    if (error) {
        return <div className="pdp-error">{error}</div>;
    }

    if (!product) {
        return <div className="pdp-error">Product not found.</div>;
    }

    return (
        <div className="pdp-container container">
            <div className="pdp-main-content">
                <ProductGallery imageUrls={product.imageUrls} />
                <ProductInfo product={product} />
            </div>

            <div className="pdp-extra-info" id="full-description">
                <Tabs>
                    <Tab label="Description">
                        <div className="pdp-description">
                            <h4>Brief Description</h4>
                            <p>{product.description}</p>

                            <h4>Please Note</h4>
                            <p>For any variation of products, the packaging may differ from the image shown as brands frequently change their packaging and pictures.</p>
                        </div>
                    </Tab>
                    <Tab label="Available Offers">
                        <div>
                            <p>No offers are available at this time.</p>
                        </div>
                    </Tab>
                    <Tab label={`Reviews (${product.numReviews || 0})`}>
                        <ProductReviews
                            productId={productId}
                            averageRating={product.rating}
                            numReviews={product.numReviews}
                        />
                    </Tab>
                </Tabs>
            </div>

            {/* We will add more sections later */}
        </div>
    );
};

export default ProductDetailPage;