import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import axiosInstance from '../api/AxiosInstance';
import AnnouncementBar from '../components/home/AnnouncementBar';
import HeroCarousel from '../components/home/HeroCarousel';
import TrustStrip from '../components/home/TrustStrip';
import ConcernSection from '../components/home/ConcernSection';
import PromoBanners from '../components/home/PromoBanners';
import ProductTabs from '../components/home/ProductTabs';
import ProductRail from '../components/home/ProductRail';
import BrandStrip from '../components/home/BrandStrip';
import { SectionHead } from '../components/home/homeUtils';
import './Home.css';
import '../components/home/HomeSections.css';

const HOME_TITLE = 'BeautyHaat | Buy Makeup, Skincare & Beauty Products Online in Bangladesh';
const HOME_DESCRIPTION = 'Shop genuine makeup, skincare, haircare, fragrance and personal care products online at BeautyHaat, with fast delivery across Bangladesh.';

// Shown until the admin adds their own hero slides in Admin > Homepage.
const DEFAULT_HERO = [
    'https://res.cloudinary.com/dgxol8iyp/image/upload/v1778592921/ecommerce/ChatGPT_Image_May_12_2026_07_34_49_PM_hauhxs.png',
].map((imageUrl, i) => ({ id: `d${i}`, imageUrl, title: 'Beauty you can trust', subtitle: 'Genuine makeup & skincare, delivered across Bangladesh', buttonText: 'Shop now', linkUrl: '/shop', textAlign: 'left', textColor: '#ffffff' }));

const safe = (p) => p.then((r) => r.data.data).catch(() => null);

const Home = () => {
    const [content, setContent] = useState(null);
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loadingContent, setLoadingContent] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        let alive = true;
        safe(axiosInstance.get('/api/v1/home/content')).then((d) => { if (alive) { setContent(d); setLoadingContent(false); } });
        safe(axiosInstance.get('/api/v1/product/newestArrivals')).then((d) => { if (alive) { setProducts(Array.isArray(d) ? d : []); setLoadingProducts(false); } });
        safe(axiosInstance.get('/api/v1/product/brandMenu')).then((d) => { if (alive && d) setBrands(d.topBrands || []); });
        return () => { alive = false; };
    }, []);

    const inStock = useMemo(() => products.filter((p) => p.quantity > 0), [products]);
    const newest = useMemo(() => inStock.slice(0, 10), [inStock]);
    const deals = useMemo(() => inStock
        .filter((p) => p.originalPrice && p.originalPrice > p.discountedPrice)
        .sort((a, b) => (b.originalPrice - b.discountedPrice) / b.originalPrice - (a.originalPrice - a.discountedPrice) / a.originalPrice)
        .slice(0, 10), [inStock]);
    const topRated = useMemo(() => inStock
        .filter((p) => p.rating >= 4)
        .sort((a, b) => b.rating - a.rating || (b.numReviews || 0) - (a.numReviews || 0))
        .slice(0, 10), [inStock]);
    const railProducts = useMemo(() => inStock.slice(10, 22), [inStock]);

    const hero = content && content.hero && content.hero.length ? content.hero : DEFAULT_HERO;

    // WebSite schema (enables Google's sitelinks search box) + Organization
    // schema (brand identity for the knowledge panel). These belong on the
    // homepage only - one instance per site.
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "BeautyHaat",
        "url": "https://beautyhaat.com/"
        // NOTE: a "potentialAction": SearchAction block (which can unlock
        // Google's sitelinks search box) is deliberately left out - it must
        // point at a URL pattern that actually returns filtered results
        // (e.g. /shop?q={search_term_string}), which ShopPage.jsx doesn't
        // support yet. Add it back once that query-param search exists.
    };

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "BeautyHaat",
        "url": "https://beautyhaat.com/",
        "logo": "https://res.cloudinary.com/dgxol8iyp/image/upload/v1778592921/ecommerce/ChatGPT_Image_May_12_2026_07_34_49_PM_hauhxs.png",
        "sameAs": [
            "https://www.facebook.com/beautyhaat52"
        ]
    };

    const itemListSchema = newest.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Newest Arrivals",
        "itemListElement": newest.slice(0, 20).map((p, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://beautyhaat.com/product/${p.slug || p.productId}`,
            "name": p.name,
            ...(p.imageUrl ? { "image": p.imageUrl } : {})
        }))
    } : null;

    return (
        <div className="home-page hp">
            <Helmet>
                <title>{HOME_TITLE}</title>
                <meta name="description" content={HOME_DESCRIPTION} />
                <link rel="canonical" href="https://beautyhaat.com/" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={HOME_TITLE} />
                <meta property="og:description" content={HOME_DESCRIPTION} />
                <meta property="og:url" content="https://beautyhaat.com/" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={HOME_TITLE} />
                <meta name="twitter:description" content={HOME_DESCRIPTION} />
                <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
                <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
                {itemListSchema && (
                    <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
                )}
            </Helmet>

            <h1 className="hp-sr">BeautyHaat - genuine makeup, skincare and beauty products in Bangladesh</h1>

            <AnnouncementBar items={content ? content.announcements : []} />
            <HeroCarousel slides={hero} loading={loadingContent} />
            <TrustStrip />
            <ConcernSection items={content ? content.concerns : []} />
            <PromoBanners items={content ? content.promos : []} />
            <ProductTabs loading={loadingProducts} tabs={[
                { key: 'new', label: 'New arrivals', products: newest },
                { key: 'deals', label: 'Best deals', products: deals },
                { key: 'top', label: 'Top rated', products: topRated },
            ]} />
            <BrandStrip brands={brands} />
            {railProducts.length > 0 && (
                <section className="hp-sec">
                    <SectionHead eyebrow="Just for you" title="More to love" to="/shop" />
                    <ProductRail products={railProducts} />
                </section>
            )}
        </div>
    );
};

export default Home;
