import axiosInstance from '../api/axiosConfig';

export const getProfile = async () => {
  const response = await axiosInstance.get('/api/employee/profile');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put('/api/employee/profile', profileData);
  return response.data;
};

export const getLeaves = async () => {
  const response = await axiosInstance.get('/api/employee/leaves');
  return response.data;
};

export const applyLeave = async (leaveData) => {
  const response = await axiosInstance.post('/api/employee/leaves', leaveData);
  return response.data;
};

export const getTimesheets = async () => {
  const response = await axiosInstance.get('/api/employee/timesheets');
  return response.data;
};

export const submitTimesheet = async (timesheetData) => {
  const response = await axiosInstance.post('/api/employee/timesheets', timesheetData);
  return response.data;
};

export const getPerformance = async () => {
  const response = await axiosInstance.get('/api/employee/performance');
  return response.data;
};
