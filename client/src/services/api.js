// LandlordReady API Service Client

const API_BASE = '/api';

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    const error = new Error(data.error || 'An unexpected error occurred');
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  // Rules
  getRules: () => request(`${API_BASE}/rules`),

  // Free Compliance Check
  submitCheck: (answers) => request(`${API_BASE}/check`, {
    method: 'POST',
    body: JSON.stringify(answers)
  }),
  saveCheckEmail: (check_id, email, name) => request(`${API_BASE}/check/email`, {
    method: 'POST',
    body: JSON.stringify({ check_id, email, name })
  }),
  getCheck: (id) => request(`${API_BASE}/check/${id}`),

  // Profile & Subscriptions
  getProfile: () => request(`${API_BASE}/profile`),
  updateProfile: (profile) => request(`${API_BASE}/profile`, {
    method: 'PUT',
    body: JSON.stringify(profile)
  }),
  upgradeSubscription: (plan_id, billing_cycle) => request(`${API_BASE}/subscriptions/upgrade`, {
    method: 'POST',
    body: JSON.stringify({ plan_id, billing_cycle })
  }),
  getOrders: () => request(`${API_BASE}/orders`),

  // Properties
  getProperties: () => request(`${API_BASE}/properties`),
  createProperty: (data) => request(`${API_BASE}/properties`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProperty: (id, data) => request(`${API_BASE}/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteProperty: (id) => request(`${API_BASE}/properties/${id}`, {
    method: 'DELETE'
  }),
  getPropertyPack: (id) => request(`${API_BASE}/properties/${id}/pack`),

  // Tenancies
  createTenancy: (data) => request(`${API_BASE}/tenancies`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Certificates & Files
  getCertificates: (property_id) => request(`${API_BASE}/certificates${property_id ? `?property_id=${property_id}` : ''}`),
  createCertificate: (data) => request(`${API_BASE}/certificates`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  uploadCertificateFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/certificates/upload`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  // Compliance Calendar & Tasks
  getTasks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`${API_BASE}/tasks${query ? `?${query}` : ''}`);
  },
  createTask: (data) => request(`${API_BASE}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTask: (id, data) => request(`${API_BASE}/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  simulateReminders: () => request(`${API_BASE}/tasks/simulate-reminders`, {
    method: 'POST'
  }),

  // Documents & Templates
  getTemplates: () => request(`${API_BASE}/templates`),
  generateDocument: (template_slug, property_id, custom_values) => request(`${API_BASE}/documents/generate`, {
    method: 'POST',
    body: JSON.stringify({ template_slug, property_id, custom_values })
  }),
  getDocuments: (property_id) => request(`${API_BASE}/documents${property_id ? `?property_id=${property_id}` : ''}`),

  // "Can I Do This?" Legal Assistant
  askQA: (question, property_id) => request(`${API_BASE}/qa`, {
    method: 'POST',
    body: JSON.stringify({ question, property_id })
  }),
  getQALogs: (property_id) => request(`${API_BASE}/qa${property_id ? `?property_id=${property_id}` : ''}`),

  // Regulation Updates
  getRegulationUpdates: () => request(`${API_BASE}/regulation-updates`),
  postRegulationUpdate: (data) => request(`${API_BASE}/regulation-updates`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
};
