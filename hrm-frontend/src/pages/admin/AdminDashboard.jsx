import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as adminService from '../../services/adminService';
import { leaveService } from '../../services/leaveService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('employees');
  const [leaveSubTab, setLeaveSubTab] = useState('pending'); // pending, all
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Action modal for leave approval/rejection with remarks
  const [actionModal, setActionModal] = useState({ show: false, request: null, status: 'APPROVED', remarks: '' });

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
    const results = await Promise.allSettled([
      adminService.getAllEmployees(),
      leaveService.getAllLeaveRequests(),
      adminService.getAllTimesheets()
    ]);

    if (results[0].status === 'fulfilled') setEmployees(results[0].value || []);
    if (results[1].status === 'fulfilled') setLeaves(results[1].value || []);
    if (results[2].status === 'fulfilled') setTimesheets(results[2].value || []);

    if (results.some(r => r.status === 'rejected')) {
      console.warn('Some admin dashboard APIs failed to load:', results);
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

  const handleOpenActionModal = (request, status) => {
    setActionModal({
      show: true,
      request,
      status,
      remarks: ''
    });
  };

  const submitLeaveAction = async () => {
    if (!actionModal.request) return;
    setError('');
    setSuccess('');
    try {
      await leaveService.processLeaveAction(actionModal.request.id, {
        status: actionModal.status,
        adminRemarks: actionModal.remarks
      });
      setSuccess(`Leave request #${actionModal.request.id} ${actionModal.status.toLowerCase()} successfully!`);
      setActionModal({ show: false, request: null, status: 'APPROVED', remarks: '' });
      await fetchAllData();
    } catch (err) {
      let msg = 'Could not update leave status.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
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
          <div className="workspace-vertical-stack">
            {/* Top Workspace Form Card */}
            <div className="card-container">
              <h3 className="card-header-title">{isEditing ? 'Edit Profile' : 'Add Employee'}</h3>
              <form onSubmit={handleEmpSubmit}>
                <div className="input-grid-3col">
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
                  <div>
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

                <div className="form-actions-right">
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
                      className="btn-secondary-inline"
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" disabled={isSubmitting} className="btn-primary-inline">
                    {isSubmitting && <div className="spinner"></div>}
                    <span>{isEditing ? 'Update Employee' : 'Create Employee'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Directory Table Card */}
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
                        <th>Emp ID</th>
                        <th>Name</th>
                        <th>Designation</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(emp => (
                        <tr key={emp.id}>
                          <td>#{emp.id}</td>
                          <td>{emp.firstName} {emp.lastName}</td>
                          <td>{emp.designation || 'N/A'}</td>
                          <td>{emp.email}</td>
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
          </div>
        )}

        {/* Tab 2: Leaves Review Panel */}
        {activeTab === 'leaves' && (
          <div className="workspace-single-column">
            <div className="card-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 className="card-header-title" style={{ margin: 0 }}>Leave Approvals Engine</h3>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-dark)', padding: '0.25rem', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
                  <button
                    className={`btn-pill ${leaveSubTab === 'pending' ? 'btn-pill-edit' : ''}`}
                    style={{ borderRadius: '9999px', padding: '0.35rem 1rem', fontSize: '0.85rem' }}
                    onClick={() => setLeaveSubTab('pending')}
                  >
                    Pending Queue ({leaves.filter(l => l.status === 'PENDING').length})
                  </button>
                  <button
                    className={`btn-pill ${leaveSubTab === 'all' ? 'btn-pill-edit' : ''}`}
                    style={{ borderRadius: '9999px', padding: '0.35rem 1rem', fontSize: '0.85rem' }}
                    onClick={() => setLeaveSubTab('all')}
                  >
                    All Requests History
                  </button>
                </div>
              </div>

              {(() => {
                const displayedLeaves = leaveSubTab === 'pending' 
                  ? leaves.filter(l => l.status === 'PENDING')
                  : leaves;

                if (displayedLeaves.length === 0) {
                  return (
                    <div className="empty-state-container">
                      <div className="empty-state-icon">📅</div>
                      <h4 className="empty-state-title">No {leaveSubTab === 'pending' ? 'Pending' : ''} Leave Requests</h4>
                      <p className="empty-state-desc">
                        {leaveSubTab === 'pending' 
                          ? 'There are no pending leave requests awaiting approval.' 
                          : 'No historical leave records found.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="table-wrapper">
                    <table className="enterprise-table">
                      <thead>
                        <tr>
                          <th>Applicant Name</th>
                          <th>Department</th>
                          <th>Leave Type</th>
                          <th>From - To Dates</th>
                          <th>Days</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedLeaves.map(req => (
                          <tr key={req.id}>
                            <td>
                              <strong>{req.employeeName || `Employee #${req.employeeId}`}</strong>
                            </td>
                            <td>
                              <span className={getDeptBadgeClass(req.department)}>
                                {req.department || 'General'}
                              </span>
                            </td>
                            <td>
                              <strong>{req.leaveTypeName || 'Leave'}</strong>
                            </td>
                            <td style={{ fontSize: '0.85rem' }}>{req.fromDate} to {req.toDate}</td>
                            <td><strong>{req.durationDays}</strong></td>
                            <td style={{ maxWidth: '220px', whiteSpace: 'normal', fontSize: '0.85rem' }}>
                              {req.reason || 'N/A'}
                            </td>
                            <td>
                              <span className={`badge ${
                                req.status === 'APPROVED' ? 'badge-green' : 
                                req.status === 'REJECTED' ? 'badge-red' : 'badge-yellow'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td>
                              {req.status === 'PENDING' ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    onClick={() => handleOpenActionModal(req, 'APPROVED')}
                                    className="btn-action-success"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleOpenActionModal(req, 'REJECTED')}
                                    className="btn-action-danger"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                  {req.adminRemarks || 'Completed'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
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

      {/* Leave Approval Action Remarks Modal */}
      {actionModal.show && (
        <div className="modal-overlay" onClick={() => setActionModal({ show: false, request: null, status: 'APPROVED', remarks: '' })}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                Confirm Leave {actionModal.status === 'APPROVED' ? 'Approval' : 'Rejection'}
              </h3>
              <button className="modal-close-btn" onClick={() => setActionModal({ show: false, request: null, status: 'APPROVED', remarks: '' })}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                <p style={{ margin: '0 0 0.4rem 0' }}><strong>Applicant:</strong> {actionModal.request?.employeeName}</p>
                <p style={{ margin: '0 0 0.4rem 0' }}><strong>Leave Type:</strong> {actionModal.request?.leaveTypeName}</p>
                <p style={{ margin: '0 0 0.4rem 0' }}><strong>Dates & Duration:</strong> {actionModal.request?.fromDate} to {actionModal.request?.toDate} ({actionModal.request?.durationDays} Days)</p>
                <p style={{ margin: 0 }}><strong>Reason:</strong> {actionModal.request?.reason}</p>
              </div>

              <div>
                <label className="form-label">Admin Remarks / Notes (Optional)</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder={actionModal.status === 'APPROVED' ? "e.g. Approved. Enjoy your time off!" : "e.g. Project deliverable deadline clash."}
                  value={actionModal.remarks}
                  onChange={e => setActionModal({ ...actionModal, remarks: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setActionModal({ show: false, request: null, status: 'APPROVED', remarks: '' })}
              >
                Cancel
              </button>
              <button
                className={actionModal.status === 'APPROVED' ? 'btn-action-success' : 'btn-action-danger'}
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px' }}
                onClick={submitLeaveAction}
              >
                {actionModal.status === 'APPROVED' ? 'Approve Leave' : 'Reject Leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
