import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import ReviewForm from './ReviewForm';
import StarRating from './ReviewStarRating';
import './ProductReviews.css';

// Helper function to format the date array from your API
const formatDate = (dateArray) => {
    if (!dateArray || dateArray.length < 3) return '';
    const date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const ProductReviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [pageNo, setPageNo] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchReviews = useCallback(async (currentPage) => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/v1/review/product/${productId}`, {
                params: { pageNo: currentPage, pageSize: 5, sortBy: 'id' }
            });

            const data = response.data; // The response is not nested under a 'data' key
            setReviews(prev => currentPage === 0 ? data.content : [...prev, ...data.content]);
            setHasMore(!data.last);
            setPageNo(data.pageNo);

        } catch (error) {
            toast.error("Could not load reviews.");
        } finally {
            setLoading(false);
        }
    }, [productId, loading]);

    useEffect(() => {
        if (productId) {
            fetchReviews(0);
        }
    }, [productId]);

    const handleReviewSubmitted = () => {
        // Refresh reviews from the first page after submission
        fetchReviews(0);
    };

    return (
        <div className="product-reviews-container">
            <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />

            <div className="review-list">
                <h3>Customer Reviews</h3>
                {reviews.length > 0 ? reviews.map((review, index) => (
                    <div key={index} className="review-item">
                        <div className="review-header">
                            <span className="review-author">{review.username}</span>
                            <span className="review-date">{formatDate(review.createdAt)}</span>
                        </div>
                        <StarRating rating={review.rating} />
                        <p className="review-comment">{review.comment}</p>

                        {/* --- NEW: Display review image if it exists --- */}
                        {review.imageUrl && (
                            <div className="review-image-wrapper">
                                <img src={review.imageUrl} alt={`Review by ${review.username}`} className="review-image" />
                            </div>
                        )}
                    </div>
                )) : !loading && <p>No reviews yet. Be the first to add one!</p>}

                {hasMore && !loading && (
                    <button onClick={() => fetchReviews(pageNo + 1)} className="load-more-reviews">
                        Load More Reviews
                    </button>
                )}
                {loading && <p className="loading-text">Loading...</p>}
            </div>
        </div>
    );
};

export default ProductReviews;