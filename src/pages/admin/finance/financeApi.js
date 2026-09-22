import axiosInstance from '../../../api/AxiosInstance';

export const createExpense = async (payload, receiptFile) => {
    const formData = new FormData();
    formData.append('expense', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (receiptFile) formData.append('receipt', receiptFile);

    const response = await axiosInstance.post('/api/v1/admin/expenses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
};

export const fetchExpenses = async ({ pageNo = 0, pageSize = 20, start, end, category, hasReceipt, query } = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/expenses', {
        params: { pageNo, pageSize, start, end, category, hasReceipt, query },
    });
    return response.data.data; // Spring Page: { content, totalElements, totalPages, ... }
};

export const fetchExpenseSummary = async (start, end) => {
    const response = await axiosInstance.get('/api/v1/admin/expenses/summary', { params: { start, end } });
    return response.data.data;
};

export const fetchExpenseMonthlyTrend = async (category, months = 6) => {
    const response = await axiosInstance.get('/api/v1/admin/expenses/monthly-trend', { params: { category, months } });
    return response.data.data; // { "Mar": 1234, "Apr": 5678, ... }
};

export const fetchTransactions = async ({ page = 0, size = 20, search, method, paymentStatus, orderStatus, deliveryStatus, startDate, endDate } = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/orders/finance-transactions', {
        params: { page, size, search, method, paymentStatus, orderStatus, deliveryStatus, startDate, endDate },
    });
    return response.data.data; // Spring Page of AdminTransactionDto
};
