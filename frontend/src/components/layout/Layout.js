import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '✨' },
    { path: '/projects', label: 'Projects', icon: '🔮' },
    ...(user?.role === 'admin' ? [{ path: '/users', label: 'Team', icon: '👥' }] : []),
  ];

  return (
    <div className="layout">
      {/* Top Navigation */}
      <header className="top-nav glass">
        <div className="nav-container">
          <div className="logo">
            <div className="logo-orb"></div>
            <span className="logo-text">NexusFlow</span>
          </div>

          {/* Desktop Nav */}
          <nav className="desktop-nav">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-right">
            <div className="user-profile">
              <div className="avatar">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="user-details-nav">
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
                <span className="user-role-text">{user?.role}</span>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout} title="Logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>

            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      {menuOpen && (
        <div className="mobile-nav glass">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <button className="mobile-nav-item logout-mobile" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
