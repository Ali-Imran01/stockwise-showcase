import { create } from 'zustand';
import api from '../api/client';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('stockwise_token'),
    isAuthenticated: !!localStorage.getItem('stockwise_token'),
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/login', {
                email,
                password,
                device_name: 'webapp'
            });

            const { token, user } = response.data;
            localStorage.setItem('stockwise_token', token);
            set({ token, user, isAuthenticated: true, loading: false });
            return true;
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Login failed',
                loading: false
            });
            return false;
        }
    },

    logout: async () => {
        try {
            await api.post('/logout');
        } catch (err) {
            console.error('Logout error', err);
        } finally {
            localStorage.removeItem('stockwise_token');
            set({ user: null, token: null, isAuthenticated: false });
        }
    },

    fetchMe: async () => {
        if (!localStorage.getItem('stockwise_token')) return;

        try {
            const response = await api.get('/me');
            set({ user: response.data, isAuthenticated: true });
        } catch (err) {
            localStorage.removeItem('stockwise_token');
            set({ user: null, token: null, isAuthenticated: false });
        }
    }
}));

export default useAuthStore;
