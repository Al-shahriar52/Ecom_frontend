import React from 'react';
import { SmartLink, Countdown } from './homeUtils';

/** Promo tiles managed from Admin → Homepage → Promo banners. */
export default function PromoBanners({ items }) {
    if (!items || items.length === 0) return null;
    return (
        <section className={`hp-sec hp-promos n${Math.min(items.length, 3)}`}>
            {items.map((p) => (
                <SmartLink key={p.id} url={p.linkUrl} className="hp-promo">
                    <picture>
                        {p.mobileImageUrl && <source media="(max-width: 768px)" srcSet={p.mobileImageUrl} />}
                        <img src={p.imageUrl} alt={p.title || 'Offer'} loading="lazy" />
                    </picture>
                    {(p.title || p.subtitle || p.buttonText || p.badgeText) && (
                        <div className={`hp-promo-t a-${p.textAlign || 'left'}`} style={{ color: p.textColor || '#fff' }}>
                            {p.badgeText && <em>{p.badgeText}</em>}
                            {p.title && <h3>{p.title}</h3>}
                            {p.subtitle && <p>{p.subtitle}</p>}
                            {p.showCountdown && p.endsAt && <Countdown endsAt={p.endsAt} className="on-dark" />}
                            {p.buttonText && <span className="hp-promo-btn">{p.buttonText}</span>}
                        </div>
                    )}
                </SmartLink>
            ))}
        </section>
    );
}
