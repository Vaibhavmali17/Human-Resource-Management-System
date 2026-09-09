import axiosInstance from '../api/axiosConfig';

export const leaveService = {
  getLeaveTypes: async () => {
    const response = await axiosInstance.get('/api/leaves/types');
    return response.data;
  },

  getLeaveBalances: async () => {
    const response = await axiosInstance.get('/api/leaves/balances/me');
    return response.data;
  },

  applyLeave: async (applyData) => {
    const response = await axiosInstance.post('/api/leaves/apply', applyData);
    return response.data;
  },

  getMyLeaveHistory: async () => {
    const response = await axiosInstance.get('/api/leaves/my-history');
    return response.data;
  },

  // Admin APIs
  getPendingLeaveRequests: async () => {
    const response = await axiosInstance.get('/api/admin/leaves/pending');
    return response.data;
  },

  getAllLeaveRequests: async () => {
    const response = await axiosInstance.get('/api/admin/leaves/all');
    return response.data;
  },

  processLeaveAction: async (id, actionData) => {
    const response = await axiosInstance.put(`/api/admin/leaves/${id}/action`, actionData);
    return response.data;
  }
};

export default leaveService;
