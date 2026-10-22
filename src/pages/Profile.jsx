import React, { useState, useEffect } from 'react';
import {
  User,
  Building,
  Utensils,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Package,
  HeartHandshake,
  Edit2,
  Save,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

export const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [impact, setImpact] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    // Donor
    organization_name: '',
    donor_type: '',
    fssai_license: '',
    operating_hours: '',
    // NGO
    ngo_name: '',
    registration_number: '',
    serving_capacity: 100,
    vehicle_type: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        organization_name: user.donor_profile?.organization_name || '',
        donor_type: user.donor_profile?.donor_type || 'Restaurant',
        fssai_license: user.donor_profile?.fssai_license || '',
        operating_hours: user.donor_profile?.operating_hours || '',
        ngo_name: user.ngo_profile?.ngo_name || '',
        registration_number: user.ngo_profile?.registration_number || '',
        serving_capacity: user.ngo_profile?.serving_capacity || 100,
        vehicle_type: user.ngo_profile?.vehicle_type || '',
      });

      // Load specific role impact
      const loadRoleImpact = async () => {
        try {
          if (user.role === 'DONOR') {
            const res = await usersAPI.getImpact({ donor_id: user.id });
            if (res.success && res.data) {
              setImpact(res.data.donor_impact || null);
            }
          } else if (user.role === 'NGO') {
            const res = await usersAPI.getImpact({ ngo_id: user.id });
            if (res.success && res.data) {
              setImpact(res.data.ngo_impact || null);
            }
          }
        } catch (e) {
          console.error(e);
        }
      };
      loadRoleImpact();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await usersAPI.updateProfile(formData);
      if (res.success) {
        setSuccessMsg('Profile details updated successfully!');
        setEditing(false);
        await refreshUser();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const isVerified = user?.status === 'VERIFIED';
  const isDonor = user?.role === 'DONOR';
  const isNGO = user?.role === 'NGO';

  return (
    <div className="max-w-5xl" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
            Account & Contributions
          </span>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginTop: '0.2rem' }}>
            Organization Profile & Impact Record
          </h1>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Edit2 size={16} /> {editing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      {successMsg && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '1rem',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '1rem',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <AlertCircle size={18} color="#ef4444" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Role-Specific Impact Record (Requirements 22 & 23) */}
      {(isDonor || isNGO) && impact && (
        <div className="card" style={{ padding: '2rem', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <HeartHandshake size={22} color="#059669" />
            <h2 style={{ fontSize: '1.3rem', color: '#064e3b' }}>
              {isDonor ? 'Donor Contribution Record' : 'NGO Community Rescue Record'}
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            textAlign: 'center',
          }}>
            {isDonor ? (
              <>
                <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{impact.total_donations || 0}</div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Batches</span>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>{impact.meals_rescued || 0}</div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Meals Rescued</span>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7' }}>{impact.successful_pickups || 0}</div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Successful Pickups</span>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{impact.cancelled_count || 0}</div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Cancelled Batches</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{impact.total_claims || 0}</div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Batches Claimed</span>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>{impact.meals_received || 0}</div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Meals Distributed</span>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7' }}>{impact.successful_pickups || 0}</div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Pickups Completed</span>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed' }}>{parseFloat(impact.food_kg_received || 0).toFixed(0)} kg</div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Food Weight Received</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Profile Info Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-100)',
            color: 'var(--primary-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.75rem',
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>{user?.name}</h2>
              {isVerified && (
                <span title="Verified Account" style={{ color: '#059669', display: 'flex' }}>
                  <CheckCircle2 size={20} fill="#10b981" color="#ffffff" />
                </span>
              )}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Role: <strong>{user?.role}</strong> • Status:{' '}
              <span style={{ color: isVerified ? '#059669' : '#d97706', fontWeight: 700 }}>
                {user?.status}
              </span>
            </p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Contact Person Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              {isDonor && (
                <>
                  <div className="form-group">
                    <label className="form-label">Business / Organization Name</label>
                    <input
                      type="text"
                      name="organization_name"
                      className="form-input"
                      value={formData.organization_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Operating Hours</label>
                    <input
                      type="text"
                      name="operating_hours"
                      className="form-input"
                      value={formData.operating_hours}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {isNGO && (
                <>
                  <div className="form-group">
                    <label className="form-label">NGO Name</label>
                    <input
                      type="text"
                      name="ngo_name"
                      className="form-input"
                      value={formData.ngo_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Serving Capacity (Meals/Day)</label>
                    <input
                      type="number"
                      name="serving_capacity"
                      className="form-input"
                      value={formData.serving_capacity}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                <Save size={16} /> {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>EMAIL ADDRESS</span>
              <strong style={{ color: '#0f172a' }}>{user?.email}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>PHONE NUMBER</span>
              <strong style={{ color: '#0f172a' }}>{user?.phone}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>LOCATION</span>
              <strong style={{ color: '#0f172a' }}>{user?.address}, {user?.city}</strong>
            </div>

            {isDonor && (
              <>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>ORGANIZATION</span>
                  <strong style={{ color: '#0f172a' }}>{user?.donor_profile?.organization_name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>DONOR TYPE</span>
                  <strong style={{ color: '#0f172a' }}>{user?.donor_profile?.donor_type}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>OPERATING HOURS</span>
                  <strong style={{ color: '#0f172a' }}>{user?.donor_profile?.operating_hours}</strong>
                </div>
              </>
            )}

            {isNGO && (
              <>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>NGO REGISTRATION</span>
                  <strong style={{ color: '#0f172a' }}>{user?.ngo_profile?.registration_number}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>SERVING CAPACITY</span>
                  <strong style={{ color: '#0f172a' }}>{user?.ngo_profile?.serving_capacity} meals/day</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>ACCEPTED CATEGORIES</span>
                  <strong style={{ color: '#0f172a' }}>{user?.ngo_profile?.accepted_categories}</strong>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
