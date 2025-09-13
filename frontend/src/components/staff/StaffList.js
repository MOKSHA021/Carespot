import React from 'react';

const StaffList = ({ staff, onEdit, onDelete }) => {
  if (!staff || staff.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>👥</div>
        <h3>No Staff Members Found</h3>
        <p>Start by adding doctors for consultations and receptionists for appointment management.</p>
      </div>
    );
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor': return '👨‍⚕️';
      case 'receptionist': return '👩‍💼';
      default: return '👤';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'doctor': return '#3b82f6';
      case 'receptionist': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatAvailability = (availability, workingHours, role) => {
    if (role === 'doctor' && availability && availability.length > 0) {
      return availability
        .filter(slot => slot.isAvailable)
        .map(slot => `${slot.day}: ${slot.startTime}-${slot.endTime}`)
        .join(', ');
    } else if (role === 'receptionist' && workingHours) {
      const days = workingHours.workingDays ? workingHours.workingDays.join(', ') : 'Not set';
      const hours = workingHours.startTime && workingHours.endTime 
        ? `${workingHours.startTime}-${workingHours.endTime}` 
        : 'Not set';
      return `${days} (${hours})`;
    }
    return 'Not set';
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {staff.map((member) => (
          <div key={member._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.memberInfo}>
                <div style={styles.avatar}>
                  {getRoleIcon(member.role)}
                </div>
                <div>
                  <h3 style={styles.memberName}>
                    {member.role === 'doctor' ? 'Dr.' : ''} {member.firstName} {member.lastName}
                  </h3>
                  <div 
                    style={{
                      ...styles.roleBadge,
                      backgroundColor: getRoleBadgeColor(member.role) + '20',
                      color: getRoleBadgeColor(member.role)
                    }}
                  >
                    {member.role === 'doctor' && member.specialization 
                      ? member.specialization 
                      : member.role.charAt(0).toUpperCase() + member.role.slice(1)
                    }
                  </div>
                </div>
              </div>
              <div style={styles.actions}>
                <button
                  style={styles.editButton}
                  onClick={() => onEdit(member)}
                  title="Edit Staff Member"
                >
                  ✏️
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => onDelete(member._id)}
                  title="Remove Staff Member"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.contactInfo}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>📧 Email:</span>
                  <span style={styles.infoValue}>{member.email}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>📞 Phone:</span>
                  <span style={styles.infoValue}>{member.phone}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>🏢 Department:</span>
                  <span style={styles.infoValue}>{member.department}</span>
                </div>
                
                {/* ✅ ROLE-SPECIFIC INFORMATION */}
                {member.role === 'doctor' && (
                  <>
                    {member.qualifications && (
                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>🎓 Qualifications:</span>
                        <span style={styles.infoValue}>{member.qualifications}</span>
                      </div>
                    )}
                    {member.licenseNumber && (
                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>📋 License:</span>
                        <span style={styles.infoValue}>{member.licenseNumber}</span>
                      </div>
                    )}
                    {member.consultationFee && (
                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>💰 Consultation Fee:</span>
                        <span style={styles.infoValue}>₹{member.consultationFee}</span>
                      </div>
                    )}
                  </>
                )}

                {member.experienceYears > 0 && (
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>⏱️ Experience:</span>
                    <span style={styles.infoValue}>{member.experienceYears} years</span>
                  </div>
                )}
              </div>

              {/* ✅ AVAILABILITY/WORKING HOURS SECTION */}
              <div style={styles.availabilitySection}>
                <h4 style={styles.sectionTitle}>
                  📅 {member.role === 'doctor' ? 'Availability:' : 'Working Hours:'}
                </h4>
                <div style={styles.availabilityInfo}>
                  {formatAvailability(member.availability, member.workingHours, member.role)}
                </div>
              </div>

              {/* ✅ LANGUAGE SUPPORT */}
              {member.languages && member.languages.length > 0 && (
                <div style={styles.languageSection}>
                  <h4 style={styles.sectionTitle}>🗣️ Languages:</h4>
                  <div style={styles.languageList}>
                    {member.languages.map((lang, index) => (
                      <span key={index} style={styles.languageTag}>
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },
  memberInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem'
  },
  memberName: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 0.25rem 0'
  },
  roleBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  actions: {
    display: 'flex',
    gap: '0.5rem'
  },
  editButton: {
    padding: '0.5rem',
    border: 'none',
    borderRadius: '0.375rem',
    backgroundColor: '#f1f5f9',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '1rem'
  },
  deleteButton: {
    padding: '0.5rem',
    border: 'none',
    borderRadius: '0.375rem',
    backgroundColor: '#fef2f2',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '1rem'
  },
  cardBody: {
    space: '1rem'
  },
  contactInfo: {
    marginBottom: '1rem'
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #f1f5f9'
  },
  infoLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500'
  },
  infoValue: {
    fontSize: '0.875rem',
    color: '#1e293b',
    fontWeight: '500'
  },
  availabilitySection: {
    marginTop: '1rem'
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 0.75rem 0'
  },
  availabilityInfo: {
    fontSize: '0.875rem',
    color: '#64748b',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.375rem',
    border: '1px solid #e2e8f0'
  },
  languageSection: {
    marginTop: '1rem'
  },
  languageList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  languageTag: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    fontSize: '0.75rem',
    borderRadius: '0.375rem',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  }
};

export default StaffList;
