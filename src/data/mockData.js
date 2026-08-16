import { Users, UserCheck, Clock, UserX } from "lucide-react";
import { ROLE_META } from "./constants";

const NAMES_POOL = [
    ["Farhana Akter","admin"], ["Tanvir Hasan","manager"],
    ["Nusrat Jahan","user"], ["Rafi Islam","user"],
    ["Shaila Parvin","guest"], ["Imran Kabir","manager"],
    ["Mahfuza Sultana","user"], ["Sabbir Ahmed","user"],
    ["Ayesha Siddika","guest"], ["Kamrul Hasan","user"],
    ["Sharmin Akhter","manager"], ["Jahidul Islam","user"],
];

const CITIES = ["Dhaka","Chattogram","Sylhet","Khulna","Rajshahi","Barishal"];
const AREAS = ["Gulshan","Banani","Mirpur","Uttara","Dhanmondi","Bashundhara"];
const STATUS_POOL = ["active","active","active","unverified","suspended","active"];

function buildActivityLog(status, city, i) {
    if (status === "unverified") {
        return [{ t: "2026-07-28 09:14", a: "Account created — verification pending" }];
    }
    const templates = [
        `Logged in from ${city}, BD`, "Updated shipping address", "Changed password",
        "Placed a new order", "Left a product review", "Updated profile photo",
        "Enabled email notifications", "Viewed order tracking", "Applied a discount coupon",
        "Added a new billing address", "Contacted customer support", "Updated phone number",
    ];
    const count = 6 + (i % 10);
    return Array.from({ length: count }, (_, idx) => ({
        t: `2026-0${((i + idx) % 7) + 1}-${10 + ((i + idx) % 18)} ${((8 + idx) % 12) + 1}:${(idx * 11) % 60 < 10 ? "0" : ""}${(idx * 11) % 60} ${(idx % 2 === 0) ? "AM" : "PM"}`,
        a: templates[(i + idx) % templates.length],
    }));
}

const ORDER_STATUS_CYCLE = ["Delivered", "Delivered", "Processing", "Cancelled", "Delivered", "Shipped"];
function buildOrderHistory(totalOrders, i) {
    if (totalOrders === 0) return [];
    const count = Math.max(totalOrders, 4) + (i % 6);
    return Array.from({ length: count }, (_, idx) => ({
        id: `ORD-9${String(100 + i * 13 + idx).slice(-3)}${idx}`,
        date: `2026-0${((i + idx) % 7) + 1}-${10 + ((idx * 3) % 18)}`,
        amount: `৳${(idx + 1) * 210 + i * 15}`,
        status: ORDER_STATUS_CYCLE[(i + idx) % ORDER_STATUS_CYCLE.length],
        items: 1 + ((i + idx) % 4),
    }));
}

export const MOCK_USERS = NAMES_POOL.map(([name, role], i) => {
    const status = i < 2 ? "active" : STATUS_POOL[i % STATUS_POOL.length];
    const delivered = status === "unverified" ? 0 : Math.floor(Math.random() * 10) + (role === "admin" ? 4 : 0);
    const cancelled = status === "unverified" ? 0 : Math.floor(Math.random() * 3);
    const pending = status === "unverified" ? 0 : Math.floor(Math.random() * 2);
    const processing = status === "unverified" ? 0 : Math.floor(Math.random() * 2);
    const totalOrders = delivered + cancelled + pending + processing;
    const totalSpent = delivered * (280 + i * 35) + processing * (150 + i * 20);
    return {
        id: `USR-10${42 + i}`,
        name, role, status,
        avatarVariant: ROLE_META[role].variant,
        email: name.toLowerCase().replace(/ /g, ".") + "@mail.com",
        phone: `+880 1${700 + i}-${100000 + i * 37}`.slice(0, 17),
        createdAt: `2026-0${(i % 7) + 1}-${10 + i} · ${(8 + i) % 12 + 1}:${(i * 7) % 60 < 10 ? "0" : ""}${(i * 7) % 60} ${(8+i)%24 < 12 ? "AM" : "PM"}`,
        addresses: [
            { id: i * 10 + 1, addressType: "home", city: CITIES[i % CITIES.length], area: AREAS[i % AREAS.length], address: `House ${12 + i}, Road ${3 + (i % 9)}` },
            ...(i % 3 !== 2 ? [{ id: i * 10 + 2, addressType: "shipping", city: CITIES[(i + 1) % CITIES.length], area: AREAS[(i + 2) % AREAS.length], address: `Flat 4B, Road ${8 + i}` }] : []),
            ...(i % 4 === 0 ? [{ id: i * 10 + 3, addressType: "billing", city: CITIES[i % CITIES.length], area: AREAS[(i + 1) % AREAS.length], address: `Office ${5 + i}, Level 3` }] : []),
        ],
        orders: totalOrders,
        orderStats: { totalSpent, delivered, cancelled, pending: pending + processing },
        activity: buildActivityLog(status, CITIES[i % CITIES.length], i),
        orderHistory: buildOrderHistory(totalOrders, i),
    };
});

export const STATS = [
    { label: "Total users", value: "1,248", icon: Users, variant: "brand", delta: "+42 this month", up: true },
    { label: "Active", value: "1,062", icon: UserCheck, variant: "teal", delta: "85% of total", up: true },
    { label: "Unverified", value: "116", icon: Clock, variant: "bronze", delta: "Needs review", up: false },
    { label: "Suspended", value: "70", icon: UserX, variant: "red", delta: "5.6% of total", up: false },
];

export const ROLE_DISTRIBUTION = [
    { role: "admin", pct: 4 }, { role: "manager", pct: 14 }, { role: "user", pct: 71 }, { role: "guest", pct: 11 },
];

export const SPARK = [4,7,5,9,6,10,8,12,9,13,11,15];