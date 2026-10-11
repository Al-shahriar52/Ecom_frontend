import axiosInstance from '../../../api/AxiosInstance';

const BASE = '/api/v1/admin/courier';

export const fetchPickupLocations = async () => (await axiosInstance.get(`${BASE}/pickup-locations`)).data.data;
export const savePickupLocation = async (payload, id) => {
    const res = id
        ? await axiosInstance.put(`${BASE}/pickup-locations/${id}`, payload)
        : await axiosInstance.post(`${BASE}/pickup-locations`, payload);
    return res.data.data;
};
export const deletePickupLocation = async (id) => axiosInstance.delete(`${BASE}/pickup-locations/${id}`);
export const fetchPoliceStations = async () => (await axiosInstance.get(`${BASE}/police-stations`)).data.data;
export const createPickupRequest = async (payload) => (await axiosInstance.post(`${BASE}/pickup-requests`, payload)).data.data;
export const fetchPickupHistory = async (pageNo = 0, pageSize = 10) =>
    (await axiosInstance.get(`${BASE}/pickup-requests`, { params: { pageNo, pageSize } })).data.data;
export const fetchAwaitingPickup = async () => (await axiosInstance.get(`${BASE}/awaiting-pickup`)).data.data;

// ---- Providers (Steadfast, Pathao, ...) ----
export const fetchProviders = async () => (await axiosInstance.get(`${BASE}/providers`)).data.data;
export const updateProvider = async (key, payload) => (await axiosInstance.put(`${BASE}/providers/${key}`, payload)).data.data;
export const testPathaoConnection = async () => (await axiosInstance.post(`${BASE}/providers/pathao/test`)).data;

// ---- Pathao stores + locations ----
export const fetchPathaoStores = async () => (await axiosInstance.get(`${BASE}/pathao/stores`)).data.data;
export const syncPathaoStores = async () => (await axiosInstance.post(`${BASE}/pathao/stores/sync`)).data.data;
export const createPathaoStore = async (payload) => (await axiosInstance.post(`${BASE}/pathao/stores`, payload)).data.data;
export const setDefaultPathaoStore = async (id) => (await axiosInstance.put(`${BASE}/pathao/stores/${id}/default`)).data.data;
export const fetchPathaoCities = async () => (await axiosInstance.get(`${BASE}/pathao/cities`)).data.data;
export const fetchPathaoZones = async (cityId) => (await axiosInstance.get(`${BASE}/pathao/cities/${cityId}/zones`)).data.data;
export const fetchPathaoAreas = async (zoneId) => (await axiosInstance.get(`${BASE}/pathao/zones/${zoneId}/areas`)).data.data;
export const quotePathao = async (payload) => (await axiosInstance.post(`${BASE}/pathao/quote`, payload)).data.data;

// ---- Booking (any courier) ----
export const bookParcels = async (orderIds, courier) =>
    (await axiosInstance.post('/api/v1/admin/orders/pickup', { orderIds, courier: courier || null })).data;

// ---- Status sync ----
export const syncAllStatuses = async () => (await axiosInstance.post(`${BASE}/sync`)).data.data;
export const syncOrderStatus = async (orderId) => (await axiosInstance.post(`${BASE}/sync/order/${orderId}`)).data.data;
export const fetchSteadfastPayouts = async (page = 1) => (await axiosInstance.get(`${BASE}/steadfast/payouts`, { params: { page } })).data.data;
export const checkCustomer = async (phone) => (await axiosInstance.get(`${BASE}/steadfast/customer-check`, { params: { phone } })).data.data;
export const fetchWebhookEvents = async () => (await axiosInstance.get(`${BASE}/webhook-events`)).data.data;
export const reconcilePayout = async (paymentId) => (await axiosInstance.get(`${BASE}/steadfast/payouts/${encodeURIComponent(paymentId)}`)).data.data;
