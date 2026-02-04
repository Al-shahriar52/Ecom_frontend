
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-hot-toast';
import './AdminOrders.css';

// --- PORTAL COMPONENT ---
const ModalPortal = ({ children }) => {
    return ReactDOM.createPortal(children, document.body);
};

const AdminOrders = () => {

    const initialFilters = {
        method: 'All',
        paymentStatus: 'All',
        deliveryStatus: 'All', // Restored
        orderStatus: 'All',
        startDate: '',
        endDate: '',
        search: ''
    };

    const [filters, setFilters] = useState(initialFilters);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // --- MODAL STATES ---
    const [showTrackModal, setShowTrackModal] = useState(false);
    const [showPickupModal, setShowPickupModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [trackingHistory, setTrackingHistory] = useState([]);

    // --- PICKUP FORM STATE ---
    const [pickupForm, setPickupForm] = useState({
        invoice: '', recipient_name: '', recipient_phone: '', recipient_address: '', cod_amount: 0, note: '',
        delivery_type: 0, alternative_phone: '', recipient_email: '', item_description: '', total_lot: 1
    });

    // --- MOCK DATA ---
    const [orders, setOrders] = useState(Array.from({ length: 25 }, (_, i) => ({
        invoice: `INV-100${i + 1}`,
        date: '2026-02-14',
        customer: i % 2 === 0 ? 'Rahim Uddin' : 'Ayesha Akter',
        phone: `017112233${i < 10 ? '0' + i : i}`,
        email: `customer${i}@example.com`,
        address: 'House 12, Road 5, Dhaka',
        totalAmount: 1250 + (i * 100),
        paymentMethod: i % 3 === 0 ? 'Bkash' : 'COD',
        paymentStatus: i % 3 === 0 ? 'Paid' : 'Unpaid',
        // Mix of statuses for testing
        orderStatus: i % 5 === 0 ? 'Cancelled' : (i % 4 === 0 ? 'Processing' : 'Pending'),
        deliveryStatus: i % 5 === 0 ? 'Cancelled' : (i > 15 ? 'Delivered' : (i > 5 ? 'In Transit' : 'Pending')),
        cid: i > 5 && i % 5 !== 0 ? `SF66${1000 + i}` : ''
    })));

    // Selection State
    const [selectedInvoices, setSelectedInvoices] = useState([]);

    // --- MOCK STATS ---
    const stats = [
        { label: 'Total Orders', value: orders.length, icon: '📋', color: '#e3f2fd', text: '#1565c0' },
        { label: 'Pending Pickup', value: orders.filter(o => !o.cid && o.orderStatus !== 'Cancelled').length, icon: '🚚', color: '#fce4ec', text: '#c2185b' },
        { label: 'In Transit', value: orders.filter(o => o.deliveryStatus === 'In Transit').length, icon: '🛤️', color: '#e8f5e9', text: '#2e7d32' },
        { label: 'Delivered', value: orders.filter(o => o.deliveryStatus === 'Delivered').length, icon: '✅', color: '#e0f2f1', text: '#00695c' },
        { label: 'Cancelled', value: orders.filter(o => o.orderStatus === 'Cancelled').length, icon: '❌', color: '#ffebee', text: '#c62828' },
        { label: 'Balance', value: '৳ 45,200', icon: '💼', color: '#fff3e0', text: '#ef6c00' },
    ];

    // --- FILTER LOGIC ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
        setSelectedInvoices([]);
    };

    const resetFilters = () => {
        setFilters(initialFilters);
        setCurrentPage(1);
        toast.success("Filters Cleared");
    };

    const isFilterActive = JSON.stringify(filters) !== JSON.stringify(initialFilters);

    const filteredOrders = orders.filter(order => {
        const matchesMethod = filters.method === 'All' || order.paymentMethod === filters.method;
        const matchesPayment = filters.paymentStatus === 'All' || order.paymentStatus === filters.paymentStatus;
        const matchesDelivery = filters.deliveryStatus === 'All' || order.deliveryStatus === filters.deliveryStatus;
        const matchesOrderStatus = filters.orderStatus === 'All' || order.orderStatus === filters.orderStatus;
        const matchesSearch = order.invoice.toLowerCase().includes(filters.search.toLowerCase()) ||
            order.customer.toLowerCase().includes(filters.search.toLowerCase()) ||
            order.phone.includes(filters.search);

        const orderDate = new Date(order.date).getTime();
        const start = filters.startDate ? new Date(filters.startDate).getTime() : null;
        const end = filters.endDate ? new Date(filters.endDate).getTime() : null;
        const matchesDate = (!start || orderDate >= start) && (!end || orderDate <= end);

        return matchesMethod && matchesPayment && matchesDelivery && matchesOrderStatus && matchesSearch && matchesDate;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    // --- SELECTION LOGIC ---
    const toggleRow = (invoice) => {
        if (selectedInvoices.includes(invoice)) {
            setSelectedInvoices(selectedInvoices.filter(id => id !== invoice));
        } else {
            setSelectedInvoices([...selectedInvoices, invoice]);
        }
    };

    const toggleSelectAll = () => {
        const currentInvoiceIds = currentItems.map(item => item.invoice);
        const allSelected = currentInvoiceIds.every(id => selectedInvoices.includes(id));
        if (allSelected) {
            setSelectedInvoices(selectedInvoices.filter(id => !currentInvoiceIds.includes(id)));
        } else {
            setSelectedInvoices([...new Set([...selectedInvoices, ...currentInvoiceIds])]);
        }
    };

    const handleDeselectAll = () => {
        setSelectedInvoices([]);
        toast("Selection cleared", { icon: '🧹' });
    };

    // --- ACTIONS LOGIC ---

    // 1. Single Cancel
    const handleCancelOrder = (invoiceId) => {
        if (!window.confirm(`Are you sure you want to cancel ${invoiceId}?`)) return;
        setOrders(prev => prev.map(o => o.invoice === invoiceId ? { ...o, orderStatus: 'Cancelled', deliveryStatus: 'Cancelled' } : o));
        toast.error(`Order ${invoiceId} cancelled`);
    };

    // 2. Bulk Cancel
    const handleBulkCancel = () => {
        const eligibleOrders = orders.filter(o =>
            selectedInvoices.includes(o.invoice) &&
            o.deliveryStatus !== 'Delivered' &&
            o.orderStatus !== 'Cancelled'
        );

        if (eligibleOrders.length === 0) {
            return toast.error("No eligible orders to cancel (cannot cancel Delivered orders).");
        }

        if (!window.confirm(`Permanently cancel ${eligibleOrders.length} selected orders?`)) return;

        setOrders(prev => prev.map(o =>
            selectedInvoices.includes(o.invoice) && o.deliveryStatus !== 'Delivered'
                ? { ...o, orderStatus: 'Cancelled', deliveryStatus: 'Cancelled' }
                : o
        ));

        setSelectedInvoices([]);
        toast.success(`${eligibleOrders.length} orders cancelled successfully.`);
    };

    // 3. Export
    const exportToCSV = (data, filename) => {
        if (!data.length) return toast.error("No data to export");
        const headers = ["Invoice", "Date", "Customer", "Phone", "Amount", "Status", "CID"];
        const rows = [
            headers.join(','),
            ...data.map(r => [r.invoice, r.date, `"${r.customer}"`, r.phone, r.totalAmount, r.deliveryStatus, r.cid || ''].join(','))
        ];
        const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleBulkExport = () => {
        const dataToExport = orders.filter(o => selectedInvoices.includes(o.invoice));
        exportToCSV(dataToExport, 'selected_orders.csv');
        toast.success(`Exported ${dataToExport.length} orders`);
    };

    const handleGlobalExport = () => {
        exportToCSV(filteredOrders, 'all_filtered_orders.csv');
        toast.success("Exported all filtered orders");
    };

    // 4. Bulk Pickup
    const handleBulkPickup = () => {
        const eligibleOrders = orders.filter(o => selectedInvoices.includes(o.invoice) && !o.cid && o.orderStatus !== 'Cancelled');
        if (eligibleOrders.length === 0) {
            toast.error("No eligible orders for pickup (Check if already shipped or cancelled).");
            return;
        }
        if (!window.confirm(`Create courier pickup for ${eligibleOrders.length} orders?`)) return;

        setLoading(true);
        setTimeout(() => {
            setOrders(prev => prev.map(order =>
                (selectedInvoices.includes(order.invoice) && !order.cid && order.orderStatus !== 'Cancelled')
                    ? { ...order, cid: `SF-BULK-${Math.floor(Math.random() * 10000)}`, deliveryStatus: 'In Transit', orderStatus: 'Processing' }
                    : order
            ));
            setSelectedInvoices([]);
            setLoading(false);
            toast.success(`Pickup requested for ${eligibleOrders.length} orders!`);
        }, 1500);
    };

    // --- DYNAMIC TRACKING LOGIC (UPDATED) ---
    const handleTrackOrder = (order) => {
        setSelectedOrder(order);
        setShowTrackModal(true);

        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        let history = [];

        // Base Step: Order Placed
        history.push({ time: `${order.date}, 9:00 AM`, msg: 'Order Placed', status: 'completed' });

        if (order.deliveryStatus === 'Delivered') {
            history.unshift({ time: `${today}, 2:00 PM`, msg: 'Delivered Successfully', status: 'completed' });
            history.splice(1, 0, { time: `${today}, 10:30 AM`, msg: 'Out for Delivery', status: 'completed' });
            history.splice(2, 0, { time: `${today}, 8:00 AM`, msg: 'Received at Hub', status: 'completed' });
        }
        else if (order.deliveryStatus === 'In Transit') {
            history.unshift({ time: `${today}, 10:30 AM`, msg: 'Out for Delivery', status: 'active' });
            history.splice(1, 0, { time: `${today}, 8:00 AM`, msg: 'Received at Hub', status: 'completed' });
        }
        else if (order.deliveryStatus === 'Cancelled') {
            history.unshift({ time: `${today}, 12:00 PM`, msg: 'Delivery Cancelled', status: 'cancelled' });
        }
        else {
            // Pending/Processing
            history.unshift({ time: `${today}, 11:00 AM`, msg: 'Ready for Courier Pickup', status: 'active' });
        }

        setTrackingHistory(history);
    };

    // --- MODAL TRIGGERS ---
    const openPickupModal = (order) => {
        setSelectedOrder(order);
        setPickupForm({
            invoice: order.invoice, recipient_name: order.customer, recipient_phone: order.phone, recipient_address: order.address,
            cod_amount: order.paymentStatus === 'Paid' ? 0 : order.totalAmount, note: '', delivery_type: 0, alternative_phone: '',
            recipient_email: order.email || '', item_description: 'Standard Package', total_lot: 1
        });
        setShowPickupModal(true);
    };

    const handlePickupSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setOrders(prev => prev.map(o => o.invoice === pickupForm.invoice
                ? { ...o, cid: `SF-SINGLE-${Math.floor(Math.random() * 1000)}`, deliveryStatus: 'In Transit', orderStatus: 'Processing' } : o));
            toast.success(`Consignment created for ${pickupForm.invoice}`);
            setShowPickupModal(false);
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="order-dashboard">
            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div className="stat-card" key={i}>
                        <div className="stat-icon" style={{ background: stat.color, color: stat.text }}>{stat.icon}</div>
                        <div className="stat-info"><p>{stat.label}</p><h3>{stat.value}</h3></div>
                    </div>
                ))}
            </div>

            <div className="main-card">
                <div className="card-header">
                    <div className="header-left">
                        <h3>Order Management</h3>
                        <span className="results-count">({filteredOrders.length} records)</span>
                    </div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button className="btn-global-export" onClick={handleGlobalExport}>📥 Export All</button>
                        {isFilterActive && <button className="btn-clear-top" onClick={resetFilters}>✕ Clear Filters</button>}
                    </div>
                </div>

                {/* --- FILTER BAR (CORRECTED) --- */}
                <div className="filter-bar">
                    <select name="method" value={filters.method} onChange={handleFilterChange} className="filter-select">
                        <option value="All">All Methods</option>
                        <option value="Bkash">Bkash</option>
                        <option value="COD">COD</option>
                    </select>

                    <select name="paymentStatus" value={filters.paymentStatus} onChange={handleFilterChange} className="filter-select">
                        <option value="All">Payment Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                    </select>

                    {/* RESTORED MISSING FILTER */}
                    <select name="deliveryStatus" value={filters.deliveryStatus} onChange={handleFilterChange} className="filter-select">
                        <option value="All">Delivery Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <select name="orderStatus" value={filters.orderStatus} onChange={handleFilterChange} className="filter-select">
                        <option value="All">Order Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <div className="date-range-group">
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="filter-date" />
                        <span className="date-separator">to</span>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="filter-date" />
                    </div>

                    <input type="text" name="search" placeholder="Search..." className="filter-search" value={filters.search} onChange={handleFilterChange} />
                </div>

                {/* --- BULK ACTION BAR --- */}
                {selectedInvoices.length > 0 && (
                    <div className="bulk-action-bar">
                        <div className="bulk-left">
                            <span className="bulk-count-badge">{selectedInvoices.length} Selected</span>
                            <button className="btn-deselect" onClick={handleDeselectAll}>✕ Unselect All</button>
                        </div>
                        <div className="bulk-actions">
                            <button className="btn-bulk-outline" onClick={handleBulkExport}>📥 Export</button>
                            <button className="btn-bulk-danger" onClick={handleBulkCancel}>✕ Cancel Selected</button>
                            <button className="btn-bulk-primary" onClick={handleBulkPickup}>🚚 Bulk Pickup</button>
                        </div>
                    </div>
                )}

                <div className="table-responsive">
                    <table className="logistics-table">
                        <thead>
                        <tr>
                            <th style={{width: '40px'}}><input type="checkbox" className="custom-checkbox" onChange={toggleSelectAll} checked={currentItems.length > 0 && currentItems.every(item => selectedInvoices.includes(item.invoice))} /></th>
                            <th>Invoice</th>
                            <th>Customer</th>
                            <th>Payment Info</th>
                            <th>Order Status</th>
                            <th>Delivery Status</th>
                            <th>Courier ID</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((order, i) => (
                                <tr key={i} className={selectedInvoices.includes(order.invoice) ? 'row-selected' : ''}>
                                    <td><input type="checkbox" className="custom-checkbox" checked={selectedInvoices.includes(order.invoice)} onChange={() => toggleRow(order.invoice)} /></td>
                                    <td><div className="text-pink fw-bold">{order.invoice}</div><div className="text-small">{order.date}</div></td>
                                    <td><div className="fw-bold">{order.customer}</div><div className="text-small">{order.phone}</div></td>
                                    <td><span className={order.paymentMethod === 'Bkash' ? 'badge-bkash' : 'badge-cod'}>{order.paymentMethod}</span><span className={`status-dot ${order.paymentStatus === 'Paid' ? 'dot-success' : 'dot-warning'}`}>{order.paymentStatus}</span></td>
                                    <td><span className={`status-pill ${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span></td>
                                    <td><span className={`delivery-pill ${order.deliveryStatus.toLowerCase().replace(' ', '-')}`}>{order.deliveryStatus}</span></td>
                                    <td>{order.cid || '-'}</td>
                                    <td className="fw-bold">৳{order.totalAmount}</td>
                                    <td>
                                        <div style={{display:'flex', gap:'5px'}}>
                                            {order.cid ?
                                                <button className="btn-action btn-track" onClick={() => handleTrackOrder(order)}>Track</button> :
                                                <button className="btn-action btn-pickup" onClick={() => openPickupModal(order)} disabled={order.orderStatus === 'Cancelled'}>Pickup</button>
                                            }
                                            {order.orderStatus !== 'Cancelled' && order.deliveryStatus !== 'Delivered' && (
                                                <button className="btn-action btn-cancel" onClick={() => handleCancelOrder(order.invoice)} title="Cancel Order">✕</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : ( <tr><td colSpan="9" className="text-center">No orders found.</td></tr> )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination-container">
                    <div className="pagination-info">Showing {filteredOrders.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} records</div>
                    <div className="pagination-controls">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="page-btn">Prev</button>
                        {[...Array(totalPages)].map((_, i) => (<button key={i} onClick={() => setCurrentPage(i + 1)} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}>{i + 1}</button>))}
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)} className="page-btn">Next</button>
                    </div>
                </div>
            </div>

            {/* MODALS (UNCHANGED) */}
            {showTrackModal && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => setShowTrackModal(false)}>
                        <div className="modal-content track-modal-size" onClick={e => e.stopPropagation()}>
                            <div className="modal-header"><div><h4>Consignment Journey</h4><span className="text-small" style={{color:'#ccc'}}>CID: {selectedOrder?.cid}</span></div><button onClick={() => setShowTrackModal(false)}>✕</button></div>
                            <div className="modal-body"><div className="timeline-container">{trackingHistory.map((step, i) => (<div key={i} className={`timeline-item ${step.status}`}><div className="timeline-content"><p className="timeline-msg">{step.msg}</p><span className="timeline-time">{step.time}</span></div></div>))}</div></div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {showPickupModal && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => setShowPickupModal(false)}>
                        <div className="modal-content pickup-modal-size" onClick={e => e.stopPropagation()}>
                            <div className="modal-header"><div><h4>Create Order (Steadfast)</h4><span className="text-small" style={{color:'#ccc'}}>Inv: {pickupForm.invoice}</span></div><button onClick={() => setShowPickupModal(false)}>✕</button></div>
                            <form onSubmit={handlePickupSubmit} style={{display:'flex', flexDirection:'column', overflow:'hidden', flex:1}}>
                                <div className="modal-body">
                                    <div className="pickup-grid">
                                        <div className="input-group"><label>Invoice ID <span className="req">*</span></label><input type="text" value={pickupForm.invoice} readOnly style={{backgroundColor:'#f5f5f5'}} /></div>
                                        <div className="input-group"><label>COD Amount (BDT) <span className="req">*</span></label><input type="number" value={pickupForm.cod_amount} min="0" onChange={e => setPickupForm({...pickupForm, cod_amount: e.target.value})} required /></div>
                                        <div className="input-group"><label>Recipient Name <span className="req">*</span></label><input type="text" value={pickupForm.recipient_name} onChange={e => setPickupForm({...pickupForm, recipient_name: e.target.value})} maxLength="100" required /></div>
                                        <div className="input-group"><label>Recipient Phone <span className="req">*</span></label><input type="text" value={pickupForm.recipient_phone} onChange={e => setPickupForm({...pickupForm, recipient_phone: e.target.value})} maxLength="11" required /></div>
                                        <div className="input-group"><label>Alt. Phone</label><input type="text" value={pickupForm.alternative_phone} onChange={e => setPickupForm({...pickupForm, alternative_phone: e.target.value})} maxLength="11" /></div>
                                        <div className="input-group"><label>Email</label><input type="email" value={pickupForm.recipient_email} onChange={e => setPickupForm({...pickupForm, recipient_email: e.target.value})} /></div>
                                        <div className="input-group full-width"><label>Address <span className="req">*</span></label><textarea value={pickupForm.recipient_address} onChange={e => setPickupForm({...pickupForm, recipient_address: e.target.value})} maxLength="250" required /></div>
                                        <div className="input-group"><label>Delivery Type</label><select value={pickupForm.delivery_type} onChange={e => setPickupForm({...pickupForm, delivery_type: e.target.value})}><option value={0}>Home Delivery</option><option value={1}>Point/Hub Pickup</option></select></div>
                                        <div className="input-group"><label>Total Lot</label><input type="number" value={pickupForm.total_lot} min="1" onChange={e => setPickupForm({...pickupForm, total_lot: e.target.value})} /></div>
                                        <div className="input-group full-width"><label>Item Description</label><input type="text" value={pickupForm.item_description} onChange={e => setPickupForm({...pickupForm, item_description: e.target.value})} /></div>
                                        <div className="input-group full-width"><label>Note</label><input type="text" value={pickupForm.note} onChange={e => setPickupForm({...pickupForm, note: e.target.value})} /></div>
                                    </div>
                                </div>
                                <div className="modal-footer"><button type="button" className="btn-cancel-modal" onClick={() => setShowPickupModal(false)}>Cancel</button><button type="submit" className="btn-submit-modal" disabled={loading}>{loading ? "Creating..." : "Place Pickup Request"}</button></div>
                            </form>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
};

export default AdminOrders;
