import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './Admin.css';
import axiosInstance from '../../api/AxiosInstance';
import UploadIcon from '../../components/UploadIcon';

const EditProductPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [productData, setProductData] = useState({
        name: '',
        description: '',
        brandId: '',
        categoryId: '',
        subCategoryId: '',
        tagId: '',
        status: 'PUBLISHED',
        originalPrice: '',
        discountedPrice: '',
        quantity: '',
        sku: '',
        size: '',
        color: '',
        rating: '',
    });

    const [productImages, setProductImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // We'll use this to temporarily hold the subcategory name if the API ever returns it
    const [initialSubCategoryName, setInitialSubCategoryName] = useState('');

    const fileInputRef = useRef(null);

    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [tags, setTags] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [productRes, catRes, brandRes, tagRes] = await Promise.all([
                    axiosInstance.get(`/api/v1/product/detail/${id}`),
                    axiosInstance.get('/api/v1/product/categories'),
                    axiosInstance.get('/api/v1/product/brand'),
                    axiosInstance.get('/api/v1/product/tag')
                ]);

                const fetchedCategories = catRes.data.data || [];
                const fetchedBrands = brandRes.data.data || [];
                const fetchedTags = tagRes.data.data || [];

                setCategories(fetchedCategories);
                setBrands(fetchedBrands);
                setTags(fetchedTags);

                const product = productRes.data.data;

                if (product) {
                    // 1. Match the strings from the API to the IDs in our lists
                    const matchedBrand = fetchedBrands.find(b => b.name === product.brandName);
                    const matchedCategory = fetchedCategories.find(c => c.name === product.categoryNames);
                    const matchedTag = fetchedTags.find(t => t.name === product.tagNames);

                    // Optional: If your backend starts returning a subcategory name, store it
                    if (product.subCategoryNames) {
                        setInitialSubCategoryName(product.subCategoryNames);
                    }

                    setProductData({
                        name: product.name || '',
                        description: product.description || '',
                        brandId: matchedBrand ? matchedBrand.id : '',
                        categoryId: matchedCategory ? matchedCategory.id : '',
                        subCategoryId: '', // We will set this after subcategories load!
                        tagId: matchedTag ? matchedTag.id : '',
                        status: product.status || 'PUBLISHED',
                        originalPrice: product.originalPrice || '',
                        discountedPrice: product.discountedPrice || '',
                        quantity: product.quantity || '',
                        sku: product.sku || '',
                        size: product.variations?.[0]?.size || '',
                        color: product.variations?.[0]?.color || '',
                        rating: product.rating || '',
                    });

                    // 2. Map the array of image URLs to our previews
                    if (product.imageUrls && product.imageUrls.length > 0) {
                        setImagePreviews(product.imageUrls);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Could not load product details.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchAllData();
        }
    }, [id]);

    // Fetch sub-categories when a main category is selected
    useEffect(() => {
        if (!productData.categoryId) {
            setSubCategories([]);
            return;
        }
        const fetchSubCategories = async () => {
            try {
                const response = await axiosInstance.get(`/api/v1/product/subCategory/${productData.categoryId}`);
                const fetchedSubCats = response.data.data || [];
                setSubCategories(fetchedSubCats);

                // If we have an initial subcategory name we are trying to match, match it now!
                if (initialSubCategoryName) {
                    const matchedSub = fetchedSubCats.find(sc => sc.name === initialSubCategoryName);
                    if (matchedSub) {
                        setProductData(prev => ({ ...prev, subCategoryId: matchedSub.id }));
                    }
                    setInitialSubCategoryName(''); // Clear it so it doesn't override manual changes
                }
            } catch (error) {
                console.error("Error fetching sub-categories:", error);
            }
        };
        fetchSubCategories();
    }, [productData.categoryId, initialSubCategoryName]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setProductImages(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const handleRemoveImage = (indexToRemove) => {
        setProductImages(prev => prev.filter((_, index) => index !== indexToRemove));
        setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const retainedUrls = imagePreviews.filter(url => !url.startsWith('blob:'));

    const handleUpdate = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Updating product...');

        const productDto = {
            productId: parseInt(id),
            name: productData.name,
            description: productData.description,
            brandId: parseInt(productData.brandId) || null,
            categoryId: parseInt(productData.categoryId) || null,
            subCategoryId: parseInt(productData.subCategoryId) || null,
            tagId: parseInt(productData.tagId) || null,
            status: productData.status,
            variations: [{ size: productData.size, color: productData.color }],
            originalPrice: parseFloat(productData.originalPrice) || 0,
            discountedPrice: parseFloat(productData.discountedPrice) || 0,
            quantity: parseInt(productData.quantity) || 0,
            sku: productData.sku,
            rating: parseFloat(productData.rating) || 0,
            retainedImageUrls: retainedUrls,
        };

        const formData = new FormData();
        formData.append('productDto', new Blob([JSON.stringify(productDto)], { type: 'application/json' }));

        productImages.forEach(file => {
            formData.append('files', file);
        });

        try {
            await axiosInstance.put('/api/v1/product/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            toast.success('Product updated successfully!', { id: toastId });
            navigate('/admin/products');
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error(error.response?.data?.message || 'Failed to update product.', { id: toastId });
        }
    };

    const handleCancel = () => navigate('/admin/products');
    const handleAddImageClick = () => fileInputRef.current.click();

    if (isLoading) {
        return <div className="admin-page-content">Loading product details...</div>;
    }

    return (
        <div className="admin-page-content">
            <div className="content-card">
                <form className="add-product-form-container" onSubmit={handleUpdate}>
                    <div className="add-product-header">
                        <h3><Link to="/admin/products">Product</Link> › Edit Product</h3>
                    </div>
                    <div className="add-product-layout">
                        <div className="layout-main">
                            <div className="form-card">
                                <h3>General Information</h3>
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input type="text" name="name" value={productData.name} onChange={handleChange} placeholder="Type product name..." required />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea name="description" value={productData.description} onChange={handleChange} placeholder="Type description..." required />
                                </div>
                            </div>

                            <div className="form-card">
                                <h3>Media</h3>
                                <div className="form-group">
                                    <label>Photo</label>
                                    <div className="image-upload-container">
                                        <input type="file" id="file-upload" ref={fileInputRef} multiple onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                                        <div className="image-dropzone">
                                            <div className="upload-icon">
                                                <UploadIcon />
                                            </div>
                                            <p>Drag and drop image here, or click add image</p>
                                            <button type="button" className="btn-add-image" onClick={handleAddImageClick}>Add Image</button>
                                        </div>
                                    </div>
                                    <div className="image-previews">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="image-preview-item">
                                                <img src={preview} alt="Preview" />
                                                <button type="button" className="remove-image-btn" onClick={() => handleRemoveImage(index)}>&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="form-card">
                                <h3>Pricing & Inventory</h3>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Original Price</label>
                                        <input type="number" name="originalPrice" value={productData.originalPrice} onChange={handleChange} placeholder="৳ 0.00" />
                                    </div>
                                    <div className="form-group">
                                        <label>Discounted Price</label>
                                        <input type="number" name="discountedPrice" value={productData.discountedPrice} onChange={handleChange} placeholder="৳ 0.00" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Quantity</label>
                                        <input type="number" name="quantity" value={productData.quantity} onChange={handleChange} placeholder="0" required />
                                    </div>
                                    <div className="form-group">
                                        <label>SKU</label>
                                        <input type="text" name="sku" value={productData.sku} onChange={handleChange} placeholder="e.g., SKU-001" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Rating (out of 5)</label>
                                        <input type="number" name="rating" value={productData.rating} onChange={handleChange} placeholder="e.g., 4.5" step="0.1" min="0" max="5" />
                                    </div>
                                </div>
                            </div>

                            <div className="form-card">
                                <h3>Variations</h3>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Size</label>
                                        <input type="text" name="size" value={productData.size} onChange={handleChange} placeholder="e.g., 100ml" />
                                    </div>
                                    <div className="form-group">
                                        <label>Color</label>
                                        <input type="text" name="color" value={productData.color} onChange={handleChange} placeholder="e.g., Red" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="layout-sidebar">
                            <div className="form-card">
                                <h3>Category, Brand & Tags</h3>
                                <div className="form-group">
                                    <label>Brand</label>
                                    <select name="brandId" value={productData.brandId} onChange={handleChange} required>
                                        <option value="">Select a brand</option>
                                        {brands.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Product Category</label>
                                    <select name="categoryId" value={productData.categoryId} onChange={handleChange} required>
                                        <option value="">Select a category</option>
                                        {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                    </select>
                                </div>
                                {productData.categoryId && subCategories.length > 0 && (
                                    <div className="form-group">
                                        <label>Sub-Category</label>
                                        <select name="subCategoryId" value={productData.subCategoryId} onChange={handleChange} required>
                                            <option value="">Select a sub-category</option>
                                            {subCategories.map(sc => (<option key={sc.id} value={sc.id}>{sc.name}</option>))}
                                        </select>
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Tags</label>
                                    <select name="tagId" value={productData.tagId} onChange={handleChange}>
                                        <option value="">None</option>
                                        {tags.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-card">
                                <h3>Status</h3>
                                <div className="form-group">
                                    <label>Product Status</label>
                                    <select name="status" value={productData.status} onChange={handleChange} required>
                                        <option value="DRAFT">Draft</option>
                                        <option value="PUBLISHED">Published</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                        <button type="submit" className="btn-primary">Update Product</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductPage;