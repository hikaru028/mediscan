import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NGROK_API } from '@/app/api/ngrok';

// Create an axios instance with default configurations
const axiosClient: AxiosInstance = axios.create({
    baseURL: `${NGROK_API}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token to headers
axiosClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
            if (config.headers) {
                config.headers.set('Authorization', `Bearer ${token}`);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors globally
axiosClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized, please log in again.');
            // Handle logout here if necessary
        } else if (error.response && error.response.status === 500) {
            console.error('Server error, please try again later.');
        }
        return Promise.reject(error);
    }
);

let retryCount = 0;
const MAX_RETRIES = 5;

axiosClient.interceptors.response.use(
    response => response,
    async error => {
        const { config, response } = error;
        const statusCode = response?.status;

        if (statusCode === 429) {
            retryCount++;
            const retryAfter = response.headers['retry-after'];
            const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(Math.pow(2, retryCount) * 1000, 30000); // Exponential backoff

            console.warn(`Rate limit exceeded. Retrying after ${delay / 1000} seconds... (Attempt ${retryCount})`);

            if (retryCount <= MAX_RETRIES) {
                await new Promise(resolve => setTimeout(resolve, delay));
                return axiosClient(config); // Retry the request
            } else {
                console.error('Max retries exceeded.');
                return Promise.reject(error); // Stop retrying after max attempts
            }
        }

        retryCount = 0; // Reset retry count if the request succeeds
        return Promise.reject(error);
    }
);

export default axiosClient;