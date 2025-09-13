import React, { useState } from 'react';

const AddStaffForm = ({ hospitalId, onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    role: 'doctor', // Default to doctor
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Doctor-specific fields
    specialization: 'General Medicine',
    qualifications: '',
    experienceYears: 0,
    licenseNumber: '',
    consultationFee: 500,
    // Common fields
    department: 'General Medicine',
    salary: '',
    languages: ['English', 'Hindi'],
    // Availability/Working hours
    availability: [], // For doctors
    workingHours: { // For receptionists
      startTime: '08:00',
      endTime: '18:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // ✅ SPECIALIZATIONS FOR DOCTORS
  const specializations = [
    'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
    'Gynecology', 'Dermatology', 'Psychiatry', 'Radiology', 'Anesthesiology',
    'Surgery', 'Oncology', 'Gastroenterology', 'Pulmonology', 'Nephrology',
    'Endocrinology', 'Ophthalmology', 'ENT', 'Urology'
  ];

  // ✅ DEPARTMENTS BASED ON ROLE
  const getDepartments = (role) => {
    if (role === 'receptionist') {
      return ['Reception', 'Administration'];
    } else {
      return [
        'Emergency', 'Internal Medicine', 'Surgery', 'Pediatrics', 
        'Obstetrics & Gynecology', 'Orthopedics', 'Cardiology', 'Neurology',
        'Radiology', 'Pathology', 'Anesthesiology', 'Oncology', 'Dermatology',
        'Psychiatry', 'Ophthalmology', 'ENT', 'Urology', 'General Medicine'
      ];
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // ✅ HANDLE ROLE CHANGE
    if (name === 'role') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        // Reset role-specific fields
        department: value === 'receptionist' ? 'Reception' : 'General Medicine',
        specialization: value === 'doctor' ? 'General Medicine' : '',
        availability: value === 'doctor' ? [] : prev.availability,
        workingHours: value === 'receptionist' 
          ? { startTime: '08:00', endTime: '18:00', workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] }
          : prev.workingHours
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // ✅ HANDLE LANGUAGES
  const handleLanguageChange = (e) => {
    const languages = e.target.value.split(',').map(lang => lang.trim()).filter(lang => lang);
    setFormData(prev => ({ ...prev, languages }));
  };

  // ✅ AVAILABILITY MANAGEMENT (FOR DOCTORS)
  const handleAvailabilityChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map(slot => 
        slot.day === day 
          ? { ...slot, [field]: value }
          : slot
      )
    }));
  };

  const addAvailabilityDay = (day) => {
    if (!formData.availability.find(slot => slot.day === day)) {
      setFormData(prev => ({
        ...prev,
        availability: [...prev.availability, {
          day,
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true
        }]
      }));
    }
  };

  const removeAvailabilityDay = (day) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.filter(slot => slot.day !== day)
    }));
  };

  // ✅ WORKING HOURS MANAGEMENT (FOR RECEPTIONISTS)
  const handleWorkingDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        workingDays: prev.workingHours.workingDays.includes(day)
          ? prev.workingHours.workingDays.filter(d => d !== day)
          : [...prev.workingHours.workingDays, day]
      }
    }));
  };

  const handleWorkingHoursChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // ✅ COMMON VALIDATIONS
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be exactly 10 digits';
    }

    // ✅ ROLE-SPECIFIC VALIDATIONS
    if (formData.role === 'doctor') {
      if (!formData.specialization.trim()) {
        newErrors.specialization = 'Specialization is required for doctors';
      }
      if (!formData.qualifications.trim()) {
        newErrors.qualifications = 'Qualifications are required for doctors';
      }
      if (!formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'License number is required for doctors';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        hospital: hospitalId,
        languages: formData.languages.filter(lang => lang.trim() !== '')
      };

      // ✅ CLEAN UP UNUSED FIELDS BASED ON ROLE
      if (formData.role === 'receptionist') {
        delete dataToSubmit.specialization;
        delete dataToSubmit.qualifications;
        delete dataToSubmit.licenseNumber;
        delete dataToSubmit.consultationFee;
        delete dataToSubmit.availability;
      } else {
        delete dataToSubmit.workingHours;
      }

      await onAdd(dataToSubmit);
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('Error adding staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            ➕ Add New {formData.role === 'doctor' ? 'Doctor' : 'Receptionist'}
          </h2>
          <button style={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* ✅ ROLE SELECTION */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="doctor">👨‍⚕️ Doctor (Patient Consultations)</option>
              <option value="receptionist">👩‍💼 Receptionist (Appointment Management)</option>
            </select>
          </div>

          {/* ✅ BASIC INFO */}
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.firstName ? styles.inputError : {})
                }}
                placeholder="Enter first name"
              />
              {errors.firstName && <span style={styles.errorText}>{errors.firstName}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.email ? styles.inputError : {})
                }}
                placeholder="Enter email address"
              />
              {errors.email && <span style={styles.errorText}>{errors.email}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.phone ? styles.inputError : {})
                }}
                placeholder="10-digit mobile number"
              />
              {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
            </div>
          </div>

          {/* ✅ DOCTOR-SPECIFIC FIELDS */}
          {formData.role === 'doctor' && (
            <>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Specialization *</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    style={{
                      ...styles.select,
                      ...(errors.specialization ? styles.inputError : {})
                    }}
                  >
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  {errors.specialization && <span style={styles.errorText}>{errors.specialization}</span>}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Consultation Fee (₹)</label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    style={styles.input}
                    min="0"
                    placeholder="500"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Medical Qualifications *</label>
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.qualifications ? styles.inputError : {})
                  }}
                  placeholder="MBBS, MD, etc."
                />
                {errors.qualifications && <span style={styles.errorText}>{errors.qualifications}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Medical License Number *</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.licenseNumber ? styles.inputError : {})
                  }}
                  placeholder="Enter license number"
                />
                {errors.licenseNumber && <span style={styles.errorText}>{errors.licenseNumber}</span>}
              </div>
            </>
          )}

          {/* ✅ COMMON FIELDS */}
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                style={styles.select}
              >
                {getDepartments(formData.role).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Experience (years)</label>
              <input
                type="number"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                style={styles.input}
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Languages Spoken</label>
              <input
                type="text"
                value={formData.languages.join(', ')}
                onChange={handleLanguageChange}
                style={styles.input}
                placeholder="English, Hindi, etc. (comma-separated)"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Monthly Salary (₹)</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                style={styles.input}
                min="0"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* ✅ AVAILABILITY SECTION (DOCTORS) */}
          {formData.role === 'doctor' && (
            <div style={styles.availabilitySection}>
              <label style={styles.label}>📅 Doctor Availability</label>
              <p style={styles.helpText}>Select the days and times when this doctor is available for consultations</p>
              <div style={styles.availabilityControls}>
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const hasDay = formData.availability.find(slot => slot.day === day);
                      if (hasDay) {
                        removeAvailabilityDay(day);
                      } else {
                        addAvailabilityDay(day);
                      }
                    }}
                    style={{
                      ...styles.dayButton,
                      ...(formData.availability.find(slot => slot.day === day) ? 
                          styles.dayButtonActive : {})
                    }}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>

              {formData.availability.map(slot => (
                <div key={slot.day} style={styles.timeSlotRow}>
                  <span style={styles.dayLabel}>{slot.day}:</span>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => handleAvailabilityChange(slot.day, 'startTime', e.target.value)}
                    style={styles.timeInput}
                  />
                  <span style={styles.timeSeparator}>to</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => handleAvailabilityChange(slot.day, 'endTime', e.target.value)}
                    style={styles.timeInput}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ✅ WORKING HOURS SECTION (RECEPTIONISTS) */}
          {formData.role === 'receptionist' && (
            <div style={styles.availabilitySection}>
              <label style={styles.label}>🕒 Working Hours</label>
              <p style={styles.helpText}>Set the working schedule for this receptionist</p>
              
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.subLabel}>Start Time</label>
                  <input
                    type="time"
                    value={formData.workingHours.startTime}
                    onChange={(e) => handleWorkingHoursChange('startTime', e.target.value)}
                    style={styles.timeInput}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.subLabel}>End Time</label>
                  <input
                    type="time"
                    value={formData.workingHours.endTime}
                    onChange={(e) => handleWorkingHoursChange('endTime', e.target.value)}
                    style={styles.timeInput}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.subLabel}>Working Days</label>
                <div style={styles.availabilityControls}>
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleWorkingDayToggle(day)}
                      style={{
                        ...styles.dayButton,
                        ...(formData.workingHours.workingDays.includes(day) ? 
                            styles.dayButtonActive : {})
                      }}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Adding...' : `Add ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #e2e8f0'
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0.5rem'
  },
  form: {
    padding: '1.5rem'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '1rem'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  subLabel: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: '0.5rem'
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    transition: 'border-color 0.2s ease'
  },
  select: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  inputError: {
    borderColor: '#ef4444'
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ef4444',
    marginTop: '0.25rem'
  },
  helpText: {
    fontSize: '0.8125rem',
    color: '#64748b',
    marginBottom: '1rem',
    fontStyle: 'italic'
  },
  availabilitySection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0'
  },
  availabilityControls: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    flexWrap: 'wrap'
  },
  dayButton: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  dayButtonActive: {
    backgroundColor: '#10b981',
    color: 'white',
    borderColor: '#10b981'
  },
  timeSlotRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem'
  },
  dayLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    minWidth: '80px'
  },
  timeInput: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem'
  },
  timeSeparator: {
    fontSize: '0.875rem',
    color: '#64748b'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '2rem'
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    backgroundColor: '#10b981',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s ease'
  }
};

export default AddStaffForm;
