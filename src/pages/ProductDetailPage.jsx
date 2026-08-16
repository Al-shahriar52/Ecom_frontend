import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/AxiosInstance';
import { Helmet } from 'react-helmet-async';
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

    // 1. Fetch Product Details
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

    // 2. --- META PIXEL: VIEW CONTENT EVENT ---
    useEffect(() => {
        if (product && window.fbq) {
            window.fbq('track', 'ViewContent', {
                content_ids: [product.productId || productId],
                content_name: product.name,
                content_type: 'product',
                value: product.discountedPrice || product.originalPrice || 0,
                currency: 'BDT' // Change to 'USD' if necessary
            });
        }
    }, [product, productId]);
    // ------------------------------------------

    /* ================= SKELETON LOADER STATE ================= */
    if (loading) {
        return (
            <div className="pdp-container container pdp-skeleton-container">
                <div className="pdp-main-content">
                    {/* Left Side: Gallery Skeleton */}
                    <div className="pdp-skeleton-gallery">
                        <div className="pdp-skeleton-box pdp-skeleton-main-image"></div>
                        <div className="pdp-skeleton-thumbnails">
                            <div className="pdp-skeleton-box pdp-skeleton-thumb"></div>
                            <div className="pdp-skeleton-box pdp-skeleton-thumb"></div>
                            <div className="pdp-skeleton-box pdp-skeleton-thumb"></div>
                            <div className="pdp-skeleton-box pdp-skeleton-thumb"></div>
                        </div>
                    </div>

                    {/* Right Side: Info Skeleton */}
                    <div className="pdp-skeleton-info">
                        <div className="pdp-skeleton-box pdp-skeleton-brand"></div>
                        <div className="pdp-skeleton-box pdp-skeleton-title"></div>
                        <div className="pdp-skeleton-box pdp-skeleton-title-short"></div>
                        <div className="pdp-skeleton-box pdp-skeleton-rating"></div>
                        <div className="pdp-skeleton-box pdp-skeleton-price"></div>
                        <div className="pdp-skeleton-box pdp-skeleton-button-bar"></div>
                        <div className="pdp-skeleton-bullets">
                            <div className="pdp-skeleton-box pdp-skeleton-line"></div>
                            <div className="pdp-skeleton-box pdp-skeleton-line"></div>
                            <div className="pdp-skeleton-box pdp-skeleton-line short"></div>
                        </div>
                    </div>
                </div>

                {/* Tabs & Full Details Skeleton */}
                <div className="pdp-skeleton-extra">
                    <div className="pdp-skeleton-tabs-header">
                        <div className="pdp-skeleton-box pdp-skeleton-tab-btn"></div>
                        <div className="pdp-skeleton-box pdp-skeleton-tab-btn"></div>
                        <div className="pdp-skeleton-box pdp-skeleton-tab-btn"></div>
                    </div>
                    <div className="pdp-skeleton-tab-body">
                        <div className="pdp-skeleton-box pdp-skeleton-line"></div>
                        <div className="pdp-skeleton-box pdp-skeleton-line"></div>
                        <div className="pdp-skeleton-box pdp-skeleton-line short"></div>
                    </div>
                </div>
            </div>
        );
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
            "price": product.discountedPrice || product.originalPrice,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": product.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",

            "hasMerchantReturnPolicy": {
                "@type": "MerchantReturnPolicy",
                "applicableCountry": "BD",
                "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                "merchantReturnDays": 7,
                "returnMethod": "https://schema.org/ReturnByMail",
                "returnFees": "https://schema.org/ReturnFeesCustomerResponsibility"
            },

            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "60",
                    "currency": "BDT"
                },
                "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "BD"
                },
                "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "handlingTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 0,
                        "maxValue": 1,
                        "unitCode": "d"
                    },
                    "transitTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 2,
                        "maxValue": 5,
                        "unitCode": "d"
                    }
                }
            }
        },
        ...(product.rating > 0 && product.numReviews > 0 && {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.rating,
                "reviewCount": product.numReviews
            }
        })
    };

    const categoryName = product.category?.name || "Shop";
    const categorySlug = product.category?.slug || categoryName.toLowerCase().replace(/\s+/g, '-');

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

            <Helmet>
                <title>{product.name ? `${product.name} | BeautyHaat` : 'Product | BeautyHaat'}</title>
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