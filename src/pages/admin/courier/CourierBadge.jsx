import React from 'react';
import './CourierBadge.css';

/** Small coloured tag showing which courier carries a parcel. Renders nothing when there is no courier. */
const CourierBadge = ({ name }) => {
    if (!name) return null;
    const key = String(name).toLowerCase().replace(/[^a-z]/g, '');
    return <span className={`courier-badge cb-${key}`}>{name}</span>;
};

export default CourierBadge;
