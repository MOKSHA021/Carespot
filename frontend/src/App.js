import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

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

// Temporary placeholder components
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

const NotFoundPage = () => (
  <div style={{ 
    minHeight: '80vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    textAlign: 'center'
  }}>
    <div>
      <h1 style={{ fontSize: '6rem', marginBottom: '1rem', color: '#ef4444' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>Page Not Found</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a 
        href="/"
        style={{
          backgroundColor: '#2563eb',
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '0.875rem',
          fontWeight: '600',
          transition: 'all 0.2s ease'
        }}
      >
        Go Back Home
      </a>
    </div>
  </div>
);

// App Layout Component (for regular users)
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

// Admin Layout Component (no navbar/footer for admin pages)
const AdminLayout = ({ children }) => {
  const styles = {
    app: {
      minHeight: '100vh'
    }
  };

  return (
    <div style={styles.app}>
      {children}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          } />
          
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

          {/* ✅ FIXED: Hospital Registration - Now PUBLIC (No ProtectedRoute) */}
          <Route path="/hospital/register" element={
            <AppLayout>
              <HospitalRegistrationForm />
            </AppLayout>
          } />

          {/* Admin Routes */}
          <Route path="/admin/login" element={
            <AdminLayout>
              <AdminLogin />
            </AdminLayout>
          } />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* Hospital Dashboard - Protected (for existing hospital managers) */}
          <Route path="/hospital/dashboard" element={
            <ProtectedRoute roles={['hospital_manager']}>
              <AdminLayout>
                <HospitalDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* Protected User Routes */}
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

          {/* Redirect old paths */}
          <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 Page */}
          <Route path="*" element={
            <AppLayout>
              <NotFoundPage />
            </AppLayout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
