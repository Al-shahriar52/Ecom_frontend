import React, { useState, useEffect } from 'react';
import './ProductGallery.css';

const ProductGallery = ({ imageUrls }) => {
    const [selectedImage, setSelectedImage] = useState(imageUrls?.[0] || null);

    // This effect ensures the gallery updates if a different product's data is passed.
    useEffect(() => {
        if (imageUrls && imageUrls.length > 0) {
            setSelectedImage(imageUrls[0]);
        }
    }, [imageUrls]);

    // --- The early return for no images now happens AFTER the hooks ---
    if (!imageUrls || imageUrls.length === 0) {
        return (
            <div className="gallery-container">
                <div className="main-image-wrapper">
                    <img src="/placeholder.png" alt="No Image Available" className="main-product-image" />
                </div>
            </div>
        );
    }

    return (
        <div className="gallery-container">
            <div className="main-image-wrapper">
                <img src={selectedImage} alt="Main product view" className="main-product-image" />
            </div>
            <div className="thumbnail-wrapper">
                {imageUrls.map((url, index) => (
                    <div
                        key={index}
                        className={`thumbnail-item ${url === selectedImage ? 'active' : ''}`}
                        onClick={() => setSelectedImage(url)}
                    >
                        <img src={url} alt={`Product thumbnail ${index + 1}`} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductGallery;