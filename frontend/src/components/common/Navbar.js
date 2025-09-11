import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [joinHospitalHover, setJoinHospitalHover] = useState(false);
  const [adminHover, setAdminHover] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Smart dashboard routing based on user role
  const getDashboardRoute = () => {
    if (!user) return '/dashboard';
    
    switch (user.role) {
      case 'admin':
      case 'super_admin':
        return '/admin';
      case 'hospital_manager':
        return '/hospital';
      case 'patient':
      default:
        return '/dashboard';
    }
  };

  const getDashboardText = () => {
    if (!user) return 'Dashboard';
    
    switch (user.role) {
      case 'admin':
      case 'super_admin':
        return 'Admin Panel';
      case 'hospital_manager':
        return 'Hospital Dashboard';
      case 'patient':
      default:
        return 'Dashboard';
    }
  };

  const getDashboardIcon = () => {
    if (!user) return '📊';
    
    switch (user.role) {
      case 'admin':
      case 'super_admin':
        return '🛡️';
      case 'hospital_manager':
        return '🏥';
      case 'patient':
      default:
        return '📊';
    }
  };

  const styles = {
    navbar: {
      backgroundColor: '#ffffff',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(37, 99, 235, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '72px'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isLogoHovered ? 'scale(1.05)' : 'scale(1)',
      filter: isLogoHovered ? 'brightness(1.1)' : 'brightness(1)'
    },
    logoIcon: {
      fontSize: '2.5rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isLogoHovered ? 'rotate(10deg)' : 'rotate(0deg)'
    },
    logoText: {
      fontSize: '2rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #06b6d4 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginLeft: '0.75rem',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      letterSpacing: '-0.025em'
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: '2.5rem'
    },
    navLink: {
      color: '#64748b',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '1rem',
      padding: '0.75rem 1.25rem',
      borderRadius: '12px',
      cursor: 'pointer',
      position: 'relative',
      userSelect: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden'
    },
    navLinkHovered: {
      color: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.08)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.15)'
    },
    userMenu: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      userSelect: 'none'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      cursor: 'pointer',
      padding: '0.5rem 1.25rem',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      border: '2px solid transparent',
      backgroundClip: 'padding-box',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative'
    },
    userInfoHover: {
      transform: 'translateY(-1px)',
      boxShadow: '0 12px 28px rgba(37, 99, 235, 0.15)',
      borderColor: 'rgba(37, 99, 235, 0.2)'
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
      fontSize: '1.125rem',
      fontWeight: '700',
      userSelect: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
    },
    userName: {
      color: '#1e293b',
      fontWeight: '700',
      fontSize: '1.05rem',
      lineHeight: '1.2'
    },
    userRole: {
      color: '#64748b',
      fontSize: '0.85rem',
      textTransform: 'capitalize',
      fontWeight: '500'
    },
    authButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    button: {
      padding: '0.75rem 2rem',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      textDecoration: 'none',
      cursor: 'pointer',
      userSelect: 'none',
      border: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      color: '#64748b',
      border: '2px solid #e2e8f0'
    },
    // ✅ Improved button styles
    joinHospitalButton: {
      backgroundColor: '#10b981',
      color: '#ffffff',
      padding: '0.75rem 1.25rem',
      borderRadius: '10px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.3s ease-in-out',
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    joinHospitalButtonHover: {
      backgroundColor: '#059669',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
    },
    adminButton: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
      padding: '0.75rem 1.25rem',
      borderRadius: '10px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.3s ease-in-out',
      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    adminButtonHover: {
      backgroundColor: '#dc2626',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
    },
    logoutButton: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
    }
  };

  const getNavLinkStyle = (linkKey) => {
    const baseStyle = styles.navLink;
    if (hoveredLink === linkKey) {
      return { ...baseStyle, ...styles.navLinkHovered };
    }
    return baseStyle;
  };

  const getNavItems = () => {
    const baseItems = [
      { name: 'Find Hospitals', to: '/hospitals', icon: '🏥' },
      { name: 'Our Doctors', to: '/doctors', icon: '👨‍⚕️' }
    ];

    if (isAuthenticated) {
      baseItems.push({
        name: getDashboardText(),
        to: getDashboardRoute(),
        icon: getDashboardIcon()
      });

      if (user?.role === 'patient') {
        baseItems.push({ name: 'My Appointments', to: '/appointments', icon: '📅' });
      }
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Logo */}
        <Link 
          to="/" 
          style={styles.logo}
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          <span style={styles.logoIcon}>🏥</span>
          <span style={styles.logoText}>Carespot</span>
        </Link>

        {/* Navigation Links */}
        <div style={styles.nav}>
          {navItems.map(({ name, to, icon }) => (
            <Link
              key={to}
              to={to}
              style={getNavLinkStyle(to)}
              onMouseEnter={() => setHoveredLink(to)}
              onMouseLeave={() => setHoveredLink(null)}
              onClick={(e) => {
                e.target.style.transform = 'scale(0.95)';
                setTimeout(() => {
                  e.target.style.transform = hoveredLink === to ? 'translateY(-2px)' : 'translateY(0)';
                }, 100);
              }}
            >
              <span style={{ marginRight: '0.5rem' }}>{icon}</span>
              {name}
            </Link>
          ))}
          
          {/* ✅ Updated Action buttons for non-authenticated users */}
          {!isAuthenticated && (
            <>
              {/* Join as Hospital Button */}
              <button
                style={{
                  ...styles.joinHospitalButton,
                  ...(joinHospitalHover ? styles.joinHospitalButtonHover : {})
                }}
                onMouseEnter={() => setJoinHospitalHover(true)}
                onMouseLeave={() => setJoinHospitalHover(false)}
                onClick={() => navigate('/hospital/register')}
              >
                <span>🏥</span>
                Join as Hospital
              </button>

              {/* Admin Button */}
              <button
                style={{
                  ...styles.adminButton,
                  ...(adminHover ? styles.adminButtonHover : {})
                }}
                onMouseEnter={() => setAdminHover(true)}
                onMouseLeave={() => setAdminHover(false)}
                onClick={() => navigate('/admin/login')}
              >
                <span>🛡️</span>
                Admin
              </button>
            </>
          )}
        </div>

        {/* User Menu or Auth Buttons */}
        {isAuthenticated ? (
          <div style={styles.userMenu}>
            <div 
              style={styles.userInfo}
              title={`${user?.name} (${user?.role?.replace('_', ' ')})`}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.userInfoHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'transparent';
              }}
              onClick={() => {
                navigate(getDashboardRoute());
              }}
            >
              <div style={styles.avatar}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={styles.userName}>{user?.name}</div>
                <div style={styles.userRole}>
                  {user?.role === 'hospital_manager' ? 'Hospital Manager' : 
                   user?.role === 'super_admin' ? 'Super Admin' :
                   user?.role?.replace('_', ' ')}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              style={{ ...styles.button, ...styles.logoutButton }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
              }}
            >
              👋 Logout
            </button>
          </div>
        ) : (
          <div style={styles.authButtons}>
            <Link
              to="/login"
              style={{ ...styles.button, ...styles.secondaryButton }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.borderColor = '#2563eb';
                e.target.style.color = '#2563eb';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.color = '#64748b';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              🔐 Sign In
            </Link>
            
            <Link
              to="/register"
              style={{ ...styles.button, ...styles.primaryButton }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.boxShadow = '0 12px 30px rgba(37, 99, 235, 0.4)';
                e.target.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.3)';
                e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
              }}
            >
              🚀 Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
