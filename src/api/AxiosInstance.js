import axios from 'axios';

const baseURL = 'http://localhost:8080';

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- QUEUE SYSTEM FOR PARALLEL REQUESTS ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// --- RESPONSE INTERCEPTOR ---
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // 1. IGNORE LOGIN/REFRESH ERRORS
        // Use YOUR correct endpoint here
        if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/user/refreshAccessToken')) {
            return Promise.reject(error);
        }

        // 2. CHECK FOR 401 OR 403
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {

            // A. QUEUE REQUESTS IF ALREADY REFRESHING
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({resolve, reject});
                }).then(() => {
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            // B. START REFRESH
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call YOUR correct endpoint
                await axiosInstance.post('/api/v1/user/refreshAccessToken');

                processQueue(null, 'success');
                isRefreshing = false;

                return axiosInstance(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                console.error("Session expired.");
                localStorage.removeItem('user');

                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;