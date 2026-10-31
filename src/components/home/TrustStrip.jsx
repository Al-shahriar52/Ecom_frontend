import React from 'react';
import { ShieldCheck, Truck, Wallet, RotateCcw } from 'lucide-react';

const ITEMS = [
    { icon: ShieldCheck, title: '100% authentic', text: 'Genuine products only' },
    { icon: Truck, title: 'Fast delivery', text: 'All over Bangladesh' },
    { icon: Wallet, title: 'Cash on delivery', text: 'Pay when it arrives' },
    { icon: RotateCcw, title: 'Easy returns', text: '7-day return policy' },
];

export default function TrustStrip() {
    return (
        <section className="hp-trust" aria-label="Why shop with BeautyHaat">
            {ITEMS.map(({ icon: Icon, title, text }) => (
                <div key={title} className="hp-trust-i">
                    <span><Icon size={22} /></span>
                    <div><b>{title}</b><small>{text}</small></div>
                </div>
            ))}
        </section>
    );
}
