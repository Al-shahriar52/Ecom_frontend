import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import './Wishlist.css';

const Wishlist = () => {
    const { wishlist, removeFromWishlist, loading } = useContext(WishlistContext);
    const navigate = useNavigate();

    if (loading) return <div className="wishlist-loader">Loading...</div>;

    return (
        <div className="wishlist-page">
            <div className="wishlist-container">

                {/* --- EMPTY STATE --- */}
                {wishlist.length === 0 ? (
                    <div className="wishlist-empty-box">
                        <p>You do not have any wishlist item</p>
                    </div>
                ) : (
                    /* --- GRID LAYOUT --- */
                    <div className="wishlist-grid">
                        {wishlist.map((item) => (
                            <div key={item.wishId || item.productId} className="wishlist-card">

                                {/* Left: Image (Clickable) */}
                                <div
                                    className="w-card-image"
                                    onClick={() => navigate(`/product/${item.productId}`)}
                                >
                                    <img
                                        src={item.imageUrl || 'https://via.placeholder.com/150'}
                                        alt={item.productName}
                                    />
                                </div>

                                {/* Center: Details (Clickable) */}
                                <div className="w-card-details">
                                    <h3 onClick={() => navigate(`/product/${item.productId}`)}>
                                        {item.productName}
                                    </h3>
                                    <span className="w-price">৳ {item.price}</span>
                                </div>

                                {/* Right: Delete Action */}
                                <button
                                    className="w-delete-btn"
                                    onClick={() => removeFromWishlist(item.productId)}
                                    title="Remove from Wishlist"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E91E63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;