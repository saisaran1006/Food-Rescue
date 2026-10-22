import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Utensils,
  Building,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  HeartHandshake,
  ArrowRight,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { adminAPI } from '../../services/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      try {
        const res = await adminAPI.getDashboard();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminOverview();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          margin: '0 auto 1rem',
        }} className="animate-spin" />
        <p style={{ color: '#64748b' }}>Loading administrative intelligence...</p>
      </div>
    );
  }

  const donations = stats?.donations || {};
  const users = stats?.users || {};
  const recentActions = stats?.recent_actions || [];

  return (
    <div className="max-w-7xl" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
            System Administration
          </span>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginTop: '0.2rem' }}>
            Platform Command Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
            Real-time oversight of food donors, verified NGOs, surplus batches, and security audit logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/users" className="btn btn-primary btn-lg" style={{ backgroundColor: '#0f172a' }}>
            <Users size={18} /> User Verification ({users.pending_verifications || 0})
          </Link>
          <Link to="/admin/analytics" className="btn btn-secondary btn-lg">
            <BarChart3 size={18} /> Analytics & Reports
          </Link>
        </div>
      </div>

      {/* Pending Verifications Notice */}
      {parseInt(users.pending_verifications || 0) > 0 && (
        <div style={{
          backgroundColor: '#fefce8',
          border: '1px solid #fef08a',
          color: '#854d0e',
          padding: '1.25rem 1.5rem',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={24} color="#ca8a04" />
            <div>
              <strong>Action Required:</strong> {users.pending_verifications} new food donor / NGO accounts are awaiting identity & license verification.
            </div>
          </div>
          <Link to="/admin/users?status=PENDING" className="btn btn-secondary btn-sm" style={{ fontWeight: 700 }}>
            Review Pending Users →
          </Link>
        </div>
      )}

      {/* 10 Operational Metrics Grid (Requirement 18) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Total Users */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Users</span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>{users.total_users || 0}</div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Platform participants</span>
        </div>

        {/* Total Donors */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Total Donors</span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#059669', margin: '0.25rem 0' }}>{users.total_donors || 0}</div>
          <span style={{ fontSize: '0.75rem', color: '#059669' }}>Restaurants, Hotels, Mess</span>
        </div>

        {/* Total NGOs */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>Total NGOs</span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0284c7', margin: '0.25rem 0' }}>{users.total_ngos || 0}</div>
          <span style={{ fontSize: '0.75rem', color: '#0284c7' }}>Charity Foundations</span>
        </div>

        {/* Total Donations */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Batches</span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>{donations.total_donations || 0}</div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>All-time postings</span>
        </div>

        {/* Active Donations */}
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Active Batches</span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#15803d', margin: '0.25rem 0' }}>{donations.active_donations || 0}</div>
          <span style={{ fontSize: '0.75rem', color: '#166534' }}>In circulation</span>
        </div>

        {/* Completed Donations */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>Completed</span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0284c7', margin: '0.25rem 0' }}>{donations.completed_donations || 0}</div>
          <span style={{ fontSize: '0.75rem', color: '#0284c7' }}>Safely distributed</span>
        </div>

        {/* Cancelled */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>Cancelled</span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#ef4444', margin: '0.25rem 0' }}>{donations.cancelled_donations || 0}</div>
          <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Withdrawn</span>
        </div>

        {/* Expired */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Expired</span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#64748b', margin: '0.25rem 0' }}>{donations.expired_donations || 0}</div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Passed deadline</span>
        </div>

        {/* Food Quantity */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Quantity</span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#d97706', margin: '0.25rem 0' }}>
            {parseFloat(donations.completed_quantity_kg || 0).toFixed(0)} <span style={{ fontSize: '1rem' }}>kg</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#d97706' }}>Food rescued</span>
        </div>

        {/* Meals Rescued */}
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>Meals Rescued</span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1d4ed8', margin: '0.25rem 0' }}>{donations.meals_rescued || 0}</div>
          <span style={{ fontSize: '0.75rem', color: '#1e40af' }}>Direct servings</span>
        </div>
      </div>

      {/* Admin Action Shortcuts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.5rem',
      }}>
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>User Verification</h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Verify or suspend donor restaurants and collecting NGOs with audit logging.
          </p>
          <Link to="/admin/users" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            Manage Users ({users.total_users || 0}) →
          </Link>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Utensils size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>Donations Monitoring</h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Monitor real-time food batches, full lifecycle audit timelines, and pickup handovers.
          </p>
          <Link to="/admin/donations" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            View All Donations ({donations.total_donations || 0}) →
          </Link>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>Platform Analytics</h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Monthly redistribution trends, top donor/NGO activity, and category breakdown.
          </p>
          <Link to="/admin/analytics" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            View Analytics Dashboards →
          </Link>
        </div>
      </div>

      {/* Security Audit Trail (Requirement 20) */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="#059669" />
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>Administrative Audit Trail</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Immutable ledger</span>
        </div>

        {recentActions.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No recent admin actions recorded.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem' }}>Action Type</th>
                  <th style={{ padding: '0.75rem' }}>Target</th>
                  <th style={{ padding: '0.75rem' }}>Admin</th>
                  <th style={{ padding: '0.75rem' }}>Audit Details</th>
                </tr>
              </thead>
              <tbody>
                {recentActions.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: '#f1f5f9',
                        fontSize: '0.75rem',
                      }}>
                        {log.action_type}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>
                      {log.target_type} #{log.target_id}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#334155', fontWeight: 600 }}>
                      {log.admin_name}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#475569' }}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
