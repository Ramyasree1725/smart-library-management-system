// API Service with JWT authentication headers and unified response handling

const API_BASE = '/api';

const getHeaders = (isJson = true) => {
  const token = localStorage.getItem('smartlib_token');
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

async function handleResponse(response) {
  const data = await response.json().catch(() => ({ success: false, message: 'Invalid JSON response' }));
  if (!response.ok) {
    if (response.status === 401) {
      // Clear token if expired or unauthorized
      if (localStorage.getItem('smartlib_token')) {
        console.warn("Session expired or token invalid.");
      }
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getStudents: async () => {
    const res = await fetch(`${API_BASE}/auth/students`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Books
  getBooks: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/books?${query}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getBookById: async (id) => {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  createBook: async (bookData) => {
    const res = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookData)
    });
    return handleResponse(res);
  },

  updateBook: async (id, bookData) => {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(bookData)
    });
    return handleResponse(res);
  },

  deleteBook: async (id) => {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Circulation
  issueBook: async (data) => {
    const res = await fetch(`${API_BASE}/circulation/issue`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  returnBook: async (data) => {
    const res = await fetch(`${API_BASE}/circulation/return`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  renewBook: async (transactionId) => {
    const res = await fetch(`${API_BASE}/circulation/renew`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ transactionId })
    });
    return handleResponse(res);
  },

  reserveBook: async (bookId) => {
    const res = await fetch(`${API_BASE}/circulation/reserve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookId })
    });
    return handleResponse(res);
  },

  cancelReservation: async (id) => {
    const res = await fetch(`${API_BASE}/circulation/reserve/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  payFine: async (transactionId) => {
    const res = await fetch(`${API_BASE}/circulation/pay-fine`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ transactionId })
    });
    return handleResponse(res);
  },

  getAllTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/circulation/transactions?${query}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getMyTransactions: async () => {
    const res = await fetch(`${API_BASE}/circulation/my-transactions`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getMyReservations: async () => {
    const res = await fetch(`${API_BASE}/circulation/my-reservations`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Recommendations
  getRecommendations: async () => {
    const res = await fetch(`${API_BASE}/recommendations`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Analytics
  getDashboardAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  markAllNotificationsRead: async () => {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
