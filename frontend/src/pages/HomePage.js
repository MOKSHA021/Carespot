import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const styles = {
    container: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      lineHeight: 1.6
    },
    // Hero Section
    hero: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff',
      padding: '6rem 1rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
    heroContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 2
    },
    heroTitle: {
      fontSize: '3.5rem',
      fontWeight: '800',
      marginBottom: '1.5rem',
      lineHeight: 1.2
    },
    heroSubtitle: {
      fontSize: '1.5rem',
      marginBottom: '3rem',
      opacity: 0.9,
      maxWidth: '600px',
      margin: '0 auto 3rem auto'
    },
    heroButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    primaryButton: {
      backgroundColor: '#10b981',
      color: '#ffffff',
      padding: '1rem 2rem',
      borderRadius: '12px',
      textDecoration: 'none',
      fontSize: '1.125rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)'
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      color: '#ffffff',
      padding: '1rem 2rem',
      borderRadius: '12px',
      textDecoration: 'none',
      fontSize: '1.125rem',
      fontWeight: '600',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    // Features Section
    features: {
      padding: '6rem 1rem',
      backgroundColor: '#f8fafc'
    },
    featuresContent: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    sectionTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      textAlign: 'center',
      color: '#1e293b',
      marginBottom: '1rem'
    },
    sectionSubtitle: {
      fontSize: '1.125rem',
      textAlign: 'center',
      color: '#64748b',
      marginBottom: '4rem',
      maxWidth: '600px',
      margin: '0 auto 4rem auto'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '2rem'
    },
    featureCard: {
      backgroundColor: '#ffffff',
      padding: '3rem 2rem',
      borderRadius: '20px',
      textAlign: 'center',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease'
    },
    featureIcon: {
      fontSize: '3rem',
      marginBottom: '1.5rem'
    },
    featureTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '1rem'
    },
    featureDescription: {
      color: '#64748b',
      fontSize: '1rem'
    },
    // How It Works Section
    howItWorks: {
      padding: '6rem 1rem',
      backgroundColor: '#ffffff'
    },
    stepsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '3rem',
      marginTop: '4rem'
    },
    stepCard: {
      textAlign: 'center',
      position: 'relative'
    },
    stepNumber: {
      width: '4rem',
      height: '4rem',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      fontWeight: '700',
      margin: '0 auto 1.5rem auto',
      boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)'
    },
    stepTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.5rem'
    },
    stepDescription: {
      color: '#64748b',
      fontSize: '0.95rem'
    },
    // Stats Section
    stats: {
      padding: '6rem 1rem',
      backgroundColor: '#2563eb',
      color: '#ffffff'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '3rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    statItem: {
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '3rem',
      fontWeight: '800',
      marginBottom: '0.5rem',
      color: '#10b981'
    },
    statLabel: {
      fontSize: '1.125rem',
      opacity: 0.9
    },
    // CTA Section
    cta: {
      padding: '6rem 1rem',
      backgroundColor: '#1e293b',
      color: '#ffffff',
      textAlign: 'center'
    },
    ctaTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '1rem'
    },
    ctaSubtitle: {
      fontSize: '1.125rem',
      marginBottom: '3rem',
      opacity: 0.9
    }
  };

  const features = [
    {
      icon: '🏥',
      title: 'Trusted Hospital Network',
      description: 'Access verified partner hospitals with certified medical professionals and modern facilities.'
    },
    {
      icon: '👨‍⚕️',
      title: 'Expert Doctors',
      description: 'Book appointments with experienced doctors across various specializations and get quality care.'
    },
    {
      icon: '📱',
      title: 'Easy Appointment Booking',
      description: 'Schedule appointments effortlessly through our user-friendly platform with real-time availability.'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your medical data is protected with enterprise-grade security and complete privacy compliance.'
    },
    {
      icon: '🌍',
      title: 'Location-Based Search',
      description: 'Find the nearest hospitals and doctors based on your location with GPS integration.'
    },
    {
      icon: '💬',
      title: '24/7 Support',
      description: 'Get assistance anytime with our dedicated support team for all your healthcare queries.'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Create Account',
      description: 'Sign up for free and complete your profile with basic information'
    },
    {
      number: '2',
      title: 'Find Hospitals',
      description: 'Search for trusted partner hospitals near your location'
    },
    {
      number: '3',
      title: 'Book Appointment',
      description: 'Choose your preferred doctor and schedule an appointment'
    },
    {
      number: '4',
      title: 'Get Treatment',
      description: 'Visit the hospital and receive quality healthcare services'
    }
  ];

  const stats = [
    { number: '150+', label: 'Partner Hospitals' },
    { number: '500+', label: 'Expert Doctors' },
    { number: '10,000+', label: 'Happy Patients' },
    { number: '50+', label: 'Cities Covered' }
  ];

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Your Trusted Healthcare Partner
          </h1>
          <p style={styles.heroSubtitle}>
            Connect with verified hospitals and expert doctors for quality healthcare services. 
            Book appointments, access medical records, and manage your health journey with confidence.
          </p>
          <div style={styles.heroButtons}>
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  style={styles.primaryButton}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.backgroundColor = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.backgroundColor = '#10b981';
                  }}
                >
                  Get Started Free
                </Link>
                <Link
                  to="/hospitals"
                  style={styles.secondaryButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  Find Hospitals
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  style={styles.primaryButton}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.backgroundColor = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.backgroundColor = '#10b981';
                  }}
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/appointments"
                  style={styles.secondaryButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  My Appointments
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <div style={styles.featuresContent}>
          <h2 style={styles.sectionTitle}>Why Choose Carespot?</h2>
          <p style={styles.sectionSubtitle}>
            We provide comprehensive healthcare solutions with a focus on trust, quality, and accessibility
          </p>
          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={styles.featureCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={styles.featureIcon}>{feature.icon}</div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={styles.howItWorks}>
        <div style={styles.featuresContent}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <p style={styles.sectionSubtitle}>
            Get started with Carespot in just 4 simple steps
          </p>
          <div style={styles.stepsGrid}>
            {steps.map((step, index) => (
              <div key={index} style={styles.stepCard}>
                <div style={styles.stepNumber}>{step.number}</div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDescription}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.stats}>
        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} style={styles.statItem}>
              <div style={styles.statNumber}>{stat.number}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.cta}>
        <div style={styles.featuresContent}>
          <h2 style={styles.ctaTitle}>Ready to Start Your Health Journey?</h2>
          <p style={styles.ctaSubtitle}>
            Join thousands of patients who trust Carespot for their healthcare needs
          </p>
          <div style={styles.heroButtons}>
            {!isAuthenticated ? (
              <Link
                to="/register"
                style={styles.primaryButton}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.backgroundColor = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.backgroundColor = '#10b981';
                }}
              >
                Create Free Account
              </Link>
            ) : (
              <Link
                to="/dashboard"
                style={styles.primaryButton}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.backgroundColor = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.backgroundColor = '#10b981';
                }}
              >
                Access Your Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
