import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../../api/AxiosInstance';

const ModalPortal = ({ children }) => ReactDOM.createPortal(children, document.body);

const ORDER_STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PACKAGED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
const DELIVERY_STATUS_OPTIONS = ['PENDING', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'RETURNED', 'CANCELLED'];
const PAYMENT_METHOD_OPTIONS = ['COD', 'BKASH', 'CARD', 'NAGAD', 'ROCKET'];
const PAYMENT_STATUS_OPTIONS = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

/**
 * Full order-edit form. Submits to PATCH /api/v1/admin/orders/{orderId}/status
 * with only the fields that changed - every field is optional server-side,
 * so a partial payload is fine, but we send everything we have loaded to
 * keep this simple and predictable.
 */
const OrderUpdateModal = ({ order, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        orderStatus: order.orderStatus || 'PENDING',
        deliveryStatus: order.deliveryStatus || '',
        customerName: order.customer || '',
        phone: order.phone || '',
        email: order.email || '',
        shippingAddress: order.shippingAddress || order.address || '',
        city: order.city || '',
        area: order.area || '',
        paymentMethod: order.paymentMethod || '',
        paymentStatus: order.paymentStatus || 'PENDING',
        shippingCost: order.shippingCost ?? '',
        totalAmount: order.totalAmount ?? '',
        cid: order.cid || '',
        trackingCode: order.trackingCode || '',
        orderNote: order.orderNote || '',
        note: '',
    });
    const [saving, setSaving] = useState(false);

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axiosInstance.patch(`/api/v1/admin/orders/${order.id}/status`, {
                orderStatus: form.orderStatus || null,
                deliveryStatus: form.deliveryStatus || null,
                customerName: form.customerName || null,
                phone: form.phone || null,
                email: form.email || null,
                shippingAddress: form.shippingAddress || null,
                city: form.city || null,
                area: form.area || null,
                paymentMethod: form.paymentMethod || null,
                paymentStatus: form.paymentStatus || null,
                shippingCost: form.shippingCost === '' ? null : Number(form.shippingCost),
                totalAmount: form.totalAmount === '' ? null : Number(form.totalAmount),
                cid: form.cid || null,
                trackingCode: form.trackingCode || null,
                orderNote: form.orderNote || null,
                note: form.note || null,
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

                            <h5 className="update-section-title">Status</h5>
                            <div className="update-form-grid">
                                <div className="input-group">
                                    <label>Order Status <span className="req">*</span></label>
                                    <select value={form.orderStatus} onChange={set('orderStatus')} required>
                                        {ORDER_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Delivery Status</label>
                                    <select value={form.deliveryStatus} onChange={set('deliveryStatus')} disabled={!order.cid}>
                                        <option value="">{order.cid ? '— Not set —' : 'No delivery record yet'}</option>
                                        {DELIVERY_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                                    </select>
                                </div>
                            </div>

                            <h5 className="update-section-title">Customer & Shipping</h5>
                            <div className="update-form-grid">
                                <div className="input-group">
                                    <label>Customer Name</label>
                                    <input type="text" value={form.customerName} onChange={set('customerName')} />
                                </div>
                                <div className="input-group">
                                    <label>Phone</label>
                                    <input type="text" value={form.phone} onChange={set('phone')} maxLength="11" />
                                </div>
                                <div className="input-group">
                                    <label>Email</label>
                                    <input type="email" value={form.email} onChange={set('email')} />
                                </div>
                                <div className="input-group">
                                    <label>City</label>
                                    <input type="text" value={form.city} onChange={set('city')} />
                                </div>
                                <div className="input-group">
                                    <label>Area</label>
                                    <input type="text" value={form.area} onChange={set('area')} />
                                </div>
                                <div className="input-group full-width">
                                    <label>Shipping Address</label>
                                    <textarea value={form.shippingAddress} onChange={set('shippingAddress')} maxLength="250" />
                                </div>
                            </div>

                            <h5 className="update-section-title">Payment & Financials</h5>
                            <div className="update-form-grid">
                                <div className="input-group">
                                    <label>Payment Method</label>
                                    <select value={form.paymentMethod} onChange={set('paymentMethod')}>
                                        <option value="">— Not set —</option>
                                        {PAYMENT_METHOD_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Payment Status</label>
                                    <select value={form.paymentStatus} onChange={set('paymentStatus')}>
                                        {PAYMENT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Shipping Cost (BDT)</label>
                                    <input type="number" min="0" value={form.shippingCost} onChange={set('shippingCost')} />
                                </div>
                                <div className="input-group">
                                    <label>Total Amount (BDT)</label>
                                    <input type="number" min="0" value={form.totalAmount} onChange={set('totalAmount')} />
                                </div>
                            </div>

                            <h5 className="update-section-title">Courier (manual correction only)</h5>
                            <div className="update-form-grid">
                                <div className="input-group">
                                    <label>Consignment ID</label>
                                    <input type="text" value={form.cid} onChange={set('cid')} placeholder="Set automatically on pickup" disabled={!order.cid} />
                                </div>
                                <div className="input-group">
                                    <label>Tracking Code</label>
                                    <input type="text" value={form.trackingCode} onChange={set('trackingCode')} disabled={!order.cid} />
                                </div>
                            </div>

                            <h5 className="update-section-title">Notes</h5>
                            <div className="update-form-grid">
                                <div className="input-group full-width">
                                    <label>Order Note</label>
                                    <textarea value={form.orderNote} onChange={set('orderNote')} maxLength="250" placeholder="Note attached to the order itself" />
                                </div>
                                <div className="input-group full-width">
                                    <label>Internal Note</label>
                                    <textarea
                                        value={form.note}
                                        onChange={set('note')}
                                        placeholder="Optional note about this change (not saved yet - no admin-note column exists on the backend)"
                                        maxLength="250"
                                    />
                                </div>
                            </div>

                            {form.orderStatus === 'CANCELLED' && (
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