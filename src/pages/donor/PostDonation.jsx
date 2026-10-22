import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Utensils,
  PlusCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Upload,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldAlert,
  Info
} from 'lucide-react';
import { donationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const PostDonation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Helper for formatting datetime-local inputs
  const formatDateTimeLocal = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const now = new Date();
  const defaultPrep = formatDateTimeLocal(new Date(now.getTime() - 2 * 60 * 60 * 1000)); // 2h ago
  const defaultExpiry = formatDateTimeLocal(new Date(now.getTime() + 6 * 60 * 60 * 1000)); // 6h ahead

  const [formData, setFormData] = useState({
    food_name: '',
    category: 'Cooked Meals',
    description: '',
    quantity: '',
    quantity_unit: 'kg',
    servings: '',
    prep_time: defaultPrep,
    expiry_time: defaultExpiry,
    pickup_address: user?.address || '',
    city: user?.city || 'Mumbai',
    latitude: user?.latitude || 19.0760,
    longitude: user?.longitude || 72.8777,
    is_veg: '1',
    allergens: 'None',
    packaging_type: 'Clean sealed containers',
    pickup_instructions: 'Contact manager at service gate for handover.',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expiryWarning, setExpiryWarning] = useState(null);

  // Check deadline dynamically
  useEffect(() => {
    if (!formData.expiry_time) {
      setExpiryWarning(null);
      return;
    }
    const expiry = new Date(formData.expiry_time);
    const current = new Date();
    const diffHours = (expiry.getTime() - current.getTime()) / (1000 * 60 * 60);

    if (diffHours <= 0) {
      setExpiryWarning({
        type: 'ERROR',
        message: 'Cannot post expired food! The consumption deadline is in the past.',
      });
    } else if (diffHours < 2) {
      setExpiryWarning({
        type: 'CRITICAL',
        message: '⚠️ Critical Deadline: Less than 2 hours remaining! Food must be picked up and served immediately.',
      });
    } else if (diffHours <= 6) {
      setExpiryWarning({
        type: 'WARNING',
        message: '⏳ Urgent: Food will expire within 2 to 6 hours. Eligible nearby NGOs will be prioritized for rapid collection.',
      });
    } else {
      setExpiryWarning(null);
    }
  }, [formData.expiry_time]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation checks
    if (!formData.food_name || !formData.category || !formData.quantity || !formData.servings) {
      setError('Please fill in food name, category, quantity, and servings.');
      return;
    }

    const prep = new Date(formData.prep_time);
    const expiry = new Date(formData.expiry_time);
    const current = new Date();

    if (expiry <= current) {
      setError('Cannot post expired food. Consumption deadline must be in the future.');
      return;
    }

    if (expiry <= prep) {
      setError('Consumption deadline must be strictly after the preparation time.');
      return;
    }

    if (parseFloat(formData.quantity) <= 0 || parseInt(formData.servings) <= 0) {
      setError('Quantity and servings must both be positive numbers.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (imageFile) {
        data.append('food_image', imageFile);
      }

      const res = await donationsAPI.create(data);
      if (res.success && res.data) {
        navigate(`/donations/${res.data.id}`);
      } else {
        throw new Error(res.message || 'Failed to post donation');
      }
    } catch (err) {
      setError(err.message || 'Unable to post surplus food. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
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
    <div className="max-w-5xl" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
          Surplus Food Posting Form
        </span>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', marginTop: '0.2rem' }}>
          Post Surplus Edible Food
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
          Provide accurate preparation details, food safety deadlines, and pickup instructions for collecting NGOs.
        </p>
      </div>

      {/* Expiry / Deadline Warning Alert */}
      {expiryWarning && (
        <div style={{
          backgroundColor: expiryWarning.type === 'ERROR' ? '#fee2e2' : expiryWarning.type === 'CRITICAL' ? '#fff1f2' : '#fefce8',
          border: `1px solid ${expiryWarning.type === 'ERROR' ? '#fecaca' : expiryWarning.type === 'CRITICAL' ? '#fecdd3' : '#fef08a'}`,
          color: expiryWarning.type === 'ERROR' ? '#991b1b' : expiryWarning.type === 'CRITICAL' ? '#be123c' : '#854d0e',
          padding: '1rem 1.25rem',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          fontWeight: 600,
          fontSize: '0.9rem',
        }}>
          <AlertTriangle size={20} />
          <span>{expiryWarning.message}</span>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '0.875rem 1.25rem',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
        }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem' }}>
        {/* Section 1: Food Details */}
        <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Utensils size={18} color="var(--primary-600)" />
          1. Food Item & Category
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Food Name / Dish Title *</label>
            <input
              type="text"
              name="food_name"
              className="form-input"
              placeholder="e.g. Vegetable Biryani, Paneer Butter Masala, Fresh Dinner Rolls"
              value={formData.food_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Food Category *</label>
            <select
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Dietary Preference *</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                <input
                  type="radio"
                  name="is_veg"
                  value="1"
                  checked={formData.is_veg === '1'}
                  onChange={handleChange}
                />
                <span style={{ color: '#16a34a' }}>● Vegetarian</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                <input
                  type="radio"
                  name="is_veg"
                  value="0"
                  checked={formData.is_veg === '0'}
                  onChange={handleChange}
                />
                <span style={{ color: '#dc2626' }}>● Non-Vegetarian</span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Food Description</label>
          <textarea
            name="description"
            rows="3"
            className="form-textarea"
            placeholder="Details about dish preparation, freshness, taste notes, storage container condition..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />

        {/* Section 2: Quantity & Servings */}
        <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="var(--primary-600)" />
          2. Quantity & Serving Capacity
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input
              type="number"
              step="0.5"
              name="quantity"
              className="form-input"
              placeholder="e.g. 25"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quantity Unit *</label>
            <select
              name="quantity_unit"
              className="form-select"
              value={formData.quantity_unit}
              onChange={handleChange}
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="meals">Meal Packets / Thalis</option>
              <option value="boxes">Crates / Boxes</option>
              <option value="portions">Portions</option>
              <option value="litres">Litres</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Servings (Number of People) *</label>
            <input
              type="number"
              name="servings"
              className="form-input"
              placeholder="e.g. 60"
              value={formData.servings}
              onChange={handleChange}
              required
            />
            <span className="form-hint">Used for matching NGO capacities</span>
          </div>
        </div>

        <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />

        {/* Section 3: Time Critical Deadlines (Requirement 6 & 11) */}
        <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} color="var(--primary-600)" />
          3. Food Timing & Safety Deadlines
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Food Preparation Date & Time *</label>
            <input
              type="datetime-local"
              name="prep_time"
              className="form-input"
              value={formData.prep_time}
              onChange={handleChange}
              required
            />
            <span className="form-hint">When the batch was finished</span>
          </div>

          <div className="form-group">
            <label className="form-label">Best Consumption Deadline *</label>
            <input
              type="datetime-local"
              name="expiry_time"
              className="form-input"
              value={formData.expiry_time}
              onChange={handleChange}
              required
            />
            <span className="form-hint">Must be consumed before this time</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Allergen Information</label>
            <input
              type="text"
              name="allergens"
              className="form-input"
              placeholder="e.g. Dairy, Nuts, Gluten, None"
              value={formData.allergens}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Packaging Type</label>
            <input
              type="text"
              name="packaging_type"
              className="form-input"
              placeholder="e.g. Sealed Stainless Drums, Silver Foil Casseroles, Bakery Crates"
              value={formData.packaging_type}
              onChange={handleChange}
            />
          </div>
        </div>

        <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />

        {/* Section 4: Food Photo Upload */}
        <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Upload size={18} color="var(--primary-600)" />
          4. Food Photo (Optional but Recommended)
        </h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '1.25rem',
            backgroundColor: '#f8fafc',
            border: '2px dashed #cbd5e1',
            borderRadius: '0.75rem',
          }}>
            {imagePreview ? (
              <div style={{ position: 'relative', width: '120px', height: '90px', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{
                width: '120px',
                height: '90px',
                borderRadius: '0.5rem',
                backgroundColor: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
              }}>
                <Utensils size={32} />
              </div>
            )}

            <div>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                <Upload size={15} /> Upload Food Image
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                Max file size: 5MB. Formats: JPG, PNG, WEBP. Demonstrates food packaging and portion size.
              </p>
            </div>
          </div>
        </div>

        <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }} />

        {/* Section 5: Pickup Location & Instructions */}
        <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={18} color="var(--primary-600)" />
          5. Pickup Location & Instructions
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Pickup Address *</label>
            <input
              type="text"
              name="pickup_address"
              className="form-input"
              value={formData.pickup_address}
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

        <div className="form-group">
          <label className="form-label">Pickup Instructions for Collecting NGO</label>
          <textarea
            name="pickup_instructions"
            rows="2"
            className="form-textarea"
            placeholder="e.g. Enter through kitchen service door at basement level. Contact Chef Rajesh upon arrival. Gate pass pre-approved."
            value={formData.pickup_instructions}
            onChange={handleChange}
          />
        </div>

        {/* Submit Button */}
        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate('/donor/dashboard')}
            className="btn btn-secondary btn-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || (expiryWarning && expiryWarning.type === 'ERROR')}
            className="btn btn-primary btn-lg"
          >
            <PlusCircle size={20} />
            {loading ? 'Posting Surplus Batch...' : 'Publish Surplus Food Donation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostDonation;
