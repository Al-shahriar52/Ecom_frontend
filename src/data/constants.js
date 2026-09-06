
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
    "View dashboard",     // Index 0
    "Manage users",       // Index 1
    "Create users",       // Index 2
    "Edit permissions",   // Index 3
    "View orders",        // Index 4
    "Refund orders",      // Index 5
    "Export data",        // Index 6
    "Manage settings",    // Index 7
    "Manage Coupons",     // Index 8
    "Manage Accounting",  // Index 9
    "Manage FBT"          // Index 10
];

export const ROLE_META = {
    admin: { label: "Administrator", variant: "purple" },
    manager: { label: "Manager", variant: "blue" },
    user: { label: "User", variant: "emerald" },
    guest: { label: "Guest", variant: "amber" }
};

export const ROLE_PERMISSION_MATRIX = {
    admin:   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    manager: [1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0],
    user:    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    guest:   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};