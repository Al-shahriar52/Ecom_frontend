import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../../api/AxiosInstance';

const ModalPortal = ({ children }) => ReactDOM.createPortal(children, document.body);

const ORDER_STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PACKAGED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
const DELIVERY_STATUS_OPTIONS = ['', 'PENDING', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'RETURNED', 'CANCELLED'];

/**
 * NOTE FOR BACKEND: this submits to PATCH /api/v1/admin/orders/{orderId}/status
 * with { orderStatus, deliveryStatus, note }. Adjust the endpoint/payload here
 * if your actual backend route differs.
 */
const OrderUpdateModal = ({ order, onClose, onSuccess }) => {
    const [orderStatus, setOrderStatus] = useState(order.orderStatus || 'PENDING');
    const [deliveryStatus, setDeliveryStatus] = useState(order.deliveryStatus || '');
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axiosInstance.patch(`/api/v1/admin/orders/${order.id}/status`, {
                orderStatus,
                deliveryStatus: deliveryStatus || null,
                note: note || null,
            });
            toast.success(`Order ${order.invoice} updated`);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error(error.response?.data?.message || 'Failed to update order.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ModalPortal>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content update-modal-size" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <div>
                            <h4>Update Order</h4>
                            <span className="text-small" style={{ color: '#ccc' }}>Inv: {order.invoice}</span>
                        </div>
                        <button onClick={onClose}>✕</button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                        <div className="modal-body">
                            <div className="update-form-grid">
                                <div className="input-group">
                                    <label>Order Status <span className="req">*</span></label>
                                    <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)} required>
                                        {ORDER_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label>Delivery Status</label>
                                    <select value={deliveryStatus} onChange={e => setDeliveryStatus(e.target.value)}>
                                        <option value="">— Not set —</option>
                                        {DELIVERY_STATUS_OPTIONS.filter(Boolean).map(s => (
                                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group full-width">
                                    <label>Internal Note</label>
                                    <textarea
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        placeholder="Optional note about this status change (visible to admins only)"
                                        maxLength="250"
                                    />
                                </div>
                            </div>

                            {orderStatus === 'CANCELLED' && (
                                <div className="update-warning-banner">
                                    ⚠ Setting status to CANCELLED will cancel this order. Consider using the dedicated
                                    "Cancel Order" action instead, which also notifies the courier if a pickup was already placed.
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-cancel-modal" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-submit-modal" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ModalPortal>
    );
};

export default OrderUpdateModal;