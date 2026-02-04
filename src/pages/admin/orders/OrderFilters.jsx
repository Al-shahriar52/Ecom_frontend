import React from 'react';

const OrderFilters = ({ filters, setFilters }) => {
    return (
        <div className="order-filter-bar">
            <select
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
            >
                <option value="">All Status</option>
                <option value="in_review">In Review</option>
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
            </select>

            <select
                value={filters.courier}
                onChange={e => setFilters({ ...filters, courier: e.target.value })}
            >
                <option value="">All Couriers</option>
                <option value="Steadfast">Steadfast</option>
            </select>

            <input
                type="text"
                placeholder="Search by Invoice / Phone"
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
            />

            <button
                className="reset-btn"
                onClick={() =>
                    setFilters({ status: '', courier: '', fromDate: '', toDate: '', search: '' })
                }
            >
                Reset
            </button>
        </div>
    );
};

export default OrderFilters;
