import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as employeeService from '../../services/employeeService';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [subTab, setSubTab] = useState('personal'); // personal, emergency, dependents

  // Initial shape with defaults
  const [profile, setProfile] = useState({
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: '',
    designation: '',
    dateOfJoining: '',
    salary: 0,
    gender: '',
    maritalStatus: '',
    nationality: '',
    dateOfBirth: '',
    streetAddress1: '',
    streetAddress2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    mobileNumber: '',
    personalEmail: '',
    profilePicture: '',
    emergencyContacts: [],
    dependents: []
  });

  const [leaves, setLeaves] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states for leaves/timesheets
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', leaveType: 'ANNUAL', reason: '' });
  const [tsForm, setTsForm] = useState({ weekStartDate: '', hoursWorked: '', comments: '' });

  // Modals state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', relationship: 'Parent', mobileNumber: '', homePhone: '' });

  const [showDependentModal, setShowDependentModal] = useState(false);
  const [dependentForm, setDependentForm] = useState({ name: '', relationship: '', dateOfBirth: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setError('');
    try {
      if (activeTab === 'profile') {
        const data = await employeeService.getMe();
        setProfile({
          id: data.id || null,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          department: data.department || '',
          designation: data.designation || '',
          dateOfJoining: data.dateOfJoining || '',
          salary: data.salary || 0,
          gender: data.gender || '',
          maritalStatus: data.maritalStatus || '',
          nationality: data.nationality || '',
          dateOfBirth: data.dateOfBirth || '',
          streetAddress1: data.streetAddress1 || '',
          streetAddress2: data.streetAddress2 || '',
          city: data.city || '',
          state: data.state || '',
          postalCode: data.postalCode || '',
          country: data.country || '',
          mobileNumber: data.mobileNumber || '',
          personalEmail: data.personalEmail || '',
          profilePicture: data.profilePicture || '',
          emergencyContacts: data.emergencyContacts || [],
          dependents: data.dependents || []
        });
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
      const data = await employeeService.updateMe(profile);
      setProfile(data);
      setSuccess('Profile details saved successfully!');
    } catch (err) {
      setError('Failed to save profile changes.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        setError('Image file size limit is 1MB. Please upload a smaller image.');
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
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

  // Contact Handlers
  const handleAddContact = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await employeeService.addEmergencyContact(contactForm);
      setSuccess('Emergency contact added successfully!');
      setShowContactModal(false);
      setContactForm({ name: '', relationship: 'Parent', mobileNumber: '', homePhone: '' });
      const data = await employeeService.getMe();
      setProfile(prev => ({ ...prev, emergencyContacts: data.emergencyContacts }));
    } catch (err) {
      setError('Failed to add emergency contact.');
    }
  };

  const handleDeleteContact = async (id) => {
    setError('');
    setSuccess('');
    try {
      await employeeService.deleteEmergencyContact(id);
      setSuccess('Emergency contact deleted.');
      const data = await employeeService.getMe();
      setProfile(prev => ({ ...prev, emergencyContacts: data.emergencyContacts }));
    } catch (err) {
      setError('Failed to delete emergency contact.');
    }
  };

  // Dependent Handlers
  const handleAddDependent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await employeeService.addDependent(dependentForm);
      setSuccess('Dependent added successfully!');
      setShowDependentModal(false);
      setDependentForm({ name: '', relationship: '', dateOfBirth: '' });
      const data = await employeeService.getMe();
      setProfile(prev => ({ ...prev, dependents: data.dependents }));
    } catch (err) {
      setError('Failed to add dependent.');
    }
  };

  const handleDeleteDependent = async (id) => {
    setError('');
    setSuccess('');
    try {
      await employeeService.deleteDependent(id);
      setSuccess('Dependent deleted.');
      const data = await employeeService.getMe();
      setProfile(prev => ({ ...prev, dependents: data.dependents }));
    } catch (err) {
      setError('Failed to delete dependent.');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="sidebar-title">HRM Portal</h2>
        <div className="sidebar-menu">
          <button className={`sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            My Info Workspace
          </button>
          <button className={`sidebar-btn ${activeTab === 'leaves' ? 'active' : ''}`} onClick={() => setActiveTab('leaves')}>
            Apply Leave
          </button>
          <button className={`sidebar-btn ${activeTab === 'timesheets' ? 'active' : ''}`} onClick={() => setActiveTab('timesheets')}>
            Submit Timesheets
          </button>
          <button className={`sidebar-btn ${activeTab === 'perf' ? 'active' : ''}`} onClick={() => setActiveTab('perf')}>
            Performance Appraisals
          </button>
        </div>
        <button onClick={logout} className="logout-btn">
          Log Out
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header-container">
          <div>
            <h1 className="header-title">Employee Self Service</h1>
            <p className="header-subtitle">Welcome, {user?.username}</p>
          </div>
        </div>

        {error && <div className="alert-box alert-error">{error}</div>}
        {success && <div className="alert-box alert-success">{success}</div>}

        {/* Tab 1: Profile Workspace */}
        {activeTab === 'profile' && profile.id !== null && (
          <div className="rounded-xl">
            {/* ESS Hub Navigation bar */}
            <div className="ess-tabs-nav">
              <button className={`ess-tab-link ${subTab === 'personal' ? 'active' : ''}`} onClick={() => setSubTab('personal')}>
                Personal & Contact Details
              </button>
              <button className={`ess-tab-link ${subTab === 'emergency' ? 'active' : ''}`} onClick={() => setSubTab('emergency')}>
                Emergency Contacts
              </button>
              <button className={`ess-tab-link ${subTab === 'dependents' ? 'active' : ''}`} onClick={() => setSubTab('dependents')}>
                Dependents
              </button>
            </div>

            {/* Sub-tab 1: Personal & Contact detailsform */}
            {subTab === 'personal' && (
              <form onSubmit={handleProfileSubmit}>
                {/* Profile Picture Uploader preview */}
                <div className="profile-upload-container">
                  <img
                    src={profile.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                    alt="Profile Preview"
                    className="profile-preview"
                  />
                  <div className="profile-upload-text">
                    <label htmlFor="pf-upload" className="upload-file-label">
                      Upload New Photo
                    </label>
                    <input id="pf-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    <p className="upload-hint">Upload JPEG or PNG. Max size 1MB.</p>
                  </div>
                </div>

                <h3 className="form-section-title">Personal Details</h3>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.firstName}
                      onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.lastName}
                      onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Employee ID <span className="lock-badge">LOCKED</span></label>
                    <input
                      type="text"
                      className="form-input form-input-locked"
                      value={profile.id || ''}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth <span className="lock-badge">LOCKED</span></label>
                    <input
                      type="date"
                      className="form-input form-input-locked"
                      value={profile.dateOfBirth || ''}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-input"
                      value={profile.gender}
                      onChange={e => setProfile({ ...profile, gender: e.target.value })}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Marital Status</label>
                    <select
                      className="form-input"
                      value={profile.maritalStatus}
                      onChange={e => setProfile({ ...profile, maritalStatus: e.target.value })}
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nationality</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.nationality}
                      onChange={e => setProfile({ ...profile, nationality: e.target.value })}
                    />
                  </div>
                </div>

                <h3 className="form-section-title">Contact Details</h3>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Street Address 1</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.streetAddress1}
                      onChange={e => setProfile({ ...profile, streetAddress1: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Street Address 2</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.streetAddress2}
                      onChange={e => setProfile({ ...profile, streetAddress2: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.city}
                      onChange={e => setProfile({ ...profile, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.state}
                      onChange={e => setProfile({ ...profile, state: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.postalCode}
                      onChange={e => setProfile({ ...profile, postalCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.country}
                      onChange={e => setProfile({ ...profile, country: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.mobileNumber}
                      onChange={e => setProfile({ ...profile, mobileNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Personal Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={profile.personalEmail}
                      onChange={e => setProfile({ ...profile, personalEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Work Email <span className="lock-badge">LOCKED</span></label>
                    <input
                      type="email"
                      className="form-input form-input-locked"
                      value={profile.email}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Work Phone</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.phoneNumber}
                      onChange={e => setProfile({ ...profile, phoneNumber: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '1.5rem' }}>
                  Save Changes
                </button>
              </form>
            )}

            {/* Sub-tab 2: Emergency Contacts */}
            {subTab === 'emergency' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>Assigned Emergency Contacts</h3>
                  <button className="add-action-btn" onClick={() => setShowContactModal(true)}>
                    + Add New Contact
                  </button>
                </div>

                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Relationship</th>
                        <th>Mobile Number</th>
                        <th>Home Phone</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.emergencyContacts && profile.emergencyContacts.length > 0 ? (
                        profile.emergencyContacts.map(c => (
                          <tr key={c.id}>
                            <td>{c.name}</td>
                            <td>{c.relationship}</td>
                            <td>{c.mobileNumber}</td>
                            <td>{c.homePhone || 'PIM Locked'}</td>
                            <td>
                              <button className="delete-action-btn" onClick={() => handleDeleteContact(c.id)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="empty-row">
                            No emergency contacts logged yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-tab 3: Dependents */}
            {subTab === 'dependents' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>Assigned Dependents</h3>
                  <button className="add-action-btn" onClick={() => setShowDependentModal(true)}>
                    + Add Dependent
                  </button>
                </div>

                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Relationship</th>
                        <th>Date of Birth</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.dependents && profile.dependents.length > 0 ? (
                        profile.dependents.map(d => (
                          <tr key={d.id}>
                            <td>{d.name}</td>
                            <td>{d.relationship}</td>
                            <td>{d.dateOfBirth}</td>
                            <td>
                              <button className="delete-action-btn" onClick={() => handleDeleteDependent(d.id)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="empty-row">
                            No dependents listed yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Apply Leave */}
        {activeTab === 'leaves' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
            <div className="rounded-xl" style={{ padding: '2rem' }}>
              <h3 className="card-title" style={{ borderBottom: 'none', margin: '0 0 1rem 0' }}>Request Time-off</h3>
              <form onSubmit={handleLeaveSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" required className="form-input" value={leaveForm.startDate} onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input type="date" required className="form-input" value={leaveForm.endDate} onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Leave Type</label>
                  <select className="form-input" value={leaveForm.leaveType} onChange={e => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}>
                    <option value="ANNUAL">Annual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="CASUAL">Casual Leave</option>
                    <option value="MATERNITY">Maternity Leave</option>
                    <option value="PATERNITY">Paternity Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Reason</label>
                  <textarea rows="3" className="form-input" value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
                </div>
                <button type="submit" className="submit-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  Submit Request
                </button>
              </form>
            </div>

            <div className="rounded-xl" style={{ padding: '2rem' }}>
              <h3 className="card-title" style={{ borderBottom: 'none', margin: '0 0 1rem 0' }}>Request History</h3>
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
            <div className="rounded-xl" style={{ padding: '2rem' }}>
              <h3 className="card-title" style={{ borderBottom: 'none', margin: '0 0 1rem 0' }}>Log Work Hours</h3>
              <form onSubmit={handleTimesheetSubmit}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Week Start Date</label>
                  <input type="date" required className="form-input" value={tsForm.weekStartDate} onChange={e => setTsForm({ ...tsForm, weekStartDate: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Hours Worked</label>
                  <input type="number" step="0.5" required className="form-input" value={tsForm.hoursWorked} onChange={e => setTsForm({ ...tsForm, hoursWorked: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Comments</label>
                  <textarea rows="3" className="form-input" value={tsForm.comments} onChange={e => setTsForm({ ...tsForm, comments: e.target.value })} />
                </div>
                <button type="submit" className="submit-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  Submit Log
                </button>
              </form>
            </div>

            <div className="rounded-xl" style={{ padding: '2rem' }}>
              <h3 className="card-title" style={{ borderBottom: 'none', margin: '0 0 1rem 0' }}>Logs History</h3>
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
          <div className="rounded-xl" style={{ padding: '2rem' }}>
            <h3 className="card-title" style={{ borderBottom: 'none', margin: '0 0 1.5rem 0' }}>Performance Appraisal History</h3>
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

      {/* Emergency Contact Modal */}
      {showContactModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Emergency Contact</h3>
              <button className="modal-close-btn" onClick={() => setShowContactModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleAddContact}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={contactForm.name}
                  onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Relationship</label>
                <select
                  className="form-input"
                  value={contactForm.relationship}
                  onChange={e => setContactForm({ ...contactForm, relationship: e.target.value })}
                  required
                >
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number (Mobile)</label>
                <input
                  type="tel"
                  className="form-input"
                  value={contactForm.mobileNumber}
                  onChange={e => setContactForm({ ...contactForm, mobileNumber: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Home Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={contactForm.homePhone}
                  onChange={e => setContactForm({ ...contactForm, homePhone: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowContactModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dependent Modal */}
      {showDependentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Dependent</h3>
              <button className="modal-close-btn" onClick={() => setShowDependentModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleAddDependent}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={dependentForm.name}
                  onChange={e => setDependentForm({ ...dependentForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Relationship</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Daughter, Son, Spouse, Spouse/Partner"
                  value={dependentForm.relationship}
                  onChange={e => setDependentForm({ ...dependentForm, relationship: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-input"
                  value={dependentForm.dateOfBirth}
                  onChange={e => setDependentForm({ ...dependentForm, dateOfBirth: e.target.value })}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowDependentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Dependent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
