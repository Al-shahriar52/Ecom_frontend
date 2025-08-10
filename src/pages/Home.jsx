import React from 'react';
import { products as allProducts } from '../data';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
    // Sort products by most recent 'createdAt' date
    const sortedProducts = [...allProducts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <div>
            <h1 className="home-title">✨ Our Newest Arrivals ✨</h1>
            <div className="product-grid">
                {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default Home;