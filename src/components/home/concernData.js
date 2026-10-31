import { slugify } from '../../utils/slugify';

// Shown on the home page until the admin adds their own in Admin > Homepage > Shop by concern.
export const DEFAULT_CONCERNS = [
    { id: 'd-acne', title: 'Acne & breakouts', subtitle: 'Clear, calm, blemish-free skin', keywords: 'acne, pimple, blemish, salicylic', bgColor: '#fde4df', textColor: '#8a2f1f' },
    { id: 'd-hair', title: 'Hair fall', subtitle: 'Stronger, thicker, healthier hair', keywords: 'hair fall, hair loss, hair growth, hair serum, hair oil', bgColor: '#e3efe6', textColor: '#2f5a3b' },
    { id: 'd-barrier', title: 'Skin barrier repair', subtitle: 'Soothe, restore and protect', keywords: 'barrier, ceramide, cica, repair, soothing', bgColor: '#e6e4f5', textColor: '#3f3a7a' },
    { id: 'd-bright', title: 'Brightening', subtitle: 'A natural, even glow', keywords: 'brightening, vitamin c, niacinamide, glow, whitening', bgColor: '#fdf0d5', textColor: '#7a5a10' },
    { id: 'd-spots', title: 'Dark spots', subtitle: 'Fade marks and pigmentation', keywords: 'dark spot, pigmentation, melasma, spot, tranexamic', bgColor: '#f9e1e6', textColor: '#7a2e43' },
    { id: 'd-sun', title: 'Sun protection', subtitle: 'Daily SPF, every skin type', keywords: 'sunscreen, sunblock, spf, sun protection, sun', bgColor: '#fff1d6', textColor: '#8a5b0a' },
    { id: 'd-dry', title: 'Dry & dehydrated', subtitle: 'Deep, lasting hydration', keywords: 'hydrating, moisturizer, hyaluronic, dry skin, cream', bgColor: '#dff0f7', textColor: '#1f5a75' },
    { id: 'd-aging', title: 'Anti-aging', subtitle: 'Smooth fine lines and firm up', keywords: 'anti aging, anti-aging, retinol, wrinkle, collagen', bgColor: '#efe3f3', textColor: '#5e2f73' },
];

export const concernLink = (c) => {
    const q = new URLSearchParams({ kw: c.keywords || c.title, t: c.title, d: c.subtitle || '' });
    return `/concern/${slugify(c.title)}?${q.toString()}`;
};
