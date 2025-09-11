import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    header: {
      backgroundColor: '#ffffff',
      padding: '2rem 0',
      borderBottom: '1px solid #e2e8f0'
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 1rem'
    },
    welcome: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#64748b',
      fontSize: '1.125rem'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '3rem 1rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginBottom: '3rem'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease'
    },
    cardIcon: {
      fontSize: '2.5rem',
      marginBottom: '1rem'
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.5rem'
    },
    cardDescription: {
      color: '#64748b',
      marginBottom: '1.5rem'
    },
    cardButton: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem'
    },
    statCard: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '1.5rem',
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#2563eb',
      marginBottom: '0.5rem'
    },
    statLabel: {
      color: '#64748b',
      fontSize: '0.875rem'
    }
  };

  const quickActions = [
    {
      icon: '🏥',
      title: 'Find Hospitals',
      description: 'Search for partnered hospitals near your location',
      action: 'Browse Hospitals',
      color: '#2563eb'
    },
    {
      icon: '👨‍⚕️',
      title: 'Book Appointment',
      description: 'Schedule appointments with trusted doctors',
      action: 'Book Now',
      color: '#10b981'
    },
    {
      icon: '📋',
      title: 'Medical History',
      description: 'View your past consultations and reports',
      action: 'View History',
      color: '#f59e0b'
    },
    {
      icon: '💊',
      title: 'Prescriptions',
      description: 'Access your digital prescriptions and medicines',
      action: 'View Prescriptions',
      color: '#8b5cf6'
    }
  ];

  const stats = [
    { number: '150+', label: 'Partner Hospitals' },
    { number: '500+', label: 'Trusted Doctors' },
    { number: '10,000+', label: 'Happy Patients' },
    { number: '24/7', label: 'Support Available' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.welcome}>
            Welcome back, {user?.name}! 👋
          </h1>
          <p style={styles.subtitle}>
            Manage your healthcare journey with trusted medical professionals
          </p>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.grid}>
          {quickActions.map((action, index) => (
            <div
              key={index}
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={styles.cardIcon}>{action.icon}</div>
              <h3 style={styles.cardTitle}>{action.title}</h3>
              <p style={styles.cardDescription}>{action.description}</p>
              <button
                style={{
                  ...styles.cardButton,
                  backgroundColor: action.color
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.opacity = '1';
                }}
              >
                {action.action}
              </button>
            </div>
          ))}
        </div>

        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} style={styles.statCard}>
              <div style={styles.statNumber}>{stat.number}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
