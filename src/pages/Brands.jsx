import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axiosInstance from '../api/AxiosInstance';
import { slugify } from '../utils/slugify';
import './Brands.css';

const Brands = () => {
    const [brandMenuData, setBrandMenuData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/api/v1/product/brandMenu');
                setBrandMenuData(response.data.data);
            } catch (error) {
                console.error("Error fetching brands:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBrands();
    }, []);

    const groupedBrands = useMemo(() => {
        if (!brandMenuData?.allBrands) return {};
        return brandMenuData.allBrands.reduce((acc, brand) => {
            let firstChar = brand.name.charAt(0).toUpperCase();
            if (!/[A-Z]/.test(firstChar)) firstChar = '#';
            if (!acc[firstChar]) acc[firstChar] = [];
            acc[firstChar].push(brand);
            return acc;
        }, {});
    }, [brandMenuData]);

    const sortedLetters = Object.keys(groupedBrands).sort();
    const alphabet = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

    return (
        <div className="brands-page container">
            <Helmet>
                <title>All Brands | BeautyHaat</title>
                <meta name="description" content="Browse every brand available at BeautyHaat, from skincare to makeup, haircare and personal care." />
                <link rel="canonical" href="https://beautyhaat.com/brands" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="All Brands | BeautyHaat" />
                <meta property="og:description" content="Browse every brand available at BeautyHaat, from skincare to makeup, haircare and personal care." />
                <meta property="og:url" content="https://beautyhaat.com/brands" />
            </Helmet>

            <h1 className="brands-page-heading">All Brands</h1>

            {loading ? (
                <div className="brands-page-loading">Loading brands...</div>
            ) : !brandMenuData || (brandMenuData.allBrands || []).length === 0 ? (
                <p>No brands available right now.</p>
            ) : (
                <>
                    {brandMenuData.topBrands && brandMenuData.topBrands.length > 0 && (
                        <section className="brands-page-top">
                            <h2>Top Brands</h2>
                            <div className="brands-page-logo-grid">
                                {brandMenuData.topBrands.map(b => (
                                    <Link
                                        key={b.id}
                                        to={`/brand/${slugify(b.name)}`}
                                        className="brands-page-logo-item"
                                        state={{ brandName: b.name, brandId: b.id }}
                                    >
                                        {b.logoUrl && <img src={b.logoUrl} alt={b.name} />}
                                        <p>{b.name}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    <div className="brands-page-body">
                        <nav className="brands-page-alphabet">
                            {alphabet.map(letter => (
                                <a
                                    key={letter}
                                    href={`#brand-letter-${letter}`}
                                    className={groupedBrands[letter] ? '' : 'disabled'}
                                >
                                    {letter}
                                </a>
                            ))}
                        </nav>

                        <div className="brands-page-list">
                            {sortedLetters.map(letter => (
                                <div key={letter} id={`brand-letter-${letter}`} className="brands-page-letter-group">
                                    <h3>{letter}</h3>
                                    <ul>
                                        {groupedBrands[letter].map(b => (
                                            <li key={b.id}>
                                                <Link to={`/brand/${slugify(b.name)}`} state={{ brandName: b.name, brandId: b.id }}>
                                                    {b.name}
                                                    <span className="brands-page-count">{b.productCount}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Brands;
