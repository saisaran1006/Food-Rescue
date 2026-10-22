import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HeartHandshake, UserPlus, ShieldCheck, Utensils, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'NGO' ? 'NGO' : 'DONOR';

  const [role, setRole] = useState(defaultRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    city: 'Mumbai',
    // Donor specific
    organization_name: '',
    donor_type: 'Restaurant',
    fssai_license: '',
    operating_hours: '9:00 AM - 10:00 PM',
    // NGO specific
    ngo_name: '',
    registration_number: '',
    accepted_categories: ['Cooked Meals', 'Rice', 'Bread', 'Fruits'],
    serving_capacity: 150,
    vehicle_type: 'Van / Insulated Vehicle',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (category) => {
    setFormData((prev) => {
      const exists = prev.accepted_categories.includes(category);
      const updated = exists
        ? prev.accepted_categories.filter((c) => c !== category)
        : [...prev.accepted_categories, category];
      return { ...prev, accepted_categories: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.address || !formData.city) {
      setError('Please fill in all core personal and location fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        role,
        user_type: role,
        accepted_categories: formData.accepted_categories.join(','),
      };

      const user = await register(payload);
      if (user.role === 'DONOR') {
        navigate('/donor/dashboard');
      } else {
        navigate('/ngo/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const foodCategoriesList = [
    'Cooked Meals',
    'Rice',
    'Bread',
    'Fruits',
    'Vegetables',
    'Bakery',
    'Packaged Food',
    'Dairy',
    'Other',
  ];

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      backgroundColor: '#f8fafc',
    }}>
      <div style={{ maxWidth: '640px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--primary-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 1rem',
          }}>
            <HeartHandshake size={28} />
          </div>
          <h1 style={{ fontSize: '1.875rem', color: '#0f172a' }}>Join the FoodRescue Network</h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem', marginTop: '0.25rem' }}>
            Register your organization to donate or receive surplus edible food
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          <button
            type="button"
            onClick={() => setRole('DONOR')}
            style={{
              padding: '1rem',
              borderRadius: '0.75rem',
              border: `2px solid ${role === 'DONOR' ? 'var(--primary-600)' : '#cbd5e1'}`,
              backgroundColor: role === 'DONOR' ? '#ecfdf5' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: role === 'DONOR' ? 'var(--primary-600)' : '#f1f5f9',
              color: role === 'DONOR' ? '#ffffff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Utensils size={20} />
            </div>
            <div>
              <span style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: role === 'DONOR' ? '#065f46' : '#1e293b' }}>
                Food Donor
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Restaurant, Hotel, Hostel, Caterer
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole('NGO')}
            style={{
              padding: '1rem',
              borderRadius: '0.75rem',
              border: `2px solid ${role === 'NGO' ? 'var(--primary-600)' : '#cbd5e1'}`,
              backgroundColor: role === 'NGO' ? '#ecfdf5' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: role === 'NGO' ? 'var(--primary-600)' : '#f1f5f9',
              color: role === 'NGO' ? '#ffffff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users size={20} />
            </div>
            <div>
              <span style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: role === 'NGO' ? '#065f46' : '#1e293b' }}>
                Verified NGO
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Charity, Shelter, Roti Bank
              </span>
            </div>
          </button>
        </div>

        {/* Registration Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Contact Person Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="rajesh@restaurant.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  placeholder="+91 98200 12345"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Address & City */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Pickup / Office Address *</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  placeholder="14 Shivaji Park Road, Dadar West"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <hr style={{ margin: '1.25rem 0', borderColor: 'var(--border-color)' }} />

            {/* Role Specific Section */}
            {role === 'DONOR' ? (
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>
                  Donor Organization Details
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Business / Organization Name *</label>
                    <input
                      type="text"
                      name="organization_name"
                      className="form-input"
                      placeholder="e.g. Annapoorna Catering Services"
                      value={formData.organization_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Donor Type *</label>
                    <select
                      name="donor_type"
                      className="form-select"
                      value={formData.donor_type}
                      onChange={handleChange}
                    >
                      <option value="Restaurant">Restaurant</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Hostel">Hostel / Mess</option>
                      <option value="Event Organizer">Event Organizer / Banquet</option>
                      <option value="Cafeteria">Cafeteria / Corporate Canteen</option>
                      <option value="Household">Household</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">FSSAI License No. (Optional)</label>
                    <input
                      type="text"
                      name="fssai_license"
                      className="form-input"
                      placeholder="e.g. FSSAI-11518001000234"
                      value={formData.fssai_license}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Operating Hours</label>
                    <input
                      type="text"
                      name="operating_hours"
                      className="form-input"
                      placeholder="e.g. 7:00 AM - 11:00 PM"
                      value={formData.operating_hours}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>
                  NGO & Food Rescue Capacity
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">NGO / Foundation Name *</label>
                    <input
                      type="text"
                      name="ngo_name"
                      className="form-input"
                      placeholder="e.g. Robin Hood Army Mumbai"
                      value={formData.ngo_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Registration / Darpan Number *</label>
                    <input
                      type="text"
                      name="registration_number"
                      className="form-input"
                      placeholder="e.g. RHA-MH-2018-091"
                      value={formData.registration_number}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Approx. Serving Capacity (Meals/Day) *</label>
                    <input
                      type="number"
                      name="serving_capacity"
                      className="form-input"
                      min="10"
                      max="10000"
                      value={formData.serving_capacity}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Transport Vehicle Type</label>
                    <input
                      type="text"
                      name="vehicle_type"
                      className="form-input"
                      placeholder="e.g. Insulated Mini Van / Auto"
                      value={formData.vehicle_type}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label">Food Categories Accepted *</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
                    {foodCategoriesList.map((cat) => {
                      const selected = formData.accepted_categories.includes(cat);
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => handleCategoryToggle(cat)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            border: `1px solid ${selected ? 'var(--primary-600)' : '#cbd5e1'}`,
                            backgroundColor: selected ? 'var(--primary-50)' : '#ffffff',
                            color: selected ? 'var(--primary-800)' : '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          {selected ? '✓ ' : '+ '} {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1.5rem' }}
            >
              <UserPlus size={20} />
              {loading ? 'Creating Account...' : `Register as ${role === 'DONOR' ? 'Food Donor' : 'Rescue NGO'}`}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
