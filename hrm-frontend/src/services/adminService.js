import axiosInstance from '../api/axiosConfig';

export const getAllEmployees = async () => {
  const response = await axiosInstance.get('/api/admin/employees');
  return response.data;
};

export const createEmployee = async (employeeData) => {
  const response = await axiosInstance.post('/api/admin/employees', employeeData);
  return response.data;
};

export const updateEmployee = async (id, employeeData) => {
  const response = await axiosInstance.put(`/api/admin/employees/${id}`, employeeData);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await axiosInstance.delete(`/api/admin/employees/${id}`);
  return response.data;
};

export const getAllLeaves = async () => {
  const response = await axiosInstance.get('/api/admin/leaves');
  return response.data;
};

export const approveLeave = async (id, status) => {
  const response = await axiosInstance.put(`/api/admin/leaves/${id}/approve`, null, {
    params: { status }
  });
  return response.data;
};

export const getAllTimesheets = async () => {
  const response = await axiosInstance.get('/api/admin/timesheets');
  return response.data;
};

export const approveTimesheet = async (id, status) => {
  const response = await axiosInstance.put(`/api/admin/timesheets/${id}/approve`, null, {
    params: { status }
  });
  return response.data;
};
