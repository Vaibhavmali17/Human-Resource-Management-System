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

export const updateEmergencyContact = async (id, contactData) => {
  const response = await axiosInstance.put(`/api/employee/me/emergency-contacts/${id}`, contactData);
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

export const updateDependent = async (id, dependentData) => {
  const response = await axiosInstance.put(`/api/employee/me/dependents/${id}`, dependentData);
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

// Qualifications & Skills Hub Services
export const getQualifications = async () => {
  const response = await axiosInstance.get('/api/employee/me/qualifications');
  return response.data;
};

export const addWorkExperience = async (data) => {
  const response = await axiosInstance.post('/api/employee/me/work-experience', data);
  return response.data;
};

export const updateWorkExperience = async (id, data) => {
  const response = await axiosInstance.put(`/api/employee/me/work-experience/${id}`, data);
  return response.data;
};

export const deleteWorkExperience = async (id) => {
  const response = await axiosInstance.delete(`/api/employee/me/work-experience/${id}`);
  return response.data;
};

export const addEducation = async (data) => {
  const response = await axiosInstance.post('/api/employee/me/education', data);
  return response.data;
};

export const updateEducation = async (id, data) => {
  const response = await axiosInstance.put(`/api/employee/me/education/${id}`, data);
  return response.data;
};

export const deleteEducation = async (id) => {
  const response = await axiosInstance.delete(`/api/employee/me/education/${id}`);
  return response.data;
};

export const addSkill = async (data) => {
  const response = await axiosInstance.post('/api/employee/me/skills', data);
  return response.data;
};

export const updateSkill = async (id, data) => {
  const response = await axiosInstance.put(`/api/employee/me/skills/${id}`, data);
  return response.data;
};

export const deleteSkill = async (id) => {
  const response = await axiosInstance.delete(`/api/employee/me/skills/${id}`);
  return response.data;
};

export const addLanguage = async (data) => {
  const response = await axiosInstance.post('/api/employee/me/languages', data);
  return response.data;
};

export const updateLanguage = async (id, data) => {
  const response = await axiosInstance.put(`/api/employee/me/languages/${id}`, data);
  return response.data;
};

export const deleteLanguage = async (id) => {
  const response = await axiosInstance.delete(`/api/employee/me/languages/${id}`);
  return response.data;
};

export const addLicense = async (data) => {
  const response = await axiosInstance.post('/api/employee/me/licenses', data);
  return response.data;
};

export const updateLicense = async (id, data) => {
  const response = await axiosInstance.put(`/api/employee/me/licenses/${id}`, data);
  return response.data;
};

export const deleteLicense = async (id) => {
  const response = await axiosInstance.delete(`/api/employee/me/licenses/${id}`);
  return response.data;
};

export const sendChatMessage = async (message, history) => {
  const response = await axiosInstance.post('/api/employee/chat', { message, history });
  return response.data;
};


