import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Pencil, Truck, XCircle, PackageSearch } from 'lucide-react';
import axiosInstance from '../../../api/AxiosInstance';
import TrackingStepper from '../../../components/order/TrackingStepper';
import PickupModal from './PickupModal';
import OrderUpdateModal from './OrderUpdateModal';
import './AdminOrders.css'; // reuse status-pill / delivery-pill / badge / status-dot classes
import './AdminOrderDetails.css';

// NOTE FOR BACKEND: fetches GET /api/v1/admin/orders/{orderId} for the
// authoritative record (address, email, line items, etc. that the list
// endpoint doesn't return). Adjust this path if your actual route differs.
const AdminOrderDetails = () => {
    const { orderId } = useParams();
    const location = useLocation();

    // Fast path: render instantly from the row data passed via navigation
    // state (clicking the invoice link or "View Details"), then confirm/
    // enrich from the API. Falls back to a normal loading spinner on a
    // direct URL load or refresh, where no state is available.
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);
    const [error, setError] = useState(null);

    const [showPickupModal, setShowPickupModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const fetchOrder = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/api/v1/admin/orders/${orderId}`);
            setOrder(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching order details:', err);
            // Only show a hard error if we have nothing at all to display yet.
            if (!location.state?.order) {
                setError('Failed to load this order. It may not exist or you may not have permission to view it.');
            }
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const formatDate = (dateArray) => {
        if (!Array.isArray(dateArray)) return 'N/A';
        const date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], dateArray[3], dateArray[4]);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handleCancelOrder = async () => {
        if (!order?.invoice) {
            toast.error("Cannot cancel an order without an invoice ID");
            return;
        }
        if (!window.confirm(`Are you sure you want to cancel order ${order.invoice}?`)) return;

        try {
            await axiosInstance.post('/api/v1/admin/orders/cancel', { invoices: [order.invoice] });
            toast.success(`Order ${order.invoice} cancelled successfully.`);
            fetchOrder();
        } catch (err) {
            console.error("Error cancelling order:", err);
            toast.error("Failed to cancel order.");
        }
    };

    if (loading) {
        return (
            <div className="aod-page">
                <div className="aod-loading">Loading order...</div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="aod-page">
                <Link to="/admin/orders" className="aod-back-link"><ArrowLeft size={16} /> Back to Orders</Link>
                <div className="aod-error">{error || 'Order not found.'}</div>
            </div>
        );
    }

    const canCancel = order.orderStatus !== 'CANCELLED' && order.deliveryStatus !== 'DELIVERED';
    const hasCourier = !!order.cid;
    const items = order.items || order.orderItems || order.products || [];

    return (
        <div className="aod-page">
            <Link to="/admin/orders" className="aod-back-link"><ArrowLeft size={16} /> Back to Orders</Link>

            {/* HEADER */}
            <div className="aod-header">
                <div>
                    <h1 className="aod-title">Order {order.invoice || `#${order.id}`}</h1>
                    <div className="aod-subtitle">Placed on {formatDate(order.date)}</div>
                </div>

                <div className="aod-header-actions">
                    <span className={`status-pill ${order.orderStatus?.toLowerCase() || 'pending'}`}>{order.orderStatus || 'PENDING'}</span>

                    <button className="aod-action-btn" onClick={() => setShowUpdateModal(true)}>
                        <Pencil size={15} /> Update Order
                    </button>

                    {!hasCourier && (
                        <button
                            className="aod-action-btn aod-action-primary"
                            onClick={() => setShowPickupModal(true)}
                            disabled={order.orderStatus === 'CANCELLED'}
                        >
                            <Truck size={15} /> Request Pickup
                        </button>
                    )}

                    {canCancel && (
                        <button className="aod-action-btn aod-action-danger" onClick={handleCancelOrder}>
                            <XCircle size={15} /> Cancel Order
                        </button>
                    )}
                </div>
            </div>

            <div className="aod-grid">
                {/* MAIN COLUMN */}
                <div className="aod-main">

                    {/* ORDER ITEMS */}
                    <div className="aod-card">
                        <h3 className="aod-card-title">Order Items</h3>
                        {items.length > 0 ? (
                            <table className="aod-items-table">
                                <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Subtotal</th>
                                </tr>
                                </thead>
                                <tbody>
                                {items.map((item, i) => (
                                    <tr key={i}>
                                        <td className="aod-item-name">{item.productName || item.name}</td>
                                        <td>{item.quantity || item.qty}</td>
                                        <td>৳{item.price || item.unitPrice}</td>
                                        <td>৳{item.subtotal || (item.quantity || item.qty) * (item.price || item.unitPrice)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="aod-empty-note">Item-level details aren't available from this endpoint yet.</p>
                        )}
                    </div>

                    {/* TRACKING - embedded directly on the page, not a modal */}
                    <div className="aod-card">
                        <h3 className="aod-card-title">Delivery Tracking</h3>
                        {hasCourier ? (
                            <>
                                <div className="aod-tracking-summary">
                                    <span>Courier Tracking ID: <strong>{order.cid}</strong></span>
                                </div>
                                <TrackingStepper order={order} />
                            </>
                        ) : (
                            <div className="aod-no-tracking">
                                <PackageSearch size={28} strokeWidth={1.5} />
                                <p>This order hasn't been picked up by a courier yet.</p>
                                {order.orderStatus !== 'CANCELLED' && (
                                    <button className="aod-action-btn aod-action-primary" onClick={() => setShowPickupModal(true)}>
                                        <Truck size={15} /> Request Pickup
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* SIDEBAR */}
                <div className="aod-sidebar">
                    <div className="aod-card">
                        <h3 className="aod-card-title">Customer</h3>
                        <div className="aod-info-row"><span>Name</span><strong>{order.customer || 'Guest User'}</strong></div>
                        <div className="aod-info-row"><span>Phone</span><strong>{order.phone || 'N/A'}</strong></div>
                        <div className="aod-info-row"><span>Email</span><strong>{order.email || 'N/A'}</strong></div>
                    </div>

                    <div className="aod-card">
                        <h3 className="aod-card-title">Shipping Address</h3>
                        <p className="aod-address">{order.address || 'Not available from this endpoint yet.'}</p>
                    </div>

                    <div className="aod-card">
                        <h3 className="aod-card-title">Payment</h3>
                        <div className="aod-info-row">
                            <span>Method</span>
                            <span className={order.paymentMethod === 'Bkash' ? 'badge-bkash' : 'badge-cod'}>{order.paymentMethod || 'N/A'}</span>
                        </div>
                        <div className="aod-info-row">
                            <span>Status</span>
                            <span className={`status-dot ${order.paymentStatus === 'PAID' ? 'dot-success' : 'dot-warning'}`}>{order.paymentStatus || 'PENDING'}</span>
                        </div>
                        <div className="aod-info-row aod-total-row"><span>Total</span><strong>৳{order.totalAmount || 0}</strong></div>
                    </div>

                    <div className="aod-card">
                        <h3 className="aod-card-title">Order Meta</h3>
                        <div className="aod-info-row"><span>Order ID</span><strong>#{order.id}</strong></div>
                        <div className="aod-info-row">
                            <span>Delivery Status</span>
                            <span className={`delivery-pill ${!order.deliveryStatus ? 'empty' : order.deliveryStatus.toLowerCase().replace(' ', '-')}`}>{order.deliveryStatus || '-'}</span>
                        </div>
                        <div className="aod-info-row"><span>Courier ID</span><strong>{order.cid || '—'}</strong></div>
                    </div>
                </div>
            </div>

            {showPickupModal && (
                <PickupModal
                    order={order}
                    onClose={() => setShowPickupModal(false)}
                    onSuccess={fetchOrder}
                />
            )}

            {showUpdateModal && (
                <OrderUpdateModal
                    order={order}
                    onClose={() => setShowUpdateModal(false)}
                    onSuccess={fetchOrder}
                />
            )}
        </div>
    );
};

export default AdminOrderDetails;