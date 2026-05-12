
import React from 'react';
import Slider from 'react-slick';
import './HeroSlider.css';

const HeroSlider = () => {
    // Settings for the slider
    const settings = {
        dots: true, // Show navigation dots
        infinite: true, // Loop slides
        speed: 500, // Transition speed in ms
        slidesToShow: 1, // Show one slide at a time
        slidesToScroll: 1, // Scroll one slide at a time
        autoplay: true, // Enable auto-play
        autoplaySpeed: 15000, // Auto-play interval: 15 seconds
        fade: true, // Use a fade transition
        cssEase: 'linear'
    };

    // Updated slides data
    const slides = [
        {
            imageUrl: 'https://res.cloudinary.com/dgxol8iyp/image/upload/v1778600655/ecommerce/Gemini_Generated_Image_cfsrpdcfsrpdcfsr_1_y2olu3.jpg',
            buttonLink: 'https://beautyhaat.com/product/14'
        },
        {
            imageUrl: 'https://res.cloudinary.com/dgxol8iyp/image/upload/v1778600655/ecommerce/IMG_4045.JPG_dppabw.jpg',
            buttonLink: 'https://beautyhaat.com/product/2' // Internal relative path
        },
        {
            imageUrl: 'https://res.cloudinary.com/dgxol8iyp/image/upload/v1778600655/ecommerce/Gemini_Generated_Image_p7ndqwp7ndqwp7nd_1_1_p6ssqx.jpg',
            buttonLink: 'https://beautyhaat.com/product/10' // Internal relative path
        },
        /*{
            imageUrl: 'https://res.cloudinary.com/dgxol8iyp/image/upload/v1756663199/shop-by-concern-web-updated_dvxdhi.webp',
            buttonLink: '/shop/fragrance' // Internal relative path
        },
        {
            imageUrl: 'https://res.cloudinary.com/dgxol8iyp/image/upload/v1756663199/shajgoj-cosrx-exclusives-slider-web_ylmy3m.webp',
            buttonLink: '/shop/fragrance' // Internal relative path
        }*/
    ];

    // Helper to check if a link is external
    const isExternalLink = (url) => {
        return url.startsWith('http://') || url.startsWith('https://');
    };

    return (
        <div className="hero-slider">
            <Slider {...settings}>
                {slides.map((slide, index) => {
                    const slideContent = (
                        <div className="slide" style={{ backgroundImage: `url(${slide.imageUrl})` }}>
                            {/* Slide titles and buttons would go here if needed.
                                Example content:
                                <div className="slide-content">
                                    <h1 className="slide-title">Example Title</h1>
                                    <button className="shop-now-btn">Shop Now</button>
                                </div>
                            */}
                        </div>
                    );

                    // Choose <a> for external or <Link> for internal
                    if (isExternalLink(slide.buttonLink)) {
                        return (
                            <a key={index} href={slide.buttonLink} target="_blank" rel="noopener noreferrer" className="slide-anchor">
                                {slideContent}
                            </a>
                        );
                    } else {
                        // For internal links, we must handle the relative URL correctly.
                        // Assuming you are still using <Link> from react-router-dom elsewhere.
                        // You will need to import Link again at the top: import { Link } from 'react-router-dom';
                        return (
                            <div key={index}> {slideContent} </div> // Placeholder for internal link logic
                        );
                    }
                })}
            </Slider>
        </div>
    );
};

export default HeroSlider;