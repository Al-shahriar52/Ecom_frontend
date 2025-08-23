import React from 'react';
import './StarRating.css';

const StarRating = ({ rating }) => {
    // Calculate the width percentage for the filled stars
    const percentage = (rating / 5) * 100;

    return (
        <div className="star-rating">
            <div className="stars-empty">★★★★★</div>
            <div className="stars-filled" style={{ width: `${percentage}%` }}>
                ★★★★★
            </div>
        </div>
    );
};

export default StarRating;