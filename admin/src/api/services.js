import api from './client';

export const authApi = {
  login: (credentials) => api.post('/auth/token/', credentials),
  refresh: (refresh) => api.post('/auth/token/refresh/', { refresh }),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats/'),
};

export const applicantApi = {
  list: (params) => api.get('/applicants/', { params }),
  retrieve: (id) => api.get(`/applicants/${id}/`),
  create: (data) => api.post('/applicants/', data),
  update: (id, data) => api.patch(`/applicants/${id}/`, data),
  delete: (id) => api.delete(`/applicants/${id}/`),
  // Nested
  getPayments: (id) => api.get(`/applicants/${id}/payments/`),
  createPayment: (id, data) => api.post(`/applicants/${id}/payments/`, data),
  getRefunds: (id) => api.get(`/applicants/${id}/refunds/`),
  createRefund: (id, data) => api.post(`/applicants/${id}/refunds/`, data),
  getNotes: (id) => api.get(`/applicants/${id}/notes/`),
  createNote: (id, data) => api.post(`/applicants/${id}/notes/`, data),
  getStatusHistory: (id) => api.get(`/applicants/${id}/status-history/`),
  getAgreement: (id) => api.get(`/applicants/${id}/agreement/`),
};

export const slotApi = {
  list: (params) => api.get('/monthly-slots/', { params }),
  retrieve: (id) => api.get(`/monthly-slots/${id}/`),
  create: (data) => api.post('/monthly-slots/', data),
  update: (id, data) => api.patch(`/monthly-slots/${id}/`, data),
  delete: (id) => api.delete(`/monthly-slots/${id}/`),
};

export const staffApi = {
  list: (params) => api.get('/staffs/', { params }),
  retrieve: (id) => api.get(`/staffs/${id}/`),
  create: (data) => api.post('/staffs/', data),
  update: (id, data) => api.patch(`/staffs/${id}/`, data),
  delete: (id) => api.delete(`/staffs/${id}/`),
  // Nested Monthly Slots
  listSlots: (staffId) => api.get(`/staffs/${staffId}/monthly-slots/`),
  createSlot: (staffId, data) => api.post(`/staffs/${staffId}/monthly-slots/`, data),
  // Nested Sub-staffs
  listSubStaffs: (staffId) => api.get(`/staffs/${staffId}/sub-staffs/`),
  createSubStaff: (staffId, data) => api.post(`/staffs/${staffId}/sub-staffs/`, data),
};

export const configApi = {
  // Countries
  countries: {
    list: () => api.get('/countries/'),
    create: (data) => api.post('/countries/', data),
    update: (id, data) => api.patch(`/countries/${id}/`, data),
    delete: (id) => api.delete(`/countries/${id}/`),
    requirements: {
      list: (countryId) => api.get(`/countries/${countryId}/requirements/`),
      create: (countryId, data) => api.post(`/countries/${countryId}/requirements/`, data),
      delete: (countryId, reqId) => api.delete(`/countries/${countryId}/requirements/${reqId}/`),
    },
    faqs: {
      list: (countryId) => api.get(`/countries/${countryId}/faqs/`),
      create: (countryId, data) => api.post(`/countries/${countryId}/faqs/`, data),
      delete: (countryId, faqId) => api.delete(`/countries/${countryId}/faqs/${faqId}/`),
    }
  },
  // Visa Categories
  visaCategories: {
    list: () => api.get('/visa-categories/'),
    create: (data) => api.post('/visa-categories/', data),
  },
  // Visas
  visas: {
    list: (params) => api.get('/visas/', { params }),
    create: (data) => api.post('/visas/', data),
    update: (id, data) => api.patch(`/visas/${id}/`, data),
    delete: (id) => api.delete(`/visas/${id}/`),
    jobs: {
      list: (visaId) => api.get(`/visas/${visaId}/jobs/`),
      create: (visaId, data) => api.post(`/visas/${visaId}/jobs/`, data),
      delete: (visaId, jobId) => api.delete(`/visas/${visaId}/jobs/${jobId}/`),
      facilities: {
        list: (visaId, jobId) => api.get(`/visas/${visaId}/jobs/${jobId}/facilities/`),
        create: (visaId, jobId, data) => api.post(`/visas/${visaId}/jobs/${jobId}/facilities/`, data),
      }
    },
    steps: {
      list: (visaId) => api.get(`/visas/${visaId}/steps/`),
      create: (visaId, data) => api.post(`/visas/${visaId}/steps/`, data),
    },
    faqs: {
      list: (visaId) => api.get(`/visas/${visaId}/faqs/`),
      create: (visaId, data) => api.post(`/visas/${visaId}/faqs/`, data),
    },
    requirements: {
      list: (visaId) => api.get(`/visas/${visaId}/requirements/`),
      create: (visaId, data) => api.post(`/visas/${visaId}/requirements/`, data),
    }
  },
  // Designations
  designations: {
    list: () => api.get('/designations/'),
    create: (data) => api.post('/designations/', data),
  },
};
