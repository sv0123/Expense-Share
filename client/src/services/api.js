import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const API = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});

// Centralized error handling
API.interceptors.response.use(
    (res) => res,
    (err) => {
        // Log error for debugging
        console.error('API Error:', err.response || err);

        const fullUrl = (err.config?.baseURL || '') + (err.config?.url || '');
        const message =
            err.response?.data?.error ||
            err.response?.data?.message ||
            (err.response?.status === 404 ? `Not found (404): ${fullUrl}` : null) ||
            (err.response?.status >= 500 ? 'Server error. Please try again later.' : null) ||
            err.message ||
            'Something went wrong';

        return Promise.reject(new Error(message));
    }
);

export const createGroup = (data) => API.post('/groups', data);
export const joinGroup = (data) => API.post('/groups/join', data);
export const getGroup = (id) => API.get(`/groups/${id}`);
export const getUserGroups = () => API.get('/groups/my-groups');
export const addExpense = (data) => API.post('/expenses', data);
export const getExpenses = (groupId) => API.get(`/expenses/group/${groupId}`);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

export const getReminders = (groupId) => API.get(`/reminders/group/${groupId}`);
export const createReminder = (data) => API.post('/reminders', data);
export const sendReminder = (data) => API.post('/reminders/send', data);
export const sendReminderSms = (data) => API.post('/reminders/sms', data);

export const getSettlements = (groupId) => API.get(`/settlements/group/${groupId}`);
export const addSettlement = (data) => API.post('/settlements', data);

export default API;
