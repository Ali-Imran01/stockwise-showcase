import axios from 'axios';
import { handle } from '../mock/handlers';
import { db } from '../mock/db';

// The showcase has no backend: an axios adapter answers every /api call from the in-memory mock
// database (src/mock). Page code keeps using this instance exactly as it did against Laravel.
const mockAdapter = async (config) => {
    await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 200));

    const path = (config.url || '').split('?')[0];
    const auth = config.headers?.Authorization || config.headers?.get?.('Authorization') || '';
    const userId = Number(String(auth).replace('Bearer demo-token-', ''));
    const user = db.users.find((u) => u.id === userId) || null;

    let body = config.data;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            /* leave as-is */
        }
    }

    const { status, data } = await handle({
        method: (config.method || 'get').toUpperCase(),
        path,
        params: config.params || {},
        body,
        user,
    });

    const response = { data, status, statusText: String(status), headers: {}, config, request: {} };
    if (status >= 200 && status < 300) return response;
    throw new axios.AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response);
};

const api = axios.create({
    baseURL: '/api',
    adapter: mockAdapter,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor to add the token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('stockwise_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor to handle session expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('stockwise_token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
