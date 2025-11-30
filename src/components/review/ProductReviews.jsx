import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import ReviewForm from './ReviewForm';
import StarRating from './ReviewStarRating';
import ReviewSummary from './ReviewSummary';
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

const ProductReviews = ({ productId, averageRating, numReviews }) => {
    const [reviews, setReviews] = useState([]);
    const [pageNo, setPageNo] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [ratingCounts, setRatingCounts] = useState(null);

    const fetchReviews = useCallback(async (currentPage) => {
        if (loading && currentPage > 0) return; // Prevent multiple simultaneous fetches
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/v1/review/product/${productId}`, {
                params: { pageNo: currentPage, pageSize: 5, sortBy: 'id' }
            });

            const data = response.data;
            const fetchedReviews = data.content || [];

            // Combine new reviews with existing ones for pagination
            const allFetchedReviews = currentPage === 0 ? fetchedReviews : [...reviews, ...fetchedReviews];

            setReviews(allFetchedReviews);
            setHasMore(!data.last);
            setPageNo(data.pageNo);

            // Calculate the rating breakdown from all fetched reviews
            const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            allFetchedReviews.forEach(review => {
                if (counts[review.rating] !== undefined) {
                    counts[review.rating]++;
                }
            });
            setRatingCounts(counts);

        } catch (error) {
            toast.error("Could not load reviews.");
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    }, [productId, loading, reviews]);

    useEffect(() => {
        if (productId) {
            fetchReviews(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    const handleReviewSubmitted = () => {
        // This function is called after a review is submitted.
        // The success toast is now in ReviewForm.jsx, so this can be left empty
        // or used for other logic in the future.
    };

    return (
        <div className="product-reviews-container">
            <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />

            <div className="review-list">
                <h3>Customer Reviews</h3>

                <ReviewSummary
                    averageRating={averageRating}
                    numReviews={numReviews}
                    ratingCounts={ratingCounts}
                />

                {reviews.length > 0 ? reviews.map((review, index) => (
                    <div key={index} className="review-item">
                        <div className="review-avatar">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#999"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                        </div>
                        <div className="review-content">
                            <div className="review-header">
                                <span className="review-author">{review.username}</span>
                                <span className="review-date">{formatDate(review.createdAt)}</span>
                            </div>
                            <StarRating rating={review.rating} />
                            <p className="review-comment">{review.comment}</p>
                            {review.imageUrl && (
                                <div className="review-image-wrapper">
                                    <img src={review.imageUrl} alt={`Review by ${review.username}`} className="review-image" />
                                </div>
                            )}
                        </div>
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