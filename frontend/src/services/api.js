import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

export const getProducts = () => api.get('/api/products/');
export const getProduct = (id) => api.get(`/api/products/${id}`);
export const createProduct = (data) => api.post('/api/products/', data);
export const updateProduct = (id, data) => api.put(`/api/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/api/products/${id}`);

export const getCustomers = () => api.get('/api/customers/');
export const getCustomer = (id) => api.get(`/api/customers/${id}`);
export const createCustomer = (data) => api.post('/api/customers/', data);
export const updateCustomer = (id, data) => api.put(`/api/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/api/customers/${id}`);

export const getOrders = () => api.get('/api/orders/');
export const getOrder = (id) => api.get(`/api/orders/${id}`);
export const createOrder = (data) => api.post('/api/orders/', data);

export default api;
