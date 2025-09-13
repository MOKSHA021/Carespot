import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!user) return '/dashboard';
    switch(user.role) {
      case 'admin':
      case 'super_admin': return '/admin';
      case 'hospital_manager': return '/hospital';
      case 'patient':
      default: return '/dashboard';
    }
  };

  const getDashboardText = () => {
    if (!user) return 'Dashboard';
    switch(user.role) {
      case 'admin':
      case 'super_admin': return 'Admin Panel';
      case 'hospital_manager': return 'Hospital Dashboard';
      case 'patient':
      default: return 'My Dashboard';
    }
  };

  const getUserInitials = () => {
    return user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const styles = {
    navbar: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      backdropFilter: 'blur(20px)',
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '70px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
    },
    logoIcon: {
      fontSize: '2.2rem',
      marginRight: '0.7rem',
      filter: 'drop-shadow(0 2px 4px rgba(37, 99, 235, 0.2))',
    },
    logoText: {
      fontSize: '1.8rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #0ea5e9 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
      letterSpacing: '-0.02em',
      userSelect: 'none',
    },
    logoTagline: {
      fontSize: '0.75rem',
      color: '#64748b',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginLeft: '0.5rem',
      opacity: 0.8,
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
    },
    navLink: {
      color: '#475569',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '0.95rem',
      padding: '0.6rem 1.2rem',
      borderRadius: '10px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
    },
    navLinkHover: {
      color: '#1e40af',
      backgroundColor: 'rgba(30, 64, 175, 0.1)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(30, 64, 175, 0.15)',
    },
    actionsContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    button: {
      padding: '0.65rem 1.4rem',
      borderRadius: '10px',
      border: 'none',
      fontWeight: '600',
      fontSize: '0.9rem',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      userSelect: 'none',
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
    },
    primaryButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)',
    },
    hospitalButton: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
    },
    hospitalButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      color: '#64748b',
      border: '2px solid #e2e8f0',
    },
    secondaryButtonHover: {
      backgroundColor: '#f8fafc',
      borderColor: '#cbd5e1',
      color: '#475569',
      transform: 'translateY(-1px)',
    },
    logoutButton: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
    },
    userProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.8rem',
      padding: '0.4rem 1rem 0.4rem 0.4rem',
      backgroundColor: 'rgba(248, 250, 252, 0.8)',
      borderRadius: '50px',
      border: '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
    },
    userProfileHover: {
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      borderColor: 'rgba(37, 99, 235, 0.2)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 15px rgba(37, 99, 235, 0.15)',
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.9rem',
      fontWeight: '700',
      boxShadow: '0 3px 10px rgba(37, 99, 235, 0.3)',
    },
    userInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    userName: {
      fontSize: '0.9rem',
      fontWeight: '700',
      color: '#1e293b',
      lineHeight: '1.2',
    },
    userRole: {
      fontSize: '0.75rem',
      color: '#64748b',
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    badge: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: '#ffffff',
      fontSize: '0.7rem',
      fontWeight: '700',
      padding: '0.2rem 0.6rem',
      borderRadius: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginLeft: '0.5rem',
      boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)',
    },
  };

  const navItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Find Hospitals', path: '/hospitals', icon: '🏥' },
    { name: 'Our Doctors', path: '/doctors', icon: '👨‍⚕️' },
  ];

  if (isAuthenticated) {
    navItems.push({
      name: getDashboardText(),
      path: getDashboardRoute(),
      icon: user?.role === 'admin' || user?.role === 'super_admin' ? '🛡️' : 
            user?.role === 'hospital_manager' ? '🏥' : '📊'
    });
  }

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🏥</span>
          <div>
            <span style={styles.logoText}>CareSpot</span>
            <div style={styles.logoTagline}>Healthcare Platform</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div style={styles.navLinks}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navLink,
                ...(hoveredItem === item.path ? styles.navLinkHover : {}),
              }}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span style={{ marginRight: '0.4rem' }}>{item.icon}</span>
              {item.name}
              {item.name.includes('Admin') && <span style={styles.badge}>Pro</span>}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div style={styles.actionsContainer}>
          {isAuthenticated ? (
            <>
              {/* User Profile */}
              <div
                style={{
                  ...styles.userProfile,
                  ...(hoveredItem === 'profile' ? styles.userProfileHover : {}),
                }}
                onMouseEnter={() => setHoveredItem('profile')}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => navigate(getDashboardRoute())}
              >
                <div style={styles.avatar}>{getUserInitials()}</div>
                <div style={styles.userInfo}>
                  <div style={styles.userName}>{user?.name || 'User'}</div>
                  <div style={styles.userRole}>
                    {user?.role === 'hospital_manager' ? 'Hospital Manager' : 
                     user?.role === 'super_admin' ? 'Super Admin' :
                     user?.role?.replace('_', ' ') || 'User'}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                style={{
                  ...styles.button,
                  ...styles.logoutButton,
                  ...(hoveredItem === 'logout' ? { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)' } : {}),
                }}
                onMouseEnter={() => setHoveredItem('logout')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span>👋</span> Logout
              </button>
            </>
          ) : (
            <>
              {/* Login Button */}
              <Link
                to="/login"
                style={{
                  ...styles.button,
                  ...styles.secondaryButton,
                  ...(hoveredItem === 'login' ? styles.secondaryButtonHover : {}),
                }}
                onMouseEnter={() => setHoveredItem('login')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span>🔐</span> Patient Login
              </Link>

              {/* Hospital Login Button */}
              <Link
                to="/hospital/login"
                style={{
                  ...styles.button,
                  ...styles.hospitalButton,
                  ...(hoveredItem === 'hospital' ? styles.hospitalButtonHover : {}),
                }}
                onMouseEnter={() => setHoveredItem('hospital')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span>🏥</span> Hospital Login
              </Link>

              {/* Register Button */}
              <Link
                to="/register"
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  ...(hoveredItem === 'register' ? styles.primaryButtonHover : {}),
                }}
                onMouseEnter={() => setHoveredItem('register')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span>🚀</span> Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
