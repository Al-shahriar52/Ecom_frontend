import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Sprout, ShieldCheck, Sparkles, Zap, Sun, Droplets, Heart, ArrowRight } from 'lucide-react';
import { SectionHead } from './homeUtils';
import { DEFAULT_CONCERNS, concernLink } from './concernData';

const ICONS = [Leaf, Sprout, ShieldCheck, Sparkles, Zap, Sun, Droplets, Heart];

/** "Shop by concern": problem-first shopping (acne, hair fall, ...). Managed in Admin > Homepage. */
export default function ConcernSection({ items }) {
    const list = items && items.length ? items : DEFAULT_CONCERNS;
    return (
        <section className="hp-sec">
            <SectionHead eyebrow="Solutions" title="Shop by your concern" />
            <p className="hp-concern-lead">Tell us what you want to fix. We will show the products that help.</p>
            <div className="hp-concerns">
                {list.map((c, i) => {
                    const Icon = ICONS[i % ICONS.length];
                    const ink = c.textColor || '#333';
                    return (
                        <Link key={c.id} to={concernLink(c)} className="hp-concern" style={{ background: c.bgColor || '#f9e1e6', color: ink }}>
                            <span className="hp-concern-blob" style={{ background: ink }} aria-hidden="true" />
                            <span className="hp-concern-ico" style={{ color: ink }}>
                                {c.imageUrl ? <img src={c.imageUrl} alt="" loading="lazy" /> : <Icon size={26} strokeWidth={1.8} />}
                            </span>
                            <span className="hp-concern-t">
                                <b>{c.title}</b>
                                {c.subtitle && <small>{c.subtitle}</small>}
                            </span>
                            <span className="hp-concern-go" style={{ background: ink }}><ArrowRight size={16} /></span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
