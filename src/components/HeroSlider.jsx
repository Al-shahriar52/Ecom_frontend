import React from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
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

    // Example slides (you can fetch this data from an API later)
    const slides = [
        {
            imageUrl: 'https://res.cloudinary.com/dgxol8iyp/image/upload/v1756663199/nirvana-web-banner-2-1920x490_jqggg6.webp',
            buttonLink: '/shop/cosrx'
        },
        {
            imageUrl: 'https://res.cloudinary.com/dgxol8iyp/image/upload/v1756663199/website-homepage-slider-monsoon-sale-2025-yyla_tmjrkn.webp',
            buttonLink: '/shop/ponds'
        },
        {
            imageUrl: 'https://res.cloudinary.com/dgxol8iyp/image/upload/v1756663199/post-eid-hero-banner-1920x490-v2_sjztqu.webp',
            buttonLink: '/shop/fragrance'
        },
        {
            imageUrl: 'https://res.cloudinary.com/dgxol8iyp/image/upload/v1756663199/shop-by-concern-web-updated_dvxdhi.webp',
            buttonLink: '/shop/fragrance'
        },
        {
            imageUrl: 'https://res.cloudinary.com/dgxol8iyp/image/upload/v1756663199/shajgoj-cosrx-exclusives-slider-web_ylmy3m.webp',
            buttonLink: '/shop/fragrance'
        }
    ];

    return (
        <div className="hero-slider">
            <Slider {...settings}>
                {slides.map((slide, index) => (
                    <div key={index}>
                        <div className="slide" style={{ backgroundImage: `url(${slide.imageUrl})` }}>
                            <div className="slide-content">
                                <h1 className="slide-title">{slide.title}</h1>
                                <p className="slide-subtitle">{slide.subtitle}</p>
                                <Link to={slide.linkUrl} key={index}>
                                    <div
                                        className="slide"
                                        style={{ backgroundImage: `url(${slide.imageUrl})` }}
                                    >
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default HeroSlider;