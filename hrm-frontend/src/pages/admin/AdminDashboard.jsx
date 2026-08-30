import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as adminService from '../../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Employee Edit Form State
  const [empForm, setEmpForm] = useState({
    id: null, firstName: '', lastName: '', email: '', phoneNumber: '',
    department: '', designation: '', dateOfJoining: '', salary: '', userId: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setError('');
    try {
      const [empData, leavesData, tsData] = await Promise.all([
        adminService.getAllEmployees(),
        adminService.getAllLeaves(),
        adminService.getAllTimesheets()
      ]);
      setEmployees(empData || []);
      setLeaves(leavesData || []);
      setTimesheets(tsData || []);
    } catch (err) {
      setError('Failed to fetch dashboard data from API.');
    }
  };

  const handleEmpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      const payload = {
        ...empForm,
        userId: empForm.userId ? parseInt(empForm.userId) : null,
        salary: empForm.salary ? parseFloat(empForm.salary) : null
      };

      if (isEditing) {
        await adminService.updateEmployee(empForm.id, payload);
        setSuccess('Employee updated successfully!');
      } else {
        await adminService.createEmployee(payload);
        setSuccess('Employee created successfully!');
      }
      setIsEditing(false);
      setEmpForm({
        id: null, firstName: '', lastName: '', email: '', phoneNumber: '',
        department: '', designation: '', dateOfJoining: '', salary: '', userId: ''
      });
      await fetchAllData();
    } catch (err) {
      setError('Action failed, verify inputs or user ID mappings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editEmp = (emp) => {
    setIsEditing(true);
    setEmpForm({
      id: emp.id,
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      phoneNumber: emp.phoneNumber || '',
      department: emp.department || '',
      designation: emp.designation || '',
      dateOfJoining: emp.dateOfJoining || '',
      salary: emp.salary || '',
      userId: emp.userId || ''
    });
  };

  const deleteEmp = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    setError('');
    setSuccess('');
    try {
      await adminService.deleteEmployee(id);
      setSuccess('Employee deleted successfully.');
      await fetchAllData();
    } catch (err) {
      setError('Could not delete employee.');
    }
  };

  const handleLeaveStatus = async (id, status) => {
    setError('');
    setSuccess('');
    try {
      await adminService.approveLeave(id, status);
      setSuccess(`Leave status updated to ${status}`);
      await fetchAllData();
    } catch (err) {
      setError('Could not update leave status.');
    }
  };

  const handleTimesheetStatus = async (id, status) => {
    setError('');
    setSuccess('');
    try {
      await adminService.approveTimesheet(id, status);
      setSuccess(`Timesheet status updated to ${status}`);
      await fetchAllData();
    } catch (err) {
      setError('Could not update timesheet status.');
    }
  };

  const getDeptBadgeClass = (dept) => {
    if (!dept) return 'badge badge-slate';
    const d = dept.toLowerCase();
    if (d.includes('eng') || d.includes('tech') || d.includes('dev')) return 'badge badge-blue';
    if (d.includes('hr') || d.includes('people') || d.includes('admin')) return 'badge badge-purple';
    if (d.includes('fin') || d.includes('bill') || d.includes('account')) return 'badge badge-green';
    if (d.includes('sale') || d.includes('market')) return 'badge badge-yellow';
    return 'badge badge-slate';
  };

  const getUserInitials = (username) => {
    if (!username) return 'AD';
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <div className="admin-sidebar">
        <h2 className="sidebar-title">HRM Admin</h2>
        <div className="sidebar-nav">
          <button 
            className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`} 
            onClick={() => setActiveTab('employees')}
          >
            Employees CRUD
          </button>
          <button 
            className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`} 
            onClick={() => setActiveTab('leaves')}
          >
            Leave Approvals
          </button>
          <button 
            className={`tab-btn ${activeTab === 'timesheets' ? 'active' : ''}`} 
            onClick={() => setActiveTab('timesheets')}
          >
            Timesheet Reviews
          </button>
        </div>
        
        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="avatar-circle">{getUserInitials(user?.username)}</div>
            <div className="user-info">
              <span className="user-username">{user?.username || 'Admin'}</span>
              <span className="user-role">HR Administrator</span>
            </div>
          </div>
          <button onClick={logout} className="logout-btn">
            Log Out
          </button>
        </div>
      </div>

      {/* Scrollable workspace content */}
      <div className="main-content">
        <div className="workspace-header">
          <div>
            <h1 className="workspace-title">HR Control Workspace</h1>
            <p className="workspace-subtitle">Manage directory, leave requests, and timesheet reviews</p>
          </div>
        </div>

        {/* Global Error & Success Alerts */}
        {error && <div className="alert-box alert-error">{error}</div>}
        {success && <div className="alert-box alert-success">{success}</div>}

        {/* Top KPI Metric Summary Cards */}
        <div className="metrics-grid">
          <div className="metric-card employees-card">
            <span className="metric-label">Total Employees</span>
            <p className="metric-value">{employees.length}</p>
          </div>
          <div className="metric-card leaves-card">
            <span className="metric-label">Pending Leaves</span>
            <p className="metric-value">{leaves.filter(l => l.status === 'PENDING').length}</p>
          </div>
          <div className="metric-card timesheets-card">
            <span className="metric-label">Active Timesheets</span>
            <p className="metric-value">
              {timesheets.filter(t => t.status === 'SUBMITTED' || t.status === 'PENDING').length}
            </p>
          </div>
          <div className="metric-card status-card">
            <span className="metric-label">System Status</span>
            <div className="metric-value">
              <div className="system-badge">
                <span className="status-dot"></span>
                Operational
              </div>
            </div>
          </div>
        </div>

        {/* Tab content renderer */}
        {activeTab === 'employees' && (
          <div className="workspace-columns">
            {/* Left Column (Employees Data Table) */}
            <div className="card-container">
              <h3 className="card-header-title">Employees Directory</h3>
              {employees.length === 0 ? (
                <div className="empty-state-container">
                  <div className="empty-state-icon">👥</div>
                  <h4 className="empty-state-title">No Employees Found</h4>
                  <p className="empty-state-desc">The employee directory is empty. Add new team members using the form.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Designation</th>
                        <th>Department</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(emp => (
                        <tr key={emp.id}>
                          <td>{emp.firstName} {emp.lastName}</td>
                          <td>{emp.designation || 'N/A'}</td>
                          <td>
                            <span className={getDeptBadgeClass(emp.department)}>
                              {emp.department || 'General'}
                            </span>
                          </td>
                          <td>
                            <button onClick={() => editEmp(emp)} className="btn-pill btn-pill-edit">
                              Edit
                            </button>
                            <button onClick={() => deleteEmp(emp.id)} className="btn-pill btn-pill-delete">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Column (Add Employee Form Card) */}
            <div className="card-container">
              <h3 className="card-header-title">{isEditing ? 'Edit Profile' : 'Add Employee'}</h3>
              <form onSubmit={handleEmpSubmit}>
                <div className="input-grid-2col">
                  <div>
                    <label className="form-label">First Name</label>
                    <input 
                      className="form-input" 
                      placeholder="e.g. John" 
                      value={empForm.firstName} 
                      onChange={e => setEmpForm({...empForm, firstName: e.target.value})} 
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input 
                      className="form-input" 
                      placeholder="e.g. Doe" 
                      value={empForm.lastName} 
                      onChange={e => setEmpForm({...empForm, lastName: e.target.value})} 
                      required
                    />
                  </div>
                </div>

                <div className="form-group-fullw">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="e.g. john.doe@company.com" 
                    value={empForm.email} 
                    onChange={e => setEmpForm({...empForm, email: e.target.value})} 
                    required
                  />
                </div>

                <div className="input-grid-2col">
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input 
                      className="form-input" 
                      placeholder="e.g. +1234567890" 
                      value={empForm.phoneNumber} 
                      onChange={e => setEmpForm({...empForm, phoneNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">User ID Mapping</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 1" 
                      value={empForm.userId} 
                      onChange={e => setEmpForm({...empForm, userId: e.target.value})}
                    />
                  </div>
                </div>

                <div className="input-grid-2col">
                  <div>
                    <label className="form-label">Department</label>
                    <input 
                      className="form-input" 
                      placeholder="e.g. Engineering" 
                      value={empForm.department} 
                      onChange={e => setEmpForm({...empForm, department: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Designation</label>
                    <input 
                      className="form-input" 
                      placeholder="e.g. Software Engineer" 
                      value={empForm.designation} 
                      onChange={e => setEmpForm({...empForm, designation: e.target.value})}
                    />
                  </div>
                </div>

                <div className="input-grid-2col">
                  <div>
                    <label className="form-label">Date of joining</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={empForm.dateOfJoining} 
                      onChange={e => setEmpForm({...empForm, dateOfJoining: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Salary</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 75000" 
                      value={empForm.salary} 
                      onChange={e => setEmpForm({...empForm, salary: e.target.value})}
                    />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary-block">
                  {isSubmitting && <div className="spinner"></div>}
                  <span>{isEditing ? 'Update Employee' : 'Create Employee'}</span>
                </button>

                {isEditing && (
                  <button 
                    type="button" 
                    onClick={() => { 
                      setIsEditing(false); 
                      setEmpForm({ 
                        id: null, firstName: '', lastName: '', email: '', phoneNumber: '', 
                        department: '', designation: '', dateOfJoining: '', salary: '', userId: '' 
                      }); 
                    }} 
                    className="btn-secondary-block"
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Leaves Review Panel */}
        {activeTab === 'leaves' && (
          <div className="workspace-single-column">
            <div className="card-container">
              <h3 className="card-header-title">Leaves Review Panel</h3>
              {leaves.length === 0 ? (
                <div className="empty-state-container">
                  <div className="empty-state-icon">📅</div>
                  <h4 className="empty-state-title">No Leave Requests</h4>
                  <p className="empty-state-desc">There are no pending or history of leave requests submitted.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Employee ID</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Type</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.map(req => (
                        <tr key={req.id}>
                          <td>{req.employeeId}</td>
                          <td>{req.startDate}</td>
                          <td>{req.endDate}</td>
                          <td>
                            <span className="badge badge-slate">
                              {req.leaveType || 'General'}
                            </span>
                          </td>
                          <td>{req.reason || 'N/A'}</td>
                          <td>
                            <span className={`badge ${
                              req.status === 'APPROVED' ? 'badge-green' : 
                              req.status === 'REJECTED' ? 'badge-red' : 'badge-yellow'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td>
                            {req.status === 'PENDING' && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                  onClick={() => handleLeaveStatus(req.id, 'APPROVED')} 
                                  className="btn-action-success"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleLeaveStatus(req.id, 'REJECTED')} 
                                  className="btn-action-danger"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Timesheet Reviews Panel */}
        {activeTab === 'timesheets' && (
          <div className="workspace-single-column">
            <div className="card-container">
              <h3 className="card-header-title">Timesheets Review Panel</h3>
              {timesheets.length === 0 ? (
                <div className="empty-state-container">
                  <div className="empty-state-icon">⏱️</div>
                  <h4 className="empty-state-title">No Timesheets Submitted</h4>
                  <p className="empty-state-desc">Employees have not submitted any timesheets for approval yet.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Employee ID</th>
                        <th>Week Start Date</th>
                        <th>Hours Worked</th>
                        <th>Comments</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timesheets.map(ts => (
                        <tr key={ts.id}>
                          <td>{ts.employeeId}</td>
                          <td>{ts.weekStartDate}</td>
                          <td>{ts.hoursWorked} hrs</td>
                          <td>{ts.comments || 'No comment'}</td>
                          <td>
                            <span className={`badge ${
                              ts.status === 'APPROVED' ? 'badge-green' : 
                              ts.status === 'REJECTED' ? 'badge-red' : 'badge-yellow'
                            }`}>
                              {ts.status}
                            </span>
                          </td>
                          <td>
                            {(ts.status === 'SUBMITTED' || ts.status === 'PENDING') && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                  onClick={() => handleTimesheetStatus(ts.id, 'APPROVED')} 
                                  className="btn-action-success"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleTimesheetStatus(ts.id, 'REJECTED')} 
                                  className="btn-action-danger"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
