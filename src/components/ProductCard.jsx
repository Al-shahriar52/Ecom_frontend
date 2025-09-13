/*
import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToCart } = useContext(CartContext);

    return (
        <div className="product-card">
            <div className="product-image-container">
                <img src={product.image} alt={product.title} className="product-image" />
            </div>
            <div className="product-details">
                <h3 className="product-title">{product.title}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-meta">
                    <span className="product-price">${product.price.toFixed(2)}</span>
                    <span className="product-rating">⭐ {product.rating}</span>
                </div>
                <button className="btn add-to-cart-btn" onClick={() => addToCart(product)}>
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;*/


import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './ProductCard.css';
import StarRating from './StarRating';

const ProductCard = ({ product }) => {
    const { addToCart } = useContext(CartContext);

    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercentage = hasDiscount
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="product-card">
            <Link to={`/product/${product.id}`} className="product-image-link">
                <div className="product-image-container">
                    {/* Fix 1: Changed product.name to product.title for the alt text */}
                    <img src={product.image} alt={product.title} className="product-image" />
                    {hasDiscount && (
                        <div className="discount-badge">{discountPercentage}% OFF</div>
                    )}
                </div>
            </Link>
            <div className="product-info">
                <h3 className="product-name">
                    {/* Fix 1: Changed product.name to product.title to display the title */}
                    <Link to={`/product/${product.id}`}>{product.title}</Link>
                </h3>

                {/* Fix 2: Always render the container to maintain consistent height */}
                <div className="product-tag-container">
                    {product.tag && (
                        <span className={`product-tag tag-${product.tag.toLowerCase().replace(' ', '-')}`}>
                            {product.tag}
                        </span>
                    )}
                </div>

                <div className="price-container">
                    {hasDiscount && (
                        <span className="original-price">৳{product.originalPrice.toFixed(2)}</span>
                    )}
                    <span className="current-price">৳{product.price.toFixed(2)}</span>
                </div>

                <div className="product-rating">
                    <StarRating rating={product.rating} />
                </div>

                <button onClick={() => addToCart(product)} className="add-to-cart-btn">
                    ADD TO CART
                </button>
            </div>
        </div>
    );
};

export default ProductCard;