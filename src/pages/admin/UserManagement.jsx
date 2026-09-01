
import React, { useState, useEffect, useCallback } from "react";
import {
    Trash2, CheckCircle2, Ban, X, Search, ChevronLeft, ChevronRight, UserPlus,
    ArrowUpDown, Download, Loader2, Users, UserCheck, Clock, UserX
} from "lucide-react";
import { useLocation } from 'react-router-dom';
import "./UserManagement.css";

import axiosInstance from "../../api/AxiosInstance";
import { SPARK } from "../../data/mockData";
import { ROLE_META } from "../../data/constants";
import { usePermissions } from "../../context/PermissionContext";
import { RoleBadge, StatusBadge, Avatar, formatDate } from "../../components/admin/user/Shared";
import RowMenu from "../../components/admin/user/RowMenu";
import UserFormModal from "../../components/admin/user/UserFormModal";
import DeleteConfirmModal from "../../components/admin/user/DeleteConfirmModal";
import UserDetailsModal from "../../components/admin/user/UserDetailsModal";

const UserManagement = () => {
    const { hasPermission } = usePermissions();

    // API & Data States
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Stats State
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // Filter & Pagination States
    const [query, setQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortKey, setSortKey] = useState("id");
    const [sortDir, setSortDir] = useState("asc");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selected, setSelected] = useState([]);

    // Modal & Menu States
    const [selectedUser, setSelectedUser] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [deleteUser, setDeleteUser] = useState(null);
    const [showAddUser, setShowAddUser] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);

    const [currentRole] = useState("admin");
    const location = useLocation();

    const canCreateUser = hasPermission(currentRole, 2);
    const canManage = hasPermission(currentRole, 1);
    const canDelete = currentRole === "admin";

    // --- Fetch User Stats API ---
    const fetchStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const response = await axiosInstance.get("/api/v1/admin/users/stats");
            const payload = response.data?.data;
            if (payload) {
                setStats(payload);
            }
        } catch (err) {
            console.error("Failed to load user stats", err);
        } finally {
            setLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // --- API Fetch Handler for Users Table ---
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit: pageSize,
                role: roleFilter,
                status: statusFilter,
                sortKey,
                sortDir,
            };
            if (query.trim()) params.search = query.trim();

            const response = await axiosInstance.get("/api/v1/admin/users", { params });

            const payload = response.data?.data;
            if (payload) {
                setUsers(payload.data || []);
                setTotalUsers(payload.meta?.total || 0);
                setTotalPages(payload.meta?.totalPages || 1);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load users from server.");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, query, roleFilter, statusFilter, sortKey, sortDir]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Dynamic configuration for summary cards using live API data
    const statCards = [
        {
            icon: Users,
            variant: "indigo",
            value: stats?.totalUsers ?? 0,
            label: "Total Users",
            delta: `+${stats?.newThisMonth ?? 0} this month`,
            up: true
        },
        {
            icon: UserCheck,
            variant: "teal",
            value: stats?.activeUsers ?? 0,
            label: "Active Accounts",
            delta: `${stats?.activePercentage ?? 0}% of total`,
            up: true
        },
        {
            icon: Clock,
            variant: "amber",
            value: stats?.unverifiedUsers ?? 0,
            label: "Unverified Users",
            delta: "Needs review",
            up: false
        },
        {
            icon: UserX,
            variant: "red",
            value: stats?.suspendedUsers ?? 0,
            label: "Suspended Accounts",
            delta: `${stats?.suspendedPercentage ?? 0}% of total`,
            up: false
        }
    ];

    // Sorting Handler
    const toggleSort = (key) => {
        if (sortKey === key) {
            setSortDir(d => d === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    // Selection Handlers
    const toggleSelectAll = () => setSelected(selected.length === users.length ? [] : users.map(u => u.id));
    const toggleSelectOne = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

    const columns = [
        { key: "name", label: "User" },
        { key: "role", label: "Role" },
        { key: "status", label: "Status" },
        { key: "createdAt", label: "Joined" },
        { key: "orders", label: "Orders" },
    ];

    const getVisiblePages = () => {
        const delta = 1;
        const range = [];
        for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
            range.push(i);
        }
        if (page - delta > 2) range.unshift("...");
        if (page + delta < totalPages - 1) range.push("...");
        range.unshift(1);
        if (totalPages > 1) range.push(totalPages);
        return range;
    };

    const handleBulkAction = (actionType) => {
        if (selected.length === 0) return;
        if (actionType === "delete") {
            if (window.confirm(`Are you sure you want to delete ${selected.length} user(s)?`)) {
                console.log("BULK DELETE IDs:", selected);
                setSelected([]);
            }
        } else {
            console.log(`BULK ${actionType.toUpperCase()} IDs:`, selected);
            setSelected([]);
        }
    };

    const handleExportCSV = () => {
        const headers = ["User ID", "Name", "Email", "Role", "Status", "Created At"];
        const rows = users.map((u) => [
            u.id,
            `"${u.name || ''}"`,
            `"${u.email || ''}"`,
            u.role || (u.roles ? u.roles.join(', ') : ''),
            u.accountState || u.status || 'active',
            `"${u.createdAt || ''}"`
        ]);

        const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `user_list_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (location.state?.reopenModalForUserId && users.length > 0) {
            const userToOpen = users.find(u => u.id === location.state.reopenModalForUserId);
            if (userToOpen) {
                setSelectedUser(userToOpen);
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, users]);

    const handleModalSuccess = () => {
        fetchUsers();
        fetchStats();
    };

    return (
        <div className="um-page" onClick={() => setOpenMenuId(null)}>
            <div className="um-page-header">
                <div>
                    <h1 className="um-page-title um-font-display um-text-ink">User Management</h1>
                    <p className="um-page-sub um-text-muted">Manage system users, view activity, and update access.</p>
                </div>
                <div className="um-header-actions">
                    {canCreateUser && (
                        <button onClick={() => setShowAddUser(true)} className="um-btn-primary">
                            <UserPlus size={16}/> Add User
                        </button>
                    )}
                </div>
            </div>

            {/* --- Stats Cards Grid --- */}
            <div className="um-stats-grid">
                {statCards.map((s, idx) => {
                    const Icon = s.icon;
                    return (
                        <div key={idx} className="um-card um-stat-card">
                            <div className="um-stat-top">
                                <span className={`um-stat-icon um-stat-icon--${s.variant}`}>
                                    <Icon size={18}/>
                                </span>
                                <div className="um-sparkline">
                                    {SPARK.map((val, i) => (
                                        <span
                                            key={i}
                                            className={`um-sparkline-bar um-sparkline-bar--${s.variant}`}
                                            style={{height: `${(val / 15) * 100}%`}}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="um-stat-value um-text-ink um-font-display">
                                {loadingStats ? <Loader2 size={18} className="animate-spin inline" /> : s.value}
                            </p>
                            <p className="um-stat-label um-text-muted">
                                <span className={s.up ? "um-text-tint--teal" : "um-text-tint--red"}>{s.delta}</span>
                                <span> • {s.label}</span>
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="um-card">
                <div className="um-toolbar" style={{padding: '16px 20px 0'}}>
                    <div className="um-search">
                        <Search size={16} className="um-search-icon um-text-muted"/>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={query}
                            onChange={e => {
                                setQuery(e.target.value);
                                setPage(1);
                            }}
                            className="um-search-input"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={e => {
                            setRoleFilter(e.target.value);
                            setPage(1);
                        }}
                        className="um-select"
                    >
                        <option value="all">All Roles</option>
                        {Object.keys(ROLE_META).map(r => (
                            <option key={r} value={r}>{ROLE_META[r].label}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={e => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="um-select"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="unverified">Unverified</option>
                        <option value="suspended">Suspended</option>
                    </select>
                    <span className="um-toolbar-count um-text-muted">
                        {totalUsers} users
                    </span>
                </div>

                {/* Floating Bulk Pill */}
                {selected.length > 0 && (
                    <div className="um-bulk-pill-wrap">
                        <div className="um-bulk-pill-count">
                            <div className="um-bulk-pill-number">{selected.length}</div>
                            <span className="um-bulk-pill-label">Selected</span>
                        </div>
                        <div className="um-bulk-pill-divider" />
                        <div className="um-bulk-pill-actions">
                            {canManage && (
                                <>
                                    <button onClick={() => handleBulkAction("activate")} className="um-bulk-pill-btn">
                                        <CheckCircle2 size={16} /> Activate
                                    </button>
                                    <button onClick={() => handleBulkAction("suspend")} className="um-bulk-pill-btn">
                                        <Ban size={16} /> Suspend
                                    </button>
                                    <button onClick={handleExportCSV} className="um-bulk-pill-btn" type="button">
                                        <Download size={16} /> Export
                                    </button>
                                </>
                            )}
                            {canDelete && (
                                <button onClick={() => handleBulkAction("delete")} className="um-bulk-pill-btn um-bulk-pill-btn--danger">
                                    <Trash2 size={16} /> Delete
                                </button>
                            )}
                            <button onClick={() => setSelected([])} className="um-bulk-pill-close">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="um-table-wrap">
                    <table className="um-table">
                        <thead>
                        <tr className="um-thead-row">
                            <th className="um-th um-th--checkbox">
                                <input
                                    type="checkbox"
                                    checked={users.length > 0 && selected.length === users.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            {columns.map(col => (
                                <th key={col.key} onClick={() => toggleSort(col.key)} className="um-th">
                                    <div className="um-th-content">
                                        <span>{col.label}</span>
                                        <ArrowUpDown size={12}/>
                                    </div>
                                </th>
                            ))}
                            <th className="um-th um-td--right">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8">
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                        <Loader2 size={20} className="animate-spin" /> Loading users...
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-red-500">{error}</td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((u, index) => (
                                <tr key={u.id} className="um-table-row" onClick={() => setSelectedUser(u)}>
                                    <td className="um-td um-th--checkbox" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(u.id)}
                                            onChange={() => toggleSelectOne(u.id)}
                                        />
                                    </td>
                                    <td className="um-td">
                                        <div className="um-user-cell">
                                            <Avatar name={u.name} variant={u.avatarVariant} />
                                            <div>
                                                <p className="um-user-name um-text-ink">{u.name}</p>
                                                <p className="um-user-email um-text-muted">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="um-td">
                                        <RoleBadge role={u.roles || u.role}/>
                                    </td>
                                    <td className="um-td">
                                        <StatusBadge status={u.accountState || u.status}/>
                                    </td>
                                    <td className="um-td um-text-muted">
                                        {formatDate(u.createdAt)}
                                    </td>
                                    <td className="um-td">{u.orders ?? 0}</td>
                                    <td className="um-td um-td--right" onClick={e => e.stopPropagation()}>
                                        <RowMenu
                                            user={u}
                                            currentRole={currentRole}
                                            isOpen={openMenuId === u.id}
                                            onToggle={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === u.id ? null : u.id);
                                            }}
                                            closeMenu={() => setOpenMenuId(null)}
                                            isLastRow={index >= users.length - 2}
                                            onView={() => { setSelectedUser(u); setOpenMenuId(null); }}
                                            onEdit={() => { setEditUser(u); setOpenMenuId(null); }}
                                            onDelete={() => { setDeleteUser(u); setOpenMenuId(null); }}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7}>
                                    <p className="um-empty um-text-muted">No users match your criteria.</p>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="um-pagination">
                    <div className="um-pagination-info">
                        <div className="um-pagination-size">
                            <span className="um-text-muted um-pagination-size-label">Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="um-pagination-select"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <span className="um-text-muted um-pagination-summary">
                            Showing {totalUsers === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalUsers)} of <strong>{totalUsers}</strong> users
                        </span>
                    </div>

                    <div className="um-pagination-controls">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="um-pagination-btn um-pagination-btn--icon"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {getVisiblePages().map((p, index) => (
                            <button
                                key={index}
                                onClick={() => p !== "..." && setPage(p)}
                                disabled={p === "..."}
                                className={`um-pagination-btn ${p === page ? 'is-active' : ''} ${p === "..." ? 'is-ellipsis' : ''}`}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            disabled={page === totalPages || totalPages === 0}
                            onClick={() => setPage(p => p + 1)}
                            className="um-pagination-btn um-pagination-btn--icon"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAddUser && (
                <UserFormModal
                    onClose={() => setShowAddUser(false)}
                    currentRole={currentRole}
                    onSuccess={handleModalSuccess}
                />
            )}
            {editUser && (
                <UserFormModal
                    user={editUser}
                    onClose={() => setEditUser(null)}
                    currentRole={currentRole}
                    onSuccess={handleModalSuccess}
                />
            )}
            {deleteUser && <DeleteConfirmModal user={deleteUser} onClose={() => setDeleteUser(null)}/>}
            {selectedUser && (
                <UserDetailsModal isOpen={!!selectedUser} user={selectedUser} onClose={() => setSelectedUser(null)}/>
            )}
        </div>
    );
};

export default UserManagement;