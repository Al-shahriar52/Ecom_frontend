
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { MoreVertical, Eye, Pencil, Truck, MapPinned, XCircle } from 'lucide-react';
import axiosInstance from '../../../api/AxiosInstance';
import OrderUpdateModal from './OrderUpdateModal';
import PickupModal from './PickupModal';
import TrackingModal from './TrackingModal';
import './AdminOrders.css';


const AdminOrders = () => {
    const navigate = useNavigate();

    const initialFilters = {
        method: 'All',
        paymentStatus: 'All',
        deliveryStatus: 'All',
        orderStatus: 'All',
        startDate: '',
        endDate: '',
        search: ''
    };

    const [dashboardStats, setDashboardStats] = useState({
        totalOrders: 0, pendingPickup: 0, inTransit: 0,
        delivered: 0, cancelled: 0, totalBalance: 0
    });

    // --- REFRESH TRIGGER ---
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // --- FILTER & PAGINATION STATES ---
    const [filters, setFilters] = useState(initialFilters);
    const [currentPage, setCurrentPage] = useState(1); // React UI is 1-indexed
    const [itemsPerPage] = useState(10);

    // --- SERVER DATA STATES ---
    const [orders, setOrders] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [tableLoading, setTableLoading] = useState(true);

    // --- SELECTION & MODAL STATES ---
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [showTrackModal, setShowTrackModal] = useState(false);
    const [showPickupModal, setShowPickupModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [openMenuOrderId, setOpenMenuOrderId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const stats = [
        { label: 'Total Orders', value: dashboardStats.totalOrders || 0, icon: '📋', color: '#e3f2fd', text: '#1565c0' },
        { label: 'Pending Pickup', value: dashboardStats.pendingPickup || 0, icon: '🚚', color: '#fce4ec', text: '#c2185b' },
        { label: 'In Transit', value: dashboardStats.inTransit || 0, icon: '🛤️', color: '#e8f5e9', text: '#2e7d32' },
        { label: 'Delivered', value: dashboardStats.delivered || 0, icon: '✅', color: '#e0f2f1', text: '#00695c' },
        { label: 'Cancelled', value: dashboardStats.cancelled || 0, icon: '❌', color: '#ffebee', text: '#c62828' },
        { label: 'Balance', value: `৳ ${(dashboardStats.totalBalance || 0).toLocaleString()}`, icon: '💼', color: '#fff3e0', text: '#ef6c00' },
    ];

    // --- API INTEGRATION ---
    useEffect(() => {
        const fetchOrders = async () => {
            setTableLoading(true);
            try {
                // Build query string params
                const params = new URLSearchParams({
                    page: currentPage - 1, // Spring Boot expects 0-indexed pages
                    size: itemsPerPage,
                });

                if (filters.method !== 'All') params.append('method', filters.method);
                if (filters.paymentStatus !== 'All') params.append('paymentStatus', filters.paymentStatus);
                if (filters.orderStatus !== 'All') params.append('orderStatus', filters.orderStatus);
                if (filters.deliveryStatus !== 'All') params.append('deliveryStatus', filters.deliveryStatus);
                if (filters.search) params.append('search', filters.search);
                if (filters.startDate) params.append('startDate', `${filters.startDate}T00:00:00`);
                if (filters.endDate) params.append('endDate', `${filters.endDate}T23:59:59`);

                const response = await axiosInstance.get(`/api/v1/admin/orders?${params.toString()}`);
                const pageData = response.data.data;

                setOrders(pageData.content);
                setTotalRecords(pageData.totalElements);
                setTotalPages(pageData.totalPages);
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast.error("Failed to load orders from server.");
            } finally {
                setTableLoading(false);
            }
        };

        // Debounce API call by 500ms to prevent spamming while typing in the search box
        const timeoutId = setTimeout(() => {
            fetchOrders();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [currentPage, filters, itemsPerPage, refreshTrigger]); // Added refreshTrigger

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/admin/orders/stats');
                // Use response.data.data if your backend wraps the response, otherwise fallback to response.data
                const statsData = response.data.data || response.data;
                setDashboardStats(statsData);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, [refreshTrigger]); // Added refreshTrigger

    // --- HELPERS ---
    const formatDate = (dateArray) => {
        if (!Array.isArray(dateArray)) return 'N/A';
        // JS Date month is 0-11, Java array is 1-12. Array: [Year, Month, Day, Hour, Min, Sec]
        const date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], dateArray[3], dateArray[4]);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1); // Reset to page 1 on filter change
        setSelectedInvoices([]); // Clear selections when filters change
    };

    const resetFilters = () => {
        setFilters(initialFilters);
        setCurrentPage(1);
        toast.success("Filters Cleared");
    };

    const isFilterActive = JSON.stringify(filters) !== JSON.stringify(initialFilters);

    // --- ROW SELECTION ACTIONS ---
    const getRowId = (order, index) => order.invoice || `TEMP-${index}`;

    const toggleRow = (id) => {
        if (selectedInvoices.includes(id)) setSelectedInvoices(selectedInvoices.filter(selectedId => selectedId !== id));
        else setSelectedInvoices([...selectedInvoices, id]);
    };

    const toggleSelectAll = () => {
        const currentIds = orders.map((order, i) => getRowId(order, i));
        const allSelected = currentIds.every(id => selectedInvoices.includes(id));
        if (allSelected) {
            setSelectedInvoices(selectedInvoices.filter(id => !currentIds.includes(id)));
        } else {
            setSelectedInvoices([...new Set([...selectedInvoices, ...currentIds])]);
        }
    };

    const handleDeselectAll = () => { setSelectedInvoices([]); toast("Selection cleared", { icon: '🧹' }); };

    // --- BULK & SINGLE ACTIONS ---
    const handleGlobalExport = () => { toast.success("Exporting all filtered orders..."); };
    const handleBulkExport = () => { toast.success(`Exporting ${selectedInvoices.length} selected orders...`); };

    const handleCancelOrder = async (order) => {
        const id = order.invoice;
        if (!id) {
            toast.error("Cannot cancel an order without an invoice ID");
            return;
        }

        if (!window.confirm(`Are you sure you want to cancel order ${id}?`)) return;

        try {
            await axiosInstance.post('/api/v1/admin/orders/cancel', { invoices: [id] });
            toast.success(`Order ${id} cancelled successfully.`);
            setRefreshTrigger(prev => prev + 1); // Refresh data
        } catch (error) {
            console.error("Error cancelling order:", error);
            toast.error("Failed to cancel order.");
        }
    };

    const handleBulkCancel = async () => {
        if (!window.confirm(`Permanently cancel ${selectedInvoices.length} selected orders?`)) return;

        try {
            await axiosInstance.patch('/api/v1/admin/orders/cancel', { invoices: selectedInvoices });
            toast.success(`${selectedInvoices.length} orders cancelled successfully.`);
            setSelectedInvoices([]);
            setRefreshTrigger(prev => prev + 1); // Refresh data
        } catch (error) {
            console.error("Error in bulk cancellation:", error);
            toast.error("Failed to cancel selected orders.");
        }
    };

    const handleBulkPickup = async () => {
        if (!window.confirm(`Create courier pickup for ${selectedInvoices.length} orders?`)) return;

        // Map the selected invoice strings back to their actual database order IDs
        const selectedOrderIds = orders
            .filter(order => selectedInvoices.includes(order.invoice))
            .map(order => order.id);

        try {
            await axiosInstance.post('/api/v1/admin/orders/pickup', { orderIds: selectedOrderIds });

            toast.success(`Pickup requested for ${selectedInvoices.length} orders!`);
            setSelectedInvoices([]); // Clear the checkboxes
            setRefreshTrigger(prev => prev + 1); // Refresh the table data automatically
        } catch (error) {
            console.error("Error in bulk pickup:", error);
            toast.error(error.response?.data?.message || "Failed to request bulk pickup.");
        }
    };

    // --- MODAL ACTIONS ---
    const handleTrackOrder = (order) => {
        setSelectedOrder(order);
        setShowTrackModal(true);
    };

    const openPickupModal = (order) => {
        setSelectedOrder(order);
        setShowPickupModal(true);
    };

    const openUpdateModal = (order) => {
        setSelectedOrder(order);
        setShowUpdateModal(true);
    };

    const handleViewDetails = (order) => {
        // Pass the row data along so the details page can render instantly;
        // it still confirms/refreshes from the API itself.
        navigate(`/admin/orders/${order.id}`, { state: { order } });
    };

    const handlePickupSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="order-dashboard" onClick={() => setOpenMenuOrderId(null)}>

            {/* STATS GRID */}
            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div className="stat-card" key={i}>
                        <div className="stat-icon" style={{ background: stat.color, color: stat.text }}>{stat.icon}</div>
                        <div className="stat-info"><p>{stat.label}</p><h3>{stat.value}</h3></div>
                    </div>
                ))}
            </div>

            <div className="main-card">

                {/* HEADER */}
                <div className="card-header">
                    <div className="header-left">
                        <h3>Order Management</h3>
                        <span className="results-count">({totalRecords} records)</span>
                    </div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button className="btn-global-export" onClick={handleGlobalExport}>📥 Export All</button>
                        {isFilterActive && <button className="btn-clear-top" onClick={resetFilters}>✕ Clear Filters</button>}
                    </div>
                </div>

                {/* FILTERS */}
                <div className="filter-bar">
                    <select name="method" value={filters.method} onChange={handleFilterChange} className="filter-select">
                        <option value="All">All Methods</option>
                        <option value="COD">COD</option>
                        <option value="Bkash">Bkash</option>
                    </select>
                    <select name="paymentStatus" value={filters.paymentStatus} onChange={handleFilterChange} className="filter-select">
                        <option value="All">Payment Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                    </select>
                    <select name="orderStatus" value={filters.orderStatus} onChange={handleFilterChange} className="filter-select">
                        <option value="All">Order Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                    <div className="date-range-group">
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="filter-date" />
                        <span className="date-separator">to</span>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="filter-date" />
                    </div>
                    <input type="text" name="search" placeholder="Search Invoice, Name, Phone..." className="filter-search" value={filters.search} onChange={handleFilterChange} />
                </div>

                {/* BULK ACTIONS (Visible only when rows selected) */}
                {selectedInvoices.length > 0 && (
                    <div className="bulk-action-bar">
                        <div className="bulk-left">
                            <span className="bulk-count-badge">{selectedInvoices.length} Selected</span>
                            <button className="btn-deselect" onClick={handleDeselectAll}>✕ Unselect All</button>
                        </div>
                        <div className="bulk-actions">
                            <button className="btn-bulk-outline" onClick={handleBulkExport}>📥 Export</button>
                            <button className="btn-bulk-danger" onClick={handleBulkCancel}>✕ Cancel Orders</button>
                            <button className="btn-bulk-primary" onClick={handleBulkPickup}>🚚 Bulk Pickup</button>
                        </div>
                    </div>
                )}

                {/* DATA TABLE */}
                <div className="table-responsive">
                    {tableLoading ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
                            <div className="spinner"></div> {/* Add a CSS spinner here if you have one */}
                            <p>Loading orders from server...</p>
                        </div>
                    ) : (
                        <table className="logistics-table">
                            <thead>
                            <tr>
                                <th style={{width: '40px'}}>
                                    <input
                                        type="checkbox"
                                        className="custom-checkbox"
                                        onChange={toggleSelectAll}
                                        checked={orders.length > 0 && orders.every((order, i) => selectedInvoices.includes(getRowId(order, i)))}
                                    />
                                </th>
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
                            {orders.length > 0 ? (
                                orders.map((order, i) => {
                                    const rowId = getRowId(order, i);
                                    const isSelected = selectedInvoices.includes(rowId);

                                    return (
                                        <tr key={i} className={isSelected ? 'row-selected' : ''}>
                                            <td>
                                                <input type="checkbox" className="custom-checkbox" checked={isSelected} onChange={() => toggleRow(rowId)} />
                                            </td>

                                            <td>
                                                {order.invoice ? (
                                                    <Link to={`/admin/orders/${order.id}`} state={{ order }} className="text-pink fw-bold" style={{textDecoration:'none'}}>
                                                        {order.invoice}
                                                    </Link>
                                                ) : (
                                                    <span className="text-muted fw-bold">N/A</span>
                                                )}
                                                <div className="text-small">{formatDate(order.date)}</div>
                                            </td>

                                            <td>
                                                <div className="fw-bold">{order.customer || 'Guest User'}</div>
                                                <div className="text-small">{order.phone || 'N/A'}</div>
                                            </td>

                                            <td>
                                            <span className={order.paymentMethod === 'Bkash' ? 'badge-bkash' : 'badge-cod'}>
                                                {order.paymentMethod || 'N/A'}
                                            </span>
                                                <span className={`status-dot ${order.paymentStatus === 'PAID' ? 'dot-success' : 'dot-warning'}`}>
                                                {order.paymentStatus || 'PENDING'}
                                            </span>
                                            </td>

                                            <td>
                                            <span className={`status-pill ${order.orderStatus?.toLowerCase() || 'pending'}`}>
                                                {order.orderStatus || 'PENDING'}
                                            </span>
                                            </td>

                                            <td>
                                            <span className={`delivery-pill ${!order.deliveryStatus ? 'empty' : order.deliveryStatus.toLowerCase().replace(' ', '-')}`}>
                                                {order.deliveryStatus || '-'}
                                            </span>
                                            </td>

                                            <td>{order.cid || '-'}</td>
                                            <td className="fw-bold">৳{order.totalAmount || 0}</td>

                                            <td>
                                                <div className="order-row-menu-wrap" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        className="order-row-menu-trigger"
                                                        onClick={() => setOpenMenuOrderId(openMenuOrderId === order.id ? null : order.id)}
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {openMenuOrderId === order.id && (
                                                        <div className={`order-row-menu ${i >= orders.length - 2 ? 'menu-up' : ''}`}>
                                                            <button
                                                                className="order-row-menu-item"
                                                                onClick={() => { handleViewDetails(order); setOpenMenuOrderId(null); }}
                                                            >
                                                                <Eye size={14} /> View Details
                                                            </button>

                                                            <button
                                                                className="order-row-menu-item"
                                                                onClick={() => { openUpdateModal(order); setOpenMenuOrderId(null); }}
                                                            >
                                                                <Pencil size={14} /> Update Order
                                                            </button>

                                                            {order.cid ? (
                                                                <button
                                                                    className="order-row-menu-item"
                                                                    onClick={() => { handleTrackOrder(order); setOpenMenuOrderId(null); }}
                                                                >
                                                                    <MapPinned size={14} /> Track
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="order-row-menu-item"
                                                                    disabled={order.orderStatus === 'CANCELLED'}
                                                                    onClick={() => { openPickupModal(order); setOpenMenuOrderId(null); }}
                                                                >
                                                                    <Truck size={14} /> Pickup
                                                                </button>
                                                            )}

                                                            {order.orderStatus !== 'CANCELLED' && order.deliveryStatus !== 'DELIVERED' && (
                                                                <>
                                                                    <div className="order-row-menu-divider" />
                                                                    <button
                                                                        className="order-row-menu-item danger"
                                                                        onClick={() => { handleCancelOrder(order); setOpenMenuOrderId(null); }}
                                                                    >
                                                                        <XCircle size={14} /> Cancel Order
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )})
                            ) : (
                                <tr><td colSpan="9" className="text-center" style={{padding: '40px'}}>No orders match your filters.</td></tr>
                            )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* PAGINATION */}
                {!tableLoading && totalRecords > 0 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                            Showing page {currentPage} of {totalPages}
                        </div>
                        <div className="pagination-controls">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="page-btn">Prev</button>

                            {/* Simple pagination: shows all pages. If you get >10 pages, you'll want to add ellipsis logic here */}
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}>
                                    {i + 1}
                                </button>
                            ))}

                            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)} className="page-btn">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* TRACKING MODAL */}
            {showTrackModal && selectedOrder && (
                <TrackingModal order={selectedOrder} onClose={() => setShowTrackModal(false)} />
            )}

            {/* PICKUP MODAL */}
            {showPickupModal && selectedOrder && (
                <PickupModal
                    order={selectedOrder}
                    onClose={() => setShowPickupModal(false)}
                    onSuccess={handlePickupSuccess}
                />
            )}
            {/* UPDATE ORDER MODAL */}
            {showUpdateModal && selectedOrder && (
                <OrderUpdateModal
                    order={selectedOrder}
                    onClose={() => setShowUpdateModal(false)}
                    onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                />
            )}
        </div>
    );
};

export default AdminOrders;