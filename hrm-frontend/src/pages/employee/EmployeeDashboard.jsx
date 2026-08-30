import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as employeeService from '../../services/employeeService';

const EmployeeDashboard = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ id: null, firstName: '', lastName: '', email: '', phoneNumber: '', department: '', designation: '', dateOfJoining: '', salary: null });
  const [leaves, setLeaves] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', leaveType: 'ANNUAL', reason: '' });
  const [tsForm, setTsForm] = useState({ weekStartDate: '', hoursWorked: '', comments: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setError('');
    try {
      if (activeTab === 'profile') {
        const data = await employeeService.getProfile();
        setProfile(data);
      } else if (activeTab === 'leaves') {
        const data = await employeeService.getLeaves();
        setLeaves(data);
      } else if (activeTab === 'timesheets') {
        const data = await employeeService.getTimesheets();
        setTimesheets(data);
      } else if (activeTab === 'perf') {
        const data = await employeeService.getPerformance();
        setPerformances(data);
      }
    } catch (err) {
      setError('Employee record not initialized by Admin yet, make sure Admin has mapped a user to an employee ID.');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const data = await employeeService.updateProfile(profile);
      setProfile(data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await employeeService.applyLeave(leaveForm);
      setSuccess('Leave request applied.');
      setLeaveForm({ startDate: '', endDate: '', leaveType: 'ANNUAL', reason: '' });
      fetchData();
    } catch (err) {
      setError('Failed to apply leave request.');
    }
  };

  const handleTimesheetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...tsForm,
        hoursWorked: parseFloat(tsForm.hoursWorked)
      };
      await employeeService.submitTimesheet(payload);
      setSuccess('Timesheet log submitted.');
      setTsForm({ weekStartDate: '', hoursWorked: '', comments: '' });
      fetchData();
    } catch (err) {
      setError('Failed to submit timesheet.');
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
          HRM Portal
        </h2>
        <div style={{ flex: 1 }}>
          <button style={tabButtonStyle(activeTab === 'profile')} onClick={() => setActiveTab('profile')}>My Info Workspace</button>
          <button style={tabButtonStyle(activeTab === 'leaves')} onClick={() => setActiveTab('leaves')}>Apply Leave</button>
          <button style={tabButtonStyle(activeTab === 'timesheets')} onClick={() => setActiveTab('timesheets')}>Submit Timesheets</button>
          <button style={tabButtonStyle(activeTab === 'perf')} onClick={() => setActiveTab('perf')}>Performance Appraisals</button>
        </div>
        <button onClick={logout} style={{ padding: '0.75rem 1rem', background: '#dc2626', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
          Log Out
        </button>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Employee Self Service</h1>
            <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0' }}>Welcome, {user?.username}</p>
          </div>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '8px', padding: '0.75rem', color: '#fca5a5', marginBottom: '1.5rem' }}>{error}</div>}
        {success && <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '8px', padding: '0.75rem', color: '#86efac', marginBottom: '1.5rem' }}>{success}</div>}

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && profile.id !== null && (
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '2rem', maxWidth: '600px' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Personal & Job Profile</h3>
            <form onSubmit={handleProfileSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block' }}>First Name</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.firstName}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block' }}>Last Name</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.lastName}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block' }}>Department</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.department || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block' }}>Designation</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.designation || 'N/A'}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block' }}>Joining Date</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{profile.dateOfJoining || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block' }}>Basic Salary</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>${profile.salary || '0.0'}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
                <input type="email" style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} required/>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>Phone Number</label>
                <input style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={profile.phoneNumber} onChange={e => setProfile({...profile, phoneNumber: e.target.value})}/>
              </div>

              <button type="submit" style={{ padding: '0.6rem 1.2rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Update Info
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Apply Leave */}
        {activeTab === 'leaves' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Request Time-off</h3>
              <form onSubmit={handleLeaveSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Start Date</label>
                    <input type="date" required style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={leaveForm.startDate} onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})}/>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>End Date</label>
                    <input type="date" required style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={leaveForm.endDate} onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})}/>
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Leave Type</label>
                  <select style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={leaveForm.leaveType} onChange={e => setLeaveForm({...leaveForm, leaveType: e.target.value})}>
                    <option value="ANNUAL">Annual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="CASUAL">Casual Leave</option>
                    <option value="MATERNITY">Maternity Leave</option>
                    <option value="PATERNITY">Paternity Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Reason</label>
                  <textarea row="3" style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})}/>
                </div>
                <button type="submit" style={{ width: '100%', padding: '0.5rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Submit Request
                </button>
              </form>
            </div>

            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Request History</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '0.5rem' }}>Dates</th>
                    <th style={{ padding: '0.5rem' }}>Type</th>
                    <th style={{ padding: '0.5rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(req => (
                    <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>{req.startDate} to {req.endDate}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>{req.leaveType}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{ padding: '0.25rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500', background: req.status === 'APPROVED' ? 'rgba(34,197,94,0.15)' : req.status === 'REJECTED' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)', color: req.status === 'APPROVED' ? '#86efac' : req.status === 'REJECTED' ? '#fca5a5' : '#fef08a' }}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Submit Timesheets */}
        {activeTab === 'timesheets' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Log Work Hours</h3>
              <form onSubmit={handleTimesheetSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Week Start Date</label>
                  <input type="date" required style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={tsForm.weekStartDate} onChange={e => setTsForm({...tsForm, weekStartDate: e.target.value})}/>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Hours Worked</label>
                  <input type="number" step="0.5" required style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={tsForm.hoursWorked} onChange={e => setTsForm({...tsForm, hoursWorked: e.target.value})}/>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Comments</label>
                  <textarea row="3" style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} value={tsForm.comments} onChange={e => setTsForm({...tsForm, comments: e.target.value})}/>
                </div>
                <button type="submit" style={{ width: '100%', padding: '0.5rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Submit Log
                </button>
              </form>
            </div>

            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Logs History</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '0.5rem' }}>Week Start</th>
                    <th style={{ padding: '0.5rem' }}>Hours</th>
                    <th style={{ padding: '0.5rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheets.map(ts => (
                    <tr key={ts.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>{ts.weekStartDate}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>{ts.hoursWorked} hrs</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{ padding: '0.25rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500', background: ts.status === 'APPROVED' ? 'rgba(34,197,94,0.15)' : ts.status === 'REJECTED' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)', color: ts.status === 'APPROVED' ? '#86efac' : ts.status === 'REJECTED' ? '#fca5a5' : '#fef08a' }}>
                          {ts.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Performance */}
        {activeTab === 'perf' && (
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Performance Appraisal History</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '0.5rem' }}>Review Period</th>
                  <th style={{ padding: '0.5rem' }}>Rating</th>
                  <th style={{ padding: '0.5rem' }}>Feedback</th>
                  <th style={{ padding: '0.5rem' }}>Review Date</th>
                </tr>
              </thead>
              <tbody>
                {performances.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{p.reviewPeriod}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold', color: '#38bdf8' }}>{p.rating} / 5</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{p.feedback}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{p.reviewDate}</td>
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

export default EmployeeDashboard;
