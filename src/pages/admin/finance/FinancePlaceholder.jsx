import React from 'react';
import { Info } from './financeIcons';

const FinancePlaceholder = ({ title, sub, body }) => (
    <>
        <div className="fin-pbar">
            <div><div className="fin-h1">{title}</div><div className="fin-sub">{sub}</div></div>
        </div>
        <div className="fin-wrap">
            <div className="fin-card">
                <div className="fin-empty">
                    <Info size={26} style={{ margin: '0 auto 12px', color: 'var(--fin-tx3)' }} />
                    <h4>Not built yet in this workspace</h4>
                    <p>{body}</p>
                </div>
            </div>
        </div>
    </>
);

export default FinancePlaceholder;
