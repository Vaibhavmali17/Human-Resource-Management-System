import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as adminService from '../../services/adminService';
import { leaveService } from '../../services/leaveService';
import AiChatWidget from '../../components/AiChatWidget';
import ThemeToggle from '../../components/ThemeToggle';
import './AdminDashboard.css';


const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('employees'); // employees, leaves, timesheets, recruitment, performance
  const [leaveSubTab, setLeaveSubTab] = useState('pending'); // pending, all
  
  // Data State
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [recruitments, setRecruitments] = useState([]);
  const [performanceReviews, setPerformanceReviews] = useState([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Pagination State for Employees Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Action modal for leave approval/rejection with remarks
  const [actionModal, setActionModal] = useState({ show: false, request: null, status: 'APPROVED', remarks: '' });

  // Employee Edit Form State
  const [empForm, setEmpForm] = useState({
    id: null, firstName: '', lastName: '', email: '', phoneNumber: '',
    department: '', designation: '', dateOfJoining: '', salary: '', userId: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // Recruitment Form State
  const [recruitmentForm, setRecruitmentForm] = useState({
    candidateName: '', candidateEmail: '', jobTitle: '', resumeUrl: ''
  });

  // Performance Review Form State
  const [performanceForm, setPerformanceForm] = useState({
    employeeId: '', reviewPeriod: 'Q1 2026', rating: 5, feedback: ''
  });

  // Onboard HR Form State & Modal
  const [onboardHrForm, setOnboardHrForm] = useState({
    firstName: '', lastName: '', email: '', department: 'Human Resources', designation: 'HR Executive'
  });
  const [showOnboardModal, setShowOnboardModal] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        if (setSuccess) setSuccess('');
        if (setError) setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchAllData = async () => {
    setError('');
    const results = await Promise.allSettled([
      adminService.getAllEmployees(),
      leaveService.getAllLeaveRequests(),
      adminService.getAllTimesheets(),
      adminService.getAllRecruitments(),
      adminService.getAllPerformanceReviews()
    ]);

    if (results[0].status === 'fulfilled') setEmployees(results[0].value || []);
    if (results[1].status === 'fulfilled') setLeaves(results[1].value || []);
    if (results[2].status === 'fulfilled') setTimesheets(results[2].value || []);
    if (results[3].status === 'fulfilled') setRecruitments(results[3].value || []);
    if (results[4].status === 'fulfilled') setPerformanceReviews(results[4].value || []);

    if (results.some(r => r.status === 'rejected')) {
      console.warn('Some admin dashboard APIs failed to load:', results);
    }
  };

  // Employee CRUD Handlers
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

  // Leave Handlers
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

  // Timesheet Handlers
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

  // Recruitment Handlers
  const handleRecruitmentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      await adminService.createRecruitment({
        ...recruitmentForm,
        status: 'APPLIED',
        applicationDate: new Date().toISOString().split('T')[0]
      });
      setSuccess('Candidate application created successfully!');
      setRecruitmentForm({ candidateName: '', candidateEmail: '', jobTitle: '', resumeUrl: '' });
      await fetchAllData();
    } catch (err) {
      setError('Failed to add candidate application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecruitmentStatusUpdate = async (id, newStatus) => {
    setError('');
    setSuccess('');
    try {
      await adminService.updateRecruitmentStatus(id, newStatus, `Status updated to ${newStatus}`);
      setSuccess(`Application status changed to ${newStatus}`);
      await fetchAllData();
    } catch (err) {
      setError('Could not update application status.');
    }
  };

  const handleRecruitmentDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recruitment application?')) return;
    setError('');
    setSuccess('');
    try {
      await adminService.deleteRecruitment(id);
      setSuccess('Application deleted successfully.');
      await fetchAllData();
    } catch (err) {
      setError('Could not delete application.');
    }
  };

  // Performance Review Handlers
  const handlePerformanceSubmit = async (e) => {
    e.preventDefault();
    if (!performanceForm.employeeId) {
      setError('Please select an employee.');
      return;
    }
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      await adminService.createPerformanceReview({
        employeeId: parseInt(performanceForm.employeeId),
        reviewPeriod: performanceForm.reviewPeriod,
        rating: parseInt(performanceForm.rating),
        feedback: performanceForm.feedback,
        reviewDate: new Date().toISOString().split('T')[0]
      });
      setSuccess('Performance review submitted successfully!');
      setPerformanceForm({ employeeId: '', reviewPeriod: 'Q1 2026', rating: 5, feedback: '' });
      await fetchAllData();
    } catch (err) {
      setError('Failed to submit performance review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Onboard HR Handler
  const handleOnboardHrSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      const res = await adminService.onboardHR(onboardHrForm);
      setSuccess(res?.message || 'HR Account onboarded successfully!');
      setOnboardHrForm({ firstName: '', lastName: '', email: '', department: 'Human Resources', designation: 'HR Executive' });
      setShowOnboardModal(false);
      await fetchAllData();
    } catch (err) {
      console.error('HR Onboarding Error:', err);
      let errorMsg = 'Failed to onboard HR account.';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper Methods
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

  const getEmployeeNameById = (empId) => {
    const emp = employees.find(e => e.id === empId);
    return emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${empId}`;
  };

  // Filtered & Paginated Employees Directory
  const filteredEmployees = employees.filter(emp => {
    const query = searchQuery.toLowerCase();
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    return fullName.includes(query) ||
      (emp.email && emp.email.toLowerCase().includes(query)) ||
      (emp.department && emp.department.toLowerCase().includes(query)) ||
      (emp.designation && emp.designation.toLowerCase().includes(query));
  });

  const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE) || 1;
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <div className="admin-sidebar">
        <h2 className="sidebar-title">HRM Admin Portal</h2>
        <div className="sidebar-nav">
          <button 
            className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`} 
            onClick={() => setActiveTab('employees')}
          >
            👥 Employees Directory
          </button>
          <button 
            className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`} 
            onClick={() => setActiveTab('leaves')}
          >
            📅 Leave Approvals
          </button>
          <button 
            className={`tab-btn ${activeTab === 'timesheets' ? 'active' : ''}`} 
            onClick={() => setActiveTab('timesheets')}
          >
            ⏱️ Timesheet Reviews
          </button>
          <button 
            className={`tab-btn ${activeTab === 'recruitment' ? 'active' : ''}`} 
            onClick={() => setActiveTab('recruitment')}
          >
            🎯 Recruitment
          </button>
          <button 
            className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`} 
            onClick={() => setActiveTab('performance')}
          >
            ⭐ Performance Reviews
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

      {/* Main workspace content */}
      <div className="main-content">
        <div className="workspace-header">
          <div>
            <h1 className="workspace-title">HR Administration Console</h1>
            <p className="workspace-subtitle">Enterprise management directory, leave approvals, recruitment, and performance reviews</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeToggle />
            <button className="btn-primary-inline" onClick={() => setShowOnboardModal(true)}>
              ➕ Onboard New HR
            </button>
          </div>
        </div>

        {/* Global Error & Success Alerts */}
        {error && (
          <div className="alert-box alert-error">
            <span>{error}</span>
            <button type="button" className="alert-close-btn" onClick={() => setError('')} aria-label="Close">×</button>
          </div>
        )}
        {success && (
          <div className="alert-box alert-success">
            <span>{success}</span>
            <button type="button" className="alert-close-btn" onClick={() => setSuccess('')} aria-label="Close">×</button>
          </div>
        )}

        {/* Metric Summary Cards */}
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
            <span className="metric-label">Open Recruitments</span>
            <p className="metric-value">{recruitments.filter(r => r.status === 'APPLIED' || r.status === 'IN_REVIEW' || r.status === 'INTERVIEWED').length}</p>
          </div>
        </div>

        {/* TAB 1: Employees Directory & CRUD */}
        {activeTab === 'employees' && (
          <div className="workspace-vertical-stack">
            {/* Employee Form Card */}
            <div className="card-container">
              <h3 className="card-header-title">{isEditing ? 'Edit Profile' : 'Add New Employee'}</h3>
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
                    <label className="form-label">Date of Joining</label>
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

            {/* Employee Directory Table with Search & Pagination */}
            <div className="card-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 className="card-header-title" style={{ margin: 0 }}>Employees Directory</h3>
                
                {/* Search Bar */}
                <div style={{ position: 'relative', minWidth: '280px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="🔍 Search by name, email, department..." 
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    style={{ paddingLeft: '1rem', margin: 0 }}
                  />
                </div>
              </div>

              {filteredEmployees.length === 0 ? (
                <div className="empty-state-container">
                  <div className="empty-state-icon">👥</div>
                  <h4 className="empty-state-title">No Employees Found</h4>
                  <p className="empty-state-desc">{searchQuery ? `No matches found for "${searchQuery}".` : 'The employee directory is empty.'}</p>
                </div>
              ) : (
                <>
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
                        {paginatedEmployees.map(emp => (
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

                  {/* Pagination Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filteredEmployees.length)} of {filteredEmployees.length} entries
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="btn-secondary-inline"
                        style={{ opacity: currentPage === 1 ? 0.5 : 1, padding: '0.4rem 0.8rem' }}
                      >
                        ◀ Previous
                      </button>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', padding: '0 0.5rem' }}>
                        Page {currentPage} of {totalPages}
                      </span>
                      <button 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className="btn-secondary-inline"
                        style={{ opacity: currentPage === totalPages ? 0.5 : 1, padding: '0.4rem 0.8rem' }}
                      >
                        Next ▶
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Leaves Approvals Engine */}
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
                              <strong>{req.employeeName || (employees.find(e => e.id === req.employeeId) ? `${employees.find(e => e.id === req.employeeId).firstName} ${employees.find(e => e.id === req.employeeId).lastName}` : `Employee #${req.employeeId}`)}</strong>
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

        {/* TAB 3: Timesheet Reviews */}
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
                        <th>Employee Name</th>
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
                          <td>
                            <strong>{ts.employeeName || (employees.find(e => e.id === ts.employeeId) ? `${employees.find(e => e.id === ts.employeeId).firstName} ${employees.find(e => e.id === ts.employeeId).lastName}` : `Employee #${ts.employeeId}`)}</strong>
                          </td>
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

        {/* TAB 4: Recruitment Management */}
        {activeTab === 'recruitment' && (
          <div className="workspace-vertical-stack">
            {/* Add Candidate Form */}
            <div className="card-container">
              <h3 className="card-header-title">Add Candidate Application</h3>
              <form onSubmit={handleRecruitmentSubmit}>
                <div className="input-grid-3col">
                  <div>
                    <label className="form-label">Candidate Name</label>
                    <input 
                      className="form-input" 
                      placeholder="e.g. Alice Smith" 
                      value={recruitmentForm.candidateName}
                      onChange={e => setRecruitmentForm({ ...recruitmentForm, candidateName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Candidate Email</label>
                    <input 
                      type="email"
                      className="form-input" 
                      placeholder="e.g. alice@example.com" 
                      value={recruitmentForm.candidateEmail}
                      onChange={e => setRecruitmentForm({ ...recruitmentForm, candidateEmail: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Job Title</label>
                    <input 
                      className="form-input" 
                      placeholder="e.g. Senior Frontend Developer" 
                      value={recruitmentForm.jobTitle}
                      onChange={e => setRecruitmentForm({ ...recruitmentForm, jobTitle: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Resume URL (Optional)</label>
                    <input 
                      className="form-input" 
                      placeholder="e.g. https://drive.google.com/resume.pdf" 
                      value={recruitmentForm.resumeUrl}
                      onChange={e => setRecruitmentForm({ ...recruitmentForm, resumeUrl: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-actions-right">
                  <button type="submit" disabled={isSubmitting} className="btn-primary-inline">
                    {isSubmitting && <div className="spinner"></div>}
                    <span>Submit Candidate Application</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Candidates Table */}
            <div className="card-container">
              <h3 className="card-header-title">Recruitment Pipeline Applications</h3>
              {recruitments.length === 0 ? (
                <div className="empty-state-container">
                  <div className="empty-state-icon">🎯</div>
                  <h4 className="empty-state-title">No Candidate Applications</h4>
                  <p className="empty-state-desc">No job applicants found. Add a candidate using the form above.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Candidate Name</th>
                        <th>Email</th>
                        <th>Job Title</th>
                        <th>Date Applied</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recruitments.map(rec => (
                        <tr key={rec.id}>
                          <td>#{rec.id}</td>
                          <td><strong>{rec.candidateName}</strong></td>
                          <td>{rec.candidateEmail}</td>
                          <td>{rec.jobTitle}</td>
                          <td>{rec.applicationDate || 'N/A'}</td>
                          <td>
                            <select
                              value={rec.status || 'APPLIED'}
                              onChange={(e) => handleRecruitmentStatusUpdate(rec.id, e.target.value)}
                              className="form-input"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', width: 'auto' }}
                            >
                              <option value="APPLIED">APPLIED</option>
                              <option value="SHORTLISTED">SHORTLISTED</option>
                              <option value="INTERVIEWED">INTERVIEWED</option>
                              <option value="HIRED">HIRED</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          </td>
                          <td>
                            <button onClick={() => handleRecruitmentDelete(rec.id)} className="btn-pill btn-pill-delete">
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

        {/* TAB 5: Performance Reviews */}
        {activeTab === 'performance' && (
          <div className="workspace-vertical-stack">
            {/* Create Performance Review Form */}
            <div className="card-container">
              <h3 className="card-header-title">Create Performance Appraisal</h3>
              <form onSubmit={handlePerformanceSubmit}>
                <div className="input-grid-3col">
                  <div>
                    <label className="form-label">Select Employee</label>
                    <select 
                      className="form-input"
                      value={performanceForm.employeeId}
                      onChange={e => setPerformanceForm({ ...performanceForm, employeeId: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Employee --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.department || 'General'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Review Period</label>
                    <input 
                      className="form-input" 
                      placeholder="e.g. Q1 2026, Annual 2025" 
                      value={performanceForm.reviewPeriod}
                      onChange={e => setPerformanceForm({ ...performanceForm, reviewPeriod: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Performance Rating (1 to 5 Stars)</label>
                    <select 
                      className="form-input"
                      value={performanceForm.rating}
                      onChange={e => setPerformanceForm({ ...performanceForm, rating: e.target.value })}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ 5 - Outstanding</option>
                      <option value="4">⭐⭐⭐⭐ 4 - Exceeds Expectations</option>
                      <option value="3">⭐⭐⭐ 3 - Meets Expectations</option>
                      <option value="2">⭐⭐ 2 - Needs Improvement</option>
                      <option value="1">⭐ 1 - Unsatisfactory</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <label className="form-label">Detailed Feedback & Comments</label>
                  <textarea 
                    className="form-input" 
                    rows="3"
                    placeholder="Provide constructive evaluation and key deliverables summary..."
                    value={performanceForm.feedback}
                    onChange={e => setPerformanceForm({ ...performanceForm, feedback: e.target.value })}
                    required
                  />
                </div>
                <div className="form-actions-right">
                  <button type="submit" disabled={isSubmitting} className="btn-primary-inline">
                    {isSubmitting && <div className="spinner"></div>}
                    <span>Submit Performance Review</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Performance Reviews History Table */}
            <div className="card-container">
              <h3 className="card-header-title">Submitted Performance Appraisals</h3>
              {performanceReviews.length === 0 ? (
                <div className="empty-state-container">
                  <div className="empty-state-icon">⭐</div>
                  <h4 className="empty-state-title">No Performance Appraisals Found</h4>
                  <p className="empty-state-desc">No appraisals recorded. Evaluate an employee using the form above.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Employee Name</th>
                        <th>Review Period</th>
                        <th>Rating</th>
                        <th>Feedback</th>
                        <th>Review Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceReviews.map(rev => (
                        <tr key={rev.id}>
                          <td>#{rev.id}</td>
                          <td><strong>{getEmployeeNameById(rev.employeeId)}</strong></td>
                          <td>{rev.reviewPeriod}</td>
                          <td>
                            <span className="badge badge-yellow">
                              {'⭐'.repeat(rev.rating || 5)} ({rev.rating}/5)
                            </span>
                          </td>
                          <td style={{ maxWidth: '300px', whiteSpace: 'normal', fontSize: '0.85rem' }}>{rev.feedback}</td>
                          <td>{rev.reviewDate || 'N/A'}</td>
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

      {/* Onboard HR Modal */}
      {showOnboardModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Onboard New HR / Admin User</h3>
              <button type="button" className="modal-close-btn" onClick={() => setShowOnboardModal(false)}>×</button>
            </div>
            <form onSubmit={handleOnboardHrSubmit}>
              <div className="input-grid-2col">
                <div className="form-group-fullw">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={onboardHrForm.firstName}
                    onChange={(e) => setOnboardHrForm({ ...onboardHrForm, firstName: e.target.value })}
                    placeholder="e.g. Vaibhav"
                  />
                </div>
                <div className="form-group-fullw">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={onboardHrForm.lastName}
                    onChange={(e) => setOnboardHrForm({ ...onboardHrForm, lastName: e.target.value })}
                    placeholder="e.g. Mali"
                  />
                </div>
              </div>

              <div className="form-group-fullw">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={onboardHrForm.email}
                  onChange={(e) => setOnboardHrForm({ ...onboardHrForm, email: e.target.value })}
                  placeholder="e.g. vaibhav@company.com"
                />
              </div>

              <div className="input-grid-2col">
                <div className="form-group-fullw">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={onboardHrForm.department}
                    onChange={(e) => setOnboardHrForm({ ...onboardHrForm, department: e.target.value })}
                    placeholder="Human Resources"
                  />
                </div>
                <div className="form-group-fullw">
                  <label className="form-label">Designation</label>
                  <input
                    type="text"
                    className="form-input"
                    value={onboardHrForm.designation}
                    onChange={(e) => setOnboardHrForm({ ...onboardHrForm, designation: e.target.value })}
                    placeholder="HR Executive"
                  />
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
                ℹ️ An invite email with a temporary 10-character password will be sent automatically. The user will be required to change their password on first login.
              </p>

              <div className="modal-footer">
                <button type="button" className="btn-secondary-inline" onClick={() => setShowOnboardModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-inline" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending Invite...' : 'Send Onboarding Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <AiChatWidget />
    </div>
  );
};

export default AdminDashboard;
