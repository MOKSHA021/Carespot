import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const result = await login(formData);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '3rem',
      width: '100%',
      maxWidth: '440px',
      border: '1px solid rgba(255, 255, 255, 0.18)'
    },
    logo: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    logoText: {
      fontSize: '2.5rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #2563eb, #1e40af)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.5rem'
    },
    logoSubtext: {
      color: '#64748b',
      fontSize: '0.95rem',
      fontWeight: '500'
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#1e293b',
      textAlign: 'center',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#64748b',
      textAlign: 'center',
      marginBottom: '2rem',
      fontSize: '0.95rem'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      color: '#374151',
      fontSize: '0.875rem',
      fontWeight: '600',
      marginBottom: '0.5rem'
    },
    inputWrapper: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '0.875rem 1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '1rem',
      transition: 'all 0.2s ease',
      backgroundColor: '#f8fafc',
      outline: 'none',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: '#2563eb',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)'
    },
    inputError: {
      borderColor: '#ef4444',
      backgroundColor: '#fef2f2'
    },
    passwordToggle: {
      position: 'absolute',
      right: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '1.125rem'
    },
    errorText: {
      color: '#ef4444',
      fontSize: '0.875rem',
      marginTop: '0.25rem',
      fontWeight: '500'
    },
    errorAlert: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '0.875rem 1rem',
      borderRadius: '12px',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    forgotLink: {
      textAlign: 'right'
    },
    link: {
      color: '#2563eb',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: '600',
      transition: 'color 0.2s ease'
    },
    button: {
      width: '100%',
      padding: '0.875rem 1rem',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    buttonHover: {
      backgroundColor: '#1d4ed8',
      transform: 'translateY(-1px)',
      boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)'
    },
    buttonDisabled: {
      backgroundColor: '#94a3b8',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none'
    },
    registerLink: {
      textAlign: 'center',
      marginTop: '1.5rem',
      color: '#64748b',
      fontSize: '0.875rem'
    },
    registerLinkText: {
      color: '#2563eb',
      fontWeight: '600',
      textDecoration: 'none'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoText}>Carespot</div>
          <div style={styles.logoSubtext}>Trusted Healthcare Platform</div>
        </div>

        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>
          Sign in to access your healthcare dashboard
        </p>

        <form style={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div style={styles.errorAlert}>
              {error}
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(formErrors.email ? styles.inputError : {})
              }}
              placeholder="Enter your email address"
            />
            {formErrors.email && (
              <div style={styles.errorText}>{formErrors.email}</div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="password">
              Password
            </label>
            <div style={styles.inputWrapper}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(formErrors.password ? styles.inputError : {}),
                  paddingRight: '3rem'
                }}
                placeholder="Enter your password"
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formErrors.password && (
              <div style={styles.errorText}>{formErrors.password}</div>
            )}
          </div>

          <div style={styles.forgotLink}>
            <Link to="/forgot-password" style={styles.link}>
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                Object.assign(e.target.style, styles.buttonHover);
              }
            }}
            onMouseLeave={(e) => {
              Object.assign(e.target.style, styles.button);
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.registerLink}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.registerLinkText}>
            Create one here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
