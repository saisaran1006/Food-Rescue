import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  PlusCircle,
  Package,
  HeartHandshake,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  QrCode
} from 'lucide-react';
import { donationsAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DonationCard from '../../components/DonationCard';

export const DonorDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        const [donationsRes, impactRes] = await Promise.all([
          donationsAPI.list({ donor_id: user?.id, limit: 10 }),
          usersAPI.getImpact({ donor_id: user?.id }),
        ]);

        if (donationsRes.success && donationsRes.data) {
          setDonations(donationsRes.data.donations || []);
        }
        if (impactRes.success && impactRes.data) {
          setImpact(impactRes.data.donor_impact || null);
        }
      } catch (err) {
        console.error('Donor dashboard error', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchDonorData();
    }
  }, [user?.id]);

  const activeDonations = donations.filter((d) =>
    ['AVAILABLE', 'CLAIMED', 'PICKUP_SCHEDULED', 'PICKED_UP'].includes(d.status)
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
            Donor Portal
          </span>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginTop: '0.2rem' }}>
            Welcome back, {user?.donor_profile?.organization_name || user?.name}!
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
            Manage surplus food postings and track real-time NGO pickups.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/donor/post" className="btn btn-primary btn-lg" style={{ boxShadow: 'var(--shadow-md)' }}>
            <PlusCircle size={20} /> Post Surplus Food
          </Link>
          <Link to="/donor/my-donations" className="btn btn-secondary btn-lg">
            My Donations History
          </Link>
        </div>
      </div>

      {/* Verification Notice if Pending */}
      {user?.status === 'PENDING' && (
        <div style={{
          backgroundColor: '#fefce8',
          border: '1px solid #fef08a',
          color: '#854d0e',
          padding: '1rem 1.25rem',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.9rem',
        }}>
          <Clock size={20} color="#ca8a04" />
          <div>
            <strong>Account Verification Pending:</strong> Your organization details are currently under review by our administration team. You can post donations normally, and verified status will display once confirmed.
          </div>
        </div>
      )}

      {/* 6 Key Statistics Cards (Requirement 5) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Total Donations */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total Donations
            </span>
            <Utensils size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
            {impact?.total_donations ?? donations.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>All-time contributions</span>
        </div>

        {/* Active Donations */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
              Active Donations
            </span>
            <Clock size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d', fontFamily: 'var(--font-heading)' }}>
            {impact?.active_count ?? activeDonations.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>Available or claimed</span>
        </div>

        {/* Completed Donations */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Completed
            </span>
            <CheckCircle2 size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
            {impact?.successful_pickups ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>Handed over to NGOs</span>
        </div>

        {/* Cancelled */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Cancelled
            </span>
            <XCircle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
            {impact?.cancelled_count ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>Withdrawn batches</span>
        </div>

        {/* Total Food Quantity Donated */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Food Donated
            </span>
            <Package size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
            {parseFloat(impact?.food_kg_donated || 0).toFixed(0)} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>kg</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>Total weight saved</span>
        </div>

        {/* Estimated Meals Rescued */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
              Meals Rescued
            </span>
            <HeartHandshake size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1d4ed8', fontFamily: 'var(--font-heading)' }}>
            {impact?.meals_rescued ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>People nourished</span>
        </div>
      </div>

      {/* Active Donations Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a' }}>
            Active Donations Requiring NGO Pickup ({activeDonations.length})
          </h2>
          <Link to="/donor/post" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <PlusCircle size={15} /> Add Another Batch
          </Link>
        </div>

        {activeDonations.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <Utensils size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.5rem' }}>No Active Donations</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
              You have no surplus food currently listed for pickup. Post surplus food whenever you have edible leftovers from kitchens or events.
            </p>
            <Link to="/donor/post" className="btn btn-primary">
              <PlusCircle size={18} /> Post Surplus Food Now
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {activeDonations.map((item) => (
              <DonationCard
                key={item.id}
                donation={item}
                showManageButton={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
