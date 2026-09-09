import axiosInstance from '../api/axiosConfig';

export const login = async (username, password) => {
  const response = await axiosInstance.post('/api/auth/login', { username, password });
  return response.data;
};

export const register = async (username, password, email, role, onboardingData = {}) => {
  const response = await axiosInstance.post('/api/auth/register', { 
    username, 
    password, 
    email, 
    role,
    ...onboardingData 
  });
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await axiosInstance.put('/api/auth/change-password', { currentPassword, newPassword });
  return response.data;
};
