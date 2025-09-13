import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // ✅ Added useAuth import

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminLogin from './components/auth/AdminLogin';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import HospitalRegistrationForm from './components/hospital/HospitalRegistrationForm';
import HospitalDashboard from './pages/HospitalDashboard';
import HospitalLogin from './pages/HospitalLogin';
import StaffManagement from './pages/StaffManagement';

// Placeholder components
const HospitalsPage = () => (
  <div style={{ 
    minHeight: '80vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    color: '#64748b'
  }}>
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>
        🏥 Find Hospitals
      </h2>
      <p>Search and explore our partner hospitals</p>
      <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Feature coming soon...</p>
    </div>
  </div>
);

const DoctorsPage = () => (
  <div style={{ 
    minHeight: '80vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    color: '#64748b'
  }}>
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>
        👨‍⚕️ Our Doctors
      </h2>
      <p>Browse our network of expert doctors</p>
      <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Feature coming soon...</p>
    </div>
  </div>
);

const AppointmentsPage = () => (
  <div style={{ 
    minHeight: '80vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    color: '#64748b'
  }}>
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>
        📅 My Appointments
      </h2>
      <p>Manage your appointments and medical history</p>
      <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Feature coming soon...</p>
    </div>
  </div>
);

// App Layout Component (for regular users with navbar/footer)
const AppLayout = ({ children }) => {
  const styles = {
    app: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    },
    main: {
      flex: 1
    }
  };
  
  return (
    <div style={styles.app}>
      <Navbar />
      <main style={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Dashboard Layout Component (no navbar/footer for admin/hospital dashboards)
const DashboardLayout = ({ children }) => {
  const styles = {
    app: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }
  };
  
  return (
    <div style={styles.app}>
      {children}
    </div>
  );
};

// ✅ Smart redirect component that redirects based on user role
const SmartRedirect = () => {
  const { isAuthenticated, user } = useAuth(); // ✅ Now useAuth is imported

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  switch (user?.role) {
    case 'hospital_manager':
      return <Navigate to="/hospital" replace />;
    case 'admin':
    case 'super_admin':
      return <Navigate to="/admin" replace />;
    case 'patient':
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ===================================================================== */}
          {/* PUBLIC ROUTES */}
          {/* ===================================================================== */}
          
          {/* Main Public Routes */}
          <Route path="/" element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          } />
          
          <Route path="/hospitals" element={
            <AppLayout>
              <HospitalsPage />
            </AppLayout>
          } />
          
          <Route path="/doctors" element={
            <AppLayout>
              <DoctorsPage />
            </AppLayout>
          } />

          {/* ===================================================================== */}
          {/* AUTHENTICATION ROUTES */}
          {/* ===================================================================== */}

          {/* Patient Authentication */}
          <Route path="/login" element={
            <AppLayout>
              <Login />
            </AppLayout>
          } />
          
          <Route path="/register" element={
            <AppLayout>
              <Register />
            </AppLayout>
          } />

          {/* Hospital Authentication */}
          <Route path="/hospital/login" element={<HospitalLogin />} />
          
          <Route path="/hospital/register" element={
            <AppLayout>
              <HospitalRegistrationForm />
            </AppLayout>
          } />

          {/* Admin Authentication */}
          <Route path="/admin/login" element={
            <DashboardLayout>
              <AdminLogin />
            </DashboardLayout>
          } />

          {/* ===================================================================== */}
          {/* PROTECTED ROUTES - HOSPITAL */}
          {/* ===================================================================== */}

          {/* ✅ HOSPITAL DASHBOARD - Main hospital route */}
          <Route path="/hospital" element={
            <ProtectedRoute roles={['hospital_manager']}>
              <DashboardLayout>
                <HospitalDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* ✅ HOSPITAL DASHBOARD - Alternative path */}
          <Route path="/hospital/dashboard" element={
            <ProtectedRoute roles={['hospital_manager']}>
              <DashboardLayout>
                <HospitalDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Hospital Staff Management */}
          <Route path="/hospital/staff" element={
            <ProtectedRoute roles={['hospital_manager', 'admin', 'super_admin']}>
              <DashboardLayout>
                <StaffManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* ===================================================================== */}
          {/* PROTECTED ROUTES - ADMIN */}
          {/* ===================================================================== */}

          <Route path="/admin" element={
            <ProtectedRoute roles={['admin', 'super_admin']}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin', 'super_admin']}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* ===================================================================== */}
          {/* PROTECTED ROUTES - PATIENT */}
          {/* ===================================================================== */}

          <Route path="/dashboard" element={
            <ProtectedRoute roles={['patient']}>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/appointments" element={
            <ProtectedRoute roles={['patient']}>
              <AppLayout>
                <AppointmentsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* ===================================================================== */}
          {/* ROLE-BASED REDIRECTS */}
          {/* ===================================================================== */}

          {/* Smart Profile Redirect - redirects based on user role */}
          <Route path="/profile" element={<SmartRedirect />} />

          {/* ===================================================================== */}
          {/* ERROR HANDLING */}
          {/* ===================================================================== */}
          
          {/* 404 Page */}
          <Route path="*" element={
            <AppLayout>
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <div style={{ marginTop: '2rem' }}>
                  <a href="/" style={{ 
                    color: '#2563eb', 
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}>
                    ← Go back to home
                  </a>
                </div>
              </div>
            </AppLayout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
