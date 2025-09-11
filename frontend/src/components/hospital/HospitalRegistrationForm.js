import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const HospitalRegistrationForm = ({ onSubmitSuccess }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospitalName: '',
    registrationNumber: '',
    hospitalType: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    contactInfo: {
      phone: '',
      email: '',
      website: '',
      emergencyNumber: ''
    },
    departments: [],
    facilities: [],
    bedCount: {
      total: '',
      available: ''
    },
    operatingHours: {
      monday: { open: '09:00', close: '18:00', isOpen: true },
      tuesday: { open: '09:00', close: '18:00', isOpen: true },
      wednesday: { open: '09:00', close: '18:00', isOpen: true },
      thursday: { open: '09:00', close: '18:00', isOpen: true },
      friday: { open: '09:00', close: '18:00', isOpen: true },
      saturday: { open: '09:00', close: '14:00', isOpen: true },
      sunday: { open: '10:00', close: '14:00', isOpen: false }
    },
    partnershipAgreement: {
      accepted: false
    }
  });
  const [formErrors, setFormErrors] = useState({});

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const steps = [
    { number: 1, title: 'Basic Info', icon: '🏥' },
    { number: 2, title: 'Location', icon: '📍' },
    { number: 3, title: 'Contact & Services', icon: '📞' },
    { number: 4, title: 'Hours', icon: '⏰' },
    { number: 5, title: 'Agreement', icon: '📋' }
  ];

  const hospitalTypes = [
    'General Hospital',
    'Multi-specialty Hospital',
    'Specialized Hospital',
    'Clinic',
    'Laboratory',
    'Diagnostic Center'
  ];

  const availableDepartments = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
    'Gynecology', 'Dermatology', 'Ophthalmology', 'ENT',
    'Psychiatry', 'General Surgery', 'Internal Medicine',
    'Radiology', 'Emergency Medicine'
  ];

  const availableFacilities = [
    'Emergency Care', 'ICU', 'Operation Theater', 'X-Ray',
    'CT Scan', 'MRI', 'Laboratory', 'Pharmacy',
    'Blood Bank', 'Dialysis', 'Maternity Ward', 'Pediatric Care'
  ];

  // Event handlers remain the same as before
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }));
  };

  const validateStep = (stepNumber) => {
    const errors = {};

    switch (stepNumber) {
      case 1:
        if (!formData.hospitalName.trim()) errors.hospitalName = 'Hospital name is required';
        if (!formData.registrationNumber.trim()) errors.registrationNumber = 'Registration number is required';
        if (!formData.hospitalType) errors.hospitalType = 'Hospital type is required';
        break;
      case 2:
        if (!formData.location.address.trim()) errors['location.address'] = 'Address is required';
        if (!formData.location.city.trim()) errors['location.city'] = 'City is required';
        if (!formData.location.state.trim()) errors['location.state'] = 'State is required';
        if (!formData.location.pincode.trim()) errors['location.pincode'] = 'Pincode is required';
        else if (!/^[1-9][0-9]{5}$/.test(formData.location.pincode)) {
          errors['location.pincode'] = 'Please enter a valid pincode';
        }
        break;
      case 3:
        if (!formData.contactInfo.phone.trim()) errors['contactInfo.phone'] = 'Phone number is required';
        else if (!/^[6-9]\d{9}$/.test(formData.contactInfo.phone)) {
          errors['contactInfo.phone'] = 'Please enter a valid phone number';
        }
        if (!formData.contactInfo.email.trim()) errors['contactInfo.email'] = 'Email is required';
        else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.contactInfo.email)) {
          errors['contactInfo.email'] = 'Please enter a valid email';
        }
        if (formData.departments.length === 0) errors.departments = 'Please select at least one department';
        break;
      case 5:
        if (!formData.partnershipAgreement.accepted) {
          errors.agreement = 'You must accept the partnership agreement';
        }
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/hospitals/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`🎉 Hospital Registration Successful!\n\n🏥 Hospital: ${data.hospital.hospitalName}\n📋 Registration: ${data.hospital.registrationNumber}\n📊 Status: ${data.hospital.verificationStatus}\n\n✅ Your application has been submitted for admin review. You will be notified once approved.`);
        
        if (onSubmitSuccess) {
          onSubmitSuccess(data.hospital);
        }
      } else {
        setFormErrors({ submit: data.message });
      }
    } catch (error) {
      console.error('Hospital registration error:', error);
      setFormErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div style={styles.stepContent}>
            <h3 style={styles.stepHeading}>Basic Hospital Information</h3>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Hospital Name *</label>
              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(formErrors.hospitalName ? styles.inputError : {})
                }}
                placeholder="Enter your hospital's full name"
              />
              {formErrors.hospitalName && <div style={styles.errorText}>{formErrors.hospitalName}</div>}
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Registration Number *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    ...(formErrors.registrationNumber ? styles.inputError : {})
                  }}
                  placeholder="Hospital registration number"
                />
                {formErrors.registrationNumber && <div style={styles.errorText}>{formErrors.registrationNumber}</div>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Hospital Type *</label>
                <select
                  name="hospitalType"
                  value={formData.hospitalType}
                  onChange={handleInputChange}
                  style={{
                    ...styles.select,
                    ...(formErrors.hospitalType ? styles.inputError : {})
                  }}
                >
                  <option value="">Select hospital type</option>
                  {hospitalTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {formErrors.hospitalType && <div style={styles.errorText}>{formErrors.hospitalType}</div>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div style={styles.stepContent}>
            <h3 style={styles.stepHeading}>Location Information</h3>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Complete Address *</label>
              <textarea
                name="location.address"
                value={formData.location.address}
                onChange={handleInputChange}
                style={{
                  ...styles.textarea,
                  ...(formErrors['location.address'] ? styles.inputError : {})
                }}
                placeholder="Enter complete hospital address"
                rows="3"
              />
              {formErrors['location.address'] && <div style={styles.errorText}>{formErrors['location.address']}</div>}
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>City *</label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    ...(formErrors['location.city'] ? styles.inputError : {})
                  }}
                  placeholder="City"
                />
                {formErrors['location.city'] && <div style={styles.errorText}>{formErrors['location.city']}</div>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>State *</label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    ...(formErrors['location.state'] ? styles.inputError : {})
                  }}
                  placeholder="State"
                />
                {formErrors['location.state'] && <div style={styles.errorText}>{formErrors['location.state']}</div>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Pincode *</label>
                <input
                  type="text"
                  name="location.pincode"
                  value={formData.location.pincode}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    ...(formErrors['location.pincode'] ? styles.inputError : {})
                  }}
                  placeholder="123456"
                />
                {formErrors['location.pincode'] && <div style={styles.errorText}>{formErrors['location.pincode']}</div>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div style={styles.stepContent}>
            <h3 style={styles.stepHeading}>Contact Information & Services</h3>
            
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number *</label>
                <input
                  type="tel"
                  name="contactInfo.phone"
                  value={formData.contactInfo.phone}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    ...(formErrors['contactInfo.phone'] ? styles.inputError : {})
                  }}
                  placeholder="9876543210"
                />
                {formErrors['contactInfo.phone'] && <div style={styles.errorText}>{formErrors['contactInfo.phone']}</div>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address *</label>
                <input
                  type="email"
                  name="contactInfo.email"
                  value={formData.contactInfo.email}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    ...(formErrors['contactInfo.email'] ? styles.inputError : {})
                  }}
                  placeholder="hospital@example.com"
                />
                {formErrors['contactInfo.email'] && <div style={styles.errorText}>{formErrors['contactInfo.email']}</div>}
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Website</label>
                <input
                  type="url"
                  name="contactInfo.website"
                  value={formData.contactInfo.website}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="https://www.hospital.com"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Emergency Contact</label>
                <input
                  type="tel"
                  name="contactInfo.emergencyNumber"
                  value={formData.contactInfo.emergencyNumber}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Emergency number"
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Medical Departments * <span style={styles.helperText}>(Select all that apply)</span></label>
              <div style={styles.checkboxGrid}>
                {availableDepartments.map(dept => (
                  <label key={dept} style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.departments.includes(dept)}
                      onChange={() => handleArrayChange('departments', dept)}
                      style={styles.checkbox}
                    />
                    {dept}
                  </label>
                ))}
              </div>
              {formErrors.departments && <div style={styles.errorText}>{formErrors.departments}</div>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Hospital Facilities <span style={styles.helperText}>(Optional)</span></label>
              <div style={styles.checkboxGrid}>
                {availableFacilities.map(facility => (
                  <label key={facility} style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.facilities.includes(facility)}
                      onChange={() => handleArrayChange('facilities', facility)}
                      style={styles.checkbox}
                    />
                    {facility}
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Total Beds</label>
                <input
                  type="number"
                  name="bedCount.total"
                  value={formData.bedCount.total}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Total number of beds"
                  min="1"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Currently Available Beds</label>
                <input
                  type="number"
                  name="bedCount.available"
                  value={formData.bedCount.available}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Available beds"
                  min="0"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div style={styles.stepContent}>
            <h3 style={styles.stepHeading}>Operating Hours</h3>
            <p style={styles.helperText}>Set your hospital's operating hours for each day of the week</p>
            
            <div style={styles.scheduleContainer}>
              {Object.keys(formData.operatingHours).map(day => (
                <div key={day} style={styles.scheduleRow}>
                  <div style={styles.dayLabel}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </div>
                  
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.operatingHours[day].isOpen}
                      onChange={(e) => handleOperatingHoursChange(day, 'isOpen', e.target.checked)}
                      style={styles.checkbox}
                    />
                    Open
                  </label>

                  {formData.operatingHours[day].isOpen && (
                    <div style={styles.timeContainer}>
                      <input
                        type="time"
                        value={formData.operatingHours[day].open}
                        onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                        style={styles.timeInput}
                      />
                      <span style={styles.timeTo}>to</span>
                      <input
                        type="time"
                        value={formData.operatingHours[day].close}
                        onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                        style={styles.timeInput}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div style={styles.stepContent}>
            <h3 style={styles.stepHeading}>Partnership Agreement</h3>
            
            <div style={styles.agreementContainer}>
              <div style={styles.agreementHeader}>
                <h4>Carespot Hospital Partnership Terms</h4>
              </div>
              <div style={styles.agreementContent}>
                <div style={styles.agreementSection}>
                  <h5>Partnership Benefits:</h5>
                  <ul>
                    <li>Access to Carespot's extensive patient network</li>
                    <li>Integrated online appointment booking system</li>
                    <li>Digital marketing and promotional support</li>
                    <li>Patient feedback and rating management system</li>
                    <li>24/7 technical support</li>
                  </ul>
                </div>

                <div style={styles.agreementSection}>
                  <h5>Hospital Responsibilities:</h5>
                  <ul>
                    <li>Maintain high-quality healthcare standards</li>
                    <li>Provide accurate and up-to-date service information</li>
                    <li>Honor all appointments booked through the platform</li>
                    <li>Maintain professional conduct with all patients</li>
                    <li>Comply with all applicable healthcare regulations</li>
                  </ul>
                </div>

                <div style={styles.agreementSection}>
                  <h5>Partnership Fees:</h5>
                  <ul>
                    <li>Basic Partnership: ₹2,000 per month</li>
                    <li>Premium Partnership: ₹5,000 per month</li>
                    <li>Transaction Fee: 2% on appointments booked through platform</li>
                    <li>Setup Fee: One-time ₹1,000 (waived for first 100 partners)</li>
                  </ul>
                </div>

                <div style={styles.agreementSection}>
                  <h5>Terms & Conditions:</h5>
                  <ul>
                    <li>Minimum 12-month partnership commitment</li>
                    <li>30-day notice period required for termination</li>
                    <li>Compliance with healthcare regulations mandatory</li>
                    <li>Regular quality audits may be conducted</li>
                  </ul>
                </div>
              </div>
            </div>

            <div style={styles.consentContainer}>
              <label style={styles.consentLabel}>
                <input
                  type="checkbox"
                  name="partnershipAgreement.accepted"
                  checked={formData.partnershipAgreement.accepted}
                  onChange={handleInputChange}
                  style={styles.checkbox}
                />
                I have read, understood, and agree to the Carespot Hospital Partnership Terms and Conditions *
              </label>
              {formErrors.agreement && <div style={styles.errorText}>{formErrors.agreement}</div>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Clean, modern styles
  const styles = {
    container: {
      maxWidth: '700px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      lineHeight: '1.5'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #e5e5e5'
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    subtitle: {
      color: '#7f8c8d',
      fontSize: '1rem',
      fontWeight: '400'
    },
    progressContainer: {
      marginBottom: '2rem'
    },
    progressBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      position: 'relative'
    },
    progressLine: {
      position: 'absolute',
      top: '15px',
      left: '0',
      right: '0',
      height: '2px',
      backgroundColor: '#e5e5e5',
      zIndex: 1
    },
    step: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flex: 1,
      position: 'relative',
      zIndex: 2
    },
    stepIcon: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.9rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      transition: 'all 0.3s ease',
      backgroundColor: '#f8f9fa',
      color: '#6c757d',
      border: '2px solid #e5e5e5'
    },
    stepIconActive: {
      backgroundColor: '#007bff',
      color: '#ffffff',
      borderColor: '#007bff',
      transform: 'scale(1.1)'
    },
    stepIconCompleted: {
      backgroundColor: '#28a745',
      color: '#ffffff',
      borderColor: '#28a745'
    },
    stepTitle: {
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#6c757d',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    stepContent: {
      minHeight: '400px'
    },
    stepHeading: {
      fontSize: '1.3rem',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '1.5rem',
      paddingBottom: '0.5rem',
      borderBottom: '2px solid #e5e5e5'
    },
    inputGroup: {
      marginBottom: '1.2rem'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem'
    },
    label: {
      display: 'block',
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#495057',
      marginBottom: '0.4rem'
    },
    helperText: {
      fontWeight: '400',
      color: '#6c757d',
      fontSize: '0.8rem'
    },
    input: {
      width: '100%',
      padding: '0.6rem 0.8rem',
      border: '1px solid #ced4da',
      borderRadius: '6px',
      fontSize: '0.9rem',
      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
      boxSizing: 'border-box',
      backgroundColor: '#ffffff'
    },
    textarea: {
      width: '100%',
      padding: '0.6rem 0.8rem',
      border: '1px solid #ced4da',
      borderRadius: '6px',
      fontSize: '0.9rem',
      resize: 'vertical',
      fontFamily: 'inherit',
      lineHeight: '1.4',
      boxSizing: 'border-box',
      backgroundColor: '#ffffff'
    },
    select: {
      width: '100%',
      padding: '0.6rem 0.8rem',
      border: '1px solid #ced4da',
      borderRadius: '6px',
      fontSize: '0.9rem',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      boxSizing: 'border-box'
    },
    inputError: {
      borderColor: '#dc3545',
      boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'
    },
    errorText: {
      color: '#dc3545',
      fontSize: '0.8rem',
      marginTop: '0.3rem',
      fontWeight: '400'
    },
    checkboxGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '0.6rem',
      marginTop: '0.5rem'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.85rem',
      color: '#495057',
      cursor: 'pointer',
      padding: '0.3rem',
      borderRadius: '4px',
      transition: 'background-color 0.2s ease'
    },
    checkbox: {
      marginRight: '0.5rem',
      cursor: 'pointer'
    },
    scheduleContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8rem'
    },
    scheduleRow: {
      display: 'grid',
      gridTemplateColumns: '100px 80px 1fr',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.8rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px',
      border: '1px solid #e5e5e5'
    },
    dayLabel: {
      fontWeight: '600',
      color: '#495057',
      fontSize: '0.9rem'
    },
    timeContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    timeInput: {
      padding: '0.4rem 0.6rem',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      fontSize: '0.8rem'
    },
    timeTo: {
      color: '#6c757d',
      fontSize: '0.8rem'
    },
    agreementContainer: {
      border: '1px solid #e5e5e5',
      borderRadius: '8px',
      marginBottom: '1.5rem'
    },
    agreementHeader: {
      backgroundColor: '#f8f9fa',
      padding: '1rem',
      borderBottom: '1px solid #e5e5e5',
      borderRadius: '8px 8px 0 0'
    },
    agreementContent: {
      padding: '1rem',
      maxHeight: '300px',
      overflowY: 'auto',
      fontSize: '0.85rem',
      lineHeight: '1.5'
    },
    agreementSection: {
      marginBottom: '1rem'
    },
    consentContainer: {
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px',
      border: '1px solid #e5e5e5'
    },
    consentLabel: {
      display: 'flex',
      alignItems: 'flex-start',
      fontSize: '0.9rem',
      color: '#495057',
      cursor: 'pointer',
      lineHeight: '1.4'
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '1rem',
      marginTop: '2rem',
      paddingTop: '1rem',
      borderTop: '1px solid #e5e5e5'
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '6px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      minWidth: '120px'
    },
    buttonPrimary: {
      backgroundColor: '#007bff',
      color: '#ffffff'
    },
    buttonSecondary: {
      backgroundColor: '#6c757d',
      color: '#ffffff'
    },
    buttonSuccess: {
      backgroundColor: '#28a745',
      color: '#ffffff'
    },
    buttonDisabled: {
      backgroundColor: '#e9ecef',
      color: '#6c757d',
      cursor: 'not-allowed'
    },
    submitError: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '0.75rem',
      borderRadius: '6px',
      marginBottom: '1rem',
      fontSize: '0.9rem',
      border: '1px solid #f5c6cb'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          🏥 Hospital Partnership Registration
        </h1>
        <p style={styles.subtitle}>Join the Carespot healthcare network</p>
      </div>

      {/* Progress Indicator */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={styles.progressLine}></div>
          {steps.map((step) => (
            <div key={step.number} style={styles.step}>
              <div
                style={{
                  ...styles.stepIcon,
                  ...(currentStep === step.number
                    ? styles.stepIconActive
                    : currentStep > step.number
                    ? styles.stepIconCompleted
                    : {})
                }}
              >
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <div style={styles.stepTitle}>{step.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={(e) => e.preventDefault()}>
        {renderStepContent()}

        {/* Submit Error */}
        {formErrors.submit && (
          <div style={styles.submitError}>
            ⚠️ {formErrors.submit}
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            style={{
              ...styles.button,
              ...(currentStep === 1 ? styles.buttonDisabled : styles.buttonSecondary)
            }}
          >
            ← Previous
          </button>

          {currentStep === steps.length ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.partnershipAgreement.accepted}
              style={{
                ...styles.button,
                ...(loading || !formData.partnershipAgreement.accepted 
                  ? styles.buttonDisabled 
                  : styles.buttonSuccess)
              }}
            >
              {loading ? '⏳ Submitting...' : '✅ Submit Application'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              style={{
                ...styles.button,
                ...styles.buttonPrimary
              }}
            >
              Next →
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default HospitalRegistrationForm;
