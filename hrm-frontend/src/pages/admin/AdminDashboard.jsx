import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as adminService from '../../services/adminService';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Employee Edit Form State
  const [empForm, setEmpForm] = useState({
    id: null, firstName: '', lastName: '', email: '', phoneNumber: '',
    department: '', designation: '', dateOfJoining: '', salary: '', userId: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setError('');
    try {
      if (activeTab === 'employees') {
        const data = await adminService.getAllEmployees();
        setEmployees(data);
      } else if (activeTab === 'leaves') {
        const data = await adminService.getAllLeaves();
        setLeaves(data);
      } else if (activeTab === 'timesheets') {
        const data = await adminService.getAllTimesheets();
        setTimesheets(data);
      }
    } catch (err) {
      setError('Failed to fetch data from API.');
    }
  };

  const handleEmpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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
      fetchData();
    } catch (err) {
      setError('Action failed, verify inputs or user ID mappings.');
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
    if (!window.confirm('Delete Employee?')) return;
    try {
      await adminService.deleteEmployee(id);
      setSuccess('Employee deleted.');
      fetchData();
    } catch (err) {
      setError('Could not delete employee.');
    }
  };

  const handleLeaveStatus = async (id, status) => {
    try {
      await adminService.approveLeave(id, status);
      setSuccess(`Leave status updated to ${status}`);
      fetchData();
    } catch (err) {
      setError('Could not update leave status.');
    }
  };

  const handleTimesheetStatus = async (id, status) => {
    try {
      await adminService.approveTimesheet(id, status);
      setSuccess(`Timesheet status updated to ${status}`);
      fetchData();
    } catch (err) {
      setError('Could not update timesheet status.');
    }
  };

  // Styles
  const dashboardStyle = {
    display: 'flex',
    minHeight: '100vh',
    background: '#0f172a',
    color: '#f8fafc',
    fontFamily: "'Outfit', 'Inter', sans-serif"
  };

  const sidebarStyle = {
    width: '260px',
    background: '#1e293b',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    padding: '2rem 1rem'
  };

  const mainContentStyle = {
    flex: 1,
    padding: '2rem 3rem',
    overflowY: 'auto'
  };

  const tabButtonStyle = (isActive) => ({
    padding: '0.75rem 1rem',
    background: isActive ? 'linear-gradient(to right, #38bdf8, #0284c7)' : 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: isActive ? '#fff' : '#94a3b8',
    textAlign: 'left',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '0.5rem',
    display: 'block',
    width: '100%',
    transition: 'all 0.2s'
  });

  return (
    <div style={dashboardStyle}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #38bdf8, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '2rem', paddingLeft: '1rem' }}>
          HRM Admin
        </h2>
        <div style={{ flex: 1 }}>
          <button style={tabButtonStyle(activeTab === 'employees')} onClick={() => setActiveTab('employees')}>Employees CRUD</button>
          <button style={tabButtonStyle(activeTab === 'leaves')} onClick={() => setActiveTab('leaves')}>Leave Approvals</button>
          <button style={tabButtonStyle(activeTab === 'timesheets')} onClick={() => setActiveTab('timesheets')}>Timesheet Reviews</button>
        </div>
        <button onClick={logout} style={{ padding: '0.75rem 1rem', background: '#dc2626', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
          Log Out
        </button>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>HR Control Workspace</h1>
            <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0' }}>Welcome, {user?.username} (HR Administrator)</p>
          </div>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '0.75rem', color: '#fca5a5', marginBottom: '1.5rem' }}>{error}</div>}
        {success && <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '8px', padding: '0.75rem', color: '#86efac', marginBottom: '1.5rem' }}>{success}</div>}

        {/* Tab 1: Employees CRUD */}
        {activeTab === 'employees' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
              {/* List */}
              <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>Employees List</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                        <th style={{ padding: '0.5rem' }}>Name</th>
                        <th style={{ padding: '0.5rem' }}>Designation</th>
                        <th style={{ padding: '0.5rem' }}>Department</th>
                        <th style={{ padding: '0.5rem' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(emp => (
                        <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{emp.firstName} {emp.lastName}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{emp.designation}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{emp.department}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <button onClick={() => editEmp(emp)} style={{ marginRight: '0.5rem', background: '#0284c7', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Edit</button>
                            <button onClick={() => deleteEmp(emp.id)} style={{ background: '#dc2626', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Form */}
              <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>{isEditing ? 'Edit Profile' : 'Add Employee'}</h3>
                <form onSubmit={handleEmpSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>First Name</label>
                      <input style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={empForm.firstName} onChange={e => setEmpForm({...empForm, firstName: e.target.value})} required/>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Last Name</label>
                      <input style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={empForm.lastName} onChange={e => setEmpForm({...empForm, lastName: e.target.value})} required/>
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Email address</label>
                    <input type="email" style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={empForm.email} onChange={e => setEmpForm({...empForm, email: e.target.value})} required/>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Phone</label>
                      <input style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={empForm.phoneNumber} onChange={e => setEmpForm({...empForm, phoneNumber: e.target.value})}/>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>User ID Mapping</label>
                      <input style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={empForm.userId} onChange={e => setEmpForm({...empForm, userId: e.target.value})}/>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Department</label>
                      <input style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={empForm.department} onChange={e => setEmpForm({...empForm, department: e.target.value})}/>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Designation</label>
                      <input style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={empForm.designation} onChange={e => setEmpForm({...empForm, designation: e.target.value})}/>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Date of Join</label>
                      <input type="date" style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={empForm.dateOfJoining} onChange={e => setEmpForm({...empForm, dateOfJoining: e.target.value})}/>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Salary</label>
                      <input type="number" style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={empForm.salary} onChange={e => setEmpForm({...empForm, salary: e.target.value})}/>
                    </div>
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '0.5rem', background: isEditing ? '#0284c7' : '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {isEditing ? 'Update Employee' : 'Create Employee'}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={() => { setIsEditing(false); setEmpForm({ id: null, firstName: '', lastName: '', email: '', phoneNumber: '', department: '', designation: '', dateOfJoining: '', salary: '', userId: '' }); }} style={{ width: '100%', padding: '0.5rem', background: 'transparent', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer', marginTop: '0.5rem' }}>
                      Cancel
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Leaves Review */}
        {activeTab === 'leaves' && (
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Leaves Approvals Dashboard</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '0.5rem' }}>Employee ID</th>
                  <th style={{ padding: '0.5rem' }}>Start Date</th>
                  <th style={{ padding: '0.5rem' }}>End Date</th>
                  <th style={{ padding: '0.5rem' }}>Type</th>
                  <th style={{ padding: '0.5rem' }}>Reason</th>
                  <th style={{ padding: '0.5rem' }}>Status</th>
                  <th style={{ padding: '0.5rem' }}>Approvals (Admin)</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{req.employeeId}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{req.startDate}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{req.endDate}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{req.leaveType}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{req.reason}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: '500', background: req.status === 'APPROVED' ? 'rgba(34,197,94,0.15)' : req.status === 'REJECTED' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)', color: req.status === 'APPROVED' ? '#86efac' : req.status === 'REJECTED' ? '#fca5a5' : '#fef08a' }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {req.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleLeaveStatus(req.id, 'APPROVED')} style={{ marginRight: '0.5rem', background: '#22c55e', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Approve</button>
                          <button onClick={() => handleLeaveStatus(req.id, 'REJECTED')} style={{ background: '#dc2626', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Timesheet Reviews */}
        {activeTab === 'timesheets' && (
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Timesheet Approvals Dashboard</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '0.5rem' }}>Employee ID</th>
                  <th style={{ padding: '0.5rem' }}>Week Start</th>
                  <th style={{ padding: '0.5rem' }}>Hours</th>
                  <th style={{ padding: '0.5rem' }}>Comments</th>
                  <th style={{ padding: '0.5rem' }}>Status</th>
                  <th style={{ padding: '0.5rem' }}>Approvals (Admin)</th>
                </tr>
              </thead>
              <tbody>
                {timesheets.map(ts => (
                  <tr key={ts.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{ts.employeeId}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{ts.weekStartDate}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{ts.hoursWorked}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{ts.comments}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: '500', background: ts.status === 'APPROVED' ? 'rgba(34,197,94,0.15)' : ts.status === 'REJECTED' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)', color: ts.status === 'APPROVED' ? '#86efac' : ts.status === 'REJECTED' ? '#fca5a5' : '#fef08a' }}>
                        {ts.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {ts.status === 'SUBMITTED' && (
                        <>
                          <button onClick={() => handleTimesheetStatus(ts.id, 'APPROVED')} style={{ marginRight: '0.5rem', background: '#22c55e', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Approve</button>
                          <button onClick={() => handleTimesheetStatus(ts.id, 'REJECTED')} style={{ background: '#dc2626', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Reject</button>
                        </>
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
  );
};

export default AdminDashboard;
