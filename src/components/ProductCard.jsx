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

export default ProductCard;