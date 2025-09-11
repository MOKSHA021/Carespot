import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import HospitalReviewModal from '../components/admin/HospitalReviewModal';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [pendingHospitals, setPendingHospitals] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateAdminForm, setShowCreateAdminForm] = useState(false);
  
  // Hospital Review Modal State
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showHospitalModal, setShowHospitalModal] = useState(false);

  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    adminLevel: 'admin',
    dateOfBirth: '',
    gender: ''
  });
  const [adminFormErrors, setAdminFormErrors] = useState({});
  const [adminFormLoading, setAdminFormLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchDashboardData();
    if (user?.adminLevel === 'super_admin') {
      fetchMyAdmins();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const statsResponse = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsResponse.json();
      
      const hospitalsResponse = await fetch(`${API_BASE_URL}/admin/hospitals/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const hospitalsData = await hospitalsResponse.json();
      
      setDashboardStats(statsData.stats);
      setPendingHospitals(hospitalsData.hospitals);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/my-admins?page=1&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAdminUsers(data.admins);
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  };

  // Hospital Review Modal Functions
  const handleHospitalClick = (hospital) => {
    setSelectedHospital(hospital);
    setShowHospitalModal(true);
  };

  const handleHospitalUpdate = (updatedHospital) => {
    setPendingHospitals(prev => 
      prev.map(h => h._id === updatedHospital._id ? updatedHospital : h)
        .filter(h => h.verificationStatus === 'pending')
    );
    fetchDashboardData(); // Refresh stats
  };

  const handleQuickAction = async (hospitalId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospitalId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: action,
          verificationNotes: `Quick ${action} by admin`,
          isPartnered: action === 'approved'
        })
      });

      if (response.ok) {
        fetchDashboardData();
        alert(`Hospital ${action} successfully!`);
      }
    } catch (error) {
      console.error('Quick action error:', error);
    }
  };

  const generateCredentials = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/generate-credentials`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAdminFormData(prev => ({
          ...prev,
          email: data.credentials.email,
          password: data.credentials.password,
          confirmPassword: data.credentials.password
        }));
        
        alert(`🎉 Credentials Generated!\n\n📧 Email: ${data.credentials.email}\n🔐 Password: ${data.credentials.password}\n\n💡 Credentials have been auto-filled in the form.`);
      }
    } catch (error) {
      console.error('Error generating credentials:', error);
      const fallbackEmail = `admin${Date.now()}@carespot.com`;
      const fallbackPassword = generateRandomPassword();
      
      setAdminFormData(prev => ({
        ...prev,
        email: fallbackEmail,
        password: fallbackPassword,
        confirmPassword: fallbackPassword
      }));
      
      alert(`⚡ Credentials Generated (Offline)!\n\n📧 Email: ${fallbackEmail}\n🔐 Password: ${fallbackPassword}`);
    }
  };

  const generateRandomPassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleAdminFormChange = (e) => {
    const { name, value } = e.target;
    setAdminFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (adminFormErrors[name]) {
      setAdminFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateAdminForm = () => {
    const errors = {};
    
    if (!adminFormData.name.trim()) errors.name = 'Name is required';
    if (!adminFormData.email.trim()) errors.email = 'Email is required';
    if (!adminFormData.password) errors.password = 'Password is required';
    if (adminFormData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (adminFormData.password !== adminFormData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!adminFormData.phone.trim()) errors.phone = 'Phone number is required';
    if (!/^[6-9]\d{9}$/.test(adminFormData.phone)) {
      errors.phone = 'Please enter a valid Indian phone number';
    }

    setAdminFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    if (!validateAdminForm()) return;
    
    setAdminFormLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adminFormData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Admin Created Successfully!\n\n👤 Name: ${data.admin.name}\n📧 Email: ${data.admin.email}\n🔑 Password: ${data.admin.tempPassword || adminFormData.password}\n📱 Phone: ${data.admin.phone}\n🛡️ Level: ${data.admin.adminLevel}\n\n⚠️ Please share these credentials securely with the new admin.\n💡 Advise them to change the password on first login.`);
        
        setShowCreateAdminForm(false);
        setAdminFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          adminLevel: 'admin',
          dateOfBirth: '',
          gender: ''
        });
        fetchMyAdmins();
      } else {
        setAdminFormErrors({ submit: data.message || 'Error creating admin user' });
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      setAdminFormErrors({ submit: 'Network error: Unable to create admin user. Please check if the backend server is running.' });
    } finally {
      setAdminFormLoading(false);
    }
  };

  const toggleAdminStatus = async (adminId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        fetchMyAdmins();
        alert(`✅ Admin ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      } else {
        alert('❌ Error updating admin status');
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert('❌ Network error: Unable to update admin status');
    }
  };

  const deleteAdmin = async (adminId, adminName) => {
    if (window.confirm(`⚠️ Are you sure you want to delete admin "${adminName}"?\n\nThis action cannot be undone and will permanently remove:\n• Admin access\n• All associated data\n• Login credentials\n\nType "DELETE" in the next prompt to confirm.`)) {
      const confirmation = window.prompt('Type "DELETE" to confirm:');
      if (confirmation === 'DELETE') {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            fetchMyAdmins();
            alert(`✅ Admin "${adminName}" deleted successfully!`);
          } else {
            alert('❌ Error deleting admin user');
          }
        } catch (error) {
          console.error('Error deleting admin:', error);
          alert('❌ Network error: Unable to delete admin user');
        }
      } else {
        alert('❌ Deletion cancelled - confirmation text did not match');
      }
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    header: {
      backgroundColor: '#1e293b',
      color: '#ffffff',
      padding: '2rem 0'
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      marginBottom: '0.5rem'
    },
    subtitle: {
      opacity: 0.8
    },
    adminInfo: {
      textAlign: 'right'
    },
    adminName: {
      fontSize: '1.125rem',
      fontWeight: '600'
    },
    adminRole: {
      fontSize: '0.875rem',
      opacity: 0.8,
      textTransform: 'capitalize'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 1rem'
    },
    tabs: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      borderBottom: '2px solid #e2e8f0'
    },
    tab: {
      padding: '1rem 1.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: '3px solid transparent',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#64748b'
    },
    activeTab: {
      color: '#ef4444',
      borderBottomColor: '#ef4444'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '3rem'
    },
    statCard: {
      backgroundColor: '#ffffff',
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: '800',
      marginBottom: '0.5rem'
    },
    statLabel: {
      color: '#64748b',
      fontSize: '0.875rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    hospitalsSection: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      color: '#1e293b'
    },
    hospitalCard: {
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1rem',
      backgroundColor: '#f8fafc',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    hospitalCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
      borderColor: '#3b82f6'
    },
    hospitalName: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.5rem'
    },
    hospitalInfo: {
      color: '#64748b',
      fontSize: '0.875rem',
      marginBottom: '1rem'
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    quickActionBtn: {
      padding: '0.375rem 0.75rem',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    approveBtn: {
      backgroundColor: '#10b981',
      color: '#ffffff'
    },
    rejectBtn: {
      backgroundColor: '#ef4444',
      color: '#ffffff'
    },
    viewBtn: {
      backgroundColor: '#3b82f6',
      color: '#ffffff'
    },
    createButton: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#ffffff',
      padding: '0.875rem 1.75rem',
      borderRadius: '12px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '2rem',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
    },
    modal: {
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
    modalContent: {
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      padding: '2.5rem',
      width: '100%',
      maxWidth: '700px',
      maxHeight: '95vh',
      overflowY: 'auto',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2.5rem',
      paddingBottom: '1rem',
      borderBottom: '2px solid #f1f5f9'
    },
    modalTitle: {
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
      backgroundColor: '#f8fafc',
      outline: 'none',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    select: {
      padding: '1rem 1.25rem',
      border: '2px solid #e2e8f0',
      borderRadius: '16px',
      fontSize: '1rem',
      backgroundColor: '#f8fafc',
      outline: 'none',
      fontWeight: '500',
      cursor: 'pointer'
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
      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
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
      width: '100%',
      boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
    },
    adminCard: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    },
    adminHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    adminNameText: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1e293b'
    },
    adminEmail: {
      color: '#64748b',
      fontSize: '0.875rem',
      marginTop: '0.25rem'
    },
    statusBadge: {
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    activeBadge: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    inactiveBadge: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    },
    adminActions: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '1.5rem'
    },
    actionButton: {
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      border: 'none',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    toggleButton: {
      backgroundColor: '#f59e0b',
      color: '#ffffff'
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      color: '#ffffff'
    },
    loading: {
      textAlign: 'center',
      padding: '3rem',
      color: '#64748b'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>Loading admin dashboard...</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.7 }}>
            Connecting to {API_BASE_URL}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>🛡️ Admin Dashboard</h1>
            <p style={styles.subtitle}>Carespot Healthcare Platform Administration</p>
          </div>
          <div style={styles.adminInfo}>
            <div style={styles.adminName}>👋 {user?.name}</div>
            <div style={styles.adminRole}>{user?.adminLevel?.replace('_', ' ') || 'Admin'}</div>
          </div>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'overview' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'hospitals' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('hospitals')}
          >
            🏥 Hospital Review
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'users' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management
          </button>
          {user?.adminLevel === 'super_admin' && (
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'admin-management' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('admin-management')}
            >
              🛡️ Admin Management
            </button>
          )}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardStats && (
          <>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#2563eb' }}>
                  {dashboardStats.hospitals?.total || 0}
                </div>
                <div style={styles.statLabel}>Total Hospitals</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#f59e0b' }}>
                  {dashboardStats.hospitals?.pending || 0}
                </div>
                <div style={styles.statLabel}>Pending Applications</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#10b981' }}>
                  {dashboardStats.hospitals?.approved || 0}
                </div>
                <div style={styles.statLabel}>Approved Hospitals</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#8b5cf6' }}>
                  {dashboardStats.users?.patients || 0}
                </div>
                <div style={styles.statLabel}>Registered Patients</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#ef4444' }}>
                  {dashboardStats.users?.admins || 0}
                </div>
                <div style={styles.statLabel}>Admin Users</div>
              </div>
            </div>

            {dashboardStats.recentApplications?.length > 0 && (
              <div style={styles.hospitalsSection}>
                <h2 style={styles.sectionTitle}>📋 Recent Hospital Applications</h2>
                {dashboardStats.recentApplications.map((hospital) => (
                  <div 
                    key={hospital._id} 
                    style={styles.hospitalCard}
                    onClick={() => handleHospitalClick(hospital)}
                    onMouseEnter={(e) => {
                      Object.assign(e.currentTarget.style, styles.hospitalCardHover);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <div style={styles.hospitalName}>🏥 {hospital.hospitalName}</div>
                    <div style={styles.hospitalInfo}>
                      📍 {hospital.location?.city} • 📅 Applied {new Date(hospital.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Hospitals Tab with Enhanced Review */}
        {activeTab === 'hospitals' && (
          <div style={styles.hospitalsSection}>
            <h2 style={styles.sectionTitle}>🏥 Hospital Applications Review</h2>
            {pendingHospitals.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h3>No Pending Applications</h3>
                <p>All hospital applications have been reviewed!</p>
              </div>
            ) : (
              pendingHospitals.map((hospital) => (
                <div key={hospital._id} style={styles.hospitalCard}>
                  <div style={styles.hospitalName}>🏥 {hospital.hospitalName}</div>
                  <div style={styles.hospitalInfo}>
                    📍 {hospital.location?.address}, {hospital.location?.city}<br />
                    📞 {hospital.contactInfo?.phone} • ✉️ {hospital.contactInfo?.email}<br />
                    📋 Registration: {hospital.registrationNumber}<br />
                    🏥 Type: {hospital.hospitalType}<br />
                    📅 Applied: {new Date(hospital.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div style={styles.buttonGroup}>
                    <button
                      style={{ ...styles.quickActionBtn, ...styles.viewBtn }}
                      onClick={() => handleHospitalClick(hospital)}
                    >
                      🔍 Review Details
                    </button>
                    <button
                      style={{ ...styles.quickActionBtn, ...styles.approveBtn }}
                      onClick={() => handleQuickAction(hospital._id, 'approved')}
                    >
                      ✅ Quick Approve
                    </button>
                    <button
                      style={{ ...styles.quickActionBtn, ...styles.rejectBtn }}
                      onClick={() => handleQuickAction(hospital._id, 'rejected')}
                    >
                      ❌ Quick Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={styles.hospitalsSection}>
            <h2 style={styles.sectionTitle}>👥 User Management</h2>
            <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <h3>User Management</h3>
              <p>Advanced user management features coming soon...</p>
            </div>
          </div>
        )}

        {/* Admin Management Tab */}
        {activeTab === 'admin-management' && user?.adminLevel === 'super_admin' && (
          <div style={styles.hospitalsSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={styles.sectionTitle}>🛡️ Admin Management</h2>
              <button
                style={styles.createButton}
                onClick={() => setShowCreateAdminForm(true)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                }}
              >
                ➕ Create New Admin
              </button>
            </div>

            {adminUsers.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛡️</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1e293b' }}>No Admin Users Created</h3>
                <p style={{ fontSize: '1rem', marginBottom: '2rem' }}>Click "Create New Admin" to add your first admin user and start building your admin team.</p>
                <div style={{ 
                  backgroundColor: '#f0f9ff', 
                  border: '1px solid #bae6fd', 
                  borderRadius: '12px', 
                  padding: '1rem', 
                  fontSize: '0.875rem',
                  color: '#0369a1'
                }}>
                  💡 <strong>Tip:</strong> Use the credential generator to create secure login details automatically
                </div>
              </div>
            ) : (
              adminUsers.map((admin) => (
                <div key={admin._id} style={styles.adminCard}>
                  <div style={styles.adminHeader}>
                    <div>
                      <div style={styles.adminNameText}>👤 {admin.name}</div>
                      <div style={styles.adminEmail}>📧 {admin.email}</div>
                      <div style={styles.adminEmail}>📱 {admin.phone}</div>
                      <div style={styles.adminEmail}>🛡️ {admin.adminLevel?.replace('_', ' ')}</div>
                    </div>
                    <div
                      style={{
                        ...styles.statusBadge,
                        ...(admin.isActive ? styles.activeBadge : styles.inactiveBadge)
                      }}
                    >
                      {admin.isActive ? '✅ Active' : '❌ Inactive'}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                    📅 Created: {new Date(admin.createdAt).toLocaleDateString()}<br />
                    🔐 Permissions: {admin.permissions?.join(', ') || 'None'}
                  </div>

                  <div style={styles.adminActions}>
                    <button
                      style={{ ...styles.actionButton, ...styles.toggleButton }}
                      onClick={() => toggleAdminStatus(admin._id, admin.isActive)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = admin.isActive ? '#dc2626' : '#059669';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#f59e0b';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      {admin.isActive ? '🚫 Deactivate' : '✅ Activate'}
                    </button>
                    
                    <button
                      style={{ ...styles.actionButton, ...styles.deleteButton }}
                      onClick={() => deleteAdmin(admin._id, admin.name)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#dc2626';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#ef4444';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Hospital Review Modal */}
      <HospitalReviewModal
        hospital={selectedHospital}
        isOpen={showHospitalModal}
        onClose={() => {
          setShowHospitalModal(false);
          setSelectedHospital(null);
        }}
        onUpdate={handleHospitalUpdate}
      />

      {/* Create Admin Modal */}
      {showCreateAdminForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>🛡️ Create New Admin</h2>
              <button 
                style={styles.closeButton} 
                onClick={() => setShowCreateAdminForm(false)}
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

            <form style={styles.form} onSubmit={handleCreateAdmin}>
              {adminFormErrors.submit && (
                <div style={{ 
                  backgroundColor: '#fef2f2', 
                  color: '#dc2626', 
                  padding: '1rem 1.25rem', 
                  borderRadius: '16px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  border: '2px solid #fecaca'
                }}>
                  ⚠️ {adminFormErrors.submit}
                </div>
              )}

              <div style={styles.inputGroup}>
                <label style={styles.label}>👤 Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={adminFormData.name}
                  onChange={handleAdminFormChange}
                  style={{
                    ...styles.input,
                    ...(adminFormErrors.name ? styles.inputError : {})
                  }}
                  placeholder="Enter admin's full name"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                />
                {adminFormErrors.name && <div style={styles.errorText}>⚠️ {adminFormErrors.name}</div>}
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>📧 Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={adminFormData.email}
                    onChange={handleAdminFormChange}
                    style={{
                      ...styles.input,
                      ...(adminFormErrors.email ? styles.inputError : {})
                    }}
                    placeholder="admin@carespot.com"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#f8fafc';
                    }}
                  />
                  {adminFormErrors.email && <div style={styles.errorText}>⚠️ {adminFormErrors.email}</div>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>📱 Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={adminFormData.phone}
                    onChange={handleAdminFormChange}
                    style={{
                      ...styles.input,
                      ...(adminFormErrors.phone ? styles.inputError : {})
                    }}
                    placeholder="9876543210"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#f8fafc';
                    }}
                  />
                  {adminFormErrors.phone && <div style={styles.errorText}>⚠️ {adminFormErrors.phone}</div>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button
                  type="button"
                  style={styles.generateButton}
                  onClick={generateCredentials}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)';
                  }}
                >
                  🎲 Generate Credentials
                </button>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>🔐 Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={adminFormData.password}
                    onChange={handleAdminFormChange}
                    style={{
                      ...styles.input,
                      ...(adminFormErrors.password ? styles.inputError : {})
                    }}
                    placeholder="Minimum 8 characters"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#f8fafc';
                    }}
                  />
                  {adminFormErrors.password && <div style={styles.errorText}>⚠️ {adminFormErrors.password}</div>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>🔐 Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={adminFormData.confirmPassword}
                    onChange={handleAdminFormChange}
                    style={{
                      ...styles.input,
                      ...(adminFormErrors.confirmPassword ? styles.inputError : {})
                    }}
                    placeholder="Confirm password"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#f8fafc';
                    }}
                  />
                  {adminFormErrors.confirmPassword && <div style={styles.errorText}>⚠️ {adminFormErrors.confirmPassword}</div>}
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>🛡️ Admin Level *</label>
                  <select
                    name="adminLevel"
                    value={adminFormData.adminLevel}
                    onChange={handleAdminFormChange}
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
                    value={adminFormData.gender}
                    onChange={handleAdminFormChange}
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
                  value={adminFormData.dateOfBirth}
                  onChange={handleAdminFormChange}
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                />
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => setShowCreateAdminForm(false)}
                  style={{
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
                  }}
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
                  disabled={adminFormLoading}
                  style={{
                    ...styles.submitButton,
                    opacity: adminFormLoading ? 0.7 : 1,
                    cursor: adminFormLoading ? 'not-allowed' : 'pointer',
                    flex: 2
                  }}
                  onMouseEnter={(e) => {
                    if (!adminFormLoading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  {adminFormLoading ? '⏳ Creating Admin...' : '✅ Create Admin User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
