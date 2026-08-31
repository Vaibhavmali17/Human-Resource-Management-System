import axiosInstance from '../api/axiosConfig';

export const getProfile = async () => {
  const response = await axiosInstance.get('/api/employee/profile');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put('/api/employee/profile', profileData);
  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get('/api/employee/me');
  return response.data;
};

export const updateMe = async (profileData) => {
  const response = await axiosInstance.put('/api/employee/me', profileData);
  return response.data;
};

export const addEmergencyContact = async (contactData) => {
  const response = await axiosInstance.post('/api/employee/me/emergency-contacts', contactData);
  return response.data;
};

export const deleteEmergencyContact = async (id) => {
  const response = await axiosInstance.delete(`/api/employee/me/emergency-contacts/${id}`);
  return response.data;
};

export const addDependent = async (dependentData) => {
  const response = await axiosInstance.post('/api/employee/me/dependents', dependentData);
  return response.data;
};

export const deleteDependent = async (id) => {
  const response = await axiosInstance.delete(`/api/employee/me/dependents/${id}`);
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
