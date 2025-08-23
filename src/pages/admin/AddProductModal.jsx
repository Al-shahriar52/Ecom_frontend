import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import './Modal.css';

const AddProductModal = ({ onClose }) => {
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [status, setStatus] = useState('In Stock');
    const [productImages, setProductImages] = useState([]);

    // Closes the modal only if the dark overlay (the parent) is clicked
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Handle image selection and create previews
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const imagePreviews = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setProductImages(imagePreviews);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newProductData = {
            name: productName,
            description,
            category,
            price: parseFloat(price),
            stock: parseInt(stock, 10),
            status,
            images: productImages.map(img => img.file) // Just the file objects
        };

        console.log("New Product Data:", newProductData);
        toast.success("Product added successfully (logged to console)!");
        onClose(); // Close the modal
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <header className="modal-header">
                    <h2>Add New Product</h2>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </header>
                <form onSubmit={handleSubmit} className="add-product-form">
                    <div className="form-group full-width">
                        <label>Product Name</label>
                        <input type="text" value={productName} onChange={e => setProductName(e.target.value)} required />
                    </div>
                    <div className="form-group full-width">
                        <label>Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} required />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} required>
                                <option value="" disabled>Select a category</option>
                                <option value="Skin Care">Skin Care</option>
                                <option value="Men Care">Men Care</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Price</label>
                            <input type="number" value={price} onChange={e => setPrice(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Stock</label>
                            <input type="number" value={stock} onChange={e => setStock(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)} required>
                                <option>In Stock</option>
                                <option>Limited</option>
                                <option>Out of Stock</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Product Images</label>
                        <div className="image-upload-container">
                            <input type="file" multiple onChange={handleImageChange} accept="image/*" />
                            <p>Drag & drop files here, or click to select files</p>
                        </div>
                        <div className="image-previews">
                            {productImages.map((img, index) => (
                                <img key={index} src={img.preview} alt="Product Preview" />
                            ))}
                        </div>
                    </div>

                    <footer className="modal-footer">
                        <button type="button" className="btn btn-danger" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn">Save Product</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;