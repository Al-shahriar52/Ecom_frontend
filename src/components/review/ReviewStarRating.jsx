import React, { useState } from 'react';
import './ReviewStarRating.css';

const StarRating = ({ rating, onRatingChange }) => {
    const [hover, setHover] = useState(0);

    // Determine if the stars should be interactive based on whether onRatingChange was passed
    const isInteractive = !!onRatingChange;

    return (
        <div className={`star-rating ${isInteractive ? 'interactive' : ''}`}>
            {[...Array(5)].map((star, index) => {
                const ratingValue = index + 1;
                return (
                    <span
                        key={index}
                        className={ratingValue <= (hover || rating) ? 'on' : 'off'}
                        onClick={isInteractive ? () => onRatingChange(ratingValue) : undefined}
                        onMouseEnter={isInteractive ? () => setHover(ratingValue) : undefined}
                        onMouseLeave={isInteractive ? () => setHover(0) : undefined}
                    >
                        ★
                    </span>
                );
            })}
        </div>
    );
};

export default StarRating;