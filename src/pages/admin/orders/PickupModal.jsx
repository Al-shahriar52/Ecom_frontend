import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../../api/AxiosInstance';

const ModalPortal = ({ children }) => ReactDOM.createPortal(children, document.body);

const PickupModal = ({ order, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        invoice: order.invoice || 'N/A',
        recipient_name: order.customer || '',
        recipient_phone: order.phone || '',
        recipient_address: order.address || '', // Requires full address from Order API, not list API
        cod_amount: order.paymentStatus === 'PAID' ? 0 : order.totalAmount,
        note: '', delivery_type: 0, alternative_phone: '',
        recipient_email: order.email || '',
        item_description: 'Standard Package',
        total_lot: 1
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Backend bulk API handles both single and bulk, so we just wrap the single ID in an array
            await axiosInstance.post('/api/v1/admin/orders/pickup', { orderIds: [order.id] });

            toast.success(`Consignment created for ${form.invoice}`);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Error creating pickup:", error);
            toast.error(error.response?.data?.message || "Failed to place pickup request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalPortal>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content pickup-modal-size" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <div>
                            <h4>Create Order (Steadfast)</h4>
                            <span className="text-small" style={{ color: '#ccc' }}>Inv: {form.invoice}</span>
                        </div>
                        <button onClick={onClose}>✕</button>
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                        <div className="modal-body">
                            <div className="pickup-grid">
                                <div className="input-group">
                                    <label>Invoice ID <span className="req">*</span></label>
                                    <input type="text" value={form.invoice} readOnly style={{ backgroundColor: '#f5f5f5' }} />
                                </div>
                                <div className="input-group">
                                    <label>COD Amount (BDT) <span className="req">*</span></label>
                                    <input type="number" value={form.cod_amount} min="0" onChange={e => setForm({ ...form, cod_amount: e.target.value })} required />
                                </div>
                                <div className="input-group">
                                    <label>Recipient Name <span className="req">*</span></label>
                                    <input type="text" value={form.recipient_name} onChange={e => setForm({ ...form, recipient_name: e.target.value })} maxLength="100" required />
                                </div>
                                <div className="input-group">
                                    <label>Recipient Phone <span className="req">*</span></label>
                                    <input type="text" value={form.recipient_phone} onChange={e => setForm({ ...form, recipient_phone: e.target.value })} maxLength="11" required />
                                </div>
                                <div className="input-group">
                                    <label>Alt. Phone</label>
                                    <input type="text" value={form.alternative_phone} onChange={e => setForm({ ...form, alternative_phone: e.target.value })} maxLength="11" />
                                </div>
                                <div className="input-group">
                                    <label>Email</label>
                                    <input type="email" value={form.recipient_email} onChange={e => setForm({ ...form, recipient_email: e.target.value })} />
                                </div>
                                <div className="input-group full-width">
                                    <label>Address <span className="req">*</span></label>
                                    <textarea value={form.recipient_address} placeholder="Enter full delivery address" onChange={e => setForm({ ...form, recipient_address: e.target.value })} maxLength="250" required />
                                </div>
                                <div className="input-group">
                                    <label>Delivery Type</label>
                                    <select value={form.delivery_type} onChange={e => setForm({ ...form, delivery_type: e.target.value })}>
                                        <option value={0}>Home Delivery</option>
                                        <option value={1}>Point/Hub Pickup</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Total Lot</label>
                                    <input type="number" value={form.total_lot} min="1" onChange={e => setForm({ ...form, total_lot: e.target.value })} />
                                </div>
                                <div className="input-group full-width">
                                    <label>Item Description</label>
                                    <input type="text" value={form.item_description} onChange={e => setForm({ ...form, item_description: e.target.value })} />
                                </div>
                                <div className="input-group full-width">
                                    <label>Note</label>
                                    <input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-cancel-modal" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-submit-modal" disabled={loading}>
                                {loading ? "Creating..." : "Place Pickup Request"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ModalPortal>
    );
};

export default PickupModal;