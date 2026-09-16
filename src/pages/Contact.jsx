import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import './Contact.css';
import axiosInstance from '../api/AxiosInstance';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Start the loading toast and save its ID
        const toastId = toast.loading('Sending your message...');

        try {
            const response = await axiosInstance.post('/api/v1/contact', formData);

            if (response.status === 200) {
                // Pass the toastId to replace the loading spinner with a success message
                toast.success('Thank you! We will get back to you soon.', {
                    id: toastId,
                });
                setFormData({ name: '', email: '', message: '' }); // Reset form
            }
        } catch (error) {
            console.error('Error sending message:', error);

            let errorMessage = 'Could not connect to the server.';
            if (error.response) {
                errorMessage = `Sorry, there was a problem: ${error.response.data}`;
            }

            // Pass the toastId to replace the loading spinner with an error message
            toast.error(errorMessage, {
                id: toastId,
            });
        }
    };

    return (
        <div className="contact-page">
            <Helmet>
                <title>Contact Us | BeautyHaat</title>
                <meta name="description" content="Get in touch with BeautyHaat for questions about orders, products or partnerships." />
                <link rel="canonical" href="https://beautyhaat.com/contact" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Contact Us | BeautyHaat" />
                <meta property="og:description" content="Get in touch with BeautyHaat for questions about orders, products or partnerships." />
                <meta property="og:url" content="https://beautyhaat.com/contact" />
            </Helmet>

            <div className="contact-header">
                <h1>Contact Us</h1>
                <p>We'd love to hear from you! Please reach out with any questions about our beauty products.</p>
            </div>

            <div className="contact-container">
                {/* Contact Information Section */}
                <div className="contact-info">
                    <h3>Get in Touch</h3>
                    <div className="info-item">
                        <strong>Phone:</strong>
                        <p><a href="tel:01805744174">01805744174</a></p>
                    </div>
                    <div className="info-item">
                        <strong>Email:</strong>
                        <p><a href="mailto:notification@beautyhaat.com">notification@beautyhaat.com</a></p>
                        <p><a href="mailto:beautyhaat52@gmail.com">beautyhaat52@gmail.com</a></p>
                    </div>
                    <div className="info-item">
                        <strong>Business Hours:</strong>
                        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    </div>
                </div>

                {/* Contact Form Section */}
                <div className="contact-form-section">
                    <h3>Send us a Message</h3>
                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Your full name"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Your email address"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="5"
                                placeholder="How can we help you?"
                            ></textarea>
                        </div>
                        <button type="submit" className="submit-btn">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;