import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Footer.css';

const Footer = () => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  // Determine navigation destinations based on authentication state & role
  const getNavLinks = () => {
    if (!user) {
      return {
        dashboard: '/login',
        directory: '/login',
        leaves: '/login',
        timesheets: '/login',
        profile: '/login',
      };
    }
    if (isAdmin) {
      return {
        dashboard: '/admin',
        directory: '/admin',
        leaves: '/admin',
        timesheets: '/admin',
        profile: '/admin',
      };
    }
    return {
      dashboard: '/employee',
      directory: '/employee',
      leaves: '/employee',
      timesheets: '/employee',
      profile: '/employee',
    };
  };

  const navLinks = getNavLinks();

  const techBadges = [
    'Spring Boot 3',
    'PostgreSQL',
    'React',
    'JWT Auth',
    'RBAC',
    'REST API',
  ];

  const hrSolutions = [
    { name: 'Recruitment (ATS)', href: user ? (isAdmin ? '/admin' : '/employee') : '/login' },
    { name: 'Performance Appraisals', href: user ? (isAdmin ? '/admin' : '/employee') : '/login' },
    { name: 'Onboarding Flow', href: user ? (isAdmin ? '/admin' : '/employee') : '/login' },
    { name: 'Payroll & Attendance', href: user ? (isAdmin ? '/admin' : '/employee') : '/login' },
    { name: 'Audit Logs', href: user ? (isAdmin ? '/admin' : '/employee') : '/login' },
  ];

  return (
    <footer className="enterprise-footer">
      {/* Subtle Glowing Top Gradient Border Line */}
      <div className="footer-top-gradient-border" />

      <div className="footer-container">
        {/* Main 4-Column Grid */}
        <div className="footer-grid">
          {/* Column 1: Brand & Trust */}
          <div className="footer-col footer-col-brand">
            <div className="footer-brand">
              <div className="footer-logo-mark">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h3 className="footer-brand-name">Enterprise HRM</h3>
            </div>
            
            <p className="footer-description">
              Next-generation workforce management platform powering enterprise HR workflows,
              talent onboarding, and compliance.
            </p>

            <div className="footer-meta-badges">
              {/* Radar/Ping Light Status Indicator */}
              <div className="footer-status-badge">
                <span className="radar-ping">
                  <span className="radar-ping-ring"></span>
                  <span className="radar-ping-dot"></span>
                </span>
                <span className="status-text">All Systems Operational</span>
              </div>

              {/* Version Badge */}
              <span className="version-badge">v1.2.0 (Enterprise)</span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="footer-col footer-col-nav">
            <h4 className="footer-col-title">Quick Navigation</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to={navLinks.dashboard} className="footer-nav-link">
                  <span className="nav-arrow">→</span> Dashboard
                </Link>
              </li>
              <li>
                <Link to={navLinks.directory} className="footer-nav-link">
                  <span className="nav-arrow">→</span> Employee Directory
                </Link>
              </li>
              <li>
                <Link to={navLinks.leaves} className="footer-nav-link">
                  <span className="nav-arrow">→</span> Leaves & Timeoff
                </Link>
              </li>
              <li>
                <Link to={navLinks.timesheets} className="footer-nav-link">
                  <span className="nav-arrow">→</span> Daily Timesheets
                </Link>
              </li>
              <li>
                <Link to={navLinks.profile} className="footer-nav-link">
                  <span className="nav-arrow">→</span> My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Core HR Solutions */}
          <div className="footer-col footer-col-solutions">
            <h4 className="footer-col-title">Core HR Solutions</h4>
            <ul className="footer-nav-list">
              {hrSolutions.map((item, index) => (
                <li key={index}>
                  <Link to={item.href} className="footer-nav-link">
                    <span className="nav-arrow">→</span> {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Security & Tech Stack */}
          <div className="footer-col footer-col-tech">
            <h4 className="footer-col-title">Security & Tech Stack</h4>
            <div className="footer-tech-badges">
              {techBadges.map((badge, index) => (
                <span key={index} className="tech-chip">
                  {badge}
                </span>
              ))}
            </div>

            {/* Need Support Anchor */}
            <div className="footer-support-box">
              <span className="support-icon">💬</span>
              <div className="support-info">
                <span className="support-label">Need System Support?</span>
                <a href="mailto:support@hrm.local" className="support-link">
                  Contact System Admin &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="footer-bottom">
          <p className="copyright-text">
            © 2026 Enterprise HRM Portal. Built for high-scale workforce operations.
          </p>
          <div className="footer-utility-links">
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="utility-link">Privacy Policy</a>
            <span className="utility-sep">•</span>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="utility-link">Terms of Service</a>
            <span className="utility-sep">•</span>
            <a href="#security" onClick={(e) => e.preventDefault()} className="utility-link">Security Audit</a>
            <span className="utility-sep">•</span>
            <a href="#docs" onClick={(e) => e.preventDefault()} className="utility-link">Documentation</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
