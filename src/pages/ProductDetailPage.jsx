
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/AxiosInstance';
import { Helmet } from 'react-helmet-async'; // 1. IMPORT HELMET HERE
import './ProductDetailPage.css';
import ProductGallery from '../components/productDetails/ProductGallery';
import ProductInfo from '../components/productDetails/ProductInfo';
import { Tabs, Tab } from '../components/productDetails/Tabs';
import ProductReviews from '../components/review/ProductReviews';
import FrequentlyBoughtTogether from '../components/productDetails/FrequentlyBoughtTogether';
import SimilarProducts from '../components/productDetails/SimilarProducts';
import { WishlistContext } from '../context/WishlistContext';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);

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

    const isWishlisted = product ? isInWishlist(product.productId) : false;

    const handleWishlistToggle = () => {
        if (!product) return;

        if (isWishlisted) {
            removeFromWishlist(product.productId);
        } else {
            addToWishlist(product);
        }
    };

    // 2. CREATE THE JSON-LD SCHEMA OBJECT
    // Note: Please check that `product.name`, `product.price`, etc., match the exact
    // property names returned by your Spring Boot backend. Adjust them if needed!
        // 2. CREATE THE JSON-LD SCHEMA OBJECT
    const schemaData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : undefined,
        "description": product.description,
        "sku": product.sku || product.productId,
        "brand": {
            "@type": "Brand",
            "name": product.brandName || "BeautyHaat" 
        },
        "offers": {
            "@type": "Offer",
            "url": `https://beautyhaat.com/product/${productId}`,
            "priceCurrency": "BDT",
            // FIX 1: Map to the correct price fields from your API
            "price": product.discountedPrice || product.originalPrice, 
            "itemCondition": "https://schema.org/NewCondition",
            // FIX 2: Map to 'quantity' instead of 'stockQuantity'
            "availability": product.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        },
        // FIX 3: Include the review data from your API for rich snippets
        ...(product.rating && product.numReviews > 0 && {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.rating,
                "reviewCount": product.numReviews
            }
        })
    };
    

    // 1. Safely grab the category name, defaulting to "Shop" if null
    const categoryName = product.category?.name || "Shop";

    // 2. Safely grab the slug if your backend provides it.
    // If not, automatically convert the name "Personal Care" into "personal-care"
    const categorySlug = product.category?.slug
        || categoryName.toLowerCase().replace(/\s+/g, '-');

    // 3. Create the Breadcrumb Schema Object with the correct URL structure
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://beautyhaat.com/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": categoryName,
                // Now it builds: https://beautyhaat.com/category/personal-care
                "item": `https://beautyhaat.com/category/${categorySlug}`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": product.name,
                "item": `https://beautyhaat.com/product/${productId}`
            }
        ]
    };

    return (
        <div className="pdp-container container">

            {/* 3. INJECT THE SEO TAGS */}
            <Helmet>
                <title>{product.name ? `${product.name} | BeautyHaat` : 'Product | BeautyHaat'}</title>
                {/* We substring the description to 160 characters as that is the max for search engine snippets */}
                <meta name="description" content={product.description ? product.description.substring(0, 160) : 'Buy quality beauty products at BeautyHaat.'} />
                <link rel="canonical" href={`https://beautyhaat.com/product/${productId}`} />
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>

                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>

            <div className="pdp-main-content">
                <ProductGallery imageUrls={product.imageUrls} />

                <ProductInfo
                    product={product}
                    isWishlisted={isWishlisted}
                    onWishlistToggle={handleWishlistToggle}
                />
            </div>

            <FrequentlyBoughtTogether mainProduct={product} />

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

            <SimilarProducts productId={product.productId} />
        </div>
    );
};

export default ProductDetailPage;
