import client from './client';

export const auth = {
  login: (data) => client.post('/auth/login', data),
  register: (data) => client.post('/auth/register', data),
  me: () => client.get('/auth/me'),
};

export const dashboard = {
  stats: () => client.get('/dashboard/stats'),
};

export const patients = {
  list: (params) => client.get('/patients', { params }),
  get: (id) => client.get(`/patients/${id}`),
  create: (data) => client.post('/patients', data),
  update: (id, data) => client.put(`/patients/${id}`, data),
  delete: (id) => client.delete(`/patients/${id}`),
};

export const doctors = {
  list: (params) => client.get('/doctors', { params }),
  get: (id) => client.get(`/doctors/${id}`),
  create: (data) => client.post('/doctors', data),
  update: (id, data) => client.put(`/doctors/${id}`, data),
  delete: (id) => client.delete(`/doctors/${id}`),
};

export const departments = {
  list: () => client.get('/departments'),
  get: (id) => client.get(`/departments/${id}`),
  create: (data) => client.post('/departments', data),
  update: (id, data) => client.put(`/departments/${id}`, data),
  delete: (id) => client.delete(`/departments/${id}`),
};

export const appointments = {
  list: (params) => client.get('/appointments', { params }),
  get: (id) => client.get(`/appointments/${id}`),
  create: (data) => client.post('/appointments', data),
  update: (id, data) => client.put(`/appointments/${id}`, data),
  delete: (id) => client.delete(`/appointments/${id}`),
};

export const medicalRecords = {
  list: (params) => client.get('/medical_records', { params }),
  get: (id) => client.get(`/medical_records/${id}`),
  create: (data) => client.post('/medical_records', data),
  update: (id, data) => client.put(`/medical_records/${id}`, data),
  delete: (id) => client.delete(`/medical_records/${id}`),
};

export const rooms = {
  list: (params) => client.get('/rooms', { params }),
  get: (id) => client.get(`/rooms/${id}`),
  create: (data) => client.post('/rooms', data),
  update: (id, data) => client.put(`/rooms/${id}`, data),
  delete: (id) => client.delete(`/rooms/${id}`),
};

export const bills = {
  list: (params) => client.get('/bills', { params }),
  get: (id) => client.get(`/bills/${id}`),
  create: (data) => client.post('/bills', data),
  update: (id, data) => client.put(`/bills/${id}`, data),
  delete: (id) => client.delete(`/bills/${id}`),
};
