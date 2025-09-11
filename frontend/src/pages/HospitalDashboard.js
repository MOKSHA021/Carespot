import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [hospitalData, setHospitalData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const fetchHospitalData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // For demo purposes, we'll use the user's hospital ID
      // In a real app, you'd store this when the hospital is created
      const hospitalId = user?.hospitalId || 'demo-hospital-id';
      
      const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHospitalData(data.hospital);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching hospital data:', error);
    } finally {
      setLoading(false);
    }
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
      textAlign: 'right'
    },
    userName: {
      fontSize: '1.125rem',
      fontWeight: '600'
    },
    userRole: {
      fontSize: '0.875rem',
      opacity: 0.8
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>🏥 Hospital Dashboard</h1>
            <p style={styles.subtitle}>Hospital Management & Partnership Portal</p>
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>👋 {user?.name}</div>
            <div style={styles.userRole}>Hospital Manager</div>
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
              ...(activeTab === 'staff' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('staff')}
          >
            👥 Staff Management
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'appointments' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('appointments')}
          >
            📅 Appointments
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'settings' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && stats && (
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
                  {stats.totalReceptionists}
                </div>
                <div style={styles.statLabel}>Receptionists</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#f59e0b' }}>
                  {stats.totalBeds}
                </div>
                <div style={styles.statLabel}>Total Beds</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#8b5cf6' }}>
                  {stats.availableBeds}
                </div>
                <div style={styles.statLabel}>Available Beds</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#ef4444' }}>
                  {stats.rating.toFixed(1)}
                </div>
                <div style={styles.statLabel}>Rating ({stats.totalReviews} reviews)</div>
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🏥 Hospital Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div>
                  <h4 style={{ color: '#374151', marginBottom: '1rem' }}>Services</h4>
                  <p><strong>Departments:</strong> {stats.departments}</p>
                  <p><strong>Facilities:</strong> {stats.facilities}</p>
                </div>
                <div>
                  <h4 style={{ color: '#374151', marginBottom: '1rem' }}>Performance</h4>
                  <p><strong>Patient Rating:</strong> {stats.rating.toFixed(1)}/5.0</p>
                  <p><strong>Total Reviews:</strong> {stats.totalReviews}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'staff' && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>👥 Staff Management</h3>
            <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <h4>Staff Management System</h4>
              <p>Add and manage doctors and receptionists for your hospital.</p>
              <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Feature coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📅 Appointment Management</h3>
            <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <h4>Appointment Booking System</h4>
              <p>Manage patient appointments and doctor schedules.</p>
              <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Feature coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>⚙️ Hospital Settings</h3>
            <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
              <h4>Hospital Configuration</h4>
              <p>Update hospital information, operating hours, and services.</p>
              <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Feature coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
