import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { hospitalAPI } from '../services/api';

const StaffManagement = ({ hospitalId, onStaffUpdate }) => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (hospitalId) {
      fetchStaff();
    }
  }, [hospitalId]);

  useEffect(() => {
    filterStaff();
  }, [staff, activeTab, searchTerm]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await hospitalAPI.getHospitalStaff();
      if (response?.data?.success) {
        setStaff(response.data.staff);
        if (onStaffUpdate) onStaffUpdate();
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FILTER BY ROLE AND SEARCH
  const filterStaff = () => {
    let filtered = staff;

    // Filter by role or specialization
    if (activeTab !== 'all') {
      if (activeTab === 'doctor' || activeTab === 'receptionist') {
        filtered = filtered.filter(member => member.role === activeTab);
      } else {
        // Filter by specialization for doctors
        filtered = filtered.filter(member => 
          member.role === 'doctor' && 
          member.specialization?.toLowerCase().includes(activeTab.toLowerCase())
        );
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStaff(filtered);
  };

  const handleAddStaff = async (staffData) => {
    try {
      const dataToSend = {
        ...staffData,
        hospital: hospitalId
      };

      const response = await hospitalAPI.addStaffMember(dataToSend);
      if (response?.data?.success) {
        await fetchStaff();
        setShowAddForm(false);
        alert(`${staffData.role.charAt(0).toUpperCase() + staffData.role.slice(1)} added successfully!`);
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      alert(error.response?.data?.message || 'Failed to add staff member');
    }
  };

  const handleEditStaff = async (staffId, updatedData) => {
    try {
      const response = await hospitalAPI.updateStaffMember(staffId, updatedData);
      if (response?.data?.success) {
        await fetchStaff();
        setEditingStaff(null);
        alert('Staff member updated successfully!');
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      alert(error.response?.data?.message || 'Failed to update staff member');
    }
  };

  const handleDeleteStaff = async (staffId, staffRole) => {
    const confirmMessage = staffRole === 'doctor' 
      ? 'Are you sure you want to remove this doctor? They will no longer be available for patient consultations.'
      : 'Are you sure you want to remove this receptionist? They will no longer be able to manage appointments.';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await hospitalAPI.deleteStaffMember(staffId);
      if (response?.data?.success) {
        await fetchStaff();
        alert(`${staffRole.charAt(0).toUpperCase() + staffRole.slice(1)} removed successfully!`);
      }
    } catch (error) {
      console.error('Error removing staff:', error);
      alert(error.response?.data?.message || 'Failed to remove staff member');
    }
  };

  // ✅ GET ROLE STATISTICS
  const getRoleStats = () => {
    const stats = {
      all: staff.length,
      doctor: staff.filter(s => s.role === 'doctor').length,
      receptionist: staff.filter(s => s.role === 'receptionist').length,
      // Specialization counts
      general: staff.filter(s => s.specialization?.toLowerCase().includes('general')).length,
      cardiology: staff.filter(s => s.specialization?.toLowerCase().includes('cardiology')).length,
      neurology: staff.filter(s => s.specialization?.toLowerCase().includes('neurology')).length,
      pediatrics: staff.filter(s => s.specialization?.toLowerCase().includes('pediatrics')).length
    };
    return stats;
  };

  const styles = {
    container: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: '2px solid #e2e8f0'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1e293b',
      margin: 0
    },
    subtitle: {
      color: '#64748b',
      fontSize: '0.875rem',
      margin: '0.5rem 0 0 0'
    },
    addButton: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    searchContainer: {
      marginBottom: '1.5rem'
    },
    searchInput: {
      width: '100%',
      maxWidth: '400px',
      padding: '0.75rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '0.875rem',
      outline: 'none'
    },
    tabs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      borderBottom: '1px solid #e2e8f0',
      overflowX: 'auto'
    },
    tab: {
      padding: '0.75rem 1rem',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#64748b',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap'
    },
    activeTab: {
      color: '#10b981',
      borderBottomColor: '#10b981'
    },
    staffGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    staffCard: {
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1.5rem',
      backgroundColor: '#f8fafc',
      transition: 'all 0.2s ease'
    },
    staffHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    staffName: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '0.25rem'
    },
    staffRole: {
      fontSize: '0.875rem',
      color: '#10b981',
      fontWeight: '500',
      textTransform: 'capitalize'
    },
    staffInfo: {
      fontSize: '0.875rem',
      color: '#64748b',
      marginBottom: '0.5rem'
    },
    staffActions: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    actionButton: {
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    editButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      color: 'white'
    },
    loading: {
      textAlign: 'center',
      padding: '3rem',
      color: '#64748b'
    },
    emptyState: {
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
          <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>Loading staff members...</div>
        </div>
      </div>
    );
  }

  const roleStats = getRoleStats();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>👥 Staff Management</h2>
          <p style={styles.subtitle}>
            Manage doctors for consultations and receptionists for appointments ({staff.length} total staff)
          </p>
        </div>
        <button
          style={styles.addButton}
          onClick={() => setShowAddForm(true)}
        >
          ➕ Add Staff Member
        </button>
      </div>

      {/* Search */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search staff by name, email, role, or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* ✅ ENHANCED TABS FOR BOTH ROLES */}
      <div style={styles.tabs}>
        {[
          { key: 'all', label: '👥 All Staff', count: roleStats.all },
          { key: 'doctor', label: '👨‍⚕️ Doctors', count: roleStats.doctor },
          { key: 'receptionist', label: '👩‍💼 Receptionists', count: roleStats.receptionist },
          { key: 'general', label: '🩺 General Medicine', count: roleStats.general },
          { key: 'cardiology', label: '❤️ Cardiology', count: roleStats.cardiology },
          { key: 'neurology', label: '🧠 Neurology', count: roleStats.neurology },
          { key: 'pediatrics', label: '👶 Pediatrics', count: roleStats.pediatrics }
        ].map(tab => (
          <button
            key={tab.key}
            style={{
              ...styles.tab,
              ...(activeTab === tab.key ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* ✅ STAFF LIST WITH ROLE-SPECIFIC DISPLAY */}
      {filteredStaff.length > 0 ? (
        <div style={styles.staffGrid}>
          {filteredStaff.map((member) => (
            <div key={member._id} style={styles.staffCard}>
              <div style={styles.staffHeader}>
                <div>
                  <div style={styles.staffName}>
                    {member.role === 'doctor' ? 'Dr.' : ''} {member.firstName} {member.lastName}
                  </div>
                  <div style={styles.staffRole}>
                    {member.role === 'doctor' ? member.specialization : member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </div>
                </div>
              </div>
              
              <div style={styles.staffInfo}>
                📧 {member.email}
              </div>
              <div style={styles.staffInfo}>
                📞 {member.phone}
              </div>
              <div style={styles.staffInfo}>
                🏥 {member.department}
              </div>
              
              {/* ✅ ROLE-SPECIFIC INFORMATION */}
              {member.role === 'doctor' && (
                <>
                  <div style={styles.staffInfo}>
                    🎓 {member.qualifications}
                  </div>
                  <div style={styles.staffInfo}>
                    📋 License: {member.licenseNumber}
                  </div>
                  <div style={styles.staffInfo}>
                    💰 Fee: ₹{member.consultationFee || 500}
                  </div>
                </>
              )}
              
              <div style={styles.staffInfo}>
                💼 Experience: {member.experienceYears} years
              </div>

              <div style={styles.staffActions}>
                <button
                  style={{...styles.actionButton, ...styles.editButton}}
                  onClick={() => setEditingStaff(member)}
                >
                  ✏️ Edit
                </button>
                <button
                  style={{...styles.actionButton, ...styles.deleteButton}}
                  onClick={() => handleDeleteStaff(member._id, member.role)}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h4>No staff members found</h4>
          <p>
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Add doctors for patient consultations and receptionists for appointment management'
            }
          </p>
        </div>
      )}

      {/* ✅ ENHANCED ADD/EDIT MODALS */}
      {showAddForm && (
        <AddStaffModal
          onSave={handleAddStaff}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingStaff && (
        <EditStaffModal
          staff={editingStaff}
          onSave={(updatedData) => handleEditStaff(editingStaff._id, updatedData)}
          onCancel={() => setEditingStaff(null)}
        />
      )}
    </div>
  );
};

// ✅ ENHANCED ADD STAFF MODAL (BOTH ROLES)
const AddStaffModal = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'doctor',
    specialization: 'General Medicine',
    department: 'General Medicine',
    qualifications: '',
    experienceYears: 0,
    licenseNumber: '',
    consultationFee: 500,
    salary: '',
    languages: ['English', 'Hindi']
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const specializations = [
    'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
    'Gynecology', 'Dermatology', 'Psychiatry', 'Radiology', 'Anesthesiology',
    'Surgery', 'Oncology', 'Gastroenterology', 'Pulmonology', 'Nephrology',
    'Endocrinology', 'Ophthalmology', 'ENT', 'Urology'
  ];

  const departments = [
    'Reception', 'Administration', 'Emergency', 'Internal Medicine', 'Surgery', 
    'Pediatrics', 'Obstetrics & Gynecology', 'Orthopedics', 'Cardiology', 
    'Neurology', 'Radiology', 'Pathology', 'Anesthesiology', 'Oncology', 
    'Dermatology', 'Psychiatry', 'Ophthalmology', 'ENT', 'Urology', 'General Medicine'
  ];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>👥 Add New Staff Member</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
            
            {/* ✅ ROLE SELECTION */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({
                  ...formData, 
                  role: e.target.value,
                  department: e.target.value === 'receptionist' ? 'Reception' : 'General Medicine'
                })}
                required
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
              >
                <option value="doctor">👨‍⚕️ Doctor (Patient Consultations)</option>
                <option value="receptionist">👩‍💼 Receptionist (Appointment Management)</option>
              </select>
            </div>

            {/* Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  placeholder="10-digit mobile number"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* ✅ ROLE-SPECIFIC FIELDS */}
            {formData.role === 'doctor' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Specialization *</label>
                    <select
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      required
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                    >
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Consultation Fee</label>
                    <input
                      type="number"
                      value={formData.consultationFee}
                      onChange={(e) => setFormData({...formData, consultationFee: parseInt(e.target.value) || 500})}
                      min="0"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Medical Qualifications *</label>
                  <input
                    type="text"
                    value={formData.qualifications}
                    onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                    required
                    placeholder="MBBS, MD, etc."
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Medical License Number *</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                  />
                </div>
              </>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                >
                  {departments.filter(dept => {
                    if (formData.role === 'receptionist') {
                      return ['Reception', 'Administration'].includes(dept);
                    }
                    return !['Reception', 'Administration'].includes(dept);
                  }).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Experience (years)</label>
                <input
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({...formData, experienceYears: parseInt(e.target.value) || 0})}
                  min="0"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Salary (Optional)</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                min="0"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{ padding: '0.75rem 1.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '0.75rem 1.5rem', border: 'none', borderRadius: '6px', backgroundColor: '#10b981', color: 'white', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              Add {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ✅ EDIT STAFF MODAL (SIMPLIFIED FOR BREVITY)
const EditStaffModal = ({ staff, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: staff.firstName || '',
    lastName: staff.lastName || '',
    phone: staff.phone || '',
    specialization: staff.specialization || 'General Medicine',
    department: staff.department || 'General Medicine',
    qualifications: staff.qualifications || '',
    experienceYears: staff.experienceYears || 0,
    consultationFee: staff.consultationFee || 500,
    salary: staff.salary || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>
          ✏️ Edit {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
              />
            </div>

            {staff.role === 'doctor' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Consultation Fee</label>
                  <input
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({...formData, consultationFee: parseInt(e.target.value) || 500})}
                    min="0"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                  />
                </div>
              </>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Experience (years)</label>
                <input
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({...formData, experienceYears: parseInt(e.target.value) || 0})}
                  min="0"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Salary</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  min="0"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{ padding: '0.75rem 1.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '0.75rem 1.5rem', border: 'none', borderRadius: '6px', backgroundColor: '#3b82f6', color: 'white', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              Update {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffManagement;
