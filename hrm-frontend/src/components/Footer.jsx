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
        profile: '/login',
      };
    }
    if (isAdmin) {
      return {
        dashboard: '/admin',
        directory: '/admin',
        leaves: '/admin',
        profile: '/admin',
      };
    }
    return {
      dashboard: '/employee',
      directory: '/employee',
      leaves: '/employee',
      profile: '/employee',
    };
  };

  const navLinks = getNavLinks();

  const techBadges = [
    'Spring Boot 3',
    'PostgreSQL',
    'React',
    'JWT Auth',
    'RBAC Security',
  ];

  return (
    <footer className="enterprise-footer">
      <div className="footer-container">
        {/* Main 3-Column Grid */}
        <div className="footer-grid">
          {/* Column 1: About Section */}
          <div className="footer-col footer-col-about">
            <div className="footer-brand">
              <span className="footer-brand-icon">⚡</span>
              <h3 className="footer-brand-name">Enterprise HRM</h3>
            </div>
            <p className="footer-description">
              Streamlining enterprise workforce management, leave workflows,
              <br className="desktop-break" />
              timesheet approvals, and employee self-service.
            </p>
            <div className="footer-status-indicator">
              <span className="status-dot"></span>
              <span className="status-text">All Systems Operational</span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="footer-col footer-col-nav">
            <h4 className="footer-col-title">Quick Navigation</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to={navLinks.dashboard} className="footer-nav-link">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to={navLinks.directory} className="footer-nav-link">
                  Employee Directory
                </Link>
              </li>
              <li>
                <Link to={navLinks.leaves} className="footer-nav-link">
                  Leaves
                </Link>
              </li>
              <li>
                <Link to={navLinks.profile} className="footer-nav-link">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: System & Architecture */}
          <div className="footer-col footer-col-tech">
            <h4 className="footer-col-title">System & Architecture</h4>
            <div className="footer-tech-badges">
              {techBadges.map((badge, index) => (
                <span key={index} className="tech-chip">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="footer-bottom">
          <p className="copyright-text">
            © 2026 Enterprise HRM Portal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
