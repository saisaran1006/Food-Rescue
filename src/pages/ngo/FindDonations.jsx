import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Layers,
  Map as MapIcon,
  Grid,
  CheckCircle2,
  AlertTriangle,
  X,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { donationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DonationCard from '../../components/DonationCard';
import DonationMap from '../../components/DonationMap';

export const FindDonations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View mode: 'grid' or 'map'
  const [viewMode, setViewMode] = useState('grid');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');
  const [selectedVeg, setSelectedVeg] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState(user?.city || 'ALL');
  const [maxDistance, setMaxDistance] = useState('ALL');

  const fetchDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        status: 'AVAILABLE',
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        urgency: selectedUrgency !== 'ALL' ? selectedUrgency : undefined,
        city: selectedCity !== 'ALL' ? selectedCity : undefined,
        is_veg: selectedVeg === 'VEG' ? 1 : selectedVeg === 'NON_VEG' ? 0 : undefined,
        search: search.trim() || undefined,
        max_distance: maxDistance !== 'ALL' ? parseFloat(maxDistance) : undefined,
        lat: user?.latitude || 19.0760,
        lng: user?.longitude || 72.8777,
        limit: 50,
      };

      const res = await donationsAPI.list(params);
      if (res.success && res.data) {
        setDonations(res.data.donations || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [selectedCategory, selectedUrgency, selectedVeg, selectedCity, maxDistance]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonations();
  };

  const handleClaim = async (donation) => {
    if (!window.confirm(`Claim surplus batch "${donation.food_name}" for ${donation.servings} people?`)) {
      return;
    }
    try {
      const res = await donationsAPI.claim(donation.id);
      if (res.success) {
        alert('Donation claimed successfully! Please proceed to schedule pickup in your dashboard.');
        fetchDonations();
      }
    } catch (err) {
      alert(err.message || 'Unable to claim donation');
    }
  };

  const categories = [
    'ALL',
    'Cooked Meals',
    'Rice',
    'Bread',
    'Fruits',
    'Vegetables',
    'Bakery',
    'Packaged Food',
    'Dairy',
  ];

  const urgencies = [
    { key: 'ALL', label: 'All Urgencies' },
    { key: 'CRITICAL', label: '⚡ Critical (< 2h)' },
    { key: 'URGENT', label: '🔥 Urgent (2-6h)' },
    { key: 'SOON', label: '⏳ Consume Soon (6-12h)' },
    { key: 'NORMAL', label: '🌿 Fresh (> 12h)' },
  ];

  return (
    <div className="max-w-7xl" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
            Rescue Marketplace
          </span>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginTop: '0.2rem' }}>
            Discover Available Surplus Food
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
            Browse live surplus batches from restaurants and caterers ready for immediate collection.
          </p>
        </div>

        {/* View Switcher: Grid vs Map */}
        <div style={{
          display: 'flex',
          backgroundColor: '#f1f5f9',
          padding: '0.3rem',
          borderRadius: '0.5rem',
          border: '1px solid #cbd5e1',
        }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.375rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
              color: viewMode === 'grid' ? '#0f172a' : '#64748b',
              boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
              border: 'none',
            }}
          >
            <Grid size={16} /> Grid View
          </button>
          <button
            onClick={() => setViewMode('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '0.375rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: viewMode === 'map' ? '#ffffff' : 'transparent',
              color: viewMode === 'map' ? '#0f172a' : '#64748b',
              boxShadow: viewMode === 'map' ? 'var(--shadow-sm)' : 'none',
              border: 'none',
            }}
          >
            <MapIcon size={16} /> Interactive Map
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by food name, description, donor, or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          </div>
          <button type="submit" className="btn btn-primary">
            Search Food
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #f1f5f9',
        }}>
          {/* Category */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          {/* Urgency */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Urgency Level</label>
            <select
              className="form-select"
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              {urgencies.map((u) => (
                <option key={u.key} value={u.key}>{u.label}</option>
              ))}
            </select>
          </div>

          {/* Diet */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Dietary</label>
            <select
              className="form-select"
              value={selectedVeg}
              onChange={(e) => setSelectedVeg(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="ALL">All Food (Veg & Non-Veg)</option>
              <option value="VEG">Vegetarian Only</option>
              <option value="NON_VEG">Non-Vegetarian</option>
            </select>
          </div>

          {/* Max Distance */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Distance Radius</label>
            <select
              className="form-select"
              value={maxDistance}
              onChange={(e) => setMaxDistance(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="ALL">Any Distance</option>
              <option value="5">Within 5 km (Fastest)</option>
              <option value="10">Within 10 km</option>
              <option value="20">Within 20 km</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>City</label>
            <select
              className="form-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="ALL">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Thane">Thane</option>
              <option value="Pune">Pune</option>
              <option value="Bangalore">Bangalore</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content View: Grid or Map */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            margin: '0 auto 1rem',
          }} className="animate-spin" />
          <p style={{ color: '#64748b' }}>Discovering available donations in your area...</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <AlertTriangle size={36} color="#d97706" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem' }}>No donations available matching criteria</h3>
          <p style={{ color: '#64748b', fontSize: '0.925rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
            Try broadening your distance radius or category filters to view more listings across the city.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedUrgency('ALL');
              setSelectedVeg('ALL');
              setMaxDistance('ALL');
              setSelectedCity('ALL');
              setSearch('');
            }}
            className="btn btn-secondary"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'map' ? (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Showing <strong>{donations.length}</strong> active food rescue locations on OpenStreetMap:
            </span>
          </div>
          <DonationMap
            donations={donations}
            height="600px"
            userLocation={{ lat: user?.latitude, lng: user?.longitude }}
          />
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Showing <strong>{donations.length}</strong> available food donation batches:
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}>
            {donations.map((item) => (
              <DonationCard
                key={item.id}
                donation={item}
                showClaimButton={true}
                onClaim={handleClaim}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FindDonations;
