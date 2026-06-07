
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/AxiosInstance';
import './Dashboard.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- PAGINATION STATE ---
    const [pageNo, setPageNo] = useState(0);
    const [pageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/api/v1/order/myOrders', {
                    params: { pageNo, pageSize }
                });

                const pageData = response.data.data;
                setOrders(pageData.content || []);
                setTotalPages(pageData.totalPages);

            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [pageNo, pageSize]);

    // Handle Page Change
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPageNo(newPage);
            window.scrollTo(0, 0); // Scroll to top on page change
        }
    };

    // Format Date Helper
    const formatDate = (dateArray) => {
        if (!Array.isArray(dateArray)) return 'N/A';
        const date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Status Badge Helper
    const getStatusClass = (status) => {
        switch (status) {
            case 'DELIVERED': return 'status-completed';
            case 'SHIPPED': return 'status-completed';
            case 'PENDING': return 'status-pending';
            case 'CANCELLED': return 'status-pending';
            default: return '';
        }
    };

    if (loading && orders.length === 0) return <div className="dashboard-content">Loading your orders...</div>;

    return (
        <div className="orders-page">
            <h2>My Orders</h2>

            {orders.length > 0 ? (
                <>
                    <div className="orders-list">
                        {orders.map((order) => (
                            <article key={order.id} className="order-card">
                                <header className="order-card-header">
                                    <div className="order-id">
                                        ORDER ID <span className="id-number">#{order.id}</span>
                                    </div>
                                    <Link to={`/dashboard/orders/${order.id}`} className="view-button">View</Link>
                                </header>
                                <section className="order-card-body">
                                    <div className="shipping-address">
                                        <h4>Shipping Address</h4>
                                        <p>{order.shippingAddress}, {order.area}, {order.city}</p>
                                        <p>Phone: {order.phoneNumber}</p>
                                    </div>
                                    <div className="order-details">
                                        <p><strong>Order Date:</strong> {formatDate(order.createdAt)}</p>
                                        <p>
                                            <strong>Status:</strong>
                                            <span className={getStatusClass(order.orderStatus)}>{order.orderStatus}</span>
                                        </p>
                                        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                                        <p><strong>Total:</strong> ৳{order.totalAmount.toFixed(2)}</p>
                                    </div>
                                </section>
                            </article>
                        ))}
                    </div>

                    {/* --- ADMIN STYLE PAGINATION --- */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(pageNo - 1)}
                                disabled={pageNo === 0}
                            >
                                Previous
                            </button>

                            {/* Page Numbers Loop */}
                            {[...Array(totalPages).keys()].map(number => (
                                <span
                                    key={number}
                                    className={`page-number ${pageNo === number ? 'active' : ''}`}
                                    onClick={() => handlePageChange(number)}
                                >
                                    {number + 1}
                                </span>
                            ))}

                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(pageNo + 1)}
                                disabled={pageNo >= totalPages - 1}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="no-orders-message">
                    <p>You don't have any previous orders.</p>
                    <Link to="/" className="view-button" style={{display:'inline-block', marginTop:'10px'}}>Start Shopping</Link>
                </div>
            )}
        </div>
    );
};

export default Orders;