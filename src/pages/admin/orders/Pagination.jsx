import React from 'react';

const Pagination = ({ total, pageSize, currentPage, onChange }) => {
    const pages = Math.ceil(total / pageSize);

    return (
        <div className="pagination">
            {Array.from({ length: pages }).map((_, i) => (
                <button
                    key={i}
                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => onChange(i + 1)}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    );
};

export default Pagination;
