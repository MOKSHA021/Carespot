import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, handleApiError } from '../services/api';

const HospitalLogin = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(process.env.NODE_ENV === 'development');

  // Redirect if already logged in as hospital manager
  useEffect(() => {
    if (isAuthenticated && user?.role === 'hospital_manager') {
      console.log('🔄 User already authenticated as hospital manager, redirecting...');
      navigate('/hospital');
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear debug info when user changes input
    setDebugInfo(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const testCredentials = async () => {
    if (!formData.email || !formData.password) {
      alert('Please enter email and password first');
      return;
    }

    try {
      console.log('🔍 Testing credentials...');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/debug/test-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setDebugInfo(data);
      console.log('🔍 Debug test results:', data);
    } catch (error) {
      console.error('Debug test error:', error);
      setDebugInfo({ success: false, error: 'Failed to connect to debug endpoint' });
    }
  };

  const testConnection = async () => {
    try {
      console.log('🔗 Testing connection to backend...');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/health`, {
        method: 'GET'
      });

      if (response.ok) {
        setDebugInfo({ 
          success: true, 
          message: `✅ Backend is reachable (Status: ${response.status})`,
          backendUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
        });
      } else {
        setDebugInfo({ 
          success: false, 
          message: `❌ Backend responded with status: ${response.status}`,
          backendUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setDebugInfo({ 
        success: false, 
        error: `❌ Cannot connect to backend: ${error.message}`,
        backendUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setDebugInfo(null);

    try {
      console.log('🔐 Hospital login attempt:');
      console.log('  - Email:', formData.email);
      console.log('  - Backend URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
      console.log('  - Request URL:', `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/login`);
      
      const response = await adminAPI.login({
        email: formData.email,
        password: formData.password
      });

      console.log('✅ Login response:', response.data);

      if (response.data.success) {
        // Check if response has user (hospital manager) or admin property
        const userData = response.data.user || response.data.admin;
        
        console.log('🔍 DEBUG: Login successful');
        console.log('🔍 DEBUG: User data:', userData);
        console.log('🔍 DEBUG: User role:', userData?.role);
        
        if (userData && userData.role === 'hospital_manager') {
          console.log('✅ Hospital manager login successful');
          console.log('🔍 DEBUG: Hospital ID:', userData.hospitalId);
          console.log('🔍 DEBUG: Hospital Name:', userData.hospitalName);
          
          // Use the login function from AuthContext to save user data
          await login(userData, response.data.token);
          
          console.log('🔍 DEBUG: About to navigate to /hospital');
          
          // ✅ NAVIGATE TO HOSPITAL DASHBOARD
          navigate('/hospital', { 
            replace: true,
            state: { 
              welcomeMessage: `Welcome back, ${userData.name}!`,
              loginTime: new Date().toISOString()
            }
          });
          
          console.log('🔍 DEBUG: Navigation to /hospital completed');
          
        } else if (userData && (userData.role === 'admin' || userData.role === 'super_admin')) {
          // Redirect admins to admin panel
          console.log('✅ Admin login detected, redirecting to admin panel');
          await login(userData, response.data.token);
          navigate('/admin', { replace: true });
          
        } else if (userData) {
          setErrors({ 
            submit: `Account role is '${userData.role}'. Hospital access requires 'hospital_manager' role.` 
          });
        } else {
          setErrors({ submit: 'Invalid response format from server' });
        }
      } else {
        setErrors({ submit: response.data.message || 'Login failed' });
      }
    } catch (error) {
      console.error('❌ Hospital login error:', error);
      
      // Enhanced error property checking
      console.log('🔍 Error analysis:');
      console.log('  - Error type:', typeof error);
      console.log('  - Error name:', error.name || 'unknown');
      console.log('  - Error message:', error.message || 'no message');
      console.log('  - Has response:', !!error.response);
      console.log('  - Has request:', !!error.request);
      
      if (error.response) {
        // Server responded with an error status
        console.log('  - Status:', error.response.status);
        console.log('  - Response data:', error.response.data);
        
        const status = error.response.status;
        const serverMessage = error.response.data?.message || 'Server error';
        
        if (status === 401) {
          setErrors({ submit: `Authentication failed: ${serverMessage}` });
        } else if (status === 403) {
          setErrors({ submit: `Access denied: ${serverMessage}` });
        } else if (status === 404) {
          setErrors({ submit: 'Login endpoint not found. Please check backend configuration.' });
        } else if (status >= 500) {
          setErrors({ submit: `Server error (${status}): ${serverMessage}` });
        } else {
          setErrors({ submit: `Request failed (${status}): ${serverMessage}` });
        }
      } else if (error.request) {
        // Request was made but no response received
        console.log('  - Request details:', error.request);
        setErrors({ 
          submit: 'Cannot connect to server. Please ensure your backend is running on port 5000.' 
        });
      } else if (error.code === 'ERR_NETWORK') {
        // Network error
        setErrors({ 
          submit: 'Network error: Cannot reach the server. Check your internet connection.' 
        });
      } else if (error.name === 'AbortError') {
        // Request was aborted
        setErrors({ submit: 'Request was cancelled or timed out.' });
      } else {
        // Something else happened
        setErrors({ 
          submit: `Request setup error: ${error.message}` 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    loginCard: {
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      padding: '3rem',
      width: '100%',
      maxWidth: '500px',
      position: 'relative',
      overflow: 'hidden',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2.5rem',
    },
    logo: {
      fontSize: '3rem',
      marginBottom: '1rem',
      display: 'block',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '800',
      color: '#1a202c',
      marginBottom: '0.5rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
    },
    subtitle: {
      color: '#718096',
      fontSize: '1rem',
      fontWeight: '500',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    inputGroup: {
      position: 'relative',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    inputContainer: {
      position: 'relative',
    },
    input: {
      width: '100%',
      padding: '1rem 1.25rem',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '1rem',
      backgroundColor: '#f7fafc',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box',
    },
    inputError: {
      borderColor: '#e53e3e',
      backgroundColor: '#fef5e7',
    },
    passwordToggle: {
      position: 'absolute',
      right: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#718096',
      fontSize: '1.2rem',
    },
    errorText: {
      color: '#e53e3e',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
      fontWeight: '500',
    },
    submitButton: {
      backgroundColor: '#667eea',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      padding: '1rem 2rem',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '1rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    },
    submitButtonLoading: {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
    debugButton: {
      backgroundColor: '#f59e0b',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '0.5rem',
    },
    connectionTestButton: {
      backgroundColor: '#8b5cf6',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '0.5rem',
      marginLeft: '0.5rem',
    },
    footer: {
      textAlign: 'center',
      marginTop: '2rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #e2e8f0',
    },
    footerText: {
      color: '#718096',
      fontSize: '0.875rem',
    },
    footerLink: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600',
      marginLeft: '0.5rem',
    },
    submitError: {
      backgroundColor: '#fed7d7',
      color: '#c53030',
      padding: '1rem',
      borderRadius: '8px',
      fontSize: '0.875rem',
      textAlign: 'center',
      marginBottom: '1rem',
      border: '1px solid #feb2b2',
    },
    debugInfo: {
      backgroundColor: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: '8px',
      padding: '1rem',
      fontSize: '0.875rem',
      marginTop: '1rem',
    },
    connectionStatus: {
      backgroundColor: '#f3f4f6',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '1rem',
      fontSize: '0.875rem',
      marginTop: '1rem',
    },
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.loginCard}>
        <div style={styles.header}>
          <span style={styles.logo}>🏥</span>
          <h1 style={styles.title}>Hospital Portal</h1>
          <p style={styles.subtitle}>Access your hospital management dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {errors.submit && (
            <div style={styles.submitError}>
              <strong>Login Failed:</strong> {errors.submit}
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputContainer}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.email ? styles.inputError : {}),
                }}
                placeholder="hospital@example.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>
            {errors.email && <div style={styles.errorText}>{errors.email}</div>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.password ? styles.inputError : {}),
                }}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <div style={styles.errorText}>{errors.password}</div>}
          </div>

          {/* Debug Section - Show in development */}
          {showDebug && (
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={testCredentials}
                style={styles.debugButton}
                disabled={loading}
              >
                🔍 Test Credentials
              </button>
              <button
                type="button"
                onClick={testConnection}
                style={styles.connectionTestButton}
                disabled={loading}
              >
                🔗 Test Connection
              </button>
            </div>
          )}

          {debugInfo && (
            <div style={debugInfo.success ? styles.debugInfo : styles.connectionStatus}>
              <strong>🔍 Debug Results:</strong><br/>
              {debugInfo.message && <>{debugInfo.message}<br/></>}
              {debugInfo.error && <>{debugInfo.error}<br/></>}
              {debugInfo.backendUrl && <>Backend URL: {debugInfo.backendUrl}<br/></>}
              {debugInfo.userExists !== undefined && (
                <>
                  User Exists: {debugInfo.userExists ? '✅ Yes' : '❌ No'}<br/>
                  {debugInfo.userExists && (
                    <>
                      Role: {debugInfo.userRole}<br/>
                      Active: {debugInfo.userActive ? '✅ Yes' : '❌ No'}<br/>
                      Password Match: {debugInfo.passwordMatch ? '✅ Yes' : '❌ No'}<br/>
                      Hospital: {debugInfo.hospitalInfo?.name || 'None'}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitButtonLoading : {}),
            }}
          >
            {loading ? (
              <>🔄 Signing In...</>
            ) : (
              <>🔐 Sign In to Hospital Portal</>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Need to register your hospital?
            <Link to="/hospital/register" style={styles.footerLink}>
              Partner with us
            </Link>
          </p>
          <p style={styles.footerText}>
            Patient login?
            <Link to="/login" style={styles.footerLink}>
              Click here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HospitalLogin;
