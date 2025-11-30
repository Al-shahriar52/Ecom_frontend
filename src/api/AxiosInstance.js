import axios from 'axios';

const baseURL = 'http://localhost:8080';

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // 1. PREVENT INFINITE LOOP
        // If the error comes from the Login or Refresh endpoint, DO NOT try to refresh again.
        if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/user/refreshAccessToken')) {
            return Promise.reject(error);
        }

        // 2. Check for 401 and if we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to Refresh
                await axiosInstance.post('/api/v1/user/refreshAccessToken');

                // If success, retry the original request
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error("Session expired.");
                localStorage.removeItem('user');

                // 3. PREVENT RELOAD LOOP ON LOGIN PAGE
                // Only redirect if we are NOT already on the login page
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