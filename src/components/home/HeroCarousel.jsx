import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SmartLink, Countdown, reducedMotion } from './homeUtils';

/** Fading hero slider: swipe on phones, arrows on desktop, pauses on hover. */
export default function HeroCarousel({ slides, loading }) {
    const [idx, setIdx] = useState(0);
    const [paused, setPaused] = useState(false);
    const touch = useRef(null);
    const n = slides ? slides.length : 0;

    const go = useCallback((d) => setIdx((i) => (n ? (i + d + n) % n : 0)), [n]);

    useEffect(() => { setIdx(0); }, [n]);

    useEffect(() => {
        if (n < 2 || paused || reducedMotion()) return undefined;
        const t = setInterval(() => setIdx((i) => (i + 1) % n), 6000);
        return () => clearInterval(t);
    }, [n, paused]);

    if (loading) return <div className="hc hc-skel" aria-hidden="true" />;
    if (!n) return null;

    const cur = slides[idx] || slides[0];

    const onTouchStart = (e) => { touch.current = e.touches[0].clientX; setPaused(true); };
    const onTouchEnd = (e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        setTimeout(() => setPaused(false), 4000);
    };

    return (
        <section className={`hc ${cur.mobileImageUrl ? 'm-tall' : ''}`} aria-roledescription="carousel" aria-label="Featured offers"
                 onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
                 onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {slides.map((s, i) => {
                const hasText = s.title || s.subtitle || s.buttonText || s.badgeText;
                return (
                    <SmartLink key={s.id || i} url={s.linkUrl} className={`hc-slide ${i === idx ? 'on' : ''}`}
                               aria-hidden={i !== idx} tabIndex={i === idx ? 0 : -1}>
                        <picture>
                            {s.mobileImageUrl && <source media="(max-width: 768px)" srcSet={s.mobileImageUrl} />}
                            <img src={s.imageUrl} alt={s.title || 'BeautyHaat offer'} loading={i === 0 ? 'eager' : 'lazy'}
                                 {...(i === 0 ? { fetchpriority: 'high' } : {})} draggable="false" />
                        </picture>
                        {hasText && (
                            <div className={`hc-text a-${s.textAlign || 'left'}`} style={{ color: s.textColor || '#fff' }}>
                                <div>
                                    {s.badgeText && <em>{s.badgeText}</em>}
                                    {s.title && <h2>{s.title}</h2>}
                                    {s.subtitle && <p>{s.subtitle}</p>}
                                    {s.showCountdown && s.endsAt && <Countdown endsAt={s.endsAt} className="on-dark" />}
                                    {s.buttonText && <span className="hc-btn">{s.buttonText}</span>}
                                </div>
                            </div>
                        )}
                    </SmartLink>
                );
            })}

            {n > 1 && (
                <>
                    <button className="hc-arrow prev" onClick={() => go(-1)} aria-label="Previous slide"><ChevronLeft size={22} /></button>
                    <button className="hc-arrow next" onClick={() => go(1)} aria-label="Next slide"><ChevronRight size={22} /></button>
                    <div className="hc-dots" role="tablist">
                        {slides.map((s, i) => (
                            <button key={s.id || i} role="tab" aria-selected={i === idx} aria-label={`Slide ${i + 1}`}
                                    className={i === idx ? 'on' : ''} onClick={() => setIdx(i)} />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
