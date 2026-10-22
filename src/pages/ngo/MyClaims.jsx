import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Truck,
  CheckCircle2,
  Calendar,
  MapPin,
  QrCode,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';
import { donationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, UrgencyBadge } from '../../components/StatusBadge';
import QRHandoverModal from '../../components/QRHandoverModal';

export const MyClaims = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedQRDonation, setSelectedQRDonation] = useState(null);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await donationsAPI.list({
        claimed_by: user?.id,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        limit: 50,
      });
      if (res.success && res.data) {
        setClaims(res.data.donations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchClaims();
    }
  }, [user?.id, statusFilter]);

  const tabs = [
    { key: 'ALL', label: 'All Claims' },
    { key: 'CLAIMED', label: 'Needs Scheduling' },
    { key: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <div className="max-w-7xl" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
          Collection Management
        </span>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', marginTop: '0.2rem' }}>
          My Claimed Surplus Food & Pickups
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
          Manage pickup dates, driver contacts, QR handover verification, and distribution milestones.
        </p>
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: statusFilter === tab.key ? 'var(--primary-600)' : '#f1f5f9',
                color: statusFilter === tab.key ? '#ffffff' : '#475569',
                border: 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Claims List */}
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
          <p style={{ color: '#64748b' }}>Loading your claimed donations...</p>
        </div>
      ) : claims.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.25rem' }}>
            No claimed batches found under this category.
          </p>
          <Link to="/ngo/find" className="btn btn-primary">
            <Search size={16} /> Discover Available Food
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {claims.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '300px', flex: 1 }}>
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                  alt={item.food_name}
                  style={{ width: '80px', height: '80px', borderRadius: '0.5rem', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                      {item.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• #{item.id}</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                    <Link to={`/donations/${item.id}`} style={{ color: 'inherit' }}>
                      {item.food_name}
                    </Link>
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <span>Quantity: <strong>{item.quantity} {item.quantity_unit}</strong> ({item.servings} Servings)</span>
                    <span>Donor: <strong>{item.organization_name || item.donor_name}</strong></span>
                    <span>📍 {item.pickup_address}</span>
                  </div>

                  {item.scheduled_date && (
                    <div style={{ marginTop: '0.4rem', fontSize: '0.775rem', color: '#0284c7', fontWeight: 600 }}>
                      🕒 Scheduled: {item.scheduled_date} at {item.scheduled_time}
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Urgency */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <StatusBadge status={item.status} />
                <UrgencyBadge urgency={item.urgency} />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                {/* QR Code Handover Button */}
                <button
                  onClick={() => setSelectedQRDonation(item)}
                  className="btn btn-secondary btn-sm"
                  title="Verify Pickup Handover"
                >
                  <QrCode size={16} /> Verify Handover
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
          userRole="NGO"
          onVerified={() => {
            fetchClaims();
          }}
        />
      )}
    </div>
  );
};

export default MyClaims;
