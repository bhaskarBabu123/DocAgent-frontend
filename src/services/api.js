const BASE_URL = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('docuchat_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

// Auth
export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
};

// Documents
export const docsAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.page) q.set('page', params.page);
    if (params.limit) q.set('limit', params.limit);
    return request(`/documents?${q}`);
  },
  get: (id) => request(`/documents/${id}`),
  delete: (id) => request(`/documents/${id}`, { method: 'DELETE' }),
  upload: async (file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
};

// Chat
export const chatAPI = {
  send: (body) => request('/chat', { method: 'POST', body: JSON.stringify(body) }),
  history: (documentId) => request(`/chat/history?documentId=${documentId}`),
};

// Dashboard
export const dashboardAPI = {
  stats: () => request('/dashboard/stats'),
};
