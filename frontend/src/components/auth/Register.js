import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid Indian phone number';
    }
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const result = await register(formData);
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
      padding: '2rem 1rem',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '3rem',
      width: '100%',
      maxWidth: '600px',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      maxHeight: '90vh',
      overflowY: 'auto'
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
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
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
    select: {
      width: '100%',
      padding: '0.875rem 1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '1rem',
      transition: 'all 0.2s ease',
      backgroundColor: '#f8fafc',
      outline: 'none',
      boxSizing: 'border-box',
      cursor: 'pointer'
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
    sectionTitle: {
      color: '#374151',
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '1rem',
      borderBottom: '2px solid #f1f5f9',
      paddingBottom: '0.5rem'
    },
    button: {
      width: '100%',
      padding: '0.875rem 1rem',
      backgroundColor: '#10b981',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
      marginTop: '1rem'
    },
    buttonHover: {
      backgroundColor: '#059669',
      transform: 'translateY(-1px)',
      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)'
    },
    buttonDisabled: {
      backgroundColor: '#94a3b8',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none'
    },
    loginLink: {
      textAlign: 'center',
      marginTop: '1.5rem',
      color: '#64748b',
      fontSize: '0.875rem'
    },
    loginLinkText: {
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
          <div style={styles.logoSubtext}>Join Our Trusted Healthcare Community</div>
        </div>

        <h2 style={styles.title}>Create Your Account</h2>
        <p style={styles.subtitle}>
          Start your journey with trusted healthcare services
        </p>

        <form style={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div style={styles.errorAlert}>
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div style={styles.sectionTitle}>Personal Information</div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="name">
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(formErrors.name ? styles.inputError : {})
              }}
              placeholder="Enter your full name"
            />
            {formErrors.name && (
              <div style={styles.errorText}>{formErrors.name}</div>
            )}
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="email">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(formErrors.email ? styles.inputError : {})
                }}
                placeholder="Enter your email"
              />
              {formErrors.email && (
                <div style={styles.errorText}>{formErrors.email}</div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="phone">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(formErrors.phone ? styles.inputError : {})
                }}
                placeholder="Enter phone number"
              />
              {formErrors.phone && (
                <div style={styles.errorText}>{formErrors.phone}</div>
              )}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="dateOfBirth">
                Date of Birth *
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(formErrors.dateOfBirth ? styles.inputError : {})
                }}
              />
              {formErrors.dateOfBirth && (
                <div style={styles.errorText}>{formErrors.dateOfBirth}</div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="gender">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  ...(formErrors.gender ? styles.inputError : {})
                }}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {formErrors.gender && (
                <div style={styles.errorText}>{formErrors.gender}</div>
              )}
            </div>
          </div>

          {/* Security */}
          <div style={styles.sectionTitle}>Security Information</div>
          
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="password">
                Password *
              </label>
              <div style={styles.inputWrapper}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(formErrors.password ? styles.inputError : {}),
                    paddingRight: '3rem'
                  }}
                  placeholder="Create password (min 6 chars)"
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

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="confirmPassword">
                Confirm Password *
              </label>
              <div style={styles.inputWrapper}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(formErrors.confirmPassword ? styles.inputError : {}),
                    paddingRight: '3rem'
                  }}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <div style={styles.errorText}>{formErrors.confirmPassword}</div>
              )}
            </div>
          </div>

          {/* Address */}
          <div style={styles.sectionTitle}>Address Information (Optional)</div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="address.street">
              Street Address
            </label>
            <input
              name="address.street"
              type="text"
              value={formData.address.street}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter street address"
            />
          </div>
          
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="address.city">
                City
              </label>
              <input
                name="address.city"
                type="text"
                value={formData.address.city}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter city"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="address.state">
                State
              </label>
              <input
                name="address.state"
                type="text"
                value={formData.address.state}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter state"
              />
            </div>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="address.pincode">
              Pincode
            </label>
            <input
              name="address.pincode"
              type="text"
              value={formData.address.pincode}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter pincode"
            />
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={styles.loginLink}>
          Already have an account?{' '}
          <Link to="/login" style={styles.loginLinkText}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
