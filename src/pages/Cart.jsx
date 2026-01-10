
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
    const {
        cart,
        cartTotal,
        updateQuantity,
        removeFromCart,
        loading,
        updatingItemIds
    } = useContext(CartContext);

    const navigate = useNavigate();
    const safeCart = cart || [];

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    // --- LOGIC: CHECK IF ANY ITEM IS INVALID ---
    // An item is invalid if it's Out of Stock OR requested quantity > real stock
    const hasStockIssues = safeCart.some(item =>
        item.stockQuantity === 0 || item.quantity > item.stockQuantity
    );

    if (loading) return <div className="cart-loader">Loading...</div>;

    if (safeCart.length === 0) {
        return (
            <div className="cart-overlay">
                <div className="cart-drawer">
                    <div className="drawer-header">
                        <button className="close-drawer-btn" onClick={() => navigate('/')}>✕</button>
                        <h2>CART</h2>
                        <div className="header-spacer"></div>
                    </div>
                    <div className="drawer-content empty">
                        <div className="bag-icon-container">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L20 21H4L5 9Z" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <p className="empty-text">Your Shopping Bag is Empty</p>
                        <button className="start-shopping-btn" onClick={() => navigate('/')}>START SHOPPING</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-overlay">
            <div className="cart-drawer">
                <div className="drawer-header">
                    <button className="close-drawer-btn" onClick={() => navigate('/')}>✕</button>
                    <h2>CART</h2>
                    <div className="header-spacer"></div>
                </div>

                <div className="drawer-items-scroll">
                    {safeCart.map((item) => {
                        const isUpdating = updatingItemIds.includes(item.cartItemId);

                        // Check specific item stock status
                        const isOutOfStock = item.stockQuantity === 0;
                        const isOverStock = !isOutOfStock && item.quantity > item.stockQuantity;
                        const hasIssue = isOutOfStock || isOverStock;

                        return (
                            <div
                                key={item.cartItemId}
                                className={`drawer-item-card ${hasIssue ? 'item-disabled' : ''}`}
                                style={{
                                    opacity: isUpdating ? 0.5 : 1,
                                    transition: 'opacity 0.2s'
                                }}
                            >
                                <div
                                    className="card-left clickable"
                                    onClick={() => handleProductClick(item.productId)}
                                >
                                    <img src={item.imageUrl} alt={item.name} />
                                    {/* Overlay for OOS image */}
                                    {isOutOfStock && <div className="oos-overlay">SOLD OUT</div>}
                                </div>

                                <div className="card-middle">
                                    <h3
                                        className="clickable-title"
                                        onClick={() => handleProductClick(item.productId)}
                                    >
                                        {item.name}
                                    </h3>

                                    <span className="item-price">Unit: ৳ {item.price}</span>

                                    {/* Stock Error Messages */}
                                    {isOutOfStock && <span className="error-text">Out of Stock</span>}
                                    {isOverStock && <span className="warning-text">Only {item.stockQuantity} available!</span>}

                                    <div className="qty-selector">
                                        <button
                                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                            disabled={item.quantity <= 1 || isUpdating || isOutOfStock} // Disable minus if OOS
                                        >-</button>

                                        <span>{isUpdating ? '...' : item.quantity}</span>

                                        <button
                                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                            // Disable plus if updating, OOS, or hitting limit
                                            disabled={isUpdating || isOutOfStock || item.quantity >= item.stockQuantity}
                                        >+</button>
                                    </div>
                                </div>
                                <div className="card-right">
                                    <button
                                        className="delete-btn"
                                        onClick={() => removeFromCart(item.cartItemId)}
                                        disabled={isUpdating}
                                        style={{ cursor: isUpdating ? 'not-allowed' : 'pointer', pointerEvents: 'auto' }} // Ensure delete is clickable
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" strokeWidth="2">
                                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                        </svg>
                                    </button>

                                    <span className="item-total">৳ {item.itemTotalPrice}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="drawer-footer">
                    {/* Optional: Warning Message */}
                    {hasStockIssues && (
                        <div className="cart-warning-box">
                            Please remove out-of-stock items to proceed.
                        </div>
                    )}

                    <div className="footer-row">
                        <span>Cart Total:</span>
                        <span className="total-price">৳ {cartTotal}</span>
                    </div>

                    <button
                        className={`proceed-checkout-btn ${hasStockIssues ? 'btn-disabled' : ''}`}
                        onClick={() => navigate('/checkout')}
                        disabled={hasStockIssues} // Lock the button
                    >
                        {hasStockIssues ? 'UPDATE CART TO PROCEED' : 'PROCEED >'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;