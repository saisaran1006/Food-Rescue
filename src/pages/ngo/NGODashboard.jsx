import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  HeartHandshake,
  ArrowRight,
  MapPin,
  QrCode
} from 'lucide-react';
import { donationsAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DonationCard from '../../components/DonationCard';
import QRHandoverModal from '../../components/QRHandoverModal';

export const NGODashboard = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [impact, setImpact] = useState(null);
  const [availableCount, setAvailableCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedQRDonation, setSelectedQRDonation] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [claimsRes, recRes, availRes, impactRes] = await Promise.all([
        donationsAPI.list({ claimed_by: user?.id, limit: 10 }),
        donationsAPI.getRecommended(),
        donationsAPI.list({ status: 'AVAILABLE', limit: 1 }),
        usersAPI.getImpact({ ngo_id: user?.id }),
      ]);

      if (claimsRes.success && claimsRes.data) {
        setClaims(claimsRes.data.donations || []);
      }
      if (recRes.success && recRes.data) {
        setRecommended(recRes.data.recommendations?.slice(0, 3) || []);
      }
      if (availRes.success && availRes.data) {
        setAvailableCount(availRes.data.pagination?.total || 0);
      }
      if (impactRes.success && impactRes.data) {
        setImpact(impactRes.data.ngo_impact || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const upcomingPickups = claims.filter((c) =>
    ['CLAIMED', 'PICKUP_SCHEDULED'].includes(c.status)
  );

  return (
    <div className="max-w-7xl" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Welcome Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
            NGO Rescue Portal
          </span>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginTop: '0.2rem' }}>
            {user?.ngo_profile?.ngo_name || user?.name}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
            Serving Capacity: <strong>{user?.ngo_profile?.serving_capacity || 200} meals/day</strong> • Base Location: <strong>{user?.city}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/ngo/find" className="btn btn-primary btn-lg">
            <Search size={18} /> Find Available Food
          </Link>
          <Link to="/ngo/recommended" className="btn btn-secondary btn-lg" style={{ borderColor: 'var(--primary-500)', color: 'var(--primary-700)' }}>
            <Sparkles size={18} color="var(--primary-600)" /> Smart Matches ({recommended.length})
          </Link>
        </div>
      </div>

      {/* 6 Key Statistics Cards (Requirement 8) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Available Donations */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
              Available Nearby
            </span>
            <Search size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d', fontFamily: 'var(--font-heading)' }}>
            {availableCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>Ready to claim</span>
        </div>

        {/* Claimed Donations */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total Claimed
            </span>
            <Clock size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
            {impact?.total_claims ?? claims.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Batches assigned</span>
        </div>

        {/* Upcoming Pickups */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>
              Upcoming Pickups
            </span>
            <Truck size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#b45309', fontFamily: 'var(--font-heading)' }}>
            {impact?.upcoming_pickups ?? upcomingPickups.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>Requires vehicle dispatch</span>
        </div>

        {/* Completed Pickups */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Completed Pickups
            </span>
            <CheckCircle2 size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
            {impact?.successful_pickups ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>Verified handovers</span>
        </div>

        {/* Meals Received */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
              Meals Received
            </span>
            <HeartHandshake size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1d4ed8', fontFamily: 'var(--font-heading)' }}>
            {impact?.meals_received ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>Beneficiaries fed</span>
        </div>

        {/* Food Quantity Received (kg) */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Food Weight
            </span>
            <Package size={18} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
            {parseFloat(impact?.food_kg_received || 0).toFixed(0)} <span style={{ fontSize: '1rem', fontWeight: 600 }}>kg</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>Total edible quantity</span>
        </div>
      </div>

      {/* Smart Compatibility Recommendations Spotlight */}
      {recommended.length > 0 && (
        <div className="card" style={{ padding: '1.75rem', backgroundColor: '#f0fdf4', border: '1px solid #a7f3d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#064e3b' }}>Smart Matched Surplus Donations</h3>
                <p style={{ fontSize: '0.8rem', color: '#047857' }}>
                  Curated for your serving capacity ({user?.ngo_profile?.serving_capacity || 200} meals) and location
                </p>
              </div>
            </div>
            <Link to="/ngo/recommended" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#059669' }}>
              View All Matches →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}>
            {recommended.map((item) => (
              <DonationCard
                key={item.id}
                donation={item}
                showClaimButton={true}
                onClaim={() => {
                  fetchDashboardData();
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Active Pickups Requiring Vehicle Action */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#0f172a' }}>
            Active Claims & Pickups In Progress ({upcomingPickups.length})
          </h2>
          <Link to="/ngo/claims" className="btn btn-secondary btn-sm">
            View All Claims History
          </Link>
        </div>

        {upcomingPickups.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>No pending pickups right now.</p>
            <Link to="/ngo/find" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <Search size={16} /> Discover Available Donations
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingPickups.map((item) => (
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
                  borderLeft: '4px solid #10b981',
                }}
              >
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
                    <span>Quantity: <strong>{item.quantity} {item.quantity_unit}</strong> ({item.servings} Servings)</span>
                    <span>Donor: <strong>{item.organization_name || item.donor_name}</strong></span>
                    <span>Location: {item.pickup_address}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {/* Enter Handover Verification Code button */}
                  <button
                    onClick={() => setSelectedQRDonation(item)}
                    className="btn btn-primary btn-sm"
                  >
                    <QrCode size={16} /> Verify Handover
                  </button>

                  <Link to={`/donations/${item.id}`} className="btn btn-secondary btn-sm">
                    Manage Pickup →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Handover Verification Modal */}
      {selectedQRDonation && (
        <QRHandoverModal
          isOpen={!!selectedQRDonation}
          onClose={() => setSelectedQRDonation(null)}
          donation={selectedQRDonation}
          userRole="NGO"
          onVerified={() => {
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};

export default NGODashboard;
