export const ROLE_META = {
    admin:   { label: "Admin",   variant: "brand" },
    manager: { label: "Manager", variant: "teal" },
    user:    { label: "User",    variant: "slate" },
    guest:   { label: "Guest",   variant: "bronze" },
};

export const STATUS_META = {
    // Existing User Statuses (adjust variant names to match your CSS)
    active: { variant: "teal", label: "Active" },
    suspended: { variant: "red", label: "Suspended" },
    unverified: { variant: "bronze", label: "Unverified" },

    // ADD Order Statuses here:
    Delivered: { variant: "teal", label: "Delivered" },
    Cancelled: { variant: "red", label: "Cancelled" },
    Processing: { variant: "brand", label: "Processing" },
    Shipped: { variant: "teal", label: "Shipped" },
    Pending: { variant: "bronze", label: "Pending" },
};

export const ADDRESS_TYPE_META = {
    home:     { label: "Home",     variant: "brand" },
    billing:  { label: "Billing",  variant: "bronze" },
    shipping: { label: "Shipping", variant: "teal" },
};

export const ADDRESS_TYPES = Object.keys(ADDRESS_TYPE_META);

export function orderStatusVariant(status) {
    if (status === "Delivered") return "teal";
    if (status === "Cancelled") return "red";
    return "bronze";
}

export const PERMISSIONS = [
    "View dashboard", "Manage users", "Create users", "Edit permissions",
    "View orders", "Refund orders", "Export data", "Manage settings",
];

export const ROLE_PERMISSION_MATRIX = {
    admin:   [1,1,1,1,1,1,1,1],
    manager: [1,1,1,0,1,1,1,0],
    user:    [1,0,0,0,1,0,0,0],
    guest:   [1,0,0,0,0,0,0,0],
};