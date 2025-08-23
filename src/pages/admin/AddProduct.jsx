
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './Admin.css';

const categoryData = {
    'Skin Care': ['Face Wash', 'Moisturizer', 'Sunscreen', 'Serum'],
    'Men Care': ['Shaving Cream', 'Beard Oil', 'Face Scrub'],
    'Makeup': ['Lipstick', 'Foundation', 'Mascara'],
};

const AddProduct = () => {
    const navigate = useNavigate();
    const [productImages, setProductImages] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [subCategories, setSubCategories] = useState([]);
    const fileInputRef = useRef(null); // Ref for the hidden file input

    useEffect(() => {
        if (selectedCategory) {
            setSubCategories(categoryData[selectedCategory] || []);
        } else {
            setSubCategories([]);
        }
    }, [selectedCategory]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const imagePreviews = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setProductImages(prev => [...prev, ...imagePreviews]);
    };

    const handleAddImageClick = () => {
        fileInputRef.current.click();
    };

    const handleRemoveImage = (indexToRemove) => {
        setProductImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleCancel = () => navigate('/admin/products');

    const handleSave = (e) => {
        e.preventDefault();
        toast.success("Product saved! (Logged to console)");
        console.log("Saving product...");
    };

    return (
        <div className="admin-page-content">
            <div className="content-card">
                <form className="add-product-form-container" onSubmit={handleSave}>
                    <div className="add-product-header">
                        <h3>Product › Add Product</h3>
                    </div>

                    <div className="add-product-layout">
                        <div className="layout-main">
                            <div className="form-card">
                                <h3>General Information</h3>
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input type="text" placeholder="Type product name here..." />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea placeholder="Type product description here..." />
                                </div>
                            </div>
                            <div className="form-card">
                                <h3>Media</h3>
                                <div className="form-group">
                                    <label>Photo</label>
                                    <div className="image-upload-container">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            ref={fileInputRef}
                                            multiple
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                        />
                                        <div className="image-dropzone">
                                            <div className="upload-icon">
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 6V12.5C14 13.88 15.12 15 16.5 15C17.88 15 19 13.88 19 12.5V9.5C19 6.47 16.53 4 13.5 4C10.47 4 8 6.47 8 9.5V16.5C8 18.99 9.99 21 12.5 21C15.01 21 17 18.99 17 16.5V10" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </div>
                                            <p>Drag and drop image here, or click add image</p>
                                            <button type="button" className="btn-add-image" onClick={handleAddImageClick}>
                                                Add Image
                                            </button>
                                        </div>
                                    </div>
                                    <div className="image-previews">
                                        {productImages.map((img, index) => (
                                            <div key={index} className="image-preview-item">
                                                <img src={img.preview} alt="Product Preview" />
                                                <button type="button" className="remove-image-btn" onClick={() => handleRemoveImage(index)}>
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="form-card">
                                <h3>Pricing & Inventory</h3>
                                <div className="form-grid-2">
                                    <div className="form-group"><label>Original Price (Strikethrough)</label><input type="number" placeholder="৳ 0.00" /></div>
                                    <div className="form-group"><label>Discounted Price (Current Price)</label><input type="number" placeholder="৳ 0.00" /></div>
                                    <div className="form-group"><label>Quantity</label><input type="number" placeholder="0" /></div>
                                    <div className="form-group"><label>SKU (Stock Keeping Unit)</label><input type="text" placeholder="e.g., HIM-FW-100" /></div>
                                </div>
                            </div>
                            <div className="form-card">
                                <h3>Variations</h3>
                                <div className="form-group"><label>Size</label><input type="text" placeholder="e.g., 100ml, Large, 12-inch" /></div>
                                <div className="form-group"><label>Color</label><input type="text" placeholder="e.g., Black, Red" /></div>
                            </div>
                        </div>
                        <div className="layout-sidebar">
                            <div className="form-card">
                                <h3>Category, Brand & Tags</h3>
                                <div className="form-group">
                                    <label>Brand</label>
                                    <input type="text" placeholder="e.g., Himalaya, Pond's" />
                                </div>
                                <div className="form-group">
                                    <label>Product Category</label>
                                    <select onChange={e => setSelectedCategory(e.target.value)}><option value="">Select a category</option>{Object.keys(categoryData).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
                                </div>
                                {selectedCategory && <div className="form-group"><label>Sub-Category</label><select><option value="">Select a sub-category</option>{subCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}</select></div>}
                                <div className="form-group">
                                    <label>Tags</label>
                                    <select><option value="">None</option><option value="SALE">Sale</option><option value="FREE SHIPPING">Free Shipping</option><option value="EXCLUSIVE">Exclusive</option></select>
                                </div>
                            </div>
                            <div className="form-card">
                                <h3>Status</h3>
                                <div className="form-group"><label>Product Status</label><select><option>Draft</option><option>Published</option></select></div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Product</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
