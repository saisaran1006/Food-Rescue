import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Clock,
  Package,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { donationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DonationCard from '../../components/DonationCard';

export const RecommendedDonations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await donationsAPI.getRecommended();
      if (res.success && res.data) {
        setRecommendations(res.data.recommendations || []);
        setContext(res.data.ngo_context || null);
      }
    } catch (err) {
      setError(err.message || 'Unable to calculate recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleClaim = async (donation) => {
    if (!window.confirm(`Claim smart-matched donation "${donation.food_name}"?`)) {
      return;
    }
    try {
      const res = await donationsAPI.claim(donation.id);
      if (res.success) {
        alert('Donation claimed successfully! Please schedule pickup in your dashboard.');
        fetchRecommendations();
      }
    } catch (err) {
      alert(err.message || 'Failed to claim');
    }
  };

  return (
    <div className="max-w-7xl" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          <Sparkles size={16} /> Rule-Based Smart Matching Engine
        </div>
        <h1 style={{ fontSize: '2rem', color: '#0f172a' }}>
          Personalized Food Recommendations
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.925rem', marginTop: '0.25rem', maxWidth: '750px' }}>
          Our multi-criteria algorithm evaluates live surplus food listings against your registered serving capacity,
          accepted food categories, real-time geographical distance, and urgency deadline priorities.
        </p>
      </div>

      {/* Algorithm Transparency Card */}
      <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '0.85rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#059669',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}>
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: '#064e3b', fontWeight: 700, marginBottom: '0.25rem' }}>
              How Compatibility Scores are Calculated
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#065f46', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              <strong>Matching Score (0–100%)</strong> = Distance Suitability (30%) + Food Category Compatibility (30%) + Serving Capacity Compatibility (20%) + Food Urgency Priority (15%) + Immediate Pickup Availability (5%).
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: '#047857' }}>
              <span>• Your Capacity: <strong>{context?.serving_capacity || 200} servings</strong></span>
              <span>• Evaluated Categories: <strong>{context?.accepted_categories?.join(', ') || 'All standard categories'}</strong></span>
              <span>• Evaluated Batches: <strong>{context?.total_evaluated || 0} batches</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Feed */}
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
          <p style={{ color: '#64748b' }}>Evaluating compatibility scores...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <AlertCircle size={36} color="#64748b" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem' }}>No compatible batches right now</h3>
          <p style={{ color: '#64748b', fontSize: '0.925rem', maxWidth: '440px', margin: '0 auto' }}>
            Check back soon as food donors in your vicinity post new surplus batches throughout the day.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {recommendations.map((item, idx) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '1.5rem',
                border: item.is_recommended ? '2px solid #10b981' : '1px solid #e2e8f0',
                position: 'relative',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                alignItems: 'center',
              }}
            >
              {/* Score pill */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '90px',
                height: '90px',
                borderRadius: '1rem',
                backgroundColor: item.match_score >= 80 ? '#ecfdf5' : item.match_score >= 60 ? '#f0fdf4' : '#f8fafc',
                border: `2px solid ${item.match_score >= 80 ? '#10b981' : item.match_score >= 60 ? '#86efac' : '#cbd5e1'}`,
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: item.match_score >= 80 ? '#059669' : '#1e293b', fontFamily: 'var(--font-heading)' }}>
                  {item.match_score}%
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Compatibility
                </span>
              </div>

              {/* Photo */}
              <img
                src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                alt={item.food_name}
                style={{ width: '110px', height: '90px', borderRadius: '0.75rem', objectFit: 'cover', flexShrink: 0 }}
              />

              {/* Details & Explanation */}
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                    {item.category}
                  </span>
                  {item.is_recommended && (
                    <span style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                    }}>
                      <Sparkles size={11} /> Recommended For You
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• #{item.id}</span>
                </div>

                <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.35rem' }}>
                  {item.food_name}
                </h3>

                {/* Plain-language explanation (Requirement 10) */}
                <div style={{
                  fontSize: '0.825rem',
                  color: '#1e293b',
                  backgroundColor: '#f8fafc',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '0.375rem',
                  borderLeft: '3px solid #10b981',
                  marginBottom: '0.6rem',
                  lineHeight: 1.4,
                }}>
                  {item.recommendation_reason}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: '#64748b' }}>
                  <span><strong>{item.quantity} {item.quantity_unit}</strong> ({item.servings} Servings)</span>
                  <span>📍 {item.pickup_address}, {item.city} ({item.distance_km} km)</span>
                  <span>⏳ Best before: <strong>{new Date(item.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '130px' }}>
                <button
                  onClick={() => handleClaim(item)}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <CheckCircle2 size={16} /> Claim Food
                </button>
                <a
                  href={`/donations/${item.id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  View Details
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedDonations;
