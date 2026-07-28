import React, { useState } from 'react';

const ImageWithSkeleton = ({ src, alt, className }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="img-skeleton-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Show skeleton box until image fires onLoad */}
            {!isLoaded && (
                <div
                    className="pdp-skeleton-box"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
            )}
            <img
                src={src}
                alt={alt}
                className={className}
                onLoad={() => setIsLoaded(true)}
                style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
            />
        </div>
    );
};

export default ImageWithSkeleton;