import React, { useState } from 'react';
import './AboutUs.css';

const AboutUs = () => {
    const [language, setLanguage] = useState('en');

    return (
        <div className="about-page">
            <div className="about-header">
                <h2>{language === 'en' ? 'About Us' : 'আমাদের সম্পর্কে'}</h2>
                <div className="language-toggle">
                    <button
                        className={language === 'en' ? 'active' : ''}
                        onClick={() => setLanguage('en')}
                    >
                        English
                    </button>
                    <button
                        className={language === 'bn' ? 'active' : ''}
                        onClick={() => setLanguage('bn')}
                    >
                        বাংলা
                    </button>
                </div>
            </div>

            <div className="about-content">
                {/* Introduction Section */}
                <div className="about-section intro-section">
                    <h3>{language === 'en' ? 'Welcome to BeautyHaat' : 'বিউটিহাটে আপনাকে স্বাগতম'}</h3>
                    <p>
                        {language === 'en'
                            ? 'Welcome to BeautyHaat, your ultimate destination for authentic beauty, skincare, hair care, and personal care products in Bangladesh. We believe that beauty is for everyone, and our goal is to bring the best local and international brands right to your doorstep.'
                            : 'বিউটিহাটে আপনাকে স্বাগতম - বাংলাদেশে আসল এবং মানসম্মত বিউটি, স্কিনকেয়ার, হেয়ার কেয়ার এবং পার্সোনাল কেয়ার পণ্যের বিশ্বস্ত প্রতিষ্ঠান। আমরা বিশ্বাস করি সৌন্দর্য সবার জন্য, আর আমাদের লক্ষ্য হলো সেরা দেশি ও বিদেশি ব্র্যান্ডের পণ্যগুলো সরাসরি আপনার দোরগোড়ায় পৌঁছে দেওয়া।'}
                    </p>
                </div>

                {/* Our Mission */}
                <div className="about-section">
                    <h3>{language === 'en' ? 'Our Mission' : 'আমাদের লক্ষ্য'}</h3>
                    <p>
                        {language === 'en'
                            ? 'Our mission is to empower individuals to feel confident and beautiful in their own skin. We strive to provide a seamless online shopping experience, offering top-quality, 100% genuine products at competitive prices, all backed by excellent customer support.'
                            : 'আমাদের লক্ষ্য হলো সাশ্রয়ী মূল্যে সর্বোচ্চ মানের এবং আসল পণ্য সরবরাহের মাধ্যমে সবার আত্মবিশ্বাস ও সৌন্দর্য বৃদ্ধি করা। আমরা আমাদের গ্রাহকদের জন্য একটি সহজ ও নিরাপদ অনলাইন শপিং অভিজ্ঞতা নিশ্চিত করতে নিরলস কাজ করে যাচ্ছি।'}
                    </p>
                </div>

                {/* Why Choose Us Section */}
                <div className="about-section">
                    <h3>{language === 'en' ? 'Why Choose Us?' : 'কেন আমাদের বেছে নেবেন?'}</h3>
                    <ul className="feature-list">
                        <li>
                            <strong>{language === 'en' ? '100% Authentic Products:' : '১০০% আসল পণ্য:'}</strong>
                            {language === 'en'
                                ? ' We source directly from authorized distributors and manufacturers.'
                                : ' আমরা সরাসরি অনুমোদিত পরিবেশক এবং প্রস্তুতকারকদের কাছ থেকে পণ্য সংগ্রহ করি।'}
                        </li>
                        <li>
                            <strong>{language === 'en' ? 'Fast Delivery:' : 'দ্রুত ডেলিভারি:'}</strong>
                            {language === 'en'
                                ? ' Reliable and swift shipping across Bangladesh.'
                                : ' সারা বাংলাদেশে আমাদের রয়েছে দ্রুত এবং নিরাপদ ডেলিভারি ব্যবস্থা।'}
                        </li>
                        <li>
                            <strong>{language === 'en' ? 'Customer Satisfaction:' : 'গ্রাহক সন্তুষ্টি:'}</strong>
                            {language === 'en'
                                ? ' A dedicated support team ready to assist you with your beauty queries.'
                                : ' আপনার যেকোনো প্রশ্নের উত্তর দিতে আমাদের রয়েছে একটি নিবেদিত কাস্টমার সাপোর্ট টিম।'}
                        </li>
                        <li>
                            <strong>{language === 'en' ? 'Secure Payments:' : 'নিরাপদ পেমেন্ট:'}</strong>
                            {language === 'en'
                                ? ' Safe and hassle-free transaction methods for your peace of mind.'
                                : ' আপনার মানসিক শান্তির জন্য নিরাপদ এবং ঝামেলামুক্ত পেমেন্ট পদ্ধতি।'}
                        </li>
                    </ul>
                </div>

                {/* Contact Banner */}
                <div className="about-contact-highlight">
                    <p>
                        {language === 'en'
                            ? 'Have any questions or need beauty advice? We would love to hear from you!'
                            : 'আপনার কি কোনো প্রশ্ন আছে বা বিউটি অ্যাডভাইস প্রয়োজন? আমরা আপনার কথা শুনতে চাই!'}
                    </p>
                    <a href="mailto:notification@beautyhaat.com" className="email-link">notification@beautyhaat.com</a>
                </div>

            </div>
        </div>
    );
};

export default AboutUs;