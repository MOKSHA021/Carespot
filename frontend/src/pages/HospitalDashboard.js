import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { hospitalAPI } from '../services/api';
import StaffManagement from './StaffManagement'; // ✅ Import StaffManagement

const HospitalDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hospitalData, setHospitalData] = useState(null);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalReceptionists: 0,
    totalNurses: 0,
    totalStaff: 0,
    totalBeds: 120,
    availableBeds: 45,
    rating: 4.6,
    totalReviews: 234,
    departments: 8,
    facilities: 12
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchHospitalData();
    fetchStaffStats();
  }, []);

  const fetchHospitalData = async () => {
    try {
      setLoading(true);
      const response = await hospitalAPI.getMyHospital();
      if (response?.data?.hospital) {
        setHospitalData(response.data.hospital);
      }
    } catch (error) {
      console.error('Error fetching hospital data:', error);
      if (error.response?.status === 401) {
        await logout();
        navigate('/hospital/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch real staff statistics
  const fetchStaffStats = async () => {
    try {
      const response = await hospitalAPI.getStaffStats();
      if (response?.data?.success) {
        const staffStats = response.data.stats;
        setStats(prev => ({
          ...prev,
          totalStaff: staffStats.total,
          totalDoctors: staffStats.summary?.doctors || 0,
          totalReceptionists: staffStats.summary?.receptionists || 0,
          totalNurses: staffStats.summary?.nurses || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching staff stats:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'under_review': return '#3b82f6';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'under_review': return '🔍';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: "'Inter', sans-serif"
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
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    avatar: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem',
      fontWeight: '700'
    },
    logoutBtn: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      padding: '0.75rem 1.5rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 1rem'
    },
    statusCard: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    },
    statusHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1rem'
    },
    statusBadge: {
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
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
      color: '#2563eb',
      borderBottomColor: '#2563eb'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
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
    section: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      color: '#1e293b'
    },
    loading: {
      textAlign: 'center',
      padding: '3rem',
      color: '#64748b'
    },
    comingSoon: {
      textAlign: 'center',
      color: '#64748b',
      padding: '3rem'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>Loading hospital dashboard...</div>
        </div>
      </div>
    );
  }

  const hospitalName = hospitalData?.hospitalName || 'Hospital Dashboard';
  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'H';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>🏥 {hospitalName}</h1>
            <p style={styles.subtitle}>Hospital Management & Partnership Portal</p>
          </div>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{userInitials}</div>
            <div>
              <div style={{ fontWeight: '600' }}>{user?.name}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Hospital Manager</div>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              👋 Logout
            </button>
          </div>
        </div>
      </div>

      <div style={styles.main}>
        {/* Hospital Status Card */}
        {hospitalData && (
          <div style={styles.statusCard}>
            <div style={styles.statusHeader}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                {hospitalData.hospitalName}
              </h2>
              <div
                style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusColor(hospitalData.verificationStatus) + '20',
                  color: getStatusColor(hospitalData.verificationStatus)
                }}
              >
                {getStatusIcon(hospitalData.verificationStatus)}
                {hospitalData.verificationStatus.replace('_', ' ').toUpperCase()}
              </div>
            </div>
            
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Partnership Status: {hospitalData.isPartnered ? '✅ Active Partner' : '⏳ Pending Approval'}<br />
              Type: {hospitalData.hospitalType}<br />
              Location: {hospitalData.location?.city}, {hospitalData.location?.state}<br />
              Registered: {new Date(hospitalData.createdAt).toLocaleDateString()}
            </div>

            {hospitalData.verificationStatus === 'pending' && (
              <div style={{
                backgroundColor: '#fef3c7',
                color: '#d97706',
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '1rem',
                fontSize: '0.875rem'
              }}>
                ⏳ Your hospital registration is pending admin review. You will be notified once approved.
              </div>
            )}

            {hospitalData.verificationStatus === 'rejected' && (
              <div style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '1rem',
                fontSize: '0.875rem'
              }}>
                ❌ Your application was rejected. Please contact admin for more information.
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'staff', label: '👥 Staff Management' },
            { key: 'appointments', label: '📅 Appointments' },
            { key: 'patients', label: '🏥 Patients' },
            { key: 'settings', label: '⚙️ Settings' }
          ].map((tab) => (
            <button
              key={tab.key}
              style={{
                ...styles.tab,
                ...(activeTab === tab.key ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ✅ TAB CONTENT - Now includes StaffManagement */}
        {activeTab === 'overview' && (
          <>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#2563eb' }}>
                  {stats.totalDoctors}
                </div>
                <div style={styles.statLabel}>Total Doctors</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#10b981' }}>
                  {stats.totalNurses}
                </div>
                <div style={styles.statLabel}>Nurses</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#f59e0b' }}>
                  {stats.totalReceptionists}
                </div>
                <div style={styles.statLabel}>Receptionists</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#8b5cf6' }}>
                  {stats.totalStaff}
                </div>
                <div style={styles.statLabel}>Total Staff</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#ef4444' }}>
                  {stats.rating.toFixed(1)} ⭐
                </div>
                <div style={styles.statLabel}>Rating ({stats.totalReviews} reviews)</div>
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🏥 Hospital Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div>
                  <h4 style={{ color: '#374151', marginBottom: '1rem' }}>Services & Facilities</h4>
                  <p><strong>Departments:</strong> {stats.departments}</p>
                  <p><strong>Facilities:</strong> {stats.facilities}</p>
                  <p><strong>Specialties:</strong> {hospitalData?.departments?.join(', ') || 'General Medicine'}</p>
                </div>
                <div>
                  <h4 style={{ color: '#374151', marginBottom: '1rem' }}>Performance Metrics</h4>
                  <p><strong>Patient Rating:</strong> {stats.rating.toFixed(1)}/5.0 ⭐</p>
                  <p><strong>Total Reviews:</strong> {stats.totalReviews}</p>
                  <p><strong>Total Staff Members:</strong> {stats.totalStaff}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ✅ STAFF MANAGEMENT TAB - Connected to StaffManagement component */}
        {activeTab === 'staff' && (
          <StaffManagement 
            hospitalId={hospitalData?._id} 
            onStaffUpdate={fetchStaffStats} // Callback to refresh stats
          />
        )}

        {/* Other tabs remain as "coming soon" */}
        {activeTab !== 'overview' && activeTab !== 'staff' && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              {activeTab === 'appointments' && '📅 Appointment Management'}
              {activeTab === 'patients' && '🏥 Patient Management'}
              {activeTab === 'settings' && '⚙️ Hospital Settings'}
            </h3>
            <div style={styles.comingSoon}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {activeTab === 'appointments' && '📅'}
                {activeTab === 'patients' && '🏥'}
                {activeTab === 'settings' && '⚙️'}
              </div>
              <h4>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management System
              </h4>
              <p>This feature is coming soon. Stay tuned for updates!</p>
              <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>We're working hard to bring you the best hospital management experience.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
