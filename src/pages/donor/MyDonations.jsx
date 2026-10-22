import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { donationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, UrgencyBadge } from '../../components/StatusBadge';
import QRHandoverModal from '../../components/QRHandoverModal';

export const MyDonations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedQRDonation, setSelectedQRDonation] = useState(null);

  const fetchMyDonations = async () => {
    setLoading(true);
    try {
      const res = await donationsAPI.list({
        donor_id: user?.id,
        status: statusFilter,
        search,
        limit: 50,
      });
      if (res.success && res.data) {
        setDonations(res.data.donations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchMyDonations();
    }
  }, [user?.id, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMyDonations();
  };

  const statuses = [
    { key: 'ALL', label: 'All Postings' },
    { key: 'AVAILABLE', label: 'Available' },
    { key: 'CLAIMED', label: 'Claimed' },
    { key: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
    { key: 'EXPIRED', label: 'Expired' },
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
            Donation Management
          </span>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginTop: '0.2rem' }}>
            My Surplus Food Donations
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
            Track the status of all your posted batches, scheduled pickups, and QR verification codes.
          </p>
        </div>

        <Link to="/donor/post" className="btn btn-primary btn-lg">
          <PlusCircle size={20} /> Post New Batch
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1rem',
        }}>
          {/* Status Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {statuses.map((st) => (
              <button
                key={st.key}
                onClick={() => setStatusFilter(st.key)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: statusFilter === st.key ? 'var(--primary-600)' : '#f1f5f9',
                  color: statusFilter === st.key ? '#ffffff' : '#475569',
                  border: 'none',
                }}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', minWidth: '260px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by food name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.875rem' }}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              <Search size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Donations List / Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            margin: '0 auto 1rem',
          }} className="animate-spin" />
          <p style={{ color: '#64748b' }}>Loading your donations...</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.25rem' }}>
            No donation records match the selected status filter.
          </p>
          <Link to="/donor/post" className="btn btn-primary">
            <PlusCircle size={18} /> Post Food Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {donations.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              {/* Left Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '280px' }}>
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                  alt={item.food_name}
                  style={{ width: '70px', height: '70px', borderRadius: '0.5rem', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                      {item.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• #{item.id}</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                    <Link to={`/donations/${item.id}`} style={{ color: 'inherit' }}>
                      {item.food_name}
                    </Link>
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <span>Quantity: <strong>{item.quantity} {item.quantity_unit}</strong></span>
                    <span>Servings: <strong>{item.servings}</strong></span>
                    <span>Posted: {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Status and Urgency Badges */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                <StatusBadge status={item.status} />
                <UrgencyBadge urgency={item.urgency} />
                {item.claimed_by_ngo_name && (
                  <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                    Assigned: {item.ngo_name || item.claimed_by_ngo_name}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {/* QR Code Handover Button */}
                <button
                  onClick={() => setSelectedQRDonation(item)}
                  className="btn btn-secondary btn-sm"
                  title="Show Handover QR Code"
                >
                  <QrCode size={16} /> QR Code
                </button>

                <Link to={`/donations/${item.id}`} className="btn btn-primary btn-sm">
                  View Timeline <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Handover Modal */}
      {selectedQRDonation && (
        <QRHandoverModal
          isOpen={!!selectedQRDonation}
          onClose={() => setSelectedQRDonation(null)}
          donation={selectedQRDonation}
          userRole="DONOR"
          onVerified={() => {
            fetchMyDonations();
          }}
        />
      )}
    </div>
  );
};

export default MyDonations;
