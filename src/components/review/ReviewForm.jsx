import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import StarRating from './ReviewStarRating';
import './ReviewForm.css';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
    const { user } = useContext(AuthContext); // Get the current user
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [files, setFiles] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0 || !comment) {
            toast.error("Please provide a rating and a comment.");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        const reviewDtoString = JSON.stringify({ productId, rating, comment });
        formData.append('reviewDtoString', reviewDtoString);

        if (files) {
            for (let i = 0; i < files.length; i++) {
                formData.append('file', files[i]);
            }
        }

        try {
            await axiosInstance.post('/api/v1/review/add', formData);
            toast.success("Thank you! Your review will be visible after admin approval.");
            setRating(0);
            setComment('');
            setFiles(null);
            e.target.reset();
            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
        } catch (error) {
            toast.error("Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- THIS IS THE NEW LOGIC ---
    // If the user is not logged in, show the message.
    if (!user) {
        return (
            <div className="login-prompt-container">
                <h3>Add Review</h3>
                <p>
                    Please <Link to="/login">Login</Link> or <Link to="/register">Register</Link> to add a review.
                </p>
            </div>
        );
    }

    // If the user IS logged in, show the form.
    return (
        <div className="review-form-container">
            <h3>Add Review</h3>
            <form onSubmit={handleSubmit} className="review-form">
                <div className="rating-group">
                    <label>Your Rating:</label>
                    <StarRating rating={rating} onRatingChange={setRating} />
                </div>
                <textarea
                    className="review-textarea"
                    placeholder="Write your review here..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(e.target.files)}
                />
                <button type="submit" className="submit-review-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;