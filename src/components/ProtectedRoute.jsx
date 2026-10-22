import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#10b981',
          borderRadius: '50%',
        }} className="animate-spin" />
        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
          Verifying security credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="max-w-5xl" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#0f172a' }}>Access Restricted</h2>
          <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
            This page requires an account with the role: <strong>{allowedRoles.join(' or ')}</strong>.
            Your current logged-in role is <strong>{role}</strong>.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-secondary">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <Link
              to={role === 'DONOR' ? '/donor/dashboard' : role === 'NGO' ? '/ngo/dashboard' : '/admin/dashboard'}
              className="btn btn-primary"
            >
              Go to Your Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
