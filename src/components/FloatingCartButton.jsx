import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './FloatingCartButton.css';

/**
 * Compact cart tab (dark top, pink price). Rests as a slim handle on the right edge,
 * slides out on hover / tap / keyboard focus and when something is added, then tucks away again.
 */
const FloatingCartButton = () => {
    const { cart } = useContext(CartContext);
    const [open, setOpen] = useState(false);
    const [bump, setBump] = useState(false);
    const timer = useRef(null);
    const prev = useRef(null);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const clear = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
    const closeLater = useCallback((ms) => { clear(); timer.current = setTimeout(() => setOpen(false), ms); }, []);

    // Item added: slide out for a moment so the customer sees it worked.
    useEffect(() => {
        if (prev.current !== null && totalItems > prev.current) {
            setOpen(true);
            setBump(true);
            closeLater(2800);
            const t = setTimeout(() => setBump(false), 700);
            prev.current = totalItems;
            return () => clearTimeout(t);
        }
        prev.current = totalItems;
        return undefined;
    }, [totalItems, closeLater]);

    useEffect(() => clear, []);

    // A tap anywhere else tucks it away.
    useEffect(() => {
        if (!open) return undefined;
        const h = (e) => { if (!e.target.closest || !e.target.closest('.fcb')) setOpen(false); };
        document.addEventListener('pointerdown', h);
        return () => document.removeEventListener('pointerdown', h);
    }, [open]);

    if (totalItems === 0) return null;

    const toggle = () => { clear(); setOpen((o) => { if (!o) closeLater(5000); return !o; }); };

    const money = Math.round(totalPrice).toLocaleString('en-US');

    return (
        <div className={`fcb ${open ? 'open' : ''} ${bump ? 'bump' : ''}`}
             onMouseEnter={(e) => { if (e.pointerType !== 'touch') { clear(); setOpen(true); } }}
             onMouseLeave={() => closeLater(350)}
             onFocus={() => { clear(); setOpen(true); }}
             onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) closeLater(300); }}>
            <div className="fcb-handle" role="button" tabIndex={0} aria-expanded={open}
                 aria-label={`Cart: ${totalItems} items. ${open ? 'Hide' : 'Show'} details`}
                 onClick={toggle} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}>
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <i className="fcb-count">{totalItems > 99 ? '99+' : totalItems}</i>
            </div>
            <Link to="/cart" className="fcb-body" tabIndex={open ? 0 : -1} aria-label="View bag">
                <span className="fcb-txt">
                    <small>{totalItems} {totalItems === 1 ? 'item' : 'items'} in bag</small>
                    <b>৳ {money}</b>
                </span>
                <span className="fcb-go">
                    View
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
                </span>
            </Link>
        </div>
    );
};

export default FloatingCartButton;
