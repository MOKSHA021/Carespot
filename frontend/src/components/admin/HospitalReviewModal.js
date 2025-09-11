import React, { useState, useEffect } from 'react';

const HospitalReviewModal = ({ hospital, isOpen, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [reviewData, setReviewData] = useState({
    status: '',
    notes: '',
    rejectionReason: '',
    managerEmail: '',
    managerName: '',
    managerPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [creatingManager, setCreatingManager] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (hospital) {
      setReviewData({
        status: hospital.verificationStatus || '',
        notes: hospital.verificationDetails?.verificationNotes || '',
        rejectionReason: hospital.verificationDetails?.rejectionReason || '',
        managerEmail: '',
        managerName: '',
        managerPhone: ''
      });
    }
  }, [hospital]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospital._id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'approved',
          verificationNotes: reviewData.notes,
          isPartnered: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        onUpdate?.(data.hospital);
        
        // If manager details provided, create manager account
        if (reviewData.managerEmail && reviewData.managerName) {
          await createManagerAccount();
        } else {
          alert('🎉 Hospital approved successfully!');
          onClose();
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert('Error approving hospital. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reviewData.rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/hospitals/${hospital._id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'rejected',
          verificationNotes: reviewData.notes,
          rejectionReason: reviewData.rejectionReason
        })
      });

      if (response.ok) {
        const data = await response.json();
        onUpdate?.(data.hospital);
        alert('Hospital application rejected');
        onClose();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Rejection error:', error);
      alert('Error rejecting hospital. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createManagerAccount = async () => {
    if (!reviewData.managerEmail || !reviewData.managerName) {
      alert('Manager email and name are required');
      return;
    }

    setCreatingManager(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/create-hospital-manager`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: reviewData.managerName,
          email: reviewData.managerEmail,
          phone: reviewData.managerPhone,
          hospitalId: hospital._id,
          hospitalName: hospital.hospitalName
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`🎉 Hospital approved and manager account created!\n\n👤 Manager: ${data.manager.name}\n📧 Email: ${data.manager.email}\n🔐 Password: ${data.tempPassword}\n\n✅ Credentials have been sent to the manager's email.`);
        onClose();
      } else {
        alert(`Hospital approved but manager creation failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Manager creation error:', error);
      alert('Hospital approved but manager creation failed. Please create manually.');
    } finally {
      setCreatingManager(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'under_review': return '#f59e0b';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    },
    modal: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '1000px',
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    header: {
      padding: '2rem',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f9fafb'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '1.5rem',
      color: '#6b7280',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '50%',
      transition: 'all 0.2s ease'
    },
    content: {
      flex: 1,
      overflow: 'auto'
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb'
    },
    tab: {
      padding: '1rem 2rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: '2px solid transparent',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#6b7280'
    },
    activeTab: {
      color: '#2563eb',
      borderBottomColor: '#2563eb',
      backgroundColor: '#ffffff'
    },
    tabContent: {
      padding: '2rem'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    infoCard: {
      backgroundColor: '#f8fafc',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    },
    infoLabel: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#64748b',
      marginBottom: '0.5rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    infoValue: {
      fontSize: '1rem',
      color: '#1e293b',
      fontWeight: '500'
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      display: 'inline-block'
    },
    section: {
      marginBottom: '2rem'
    },
    sectionTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    list: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '0.5rem',
      margin: 0,
      padding: 0,
      listStyle: 'none'
    },
    listItem: {
      padding: '0.5rem',
      backgroundColor: '#f1f5f9',
      borderRadius: '6px',
      fontSize: '0.875rem',
      color: '#475569'
    },
    scheduleGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem'
    },
    scheduleCard: {
      backgroundColor: '#f8fafc',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    },
    dayName: {
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    inputGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.95rem',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.95rem',
      resize: 'vertical',
      minHeight: '100px',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    },
    footer: {
      padding: '2rem',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem'
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease',
      minWidth: '120px'
    },
    buttonPrimary: {
      backgroundColor: '#10b981',
      color: '#ffffff'
    },
    buttonDanger: {
      backgroundColor: '#ef4444',
      color: '#ffffff'
    },
    buttonSecondary: {
      backgroundColor: '#6b7280',
      color: '#ffffff'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem'
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            🏥 {hospital?.hospitalName}
          </h2>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        <div style={styles.tabs}>
          {[
            { id: 'details', label: 'Hospital Details', icon: '🏥' },
            { id: 'contact', label: 'Contact & Services', icon: '📞' },
            { id: 'schedule', label: 'Operating Hours', icon: '⏰' },
            { id: 'review', label: 'Review & Action', icon: '⚖️' }
          ].map(tab => (
            <button
              key={tab.id}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div style={styles.content}>
          {activeTab === 'details' && (
            <div style={styles.tabContent}>
              <div style={styles.infoGrid}>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Hospital Name</div>
                  <div style={styles.infoValue}>{hospital?.hospitalName}</div>
                </div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Registration Number</div>
                  <div style={styles.infoValue}>{hospital?.registrationNumber}</div>
                </div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Hospital Type</div>
                  <div style={styles.infoValue}>{hospital?.hospitalType}</div>
                </div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Status</div>
                  <div
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: `${getStatusColor(hospital?.verificationStatus)}20`,
                      color: getStatusColor(hospital?.verificationStatus)
                    }}
                  >
                    {hospital?.verificationStatus?.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📍 Location Information</h3>
                <div style={styles.infoCard}>
                  <div style={styles.infoValue}>
                    <strong>Address:</strong> {hospital?.location?.address}<br />
                    <strong>City:</strong> {hospital?.location?.city}, {hospital?.location?.state}<br />
                    <strong>Pincode:</strong> {hospital?.location?.pincode}<br />
                    <strong>Country:</strong> {hospital?.location?.country}
                  </div>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🛏️ Capacity Information</h3>
                <div style={styles.row}>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Total Beds</div>
                    <div style={styles.infoValue}>{hospital?.bedCount?.total || 'Not specified'}</div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Available Beds</div>
                    <div style={styles.infoValue}>{hospital?.bedCount?.available || 'Not specified'}</div>
                  </div>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📅 Application Details</h3>
                <div style={styles.row}>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Applied On</div>
                    <div style={styles.infoValue}>{formatDate(hospital?.createdAt)}</div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Partnership Agreement</div>
                    <div style={styles.infoValue}>
                      {hospital?.partnershipAgreement?.accepted ? '✅ Accepted' : '❌ Not Accepted'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div style={styles.tabContent}>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📞 Contact Information</h3>
                <div style={styles.infoGrid}>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Phone</div>
                    <div style={styles.infoValue}>{hospital?.contactInfo?.phone}</div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Email</div>
                    <div style={styles.infoValue}>{hospital?.contactInfo?.email}</div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Website</div>
                    <div style={styles.infoValue}>
                      {hospital?.contactInfo?.website ? (
                        <a href={hospital.contactInfo.website} target="_blank" rel="noopener noreferrer">
                          {hospital.contactInfo.website}
                        </a>
                      ) : 'Not provided'}
                    </div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Emergency Contact</div>
                    <div style={styles.infoValue}>
                      {hospital?.contactInfo?.emergencyNumber || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🏥 Departments</h3>
                <ul style={styles.list}>
                  {hospital?.departments?.map(dept => (
                    <li key={dept} style={styles.listItem}>{dept}</li>
                  ))}
                </ul>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🔬 Facilities</h3>
                <ul style={styles.list}>
                  {hospital?.facilities?.map(facility => (
                    <li key={facility} style={styles.listItem}>{facility}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div style={styles.tabContent}>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>⏰ Operating Hours</h3>
                <div style={styles.scheduleGrid}>
                  {Object.entries(hospital?.operatingHours || {}).map(([day, hours]) => (
                    <div key={day} style={styles.scheduleCard}>
                      <div style={styles.dayName}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </div>
                      <div>
                        {hours.isOpen ? (
                          <span style={{ color: '#059669', fontWeight: '600' }}>
                            {hours.open} - {hours.close}
                          </span>
                        ) : (
                          <span style={{ color: '#ef4444', fontWeight: '600' }}>Closed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div style={styles.tabContent}>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>⚖️ Hospital Review & Action</h3>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Review Notes</label>
                  <textarea
                    name="notes"
                    value={reviewData.notes}
                    onChange={handleInputChange}
                    style={styles.textarea}
                    placeholder="Add any notes about this hospital's application..."
                  />
                </div>

                {reviewData.status === 'rejected' && (
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Rejection Reason *</label>
                    <textarea
                      name="rejectionReason"
                      value={reviewData.rejectionReason}
                      onChange={handleInputChange}
                      style={styles.textarea}
                      placeholder="Provide a detailed reason for rejection..."
                    />
                  </div>
                )}
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>👤 Create Hospital Manager Account (Optional)</h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  Create a manager account to give the hospital access to their dashboard.
                </p>
                
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Manager Name</label>
                    <input
                      type="text"
                      name="managerName"
                      value={reviewData.managerName}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="Hospital manager's full name"
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Manager Email</label>
                    <input
                      type="email"
                      name="managerEmail"
                      value={reviewData.managerEmail}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="manager@hospital.com"
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Manager Phone (Optional)</label>
                  <input
                    type="tel"
                    name="managerPhone"
                    value={reviewData.managerPhone}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Manager's phone number"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button
            style={{ ...styles.button, ...styles.buttonSecondary }}
            onClick={onClose}
          >
            Cancel
          </button>
          
          {hospital?.verificationStatus === 'pending' && (
            <>
              <button
                style={{ ...styles.button, ...styles.buttonDanger }}
                onClick={handleReject}
                disabled={loading}
              >
                {loading ? 'Processing...' : '❌ Reject'}
              </button>
              <button
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={handleApprove}
                disabled={loading || creatingManager}
              >
                {loading || creatingManager 
                  ? (creatingManager ? 'Creating Manager...' : 'Approving...')
                  : '✅ Approve Hospital'
                }
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalReviewModal;
