import axios from '../api/AxiosInstance';

const COUPON_API_URL = '/api/v1/admin/coupons';

export const couponService = {
    getCoupons: async ({ page = 0, size = 10, status = 'all', search = '', sortBy = 'recent' }) => {
        const response = await axios.get(COUPON_API_URL, {
            params: { page, size, status, search, sortBy }
        });
        return response.data;
    },
    getCouponById: async (id) => {
        const response = await axios.get(`${COUPON_API_URL}/${id}`);
        return response.data.data || response.data;
    },
    createCoupon: async (couponData) => {
        const response = await axios.post(COUPON_API_URL, couponData);
        return response.data;
    },
    updateCoupon: async (id, couponData) => {
        const response = await axios.put(`${COUPON_API_URL}/${id}`, couponData);
        return response.data;
    },
    performBulkAction: async (action, ids) => {
        const response = await axios.post(`${COUPON_API_URL}/bulk`, { action, ids });
        return response.data;
    },
    getCouponStats: async () => {
        const response = await axios.get(`${COUPON_API_URL}/stats`);
        return response.data.data || response.data;
    },
    searchProducts: async (query) => {
        const response = await axios.get('/api/v1/product/search', {
            params: { query, pageSize: 10 }
        });
        return response.data.data?.content || response.data.content || response.data;
    },
    getCategories: async () => {
        const response = await axios.get('/api/v1/product/categories');
        return response.data.data || response.data;
    },
    getSubCategories: async (categoryId) => {
        const response = await axios.get(`/api/v1/product/subCategory/${categoryId}`);
        return response.data.data || response.data;
    },
    getBrands: async () => {
        const response = await axios.get('/api/v1/product/brand');
        return response.data.data || response.data;
    },
    getCities: async () => {
        const response = await axios.get('/api/v1/location/cities');
        return response.data.data || response.data;
    },
    getAreas: async (cityId) => {
        const response = await axios.get('/api/v1/location/areas', {
            params: { city_id: cityId }
        });
        return response.data.data || response.data;
    }
};