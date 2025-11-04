import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import { CartContext } from '../../context/CartContext';
import './FrequentlyBoughtTogether.css';

const FrequentlyBoughtTogether = ({ mainProduct }) => {
    const { addToCart } = useContext(CartContext);
    const [pairedProducts, setPairedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);

    const allProducts = [mainProduct, ...pairedProducts];

    useEffect(() => {
        const fetchPairedProducts = async () => {
            const productId = mainProduct?.productId || mainProduct?.id;
            if (!productId) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await axiosInstance.get(`/api/v1/frequently-bought/get/product/${productId}`);
                const fetchedPaired = response.data.data || [];
                setPairedProducts(fetchedPaired);
                const allProductIds = [productId, ...fetchedPaired.map(p => p.id || p.productId)];
                setSelectedIds(allProductIds);
            } catch (error) {
                console.error("No FBT products found or API error:", error);
                setPairedProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPairedProducts();
    }, [mainProduct]);

    const handleCheckboxChange = (productIdToToggle) => {
        setSelectedIds(prevSelectedIds =>
            prevSelectedIds.includes(productIdToToggle)
                ? prevSelectedIds.filter(id => id !== productIdToToggle)
                : [...prevSelectedIds, productIdToToggle]
        );
    };

    const selectedProducts = allProducts.filter(p => selectedIds.includes(p.productId || p.id));
    const totalPrice = selectedProducts.reduce((sum, product) => sum + (product.discountedPrice || 0), 0);

    const handleAddSelectedToCart = () => {
        selectedProducts.forEach(product => {
            addToCart(product, 1);
        });
        toast.success(`${selectedProducts.length} items added to your cart!`);
    };

    if (loading || pairedProducts.length === 0) {
        return null;
    }

    return (
        <div className="fbt-container">
            <h2>Frequently Bought Together</h2>

            {/* --- NEW WRAPPER FOR THE TOP SECTION --- */}
            <div className="fbt-top-section">
                <div className="fbt-visuals">
                    {allProducts.map((product, index) => {
                        const imageSrc = product.imageUrl || (product.imageUrls && product.imageUrls[0]) || '/placeholder.png';
                        return (
                            <React.Fragment key={product.productId || product.id}>
                                <img src={imageSrc} alt={product.name} />
                                {index < allProducts.length - 1 && <span className="fbt-plus-icon">+</span>}
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="fbt-summary-box">
                    <div className="fbt-total-price-wrapper">
                        <span>Total Price:</span>
                        <div className="fbt-total-price">৳{totalPrice.toFixed(2)}</div>
                    </div>
                    <button
                        className="fbt-add-selected-btn"
                        onClick={handleAddSelectedToCart}
                        disabled={selectedProducts.length === 0}
                    >
                        Add {selectedProducts.length} to Cart
                    </button>
                </div>
            </div>

            <ul className="fbt-item-list">
                {allProducts.map((product, index) => {
                    const productId = product.productId || product.id;
                    return (
                        <li key={productId} className="fbt-list-item">
                            <input
                                type="checkbox"
                                className="fbt-item-checkbox"
                                checked={selectedIds.includes(productId)}
                                onChange={() => handleCheckboxChange(productId)}
                            />
                            <div className="fbt-item-details">
                                <span className="fbt-item-name">
                                    {index === 0 ? <strong>This Item: </strong> : null}
                                    {product.name}
                                </span>
                                <div className="fbt-item-pricing">
                                    <span className="original-price">৳{product.originalPrice?.toFixed(2)}</span>
                                    <span className="discounted-price">৳{product.discountedPrice?.toFixed(2)}</span>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default FrequentlyBoughtTogether;