import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import ProductSelectList from '../../components/admin/ProductSelectList';
import '../../pages/admin/Admin.css';

const FbtManagementPage = () => {
    // State for the left panel (selecting the main product)
    const [mainSearchTerm, setMainSearchTerm] = useState('');
    const [mainSearchResults, setMainSearchResults] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // State for the right panel (managing pairings)
    const [pairedProducts, setPairedProducts] = useState([]);
    const [pairSearchTerm, setPairSearchTerm] = useState('');
    const [pairSearchResults, setPairSearchResults] = useState([]);

    // --- API HANDLERS ---

    const handleSearch = async (term, setSearchResults) => {
        if (!term.trim()) {
            setSearchResults([]); // Clear results if the search term is empty
            return;
        }
        try {
            const response = await axiosInstance.get(`/api/v1/product/search?query=${term}`);
            setSearchResults(response.data.data.content || []);
        } catch (error) {
            toast.error('Failed to search for products.');
        }
    };

    // useEffect for the main product search (Debouncing)
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(mainSearchTerm, setMainSearchResults);
        }, 500); // Wait for 500ms after the user stops typing

        // Cleanup function: This clears the timer if the user types again
        return () => {
            clearTimeout(timer);
        };
    }, [mainSearchTerm]);

    // useEffect for the pair product search (Debouncing)
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(pairSearchTerm, setPairSearchResults);
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [pairSearchTerm]);

    const handleSelectProduct = async (product) => {
        const mainId = product.productId || product.id;
        if (!mainId) {
            toast.error("Invalid product selected (missing ID).");
            return;
        }
        setSelectedProduct(product);
        try {
            const response = await axiosInstance.get(`/api/v1/frequently-bought/get/product/${mainId}`);
            setPairedProducts(response.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch paired products.');
            setPairedProducts([]);
        }
    };

    const handleAddPair = async (pairedProductId) => {
        const mainId = selectedProduct?.productId || selectedProduct?.id;
        if (!mainId) return;
        try {
            const payload = {
                mainProductId: mainId,
                pairedProductId: pairedProductId
            };
            await axiosInstance.post('/api/v1/frequently-bought/together', payload);
            toast.success('Product paired successfully!');
            handleSelectProduct(selectedProduct);
        } catch (error) {
            toast.error('Failed to pair product.');
        }
    };

    const handleRemovePair = async (pairedProductId) => {
        const mainId = selectedProduct?.productId || selectedProduct?.id;
        if (!mainId) return;
        try {
            await axiosInstance.delete(`/api/v1/frequently-bought/together`, {
                data: { mainProductId: mainId, pairedProductId: pairedProductId }
            });
            toast.success('Pairing removed successfully!');
            handleSelectProduct(selectedProduct);
        } catch (error) {
            toast.error('Failed to remove pairing.');
        }
    };

    return (
        <div className="admin-page-content">
            <div className="content-card">
                <div className="page-header">
                    <h2>Frequently Bought Together Management</h2>
                </div>
                <div className="fbt-management-layout">
                    {/* --- LEFT PANEL --- */}
                    <div className="fbt-panel">
                        <h3>1. Select Main Product</h3>
                        <div className="search-bar">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Start typing to search..."
                                value={mainSearchTerm}
                                onChange={(e) => setMainSearchTerm(e.target.value)}
                            />
                        </div>
                        <ProductSelectList
                            products={mainSearchResults}
                            onProductClick={handleSelectProduct}
                            actionType="select"
                        />
                    </div>

                    {/* --- RIGHT PANEL (Conditional) --- */}
                    <div className="fbt-panel">
                        <h3>2. Manage Pairings</h3>
                        {selectedProduct ? (
                            <div>
                                <div className="selected-product-display">
                                    <img src={selectedProduct.imageUrl || '/placeholder.png'} alt={selectedProduct.name} />
                                    <h4>{selectedProduct.name}</h4>
                                </div>
                                <hr />
                                <h4>Currently Paired With:</h4>
                                <ProductSelectList
                                    products={pairedProducts}
                                    onActionClick={handleRemovePair}
                                    actionType="remove"
                                />
                                <hr />
                                <h4>Add a New Paired Product:</h4>
                                <div className="search-bar">
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Start typing to search..."
                                        value={pairSearchTerm}
                                        onChange={(e) => setPairSearchTerm(e.target.value)}
                                    />
                                </div>
                                <ProductSelectList
                                    products={pairSearchResults.filter(p => (p.productId || p.id) !== (selectedProduct.productId || selectedProduct.id))}
                                    onActionClick={handleAddPair}
                                    actionType="add"
                                />
                            </div>
                        ) : (
                            <p className="placeholder-text">Select a product from the left to begin.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FbtManagementPage;