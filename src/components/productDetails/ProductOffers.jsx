import React from 'react';
import './ProductOffers.css';

const ProductOffers = ({ tagNames }) => {
    if (!tagNames) return null;

    const hasFreeShipping = tagNames.toLowerCase().includes('free shipping');

    if (!hasFreeShipping) return null;

    return (
        <div className="offers-container">
            <div className="offer-tag">
                {/* --- Black Free Delivery Truck SVG --- */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    width="24"
                    height="24"
                    role="img"
                    aria-label="Free delivery truck icon"
                >
                    <rect x="40" y="72" width="312" height="248" rx="16" ry="16" fill="#000" />
                    <path
                        d="M368 320h48c8.837 0 16-7.163 16-16V216c0-12.568-6.37-24.39-16.977-30.393-12.48-7.24-28.3-13.607-49.023-13.607H368v164z"
                        fill="#000"
                    />
                    <path
                        d="M432 200c0 0 24 8 24 40v48c0 32-24 40-24 40h-40v-128h40z"
                        fill="#000"
                    />
                    <rect x="24" y="336" width="408" height="24" rx="12" ry="12" fill="#000" />
                    <rect x="8" y="332" width="32" height="20" rx="10" ry="10" fill="#000" />
                    <g fill="#000">
                        <circle cx="140" cy="392" r="64" />
                        <circle cx="396" cy="392" r="64" />
                    </g>
                    <g fill="#fff">
                        <circle cx="140" cy="392" r="28" />
                        <circle cx="396" cy="392" r="28" />
                    </g>
                    <g fill="none" stroke="#000" strokeWidth="8">
                        <circle cx="140" cy="392" r="64" />
                        <circle cx="396" cy="392" r="64" />
                    </g>
                    <path
                        d="M384 160h64c6.627 0 12 5.373 12 12v24c0 6.627-5.373 12-12 12h-64v-48z"
                        fill="#fff"
                    />
                    <g
                        fill="#fff"
                        fontFamily="'Arial Rounded MT Bold', 'Helvetica Rounded', Arial, sans-serif"
                        fontWeight="700"
                        textAnchor="middle"
                    >
                        <text x="206" y="190" fontSize="84">
                            FREE
                        </text>
                    </g>
                </svg>

                <span>Free Shipping</span>
            </div>
        </div>
    );
};

export default ProductOffers;
