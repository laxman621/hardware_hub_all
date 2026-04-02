// ─── Base URL ─────────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:5000/api';

// ─── Authenticated fetch helper ───────────────────────────────────────────────
const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  return response.json();
};

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (userData)    => fetchAPI('/auth/register',        { method: 'POST', body: JSON.stringify(userData) }),
  login:          (credentials) => fetchAPI('/auth/login',           { method: 'POST', body: JSON.stringify(credentials) }),
  logout:         ()            => fetchAPI('/auth/logout',          { method: 'POST' }),
  getProfile:     ()            => fetchAPI('/auth/profile'),
  changePassword: (passwords)   => fetchAPI('/auth/change-password', { method: 'POST', body: JSON.stringify(passwords) }),
};

// ─── Hardware API ─────────────────────────────────────────────────────────────
export const hardwareAPI = {
  getAll:  (params) => fetchAPI(`/hardware${params ? '?' + new URLSearchParams(params) : ''}`),
  getById: (id)     => fetchAPI(`/hardware/${id}`),
  create:  (data)   => fetchAPI('/hardware',    { method: 'POST',   body: JSON.stringify(data) }),
  update:  (id, data) => fetchAPI(`/hardware/${id}`, { method: 'PUT',  body: JSON.stringify(data) }),
  delete:  (id)     => fetchAPI(`/hardware/${id}`,   { method: 'DELETE' }),
};

// ─── Professionals API ────────────────────────────────────────────────────────
export const professionalAPI = {
  getAll:  (params)   => fetchAPI(`/professionals${params ? '?' + new URLSearchParams(params) : ''}`),
  getById: (id)       => fetchAPI(`/professionals/${id}`),
  create:  (data)     => fetchAPI('/professionals',    { method: 'POST',   body: JSON.stringify(data) }),
  update:  (id, data) => fetchAPI(`/professionals/${id}`, { method: 'PUT',  body: JSON.stringify(data) }),
  delete:  (id)       => fetchAPI(`/professionals/${id}`, { method: 'DELETE' }),
  getMyProfile: ()    => fetchAPI('/professionals/me'),
  updateMyProfile: (data) => fetchAPI('/professionals/me', { method: 'PUT', body: JSON.stringify(data) }),
  updateMyAvailability: (isAvailable) => fetchAPI('/professionals/me/availability', { method: 'PATCH', body: JSON.stringify({ isAvailable }) }),
  getMyBookings: (params) => fetchAPI(`/professionals/me/bookings${params ? '?' + new URLSearchParams(params) : ''}`),
};

// ─── Rental API ───────────────────────────────────────────────────────────────
export const rentalAPI = {
  getAll:         ()       => fetchAPI('/rentals'),
  getById:        (id)     => fetchAPI(`/rentals/${id}`),
  getUserRentals: (userId) => fetchAPI(`/rentals/user/${userId}`),
  create:         (data)   => fetchAPI('/rentals',            { method: 'POST', body: JSON.stringify(data) }),
  returnRental:   (id)     => fetchAPI(`/rentals/${id}/return`, { method: 'PUT' }),
  updateStatus:   (id, status) => fetchAPI(`/rentals/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ─── Booking API ──────────────────────────────────────────────────────────────
export const bookingAPI = {
  getAll:          ()       => fetchAPI('/bookings'),
  getById:         (id)     => fetchAPI(`/bookings/${id}`),
  getUserBookings: (userId) => fetchAPI(`/bookings/user/${userId}`),
  create:          (data)   => fetchAPI('/bookings',              { method: 'POST', body: JSON.stringify(data) }),
  cancel:          (id)     => fetchAPI(`/bookings/${id}/cancel`, { method: 'PUT' }),
  updateStatus:    (id, status) => fetchAPI(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  remove:          (id)     => fetchAPI(`/bookings/${id}`, { method: 'DELETE' }),
};

// ─── Payment API ──────────────────────────────────────────────────────────────
export const paymentAPI = {
  getAll:       ()     => fetchAPI('/payments'),
  getById:      (id)   => fetchAPI(`/payments/${id}`),
  getMyPayments: ()    => fetchAPI('/payments/my'),
  create:       (data) => fetchAPI('/payments', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminAPI = {
  getAllProfessionals: (params) => fetchAPI(`/professionals/admin/all${params ? '?' + new URLSearchParams(params) : ''}`),
  createProfessional: (data) => fetchAPI('/professionals/admin', { method: 'POST', body: JSON.stringify(data) }),
  updateProfessional: (id, data) => fetchAPI(`/professionals/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProfessional: (id) => fetchAPI(`/professionals/admin/${id}`, { method: 'DELETE' }),
};

export default {
  auth:         authAPI,
  hardware:     hardwareAPI,
  professional: professionalAPI,
  rental:       rentalAPI,
  booking:      bookingAPI,
  payment:      paymentAPI,
  admin:        adminAPI,
};
