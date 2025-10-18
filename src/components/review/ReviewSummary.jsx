import React from 'react';
import './ReviewSummary.css';

const ReviewSummary = ({ averageRating, numReviews, ratingCounts }) => {
    // Use the counts passed from the parent, or a default empty object
    const counts = ratingCounts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    return (
        <div className="review-summary-container">
            <div className="summary-overview">
                <div className="average-rating-large">
                    {averageRating?.toFixed(1) || '0.0'}<span>/5</span>
                </div>
                <div className="total-reviews-text">Based on {numReviews || 0} Reviews</div>
            </div>
            <div className="summary-breakdown">
                {[5, 4, 3, 2, 1].map(star => {
                    const count = counts[star] || 0;
                    // --- THIS CALCULATION IS NOW ACCURATE ---
                    const percentage = (numReviews > 0) ? (count / numReviews) * 100 : 0;
                    return (
                        <div key={star} className="rating-row">
                            <span className="star-label">{star} Star</span>
                            <div className="rating-bar-container">
                                <div className="rating-bar-filled" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="rating-count">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReviewSummary;