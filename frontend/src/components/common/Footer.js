import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const styles = {
    footer: {
      backgroundColor: '#1e293b',
      color: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4rem 1rem 2rem 1rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '3rem',
      marginBottom: '3rem'
    },
    column: {
      display: 'flex',
      flexDirection: 'column'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    logoIcon: {
      fontSize: '1.5rem',
      marginRight: '0.5rem'
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    description: {
      color: '#94a3b8',
      lineHeight: 1.6,
      marginBottom: '1.5rem'
    },
    columnTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '1rem',
      color: '#ffffff'
    },
    linkList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    link: {
      color: '#94a3b8',
      textDecoration: 'none',
      fontSize: '0.95rem',
      transition: 'color 0.2s ease',
      padding: '0.25rem 0'
    },
    linkHover: {
      color: '#10b981'
    },
    contactInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      color: '#94a3b8',
      fontSize: '0.95rem'
    },
    contactIcon: {
      marginRight: '0.75rem',
      fontSize: '1.125rem'
    },
    socialLinks: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem'
    },
    socialLink: {
      width: '2.5rem',
      height: '2.5rem',
      backgroundColor: '#334155',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#94a3b8',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      fontSize: '1.125rem'
    },
    divider: {
      height: '1px',
      backgroundColor: '#334155',
      margin: '2rem 0'
    },
    bottom: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    copyright: {
      color: '#94a3b8',
      fontSize: '0.875rem'
    },
    bottomLinks: {
      display: 'flex',
      gap: '2rem',
      flexWrap: 'wrap'
    },
    bottomLink: {
      color: '#94a3b8',
      textDecoration: 'none',
      fontSize: '0.875rem',
      transition: 'color 0.2s ease'
    }
  };

  const footerSections = {
    quickLinks: [
      { name: 'Find Hospitals', path: '/hospitals' },
      { name: 'Our Doctors', path: '/doctors' },
      { name: 'Book Appointment', path: '/register' },
      { name: 'Emergency Services', path: '/emergency' }
    ],
    services: [
      { name: 'General Consultation', path: '/services/general' },
      { name: 'Specialist Care', path: '/services/specialist' },
      { name: 'Emergency Care', path: '/services/emergency' },
      { name: 'Health Checkups', path: '/services/checkups' }
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'FAQ', path: '/faq' },
      { name: 'Live Chat', path: '/chat' }
    ]
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.grid}>
          {/* Company Info */}
          <div style={styles.column}>
            <div style={styles.logo}>
              <span style={styles.logoIcon}>🏥</span>
              <span style={styles.logoText}>Carespot</span>
            </div>
            <p style={styles.description}>
              Your trusted healthcare partner connecting you with verified hospitals 
              and expert doctors for quality medical care. Experience healthcare 
              with confidence and convenience.
            </p>
            <div style={styles.socialLinks}>
              <a
                href="#"
                style={styles.socialLink}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#334155';
                  e.target.style.color = '#94a3b8';
                }}
              >
                📘
              </a>
              <a
                href="#"
                style={styles.socialLink}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1da1f2';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#334155';
                  e.target.style.color = '#94a3b8';
                }}
              >
                🐦
              </a>
              <a
                href="#"
                style={styles.socialLink}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#0077b5';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#334155';
                  e.target.style.color = '#94a3b8';
                }}
              >
                💼
              </a>
              <a
                href="#"
                style={styles.socialLink}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#25d366';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#334155';
                  e.target.style.color = '#94a3b8';
                }}
              >
                📱
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div style={styles.column}>
            <h3 style={styles.columnTitle}>Quick Links</h3>
            <div style={styles.linkList}>
              {footerSections.quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  style={styles.link}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#10b981';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#94a3b8';
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div style={styles.column}>
            <h3 style={styles.columnTitle}>Our Services</h3>
            <div style={styles.linkList}>
              {footerSections.services.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  style={styles.link}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#10b981';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#94a3b8';
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div style={styles.column}>
            <h3 style={styles.columnTitle}>Contact Us</h3>
            <div style={styles.contactInfo}>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>📍</span>
                <span>123 Healthcare Avenue, Medical District, New Delhi 110001</span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>📞</span>
                <span>+91 1800-CARESPOT (1800-227-3776)</span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>✉️</span>
                <span>support@carespot.com</span>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>🕒</span>
                <span>24/7 Emergency Support Available</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.divider}></div>

        <div style={styles.bottom}>
          <div style={styles.copyright}>
            © {currentYear} Carespot Healthcare Platform. All rights reserved.
          </div>
          <div style={styles.bottomLinks}>
            <Link
              to="/privacy"
              style={styles.bottomLink}
              onMouseEnter={(e) => {
                e.target.style.color = '#10b981';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#94a3b8';
              }}
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              style={styles.bottomLink}
              onMouseEnter={(e) => {
                e.target.style.color = '#10b981';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#94a3b8';
              }}
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              style={styles.bottomLink}
              onMouseEnter={(e) => {
                e.target.style.color = '#10b981';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#94a3b8';
              }}
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
