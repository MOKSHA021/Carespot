import React, { useState, useEffect } from 'react';
import CreateAdminForm from './CreateAdminForm';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAdmins();
  }, [currentPage]);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/my-admins?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminCreated = (newAdmin) => {
    setAdmins(prev => [newAdmin, ...prev]);
    alert(`✅ Admin created successfully!\n\nEmail: ${newAdmin.email}\nPassword: ${newAdmin.tempPassword}\n\n⚠️ Please share these credentials securely with the new admin.`);
  };

  const toggleAdminStatus = async (adminId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/admins/${adminId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        fetchAdmins(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
    }
  };

  const deleteAdmin = async (adminId, adminName) => {
    if (window.confirm(`Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/admins/${adminId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchAdmins(); // Refresh the list
          alert('Admin user deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting admin:', error);
      }
    }
  };

  const styles = {
    container: {
      padding: '2rem',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif"
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#1e293b'
    },
    createButton: {
      backgroundColor: '#10b981',
      color: '#ffffff',
      padding: '0.75rem 1.5rem',
      borderRadius: '12px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    adminGrid: {
      display: 'grid',
      gap: '1.5rem'
    },
    adminCard: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    },
    adminHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    adminName: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1e293b'
    },
    adminEmail: {
      color: '#64748b',
      fontSize: '0.875rem',
      marginBottom: '0.25rem'
    },
    adminPhone: {
      color: '#64748b',
      fontSize: '0.875rem'
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    activeBadge: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    inactiveBadge: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    },
    adminLevel: {
      color: '#7c3aed',
      fontSize: '0.875rem',
      fontWeight: '600',
      textTransform: 'capitalize'
    },
    adminActions: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '1.5rem'
    },
    actionButton: {
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      border: 'none',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    toggleButton: {
      backgroundColor: '#f59e0b',
      color: '#ffffff'
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      color: '#ffffff'
    },
    emptyState: {
      textAlign: 'center',
      color: '#64748b',
      padding: '3rem',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '2rem'
    },
    pageButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600'
    },
    activePageButton: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
      borderColor: '#2563eb'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div>Loading admin users...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Admin Management</h1>
        <button
          style={styles.createButton}
          onClick={() => setShowCreateForm(true)}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#059669';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#10b981';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ➕ Create New Admin
        </button>
      </div>

      <div style={styles.adminGrid}>
        {admins.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
            <h3>No Admin Users Created</h3>
            <p>Click "Create New Admin" to add your first admin user.</p>
          </div>
        ) : (
          admins.map((admin) => (
            <div key={admin._id} style={styles.adminCard}>
              <div style={styles.adminHeader}>
                <div>
                  <div style={styles.adminName}>👤 {admin.name}</div>
                  <div style={styles.adminEmail}>📧 {admin.email}</div>
                  <div style={styles.adminPhone}>📱 {admin.phone}</div>
                  <div style={styles.adminLevel}>🛡️ {admin.adminLevel?.replace('_', ' ')}</div>
                </div>
                <div
                  style={{
                    ...styles.statusBadge,
                    ...(admin.isActive ? styles.activeBadge : styles.inactiveBadge)
                  }}
                >
                  {admin.isActive ? '✅ Active' : '❌ Inactive'}
                </div>
              </div>

              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                📅 Created: {new Date(admin.createdAt).toLocaleDateString()}<br />
                🔐 Permissions: {admin.permissions?.join(', ') || 'None'}
              </div>

              <div style={styles.adminActions}>
                <button
                  style={{ ...styles.actionButton, ...styles.toggleButton }}
                  onClick={() => toggleAdminStatus(admin._id, admin.isActive)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = admin.isActive ? '#dc2626' : '#059669';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f59e0b';
                  }}
                >
                  {admin.isActive ? '🚫 Deactivate' : '✅ Activate'}
                </button>
                
                <button
                  style={{ ...styles.actionButton, ...styles.deleteButton }}
                  onClick={() => deleteAdmin(admin._id, admin.name)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ef4444';
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              style={{
                ...styles.pageButton,
                ...(currentPage === page ? styles.activePageButton : {})
              }}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateForm && (
        <CreateAdminForm
          onAdminCreated={handleAdminCreated}
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};

export default AdminManagement;
