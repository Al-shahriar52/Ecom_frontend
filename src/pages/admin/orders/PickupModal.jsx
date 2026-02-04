import React, { useState } from 'react';

const PickupModal = ({ order, onClose }) => {
    const [form, setForm] = useState({
        invoice: order.invoice,
        name: order.customer,
        phone: order.phone,
        address: 'Dhaka, Bangladesh',
        cod: order.cod,
        note: ''
    });

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <h3>Create Steadfast Pickup</h3>
                    <button onClick={onClose}>✖</button>
                </div>

                <div className="pickup-form">
                    <label>Invoice</label>
                    <input value={form.invoice} disabled />

                    <label>Receiver Name</label>
                    <input value={form.name} />

                    <label>Phone</label>
                    <input value={form.phone} />

                    <label>Address</label>
                    <textarea value={form.address}></textarea>

                    <label>COD Amount</label>
                    <input value={form.cod} />

                    <label>Note</label>
                    <input value={form.note} placeholder="Delivery instructions" />

                    <button className="btn-confirm">Create Pickup</button>
                </div>
            </div>
        </div>
    );
};

export default PickupModal;
