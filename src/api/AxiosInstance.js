import axios from 'axios';

// The base URL for your Spring Boot backend
const baseURL = 'http://localhost:8080';

const axiosInstance = axios.create({
    baseURL,
});

// Request Interceptor: Adds the accessToken to every outgoing request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handles token refresh logic
axiosInstance.interceptors.response.use(
    (response) => {
        return response; // If the response is successful, just return it
    },
    async (error) => {
        const originalRequest = error.config;

        // Check if the error is 401 and it's not a retry request
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark it as a retry to prevent infinite loops

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    // If no refresh token, logout the user
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Call your refresh token endpoint
                const refreshResponse = await axios.post(`${baseURL}/api/v1/user/refreshAccessToken`, {}, {
                    headers: { 'Authorization': `Bearer ${refreshToken}` }
                });

                if (refreshResponse.status === 200) {
                    const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

                    // Update the new tokens in localStorage
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    // Update the Authorization header for the original request
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                    // Retry the original request with the new token
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // If the refresh token is also invalid, logout the user
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;