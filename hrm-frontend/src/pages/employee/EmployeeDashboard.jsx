import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as employeeService from '../../services/employeeService';
import { leaveService } from '../../services/leaveService';
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
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states for leaves/timesheets
  const [leaveForm, setLeaveForm] = useState({ leaveTypeId: '', fromDate: '', toDate: '', reason: '' });
  const [tsForm, setTsForm] = useState({ weekStartDate: '', hoursWorked: '', comments: '' });

  // Modals state & editing tracking
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContactId, setEditingContactId] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', relationship: 'Parent', mobileNumber: '', homePhone: '' });

  const [showDependentModal, setShowDependentModal] = useState(false);
  const [editingDependentId, setEditingDependentId] = useState(null);
  const [dependentForm, setDependentForm] = useState({ name: '', relationship: '', dateOfBirth: '' });

  // Qualifications Hub State & Forms
  const [qualifications, setQualifications] = useState({
    workExperiences: [],
    educations: [],
    skills: [],
    languages: [],
    licenses: []
  });
  const [qualTab, setQualTab] = useState('work'); // work, education, skills, languages, licenses

  const [showWorkModal, setShowWorkModal] = useState(false);
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [workForm, setWorkForm] = useState({ company: '', jobTitle: '', fromDate: '', toDate: '', comment: '' });

  const [showEduModal, setShowEduModal] = useState(false);
  const [editingEduId, setEditingEduId] = useState(null);
  const [eduForm, setEduForm] = useState({ level: '', institute: '', major: '', year: '', gpaScore: '', startDate: '', endDate: '' });

  const [showSkillModal, setShowSkillModal] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [skillForm, setSkillForm] = useState({ skillName: '', yearsOfExperience: '', comments: '' });

  const [showLangModal, setShowLangModal] = useState(false);
  const [editingLangId, setEditingLangId] = useState(null);
  const [langForm, setLangForm] = useState({ languageName: '', fluency: 'Speaking', competency: 'Intermediate', comments: '' });

  const [showLicModal, setShowLicModal] = useState(false);
  const [editingLicId, setEditingLicId] = useState(null);
  const [licForm, setLicForm] = useState({ licenseType: '', licenseNumber: '', issuedDate: '', expiryDate: '' });

  // Open Modal helpers
  const openContactModal = (contact = null) => {
    if (contact) {
      setEditingContactId(contact.id);
      setContactForm({
        name: contact.name || '',
        relationship: contact.relationship || 'Parent',
        mobileNumber: contact.mobileNumber || '',
        homePhone: contact.homePhone || ''
      });
    } else {
      setEditingContactId(null);
      setContactForm({ name: '', relationship: 'Parent', mobileNumber: '', homePhone: '' });
    }
    setShowContactModal(true);
  };

  const openDependentModal = (dep = null) => {
    if (dep) {
      setEditingDependentId(dep.id);
      setDependentForm({
        name: dep.name || '',
        relationship: dep.relationship || '',
        dateOfBirth: dep.dateOfBirth || ''
      });
    } else {
      setEditingDependentId(null);
      setDependentForm({ name: '', relationship: '', dateOfBirth: '' });
    }
    setShowDependentModal(true);
  };

  const openWorkModal = (work = null) => {
    if (work) {
      setEditingWorkId(work.id);
      setWorkForm({
        company: work.company || '',
        jobTitle: work.jobTitle || '',
        fromDate: work.fromDate || '',
        toDate: work.toDate || '',
        comment: work.comment || ''
      });
    } else {
      setEditingWorkId(null);
      setWorkForm({ company: '', jobTitle: '', fromDate: '', toDate: '', comment: '' });
    }
    setShowWorkModal(true);
  };

  const openEduModal = (edu = null) => {
    if (edu) {
      setEditingEduId(edu.id);
      setEduForm({
        level: edu.level || '',
        institute: edu.institute || '',
        major: edu.major || '',
        year: edu.year || '',
        gpaScore: edu.gpaScore !== null && edu.gpaScore !== undefined ? edu.gpaScore : '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || ''
      });
    } else {
      setEditingEduId(null);
      setEduForm({ level: '', institute: '', major: '', year: '', gpaScore: '', startDate: '', endDate: '' });
    }
    setShowEduModal(true);
  };

  const openSkillModal = (skill = null) => {
    if (skill) {
      setEditingSkillId(skill.id);
      setSkillForm({
        skillName: skill.skillName || '',
        yearsOfExperience: skill.yearsOfExperience !== null && skill.yearsOfExperience !== undefined ? skill.yearsOfExperience : '',
        comments: skill.comments || ''
      });
    } else {
      setEditingSkillId(null);
      setSkillForm({ skillName: '', yearsOfExperience: '', comments: '' });
    }
    setShowSkillModal(true);
  };

  const openLangModal = (lang = null) => {
    if (lang) {
      setEditingLangId(lang.id);
      setLangForm({
        languageName: lang.languageName || '',
        fluency: lang.fluency || 'Speaking',
        competency: lang.competency || 'Intermediate',
        comments: lang.comments || ''
      });
    } else {
      setEditingLangId(null);
      setLangForm({ languageName: '', fluency: 'Speaking', competency: 'Intermediate', comments: '' });
    }
    setShowLangModal(true);
  };

  const openLicModal = (lic = null) => {
    if (lic) {
      setEditingLicId(lic.id);
      setLicForm({
        licenseType: lic.licenseType || '',
        licenseNumber: lic.licenseNumber || '',
        issuedDate: lic.issuedDate || '',
        expiryDate: lic.expiryDate || ''
      });
    } else {
      setEditingLicId(null);
      setLicForm({ licenseType: '', licenseNumber: '', issuedDate: '', expiryDate: '' });
    }
    setShowLicModal(true);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchQualifications = async () => {
    try {
      const qData = await employeeService.getQualifications();
      setQualifications({
        workExperiences: qData.workExperiences || [],
        educations: qData.educations || [],
        skills: qData.skills || [],
        languages: qData.languages || [],
        licenses: qData.licenses || []
      });
    } catch (e) {
      console.error('Failed to fetch qualifications', e);
    }
  };

  const fetchData = async () => {
    setError('');
    setLoading(true);
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
        await fetchQualifications();
      } else if (activeTab === 'leaves') {
        const [balancesData, typesData, historyData] = await Promise.all([
          leaveService.getLeaveBalances(),
          leaveService.getLeaveTypes(),
          leaveService.getMyLeaveHistory()
        ]);
        setLeaveBalances(balancesData || []);
        setLeaveTypes(typesData || []);
        setLeaves(historyData || []);
        if (typesData && typesData.length > 0 && !leaveForm.leaveTypeId) {
          setLeaveForm(prev => ({ ...prev, leaveTypeId: typesData[0].id }));
        }
      } else if (activeTab === 'timesheets') {
        const data = await employeeService.getTimesheets();
        setTimesheets(data);
      } else if (activeTab === 'perf') {
        const data = await employeeService.getPerformance();
        setPerformances(data);
      }
    } catch (err) {
      console.error('Fetch dashboard error:', err);
      let message = 'Failed to load employee dashboard data.';
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Qualification Handlers
  const handleAddWorkExperience = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const payload = {
        ...workForm,
        fromDate: workForm.fromDate || null,
        toDate: workForm.toDate || null
      };
      if (editingWorkId) {
        await employeeService.updateWorkExperience(editingWorkId, payload);
        setSuccess('Work experience updated successfully!');
      } else {
        await employeeService.addWorkExperience(payload);
        setSuccess('Work experience added successfully!');
      }
      setShowWorkModal(false);
      setEditingWorkId(null);
      setWorkForm({ company: '', jobTitle: '', fromDate: '', toDate: '', comment: '' });
      await fetchQualifications();
    } catch (err) {
      console.error('Work experience error:', err);
      const msg = err.response?.data?.message || err.message || (editingWorkId ? 'Failed to update work experience.' : 'Failed to add work experience.');
      setError(msg);
    }
  };

  const handleDeleteWorkExperience = async (id) => {
    setError(''); setSuccess('');
    try {
      await employeeService.deleteWorkExperience(id);
      setSuccess('Work experience record deleted.');
      await fetchQualifications();
    } catch (err) {
      console.error('Delete work experience error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete work experience.');
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const payload = {
        ...eduForm,
        year: eduForm.year ? parseInt(eduForm.year, 10) : null,
        gpaScore: eduForm.gpaScore ? parseFloat(eduForm.gpaScore) : null,
        startDate: eduForm.startDate || null,
        endDate: eduForm.endDate || null
      };
      if (editingEduId) {
        await employeeService.updateEducation(editingEduId, payload);
        setSuccess('Education record updated successfully!');
      } else {
        await employeeService.addEducation(payload);
        setSuccess('Education record added successfully!');
      }
      setShowEduModal(false);
      setEditingEduId(null);
      setEduForm({ level: '', institute: '', major: '', year: '', gpaScore: '', startDate: '', endDate: '' });
      await fetchQualifications();
    } catch (err) {
      console.error('Education error:', err);
      const msg = err.response?.data?.message || err.message || (editingEduId ? 'Failed to update education record.' : 'Failed to add education record.');
      setError(msg);
    }
  };

  const handleDeleteEducation = async (id) => {
    setError(''); setSuccess('');
    try {
      await employeeService.deleteEducation(id);
      setSuccess('Education record deleted.');
      await fetchQualifications();
    } catch (err) {
      console.error('Delete education error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete education record.');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const payload = {
        ...skillForm,
        yearsOfExperience: skillForm.yearsOfExperience ? parseFloat(skillForm.yearsOfExperience) : null
      };
      if (editingSkillId) {
        await employeeService.updateSkill(editingSkillId, payload);
        setSuccess('Skill updated successfully!');
      } else {
        await employeeService.addSkill(payload);
        setSuccess('Skill added successfully!');
      }
      setShowSkillModal(false);
      setEditingSkillId(null);
      setSkillForm({ skillName: '', yearsOfExperience: '', comments: '' });
      await fetchQualifications();
    } catch (err) {
      console.error('Skill error:', err);
      const msg = err.response?.data?.message || err.message || (editingSkillId ? 'Failed to update skill.' : 'Failed to add skill.');
      setError(msg);
    }
  };

  const handleDeleteSkill = async (id) => {
    setError(''); setSuccess('');
    try {
      await employeeService.deleteSkill(id);
      setSuccess('Skill record deleted.');
      await fetchQualifications();
    } catch (err) {
      console.error('Delete skill error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete skill.');
    }
  };

  const handleAddLanguage = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      if (editingLangId) {
        await employeeService.updateLanguage(editingLangId, langForm);
        setSuccess('Language competency updated successfully!');
      } else {
        await employeeService.addLanguage(langForm);
        setSuccess('Language competency added successfully!');
      }
      setShowLangModal(false);
      setEditingLangId(null);
      setLangForm({ languageName: '', fluency: 'Speaking', competency: 'Intermediate', comments: '' });
      await fetchQualifications();
    } catch (err) {
      console.error('Language error:', err);
      const msg = err.response?.data?.message || err.message || (editingLangId ? 'Failed to update language.' : 'Failed to add language.');
      setError(msg);
    }
  };

  const handleDeleteLanguage = async (id) => {
    setError(''); setSuccess('');
    try {
      await employeeService.deleteLanguage(id);
      setSuccess('Language competency deleted.');
      await fetchQualifications();
    } catch (err) {
      console.error('Delete language error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete language.');
    }
  };

  const handleAddLicense = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const payload = {
        ...licForm,
        issuedDate: licForm.issuedDate || null,
        expiryDate: licForm.expiryDate || null
      };
      if (editingLicId) {
        await employeeService.updateLicense(editingLicId, payload);
        setSuccess('License updated successfully!');
      } else {
        await employeeService.addLicense(payload);
        setSuccess('License / Certification added successfully!');
      }
      setShowLicModal(false);
      setEditingLicId(null);
      setLicForm({ licenseType: '', licenseNumber: '', issuedDate: '', expiryDate: '' });
      await fetchQualifications();
    } catch (err) {
      console.error('License error:', err);
      const msg = err.response?.data?.message || err.message || (editingLicId ? 'Failed to update license.' : 'Failed to add license.');
      setError(msg);
    }
  };

  const handleDeleteLicense = async (id) => {
    setError(''); setSuccess('');
    try {
      await employeeService.deleteLicense(id);
      setSuccess('License record deleted.');
      await fetchQualifications();
    } catch (err) {
      setError('Failed to delete license.');
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
      const payload = {
        leaveTypeId: parseInt(leaveForm.leaveTypeId),
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        reason: leaveForm.reason
      };
      await leaveService.applyLeave(payload);
      setSuccess('Leave request submitted successfully!');
      setLeaveForm(prev => ({ ...prev, fromDate: '', toDate: '', reason: '' }));
      fetchData();
    } catch (err) {
      let msg = 'Failed to apply leave request.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
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
      if (editingContactId) {
        await employeeService.updateEmergencyContact(editingContactId, contactForm);
        setSuccess('Emergency contact updated successfully!');
      } else {
        await employeeService.addEmergencyContact(contactForm);
        setSuccess('Emergency contact added successfully!');
      }
      setShowContactModal(false);
      setEditingContactId(null);
      setContactForm({ name: '', relationship: 'Parent', mobileNumber: '', homePhone: '' });
      const data = await employeeService.getMe();
      setProfile(prev => ({ ...prev, emergencyContacts: data.emergencyContacts }));
    } catch (err) {
      console.error('Emergency contact error:', err);
      const msg = err.response?.data?.message || err.message || (editingContactId ? 'Failed to update emergency contact.' : 'Failed to add emergency contact.');
      setError(msg);
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
      console.error('Delete emergency contact error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete emergency contact.');
    }
  };

  // Dependent Handlers
  const handleAddDependent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...dependentForm,
        dateOfBirth: dependentForm.dateOfBirth || null
      };
      if (editingDependentId) {
        await employeeService.updateDependent(editingDependentId, payload);
        setSuccess('Dependent updated successfully!');
      } else {
        await employeeService.addDependent(payload);
        setSuccess('Dependent added successfully!');
      }
      setShowDependentModal(false);
      setEditingDependentId(null);
      setDependentForm({ name: '', relationship: '', dateOfBirth: '' });
      const data = await employeeService.getMe();
      setProfile(prev => ({ ...prev, dependents: data.dependents }));
    } catch (err) {
      console.error('Dependent error:', err);
      const msg = err.response?.data?.message || err.message || (editingDependentId ? 'Failed to update dependent.' : 'Failed to add dependent.');
      setError(msg);
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
      console.error('Delete dependent error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete dependent.');
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

        {loading && <div style={{ color: 'var(--text-secondary)', padding: '1.5rem', textAlign: 'center' }}>Loading workspace options...</div>}

        {/* Tab 1: Profile Workspace */}
        {!loading && activeTab === 'profile' && profile.id !== null && (
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
              <button className={`ess-tab-link ${subTab === 'qualifications' ? 'active' : ''}`} onClick={() => setSubTab('qualifications')}>
                Qualifications
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
                  <button className="add-action-btn" onClick={() => openContactModal()}>
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
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button className="edit-action-btn" onClick={() => openContactModal(c)}>
                                  Edit
                                </button>
                                <button className="delete-action-btn" onClick={() => handleDeleteContact(c.id)}>
                                  Delete
                                </button>
                              </div>
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
                  <button className="add-action-btn" onClick={() => openDependentModal()}>
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
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button className="edit-action-btn" onClick={() => openDependentModal(d)}>
                                  Edit
                                </button>
                                <button className="delete-action-btn" onClick={() => handleDeleteDependent(d.id)}>
                                  Delete
                                </button>
                              </div>
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
            {/* Sub-tab 4: Qualifications & Skills Hub */}
            {subTab === 'qualifications' && (
              <div>
                {/* Qualification Pill Tabs */}
                <div className="qual-pill-tabs">
                  <button className={`qual-pill-btn ${qualTab === 'work' ? 'active' : ''}`} onClick={() => setQualTab('work')}>
                    Work Experience
                  </button>
                  <button className={`qual-pill-btn ${qualTab === 'education' ? 'active' : ''}`} onClick={() => setQualTab('education')}>
                    Education
                  </button>
                  <button className={`qual-pill-btn ${qualTab === 'skills' ? 'active' : ''}`} onClick={() => setQualTab('skills')}>
                    Skills
                  </button>
                  <button className={`qual-pill-btn ${qualTab === 'languages' ? 'active' : ''}`} onClick={() => setQualTab('languages')}>
                    Languages
                  </button>
                  <button className={`qual-pill-btn ${qualTab === 'licenses' ? 'active' : ''}`} onClick={() => setQualTab('licenses')}>
                    Licenses
                  </button>
                </div>

                {/* Pill Tab 1: Work Experience */}
                {qualTab === 'work' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0 }}>Work Experience History</h3>
                      <button className="add-action-btn" onClick={() => openWorkModal()}>
                        + Add Experience
                      </button>
                    </div>
                    <div className="data-table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Company</th>
                            <th>Job Title</th>
                            <th>From Date</th>
                            <th>To Date</th>
                            <th>Comments</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qualifications.workExperiences && qualifications.workExperiences.length > 0 ? (
                            qualifications.workExperiences.map(w => (
                              <tr key={w.id}>
                                <td><strong>{w.company}</strong></td>
                                <td>{w.jobTitle}</td>
                                <td>{w.fromDate || '-'}</td>
                                <td>{w.toDate || 'Present'}</td>
                                <td>{w.comment || '-'}</td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <button className="edit-action-btn" onClick={() => openWorkModal(w)}>
                                      Edit
                                    </button>
                                    <button className="delete-action-btn" onClick={() => handleDeleteWorkExperience(w.id)}>
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="empty-row">
                                No work experience records found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pill Tab 2: Education */}
                {qualTab === 'education' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0 }}>Education Records</h3>
                      <button className="add-action-btn" onClick={() => openEduModal()}>
                        + Add Education
                      </button>
                    </div>
                    <div className="data-table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Degree Level</th>
                            <th>Institute</th>
                            <th>Specialization / Major</th>
                            <th>Year</th>
                            <th>GPA Score</th>
                            <th>Dates</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qualifications.educations && qualifications.educations.length > 0 ? (
                            qualifications.educations.map(e => (
                              <tr key={e.id}>
                                <td><strong>{e.level}</strong></td>
                                <td>{e.institute}</td>
                                <td>{e.major || '-'}</td>
                                <td>{e.year || '-'}</td>
                                <td>{e.gpaScore !== null && e.gpaScore !== undefined ? e.gpaScore : '-'}</td>
                                <td>{e.startDate ? `${e.startDate} to ${e.endDate || 'Present'}` : '-'}</td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <button className="edit-action-btn" onClick={() => openEduModal(e)}>
                                      Edit
                                    </button>
                                    <button className="delete-action-btn" onClick={() => handleDeleteEducation(e.id)}>
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="empty-row">
                                No education records found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pill Tab 3: Skills */}
                {qualTab === 'skills' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0 }}>Skills & Expertise</h3>
                      <button className="add-action-btn" onClick={() => openSkillModal()}>
                        + Add Skill
                      </button>
                    </div>
                    {qualifications.skills && qualifications.skills.length > 0 ? (
                      <div className="skills-grid">
                        {qualifications.skills.map(s => (
                          <div key={s.id} className="skill-card">
                            <div className="skill-card-header">
                              <div className="skill-name">{s.skillName}</div>
                              <div className="skill-actions">
                                <button className="edit-action-btn" onClick={() => openSkillModal(s)}>
                                  Edit
                                </button>
                                <button className="delete-action-btn" onClick={() => handleDeleteSkill(s.id)}>
                                  Delete
                                </button>
                              </div>
                            </div>
                            <div className="skill-card-body">
                              {s.yearsOfExperience !== null && s.yearsOfExperience !== undefined && (
                                <span className="skill-exp-badge">{s.yearsOfExperience} yrs exp</span>
                              )}
                              {s.comments && <div className="skill-comment">{s.comments}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-row" style={{ textAlign: 'center', padding: '2rem' }}>
                        No skills logged yet.
                      </div>
                    )}
                  </div>
                )}

                {/* Pill Tab 4: Languages */}
                {qualTab === 'languages' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0 }}>Language Competencies</h3>
                      <button className="add-action-btn" onClick={() => openLangModal()}>
                        + Add Language
                      </button>
                    </div>
                    <div className="data-table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Language</th>
                            <th>Fluency</th>
                            <th>Competency</th>
                            <th>Comments</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qualifications.languages && qualifications.languages.length > 0 ? (
                            qualifications.languages.map(l => (
                              <tr key={l.id}>
                                <td><strong>{l.languageName}</strong></td>
                                <td>{l.fluency || '-'}</td>
                                <td>{l.competency || '-'}</td>
                                <td>{l.comments || '-'}</td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <button className="edit-action-btn" onClick={() => openLangModal(l)}>
                                      Edit
                                    </button>
                                    <button className="delete-action-btn" onClick={() => handleDeleteLanguage(l.id)}>
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="empty-row">
                                No language competencies logged yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pill Tab 5: Licenses */}
                {qualTab === 'licenses' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0 }}>Licenses & Certifications</h3>
                      <button className="add-action-btn" onClick={() => openLicModal()}>
                        + Add License
                      </button>
                    </div>
                    <div className="data-table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>License Type</th>
                            <th>License Number</th>
                            <th>Issued Date</th>
                            <th>Expiry Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qualifications.licenses && qualifications.licenses.length > 0 ? (
                            qualifications.licenses.map(lic => (
                              <tr key={lic.id}>
                                <td><strong>{lic.licenseType}</strong></td>
                                <td>{lic.licenseNumber}</td>
                                <td>{lic.issuedDate || '-'}</td>
                                <td>{lic.expiryDate || '-'}</td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <button className="edit-action-btn" onClick={() => openLicModal(lic)}>
                                      Edit
                                    </button>
                                    <button className="delete-action-btn" onClick={() => handleDeleteLicense(lic.id)}>
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="empty-row">
                                No licenses listed yet.
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
          </div>
        )}

        {/* Tab 2: Apply Leave */}
        {activeTab === 'leaves' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Top Stat Cards: Leave Balances */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {leaveBalances && leaveBalances.length > 0 ? (
                leaveBalances.map(b => (
                  <div key={b.id} className="rounded-xl" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {b.leaveTypeName}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                        {b.remainingDays}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        / {b.totalDays} Days Left
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', marginTop: '0.25rem' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, (b.remainingDays / (b.totalDays || 1)) * 100))}%`, background: 'var(--primary-blue)', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-secondary)' }}>Loading leave balances...</div>
              )}
            </div>

            {/* Main Leave Workspace Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '2rem', alignItems: 'start' }}>
              {/* Apply For Leave Card */}
              <div className="rounded-xl" style={{ padding: '2rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <h3 className="card-title" style={{ borderBottom: 'none', margin: '0 0 1.25rem 0', fontSize: '1.2rem' }}>
                  Apply For Leave
                </h3>
                <form onSubmit={handleLeaveSubmit}>
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Leave Type</label>
                    <select
                      className="form-input"
                      value={leaveForm.leaveTypeId}
                      onChange={e => setLeaveForm({ ...leaveForm, leaveTypeId: e.target.value })}
                      required
                    >
                      {leaveTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.defaultDaysPerYear} Days/Year)</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">From Date</label>
                      <input
                        type="date"
                        required
                        className="form-input"
                        value={leaveForm.fromDate}
                        onChange={e => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">To Date</label>
                      <input
                        type="date"
                        required
                        className="form-input"
                        value={leaveForm.toDate}
                        onChange={e => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Days Duration Preview */}
                  {leaveForm.fromDate && leaveForm.toDate && (
                    <div style={{ marginBottom: '1.25rem', padding: '0.6rem 1rem', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Calculated Duration:</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                        {(() => {
                          const d1 = new Date(leaveForm.fromDate);
                          const d2 = new Date(leaveForm.toDate);
                          if (isNaN(d1) || isNaN(d2) || d2 < d1) return '0 Days';
                          const diff = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
                          return `${diff} Day${diff > 1 ? 's' : ''}`;
                        })()}
                      </span>
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Reason for Time-off</label>
                    <textarea
                      rows="3"
                      className="form-input"
                      placeholder="Specify clear reason for leave request..."
                      value={leaveForm.reason}
                      onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="submit-btn" style={{ width: '100%', justifyContent: 'center' }}>
                    Submit Request
                  </button>
                </form>
              </div>

              {/* Leave History Table Card */}
              <div className="rounded-xl" style={{ padding: '2rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <h3 className="card-title" style={{ borderBottom: 'none', margin: '0 0 1.25rem 0', fontSize: '1.2rem' }}>
                  My Leave History
                </h3>
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Leave Type</th>
                        <th>Dates</th>
                        <th>Days</th>
                        <th>Status</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves && leaves.length > 0 ? (
                        leaves.map(req => (
                          <tr key={req.id}>
                            <td><strong>{req.leaveTypeName}</strong></td>
                            <td style={{ fontSize: '0.85rem' }}>{req.fromDate} to {req.toDate}</td>
                            <td>{req.durationDays}</td>
                            <td>
                              <span style={{
                                padding: '0.25rem 0.6rem',
                                borderRadius: '9999px',
                                fontSize: '0.78rem',
                                fontWeight: '600',
                                background: req.status === 'APPROVED' ? 'rgba(34,197,94,0.15)' : req.status === 'REJECTED' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)',
                                color: req.status === 'APPROVED' ? '#4ade80' : req.status === 'REJECTED' ? '#f87171' : '#facc15',
                                border: req.status === 'APPROVED' ? '1px solid rgba(34,197,94,0.3)' : req.status === 'REJECTED' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(234,179,8,0.3)'
                              }}>
                                {req.status}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              {req.adminRemarks || req.reason || '-'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="empty-row">No leave applications found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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
              <h3 className="modal-title">{editingContactId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}</h3>
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
                  {editingContactId ? 'Update Contact' : 'Save Contact'}
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
              <h3 className="modal-title">{editingDependentId ? 'Edit Dependent' : 'Add Dependent'}</h3>
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
                  {editingDependentId ? 'Update Dependent' : 'Save Dependent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Work Experience Modal */}
      {showWorkModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingWorkId ? 'Edit Work Experience' : 'Add Work Experience'}</h3>
              <button className="modal-close-btn" onClick={() => setShowWorkModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddWorkExperience}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={workForm.company}
                  onChange={e => setWorkForm({ ...workForm, company: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={workForm.jobTitle}
                  onChange={e => setWorkForm({ ...workForm, jobTitle: e.target.value })}
                  required
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">From Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={workForm.fromDate}
                    onChange={e => setWorkForm({ ...workForm, fromDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">To Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={workForm.toDate}
                    onChange={e => setWorkForm({ ...workForm, toDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Comments / Responsibilities</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={workForm.comment}
                  onChange={e => setWorkForm({ ...workForm, comment: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowWorkModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingWorkId ? 'Update Experience' : 'Save Experience'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Education Modal */}
      {showEduModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingEduId ? 'Edit Education Record' : 'Add Education Record'}</h3>
              <button className="modal-close-btn" onClick={() => setShowEduModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddEducation}>
              <div className="form-group">
                <label className="form-label">Degree Level</label>
                <select
                  className="form-input"
                  value={eduForm.level}
                  onChange={e => setEduForm({ ...eduForm, level: e.target.value })}
                  required
                >
                  <option value="">Select Level</option>
                  <option value="High School">High School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Doctorate / PhD">Doctorate / PhD</option>
                  <option value="Diploma / Certificate">Diploma / Certificate</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Institute / University</label>
                <input
                  type="text"
                  className="form-input"
                  value={eduForm.institute}
                  onChange={e => setEduForm({ ...eduForm, institute: e.target.value })}
                  required
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Specialization / Major</label>
                  <input
                    type="text"
                    className="form-input"
                    value={eduForm.major}
                    onChange={e => setEduForm({ ...eduForm, major: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Graduation Year</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 2022"
                    value={eduForm.year}
                    onChange={e => setEduForm({ ...eduForm, year: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">GPA Score / Grade</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="e.g. 3.80"
                    value={eduForm.gpaScore}
                    onChange={e => setEduForm({ ...eduForm, gpaScore: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={eduForm.startDate}
                      onChange={e => setEduForm({ ...eduForm, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={eduForm.endDate}
                      onChange={e => setEduForm({ ...eduForm, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEduModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingEduId ? 'Update Education' : 'Save Education'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skill Modal */}
      {showSkillModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingSkillId ? 'Edit Skill' : 'Add Skill'}</h3>
              <button className="modal-close-btn" onClick={() => setShowSkillModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddSkill}>
              <div className="form-group">
                <label className="form-label">Skill Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Java, React, SQL, Project Management"
                  value={skillForm.skillName}
                  onChange={e => setSkillForm({ ...skillForm, skillName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  placeholder="e.g. 3.5"
                  value={skillForm.yearsOfExperience}
                  onChange={e => setSkillForm({ ...skillForm, yearsOfExperience: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Comments</label>
                <textarea
                  className="form-input"
                  rows="2"
                  value={skillForm.comments}
                  onChange={e => setSkillForm({ ...skillForm, comments: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowSkillModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingSkillId ? 'Update Skill' : 'Save Skill'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {showLangModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingLangId ? 'Edit Language Competency' : 'Add Language Competency'}</h3>
              <button className="modal-close-btn" onClick={() => setShowLangModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddLanguage}>
              <div className="form-group">
                <label className="form-label">Language Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. English, Spanish, German, Mandarin"
                  value={langForm.languageName}
                  onChange={e => setLangForm({ ...langForm, languageName: e.target.value })}
                  required
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Fluency Type</label>
                  <select
                    className="form-input"
                    value={langForm.fluency}
                    onChange={e => setLangForm({ ...langForm, fluency: e.target.value })}
                  >
                    <option value="Writing">Writing</option>
                    <option value="Speaking">Speaking</option>
                    <option value="Reading">Reading</option>
                    <option value="All (Writing, Speaking, Reading)">All (Writing, Speaking, Reading)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Competency Level</label>
                  <select
                    className="form-input"
                    value={langForm.competency}
                    onChange={e => setLangForm({ ...langForm, competency: e.target.value })}
                  >
                    <option value="Mother Tongue">Mother Tongue</option>
                    <option value="Basic">Basic</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Fluent / Native">Fluent / Native</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Comments</label>
                <textarea
                  className="form-input"
                  rows="2"
                  value={langForm.comments}
                  onChange={e => setLangForm({ ...langForm, comments: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowLangModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingLangId ? 'Update Language' : 'Save Language'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* License Modal */}
      {showLicModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingLicId ? 'Edit License / Certification' : 'Add License / Certification'}</h3>
              <button className="modal-close-btn" onClick={() => setShowLicModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddLicense}>
              <div className="form-group">
                <label className="form-label">License / Certification Type</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. AWS Certified Solutions Architect, PMP, CPA"
                  value={licForm.licenseType}
                  onChange={e => setLicForm({ ...licForm, licenseType: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={licForm.licenseNumber}
                  onChange={e => setLicForm({ ...licForm, licenseNumber: e.target.value })}
                  required
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Issued Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={licForm.issuedDate}
                    onChange={e => setLicForm({ ...licForm, issuedDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={licForm.expiryDate}
                    onChange={e => setLicForm({ ...licForm, expiryDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowLicModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingLicId ? 'Update License' : 'Save License'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
