import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hospitalAPI, handleApiError } from '../../services/api';

const HospitalRegistrationForm = ({ onSubmitSuccess }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hospitalName: '',
    registrationNumber: '',
    hospitalType: 'general',
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
    services: [],
    bedCount: {
      total: '',
      available: ''
    },
    operatingHours: {
      weekdays: { open: '09:00', close: '18:00' },
      weekends: { open: '09:00', close: '16:00' },
      emergency24x7: false
    },
    partnershipAgreement: {
      accepted: false
    }
  });
  const [formErrors, setFormErrors] = useState({});

  const steps = [
    { number: 1, title: 'Basic Info', icon: '🏥' },
    { number: 2, title: 'Location', icon: '📍' },
    { number: 3, title: 'Contact & Services', icon: '📞' },
    { number: 4, title: 'Hours', icon: '⏰' },
    { number: 5, title: 'Agreement', icon: '📋' }
  ];

  const hospitalTypes = [
    { value: 'general', label: 'General Hospital' },
    { value: 'multispecialty', label: 'Multi-specialty Hospital' },
    { value: 'specialty', label: 'Specialized Hospital' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'emergency', label: 'Emergency Care' },
    { value: 'teaching', label: 'Teaching Hospital' }
  ];

  const availableDepartments = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
    'Gynecology', 'Dermatology', 'Ophthalmology', 'ENT',
    'Psychiatry', 'General Surgery', 'Internal Medicine',
    'Radiology', 'Emergency Medicine', 'General Medicine'
  ];

  const availableFacilities = [
    'Emergency Care', 'ICU', 'Operation Theater', 'X-Ray',
    'CT Scan', 'MRI', 'Laboratory', 'Pharmacy',
    'Blood Bank', 'Dialysis', 'Maternity Ward', 'Pediatric Care'
  ];

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

    // Clear error when user starts typing
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

  const validateStep = (stepNumber) => {
    const errors = {};

    switch (stepNumber) {
      case 1:
        if (!formData.hospitalName.trim()) {
          errors.hospitalName = 'Hospital name is required';
        }
        if (!formData.registrationNumber.trim()) {
          errors.registrationNumber = 'Registration number is required';
        }
        if (!formData.hospitalType) {
          errors.hospitalType = 'Hospital type is required';
        }
        break;
      case 2:
        if (!formData.location.address.trim()) {
          errors['location.address'] = 'Address is required';
        }
        if (!formData.location.city.trim()) {
          errors['location.city'] = 'City is required';
        }
        if (!formData.location.state.trim()) {
          errors['location.state'] = 'State is required';
        }
        if (!formData.location.pincode.trim()) {
          errors['location.pincode'] = 'Pincode is required';
        } else if (!/^[1-9][0-9]{5}$/.test(formData.location.pincode)) {
          errors['location.pincode'] = 'Please enter a valid 6-digit pincode';
        }
        break;
      case 3:
        if (!formData.contactInfo.phone.trim()) {
          errors['contactInfo.phone'] = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.contactInfo.phone)) {
          errors['contactInfo.phone'] = 'Please enter a valid 10-digit phone number';
        }
        if (!formData.contactInfo.email.trim()) {
          errors['contactInfo.email'] = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.email)) {
          errors['contactInfo.email'] = 'Please enter a valid email address';
        }
        if (formData.departments.length === 0) {
          errors.departments = 'Please select at least one department';
        }
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

  // ✅ Enhanced handleSubmit with better debugging
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);

    try {
      // ✅ DEBUG: Log the exact data being sent
      console.log('🔍 DEBUGGING: Form data before sending:');
      console.log('Raw formData:', JSON.stringify(formData, null, 2));
      
      console.log('🏥 Submitting hospital registration:', formData);
      
      const response = await hospitalAPI.register(formData);

      console.log('✅ Registration successful:', response.data);

      alert(`🎉 Hospital Registration Successful!\n\n🏥 Hospital: ${response.data.hospital.hospitalName}\n📋 Registration: ${response.data.hospital.registrationNumber}\n📊 Status: ${response.data.hospital.verificationStatus}\n\n✅ ${response.data.message}`);
      
      // Reset form
      setFormData({
        hospitalName: '',
        registrationNumber: '',
        hospitalType: 'general',
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
        services: [],
        bedCount: {
          total: '',
          available: ''
        },
        operatingHours: {
          weekdays: { open: '09:00', close: '18:00' },
          weekends: { open: '09:00', close: '16:00' },
          emergency24x7: false
        },
        partnershipAgreement: {
          accepted: false
        }
      });
      
      setCurrentStep(1);
      
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data.hospital);
      }
    } catch (error) {
      console.error('❌ Hospital registration error:', error);
      
      // ✅ ENHANCED DEBUG: Log complete error details
      if (error.response) {
        console.error('🚨 API Error Response:');
        console.error('Status:', error.response.status);
        console.error('Status Text:', error.response.statusText);
        console.error('Headers:', error.response.headers);
        console.error('Data:', error.response.data);
        
        // Show specific backend error message
        const errorMessage = error.response.data?.message || 'Unknown server error';
        const errorField = error.response.data?.field || 'unknown';
        
        setFormErrors({ 
          submit: errorMessage 
        });
        
        alert(`❌ Registration Failed\n\nError: ${errorMessage}\nField: ${errorField}\n\nPlease check the console for details.`);
      } else if (error.request) {
        console.error('🚨 Network Error - No Response:');
        console.error('Request:', error.request);
        const networkError = 'Network error - please check if the backend is running';
        setFormErrors({ 
          submit: networkError 
        });
        alert('❌ Network Error\n\nNo response from server. Please check if the backend is running.');
      } else {
        console.error('🚨 Request Setup Error:');
        console.error('Message:', error.message);
        const setupError = error.message;
        setFormErrors({ 
          submit: setupError 
        });
        alert(`❌ Request Error\n\n${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add test functions for debugging
  const testAPIConnection = async () => {
    try {
      console.log('🧪 Testing API connection...');
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      console.log('✅ API Connection successful:', data);
      alert('✅ API Connection Working!');
    } catch (error) {
      console.error('❌ API Connection failed:', error);
      alert('❌ Backend server is not running or not accessible');
    }
  };

  const testMinimalRegistration = async () => {
    const minimalData = {
      hospitalName: "Test Hospital " + Date.now(),
      registrationNumber: "TEST" + Date.now(),
      hospitalType: "general",
      location: {
        address: "Test Address",
        city: "Test City", 
        state: "Test State",
        pincode: "123456"
      },
      contactInfo: {
        phone: "9876543210",
        email: `test${Date.now()}@hospital.com`
      },
      departments: ["general"]
    };

    try {
      console.log('🧪 Testing minimal registration data:');
      console.log(JSON.stringify(minimalData, null, 2));
      
      const response = await hospitalAPI.register(minimalData);
      console.log('✅ Minimal test successful:', response.data);
      alert('✅ Minimal Registration Test Passed!');
    } catch (error) {
      console.error('❌ Minimal test failed:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
        alert(`❌ Test Failed: ${error.response.data.message}`);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div style={styles.stepContent}>
            <h3 style={styles.stepHeading}>Basic Hospital Information</h3>
            
            {/* ✅ Add test buttons for debugging */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                onClick={testAPIConnection}
                style={{...styles.button, ...styles.buttonSecondary, fontSize: '0.7rem', padding: '0.3rem 0.7rem'}}
              >
                🧪 Test API Connection
              </button>
              <button 
                type="button" 
                onClick={testMinimalRegistration}
                style={{...styles.button, ...styles.buttonSecondary, fontSize: '0.7rem', padding: '0.3rem 0.7rem'}}
              >
                🧪 Test Minimal Data
              </button>
            </div>
            
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
                    <option key={type.value} value={type.value}>{type.label}</option>
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
          </div>
        );

      case 4:
        return (
          <div style={styles.stepContent}>
            <h3 style={styles.stepHeading}>Operating Hours</h3>
            <p style={styles.helperText}>Set your hospital's operating hours</p>
            
            <div style={styles.scheduleContainer}>
              <div style={styles.scheduleRow}>
                <div style={styles.dayLabel}>Weekdays (Mon-Fri)</div>
                <div style={styles.timeContainer}>
                  <input
                    type="time"
                    value={formData.operatingHours.weekdays.open}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      operatingHours: {
                        ...prev.operatingHours,
                        weekdays: { ...prev.operatingHours.weekdays, open: e.target.value }
                      }
                    }))}
                    style={styles.timeInput}
                  />
                  <span style={styles.timeTo}>to</span>
                  <input
                    type="time"
                    value={formData.operatingHours.weekdays.close}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      operatingHours: {
                        ...prev.operatingHours,
                        weekdays: { ...prev.operatingHours.weekdays, close: e.target.value }
                      }
                    }))}
                    style={styles.timeInput}
                  />
                </div>
              </div>

              <div style={styles.scheduleRow}>
                <div style={styles.dayLabel}>Weekends (Sat-Sun)</div>
                <div style={styles.timeContainer}>
                  <input
                    type="time"
                    value={formData.operatingHours.weekends.open}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      operatingHours: {
                        ...prev.operatingHours,
                        weekends: { ...prev.operatingHours.weekends, open: e.target.value }
                      }
                    }))}
                    style={styles.timeInput}
                  />
                  <span style={styles.timeTo}>to</span>
                  <input
                    type="time"
                    value={formData.operatingHours.weekends.close}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      operatingHours: {
                        ...prev.operatingHours,
                        weekends: { ...prev.operatingHours.weekends, close: e.target.value }
                      }
                    }))}
                    style={styles.timeInput}
                  />
                </div>
              </div>

              <div style={styles.scheduleRow}>
                <div style={styles.dayLabel}>24/7 Emergency</div>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="operatingHours.emergency24x7"
                    checked={formData.operatingHours.emergency24x7}
                    onChange={handleInputChange}
                    style={styles.checkbox}
                  />
                  Available 24/7
                </label>
              </div>
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
                  <h5>Partnership Terms:</h5>
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
      gridTemplateColumns: '150px 1fr',
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
