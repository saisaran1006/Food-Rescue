import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Building,
  Utensils,
  RefreshCw,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { adminAPI } from '../../services/api';

export const UserVerification = () => {
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({
        status: statusTab !== 'ALL' ? statusTab : undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        search: search.trim() || undefined,
      });
      if (res.success && res.data) {
        setUsers(res.data.users || []);
        setCounts(res.data.counts || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusTab, roleFilter]);

  const handleAction = async (userId, action, promptReason = false) => {
    let reason = 'Administrator action';
    if (promptReason) {
      const input = window.prompt(`Please enter reason for ${action}:`, 'Document compliance check');
      if (input === null) return;
      reason = input || reason;
    } else {
      if (!window.confirm(`Are you sure you want to ${action} this user account?`)) {
        return;
      }
    }

    setSubmittingId(userId);
    try {
      const res = await adminAPI.verifyUser(userId, action, reason);
      if (res.success) {
        setActionSuccess(`User account successfully ${action}ed.`);
        setTimeout(() => setActionSuccess(null), 3000);
        await fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setSubmittingId(null);
    }
  };

  const tabs = [
    { key: 'ALL', label: 'All Users', count: counts?.total },
    { key: 'PENDING', label: 'Pending Verification', count: counts?.pending },
    { key: 'VERIFIED', label: 'Verified', count: counts?.verified },
    { key: 'REJECTED', label: 'Rejected', count: counts?.rejected },
    { key: 'SUSPENDED', label: 'Suspended', count: counts?.suspended },
  ];

  return (
    <div className="max-w-7xl" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
          Identity & Trust Verification
        </span>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', marginTop: '0.2rem' }}>
          User Verification & Moderation
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
          Review government licenses (FSSAI, NGO Darpan, 80G), approve pending applications, or suspend non-compliant accounts.
        </p>
      </div>

      {actionSuccess && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '1rem 1.25rem',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1rem',
        }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusTab(tab.key)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: statusTab === tab.key ? '#0f172a' : '#f1f5f9',
                  color: statusTab === tab.key ? '#ffffff' : '#475569',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span style={{
                    fontSize: '0.7rem',
                    backgroundColor: statusTab === tab.key ? '#334155' : '#e2e8f0',
                    color: statusTab === tab.key ? '#ffffff' : '#475569',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Role Filter & Search */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ width: '140px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Roles</option>
              <option value="DONOR">Donors Only</option>
              <option value="NGO">NGOs Only</option>
            </select>

            <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search name, email, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem', minWidth: '200px' }}
              />
              <button type="submit" className="btn btn-secondary btn-sm">
                <Search size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#0f172a',
            borderRadius: '50%',
            margin: '0 auto 1rem',
          }} className="animate-spin" />
          <p style={{ color: '#64748b' }}>Fetching platform user directory...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b' }}>No users found matching this filter criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {users.map((u) => {
            const isVerified = u.status === 'VERIFIED';
            const isPending = u.status === 'PENDING';
            const isSuspended = u.status === 'SUSPENDED';
            const isDonor = u.role === 'DONOR';

            return (
              <div
                key={u.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  borderLeft: `4px solid ${isVerified ? '#10b981' : isPending ? '#f59e0b' : '#ef4444'}`,
                }}
              >
                {/* User info */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: isDonor ? '#ecfdf5' : '#eff6ff',
                      color: isDonor ? '#065f46' : '#1e40af',
                    }}>
                      {u.role}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: isVerified ? '#ecfdf5' : isPending ? '#fefce8' : '#fee2e2',
                      color: isVerified ? '#047857' : isPending ? '#854d0e' : '#991b1b',
                    }}>
                      {isVerified ? '✓ Verified' : u.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>User #{u.id}</span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                    {u.organization_name || u.ngo_name || u.name}
                  </h3>

                  <div style={{ fontSize: '0.825rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.4rem' }}>
                    <span>Contact: <strong>{u.name}</strong></span>
                    <span>✉️ {u.email}</span>
                    <span>📞 {u.phone}</span>
                    <span>📍 {u.address}, {u.city}</span>
                  </div>

                  {/* License & Capacity details */}
                  <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: '#334155', backgroundColor: '#f8fafc', padding: '0.4rem 0.75rem', borderRadius: '0.375rem', display: 'inline-flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {isDonor ? (
                      <>
                        <span>Type: <strong>{u.donor_type}</strong></span>
                        <span>FSSAI License: <strong>{u.fssai_license || 'Not Provided (Household/Caterer)'}</strong></span>
                        <span>Hours: {u.operating_hours}</span>
                      </>
                    ) : (
                      <>
                        <span>Reg / Darpan: <strong>{u.registration_number}</strong></span>
                        <span>Serving Capacity: <strong>{u.serving_capacity} meals/day</strong></span>
                        <span>Vehicle: {u.vehicle_type}</span>
                        <span>Accepted: {u.accepted_categories}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleAction(u.id, 'VERIFY')}
                        disabled={submittingId === u.id}
                        className="btn btn-success btn-sm"
                      >
                        <CheckCircle2 size={15} /> Verify & Approve
                      </button>
                      <button
                        onClick={() => handleAction(u.id, 'REJECT', true)}
                        disabled={submittingId === u.id}
                        className="btn btn-danger btn-sm"
                      >
                        <XCircle size={15} /> Reject
                      </button>
                    </>
                  )}

                  {isVerified && (
                    <button
                      onClick={() => handleAction(u.id, 'SUSPEND', true)}
                      disabled={submittingId === u.id}
                      className="btn btn-danger btn-sm"
                    >
                      <AlertTriangle size={15} /> Suspend Account
                    </button>
                  )}

                  {isSuspended && (
                    <button
                      onClick={() => handleAction(u.id, 'REACTIVATE')}
                      disabled={submittingId === u.id}
                      className="btn btn-secondary btn-sm"
                    >
                      <RefreshCw size={15} /> Reactivate Account
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserVerification;
