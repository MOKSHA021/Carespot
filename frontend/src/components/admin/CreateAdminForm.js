import React, { useState } from 'react';

const CreateAdminForm = ({ onAdminCreated, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    adminLevel: 'admin',
    dateOfBirth: '',
    gender: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatingCredentials, setGeneratingCredentials] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Enhanced credential generation function
  const generateStrongPassword = (length = 12) => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // Ensure at least one character from each category
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const generateRandomEmail = () => {
    const adjectives = ['smart', 'tech', 'care', 'med', 'health', 'admin', 'super', 'pro'];
    const nouns = ['admin', 'manager', 'user', 'staff', 'lead', 'head', 'chief'];
    const randomNum = Math.floor(Math.random() * 9999) + 1000;
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adjective}.${noun}.${randomNum}@carespot.com`;
  };

  const generateRandomPhone = () => {
    const firstDigits = ['6', '7', '8', '9'];
    const firstDigit = firstDigits[Math.floor(Math.random() * firstDigits.length)];
    let phone = firstDigit;
    
    for (let i = 1; i < 10; i++) {
      phone += Math.floor(Math.random() * 10);
    }
    
    return phone;
  };

  const generateCredentials = async () => {
    setGeneratingCredentials(true);
    
    try {
      // Try API-based generation first
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/generate-credentials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let credentials;
      
      if (response.ok) {
        const data = await response.json();
        credentials = data.credentials;
      } else {
        // Fallback to client-side generation
        credentials = {
          email: generateRandomEmail(),
          password: generateStrongPassword(14),
          phone: generateRandomPhone()
        };
      }

      // Update form data
      setFormData(prev => ({
        ...prev,
        email: credentials.email,
        password: credentials.password,
        confirmPassword: credentials.password,
        phone: credentials.phone || generateRandomPhone()
      }));

      // Store generated credentials for display
      setGeneratedCredentials({
        ...credentials,
        phone: credentials.phone || generateRandomPhone(),
        generatedAt: new Date().toLocaleString()
      });

      // Show success message
      setTimeout(() => {
        alert(`🎉 Credentials Generated Successfully!\n\n📧 Email: ${credentials.email}\n🔐 Password: ${credentials.password}\n📱 Phone: ${credentials.phone || generateRandomPhone()}\n\n💡 These credentials have been auto-filled in the form.`);
      }, 500);

    } catch (error) {
      console.error('Error generating credentials:', error);
      
      // Fallback generation
      const fallbackCredentials = {
        email: generateRandomEmail(),
        password: generateStrongPassword(14),
        phone: generateRandomPhone()
      };

      setFormData(prev => ({
        ...prev,
        email: fallbackCredentials.email,
        password: fallbackCredentials.password,
        confirmPassword: fallbackCredentials.password,
        phone: fallbackCredentials.phone
      }));

      setGeneratedCredentials({
        ...fallbackCredentials,
        generatedAt: new Date().toLocaleString()
      });

      alert(`⚡ Credentials Generated (Offline Mode)!\n\n📧 Email: ${fallbackCredentials.email}\n🔐 Password: ${fallbackCredentials.password}\n📱 Phone: ${fallbackCredentials.phone}`);
    } finally {
      setGeneratingCredentials(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`✅ ${type} copied to clipboard!`);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`✅ ${type} copied to clipboard!`);
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid Indian phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message with credentials
        const successMessage = `✅ Admin Created Successfully!\n\n👤 Name: ${formData.name}\n📧 Email: ${formData.email}\n🔑 Password: ${formData.password}\n📱 Phone: ${formData.phone}\n🛡️ Level: ${formData.adminLevel}\n\n⚠️ Please share these credentials securely with the new admin.\n💡 Advise them to change the password on first login.`;
        
        alert(successMessage);
        onAdminCreated(data.admin);
        onClose();
      } else {
        setFormErrors({ submit: data.message });
      }
    } catch (error) {
      setFormErrors({ submit: 'Error creating admin user' });
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      backdropFilter: 'blur(5px)'
    },
    modal: {
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      padding: '2.5rem',
      width: '100%',
      maxWidth: '700px',
      maxHeight: '95vh',
      overflowY: 'auto',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2.5rem',
      paddingBottom: '1rem',
      borderBottom: '2px solid #f1f5f9'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '800',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    closeButton: {
      backgroundColor: '#f1f5f9',
      border: 'none',
      fontSize: '1.25rem',
      color: '#64748b',
      cursor: 'pointer',
      padding: '0.75rem',
      borderRadius: '12px',
      transition: 'all 0.2s ease'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      color: '#374151',
      fontSize: '0.875rem',
      fontWeight: '700',
      marginBottom: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    input: {
      padding: '1rem 1.25rem',
      border: '2px solid #e2e8f0',
      borderRadius: '16px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      backgroundColor: '#f8fafc',
      outline: 'none',
      fontWeight: '500'
    },
    inputFocus: {
      borderColor: '#2563eb',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)'
    },
    select: {
      padding: '1rem 1.25rem',
      border: '2px solid #e2e8f0',
      borderRadius: '16px',
      fontSize: '1rem',
      backgroundColor: '#f8fafc',
      outline: 'none',
      cursor: 'pointer',
      fontWeight: '500'
    },
    inputError: {
      borderColor: '#ef4444',
      backgroundColor: '#fef2f2'
    },
    errorText: {
      color: '#ef4444',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
      fontWeight: '600'
    },
    credentialsSection: {
      backgroundColor: '#f8fafc',
      border: '2px solid #e2e8f0',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '1rem'
    },
    credentialsTitle: {
      fontSize: '1rem',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    generateButtonContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    generateButton: {
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      color: '#ffffff',
      padding: '0.875rem 1.5rem',
      borderRadius: '12px',
      border: 'none',
      fontSize: '0.95rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
    },
    credentialDisplay: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1rem',
      marginTop: '1rem'
    },
    credentialItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem 0',
      borderBottom: '1px solid #f1f5f9'
    },
    credentialLabel: {
      fontWeight: '600',
      color: '#64748b',
      fontSize: '0.875rem'
    },
    credentialValue: {
      fontWeight: '600',
      color: '#1e293b',
      fontSize: '0.875rem',
      fontFamily: 'monospace'
    },
    copyButton: {
      backgroundColor: '#10b981',
      color: '#ffffff',
      border: 'none',
      padding: '0.25rem 0.5rem',
      borderRadius: '6px',
      fontSize: '0.75rem',
      cursor: 'pointer',
      fontWeight: '600'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem'
    },
    submitButton: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#ffffff',
      padding: '1rem 2rem',
      borderRadius: '16px',
      border: 'none',
      fontSize: '1.1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      flex: 2,
      boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
    },
    cancelButton: {
      backgroundColor: '#6b7280',
      color: '#ffffff',
      padding: '1rem 2rem',
      borderRadius: '16px',
      border: 'none',
      fontSize: '1.1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      flex: 1
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
    inputWrapper: {
      position: 'relative'
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            🛡️ Create New Admin
          </h2>
          <button 
            style={styles.closeButton} 
            onClick={onClose}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ef4444';
              e.target.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f1f5f9';
              e.target.style.color = '#64748b';
            }}
          >
            ✕
          </button>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          {formErrors.submit && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              color: '#dc2626', 
              padding: '1rem 1.25rem', 
              borderRadius: '16px',
              fontSize: '0.875rem',
              fontWeight: '600',
              border: '2px solid #fecaca'
            }}>
              ⚠️ {formErrors.submit}
            </div>
          )}

          {/* Credential Generation Section */}
          <div style={styles.credentialsSection}>
            <div style={styles.credentialsTitle}>
              🎲 Auto-Generate Credentials
            </div>
            <div style={styles.generateButtonContainer}>
              <button
                type="button"
                style={styles.generateButton}
                onClick={generateCredentials}
                disabled={generatingCredentials}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)';
                }}
              >
                {generatingCredentials ? (
                  <>⏳ Generating...</>
                ) : (
                  <>🎯 Generate Secure Credentials</>
                )}
              </button>
            </div>

            {generatedCredentials && (
              <div style={styles.credentialDisplay}>
                <div style={{ ...styles.credentialsTitle, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  🔐 Generated Credentials
                </div>
                <div style={styles.credentialItem}>
                  <span style={styles.credentialLabel}>📧 Email:</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={styles.credentialValue}>{generatedCredentials.email}</span>
                    <button
                      type="button"
                      style={styles.copyButton}
                      onClick={() => copyToClipboard(generatedCredentials.email, 'Email')}
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div style={styles.credentialItem}>
                  <span style={styles.credentialLabel}>🔑 Password:</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={styles.credentialValue}>{generatedCredentials.password}</span>
                    <button
                      type="button"
                      style={styles.copyButton}
                      onClick={() => copyToClipboard(generatedCredentials.password, 'Password')}
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div style={styles.credentialItem}>
                  <span style={styles.credentialLabel}>📱 Phone:</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={styles.credentialValue}>{generatedCredentials.phone}</span>
                    <button
                      type="button"
                      style={styles.copyButton}
                      onClick={() => copyToClipboard(generatedCredentials.phone, 'Phone')}
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                  ⏰ Generated: {generatedCredentials.generatedAt}
                </div>
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>👤 Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(formErrors.name ? styles.inputError : {})
              }}
              placeholder="Enter admin's full name"
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.boxShadow = 'none';
              }}
            />
            {formErrors.name && <div style={styles.errorText}>⚠️ {formErrors.name}</div>}
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>📧 Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(formErrors.email ? styles.inputError : {})
                }}
                placeholder="admin@carespot.com"
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {formErrors.email && <div style={styles.errorText}>⚠️ {formErrors.email}</div>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>📱 Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(formErrors.phone ? styles.inputError : {})
                }}
                placeholder="9876543210"
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {formErrors.phone && <div style={styles.errorText}>⚠️ {formErrors.phone}</div>}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>🔐 Password *</label>
              <div style={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(formErrors.password ? styles.inputError : {}),
                    paddingRight: '3rem'
                  }}
                  placeholder="Minimum 8 characters"
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#f8fafc';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {formErrors.password && <div style={styles.errorText}>⚠️ {formErrors.password}</div>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>🔐 Confirm Password *</label>
              <div style={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(formErrors.confirmPassword ? styles.inputError : {}),
                    paddingRight: '3rem'
                  }}
                  placeholder="Confirm password"
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#f8fafc';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {formErrors.confirmPassword && <div style={styles.errorText}>⚠️ {formErrors.confirmPassword}</div>}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>🛡️ Admin Level *</label>
              <select
                name="adminLevel"
                value={formData.adminLevel}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="admin">👑 Admin (Full Access)</option>
                <option value="moderator">⚡ Moderator (Limited Access)</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>⚧️ Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select Gender</option>
                <option value="male">👨 Male</option>
                <option value="female">👩 Female</option>
                <option value="other">🌈 Other</option>
              </select>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>📅 Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4b5563';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#6b7280';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              ❌ Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
              }}
            >
              {loading ? '⏳ Creating Admin...' : '✅ Create Admin User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminForm;
