import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Package, CheckCircle, Sparkles, AlertTriangle } from 'lucide-react';
import { StatusBadge, UrgencyBadge } from './StatusBadge';

export const DonationCard = ({
  donation,
  onClaim,
  showClaimButton = false,
  showManageButton = false,
}) => {
  const isVeg = donation.is_veg == 1 || donation.is_veg === true;
  const isVerifiedDonor = donation.donor_verification_status === 'VERIFIED';
  const isAvailable = donation.status === 'AVAILABLE';

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#ffffff',
        height: '100%',
      }}
    >
      {/* Top Image Banner */}
      <div style={{ position: 'relative', height: '180px', width: '100%', backgroundColor: '#f1f5f9' }}>
        <img
          src={donation.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
          alt={donation.food_name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Veg / Non-Veg Indicator Icon */}
        <div
          title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: '#ffffff',
            padding: '4px',
            borderRadius: '4px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '18px',
              height: '18px',
              border: `2px solid ${isVeg ? '#16a34a' : '#dc2626'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isVeg ? '#16a34a' : '#dc2626',
              }}
            />
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <StatusBadge status={donation.status} />
        </div>

        {/* Urgency Badge */}
        <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
          <UrgencyBadge urgency={donation.urgency} />
        </div>

        {/* Distance Badge if available */}
        {donation.distance_km !== null && donation.distance_km !== undefined && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              padding: '0.2rem 0.5rem',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <MapPin size={12} className="text-emerald-400" />
            {donation.distance_km} km away
          </div>
        )}
      </div>

      {/* Recommended Tag Header */}
      {donation.is_recommended && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            padding: '0.4rem 1rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #a7f3d0',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={14} color="#059669" />
            RECOMMENDED MATCH ({donation.match_score}%)
          </span>
          <span style={{ fontSize: '0.7rem', color: '#047857' }}>Smart Algorithm</span>
        </div>
      )}

      {/* Card Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category & Donor Name */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', textTransform: 'uppercase' }}>
            {donation.category}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: '#475569' }}>
            <span style={{ fontWeight: 600 }}>{donation.organization_name || donation.donor_name}</span>
            {isVerifiedDonor && (
              <span title="Verified Food Donor" style={{ color: '#059669', display: 'flex', alignItems: 'center' }}>
                <CheckCircle size={14} fill="#10b981" color="#ffffff" />
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: '#0f172a' }}>
          <Link to={`/donations/${donation.id}`} style={{ color: 'inherit' }}>
            {donation.food_name}
          </Link>
        </h3>

        {/* Short description */}
        <p style={{
          fontSize: '0.875rem',
          color: '#64748b',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
        }}>
          {donation.description || 'Fresh surplus food available for community pickup.'}
        </p>

        {/* Smart recommendation explanation snippet */}
        {donation.recommendation_reason && (
          <div style={{
            fontSize: '0.775rem',
            backgroundColor: '#f8fafc',
            borderLeft: '3px solid #10b981',
            padding: '0.35rem 0.6rem',
            marginBottom: '0.75rem',
            color: '#334155',
            borderRadius: '0 0.375rem 0.375rem 0'
          }}>
            {donation.recommendation_reason}
          </div>
        )}

        {/* Key Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.5rem',
          padding: '0.75rem',
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          fontSize: '0.8125rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155' }}>
            <Package size={15} color="#059669" />
            <span><strong>{donation.quantity}</strong> {donation.quantity_unit}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155' }}>
            <Users size={15} color="#059669" />
            <span><strong>{donation.servings}</strong> Servings</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155', gridColumn: 'span 2' }}>
            <Clock size={15} color="#d97706" />
            <span>Best Before: <strong>{new Date(donation.expiry_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></span>
          </div>
        </div>

        {/* Location snippet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
          <MapPin size={14} color="#64748b" />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {donation.pickup_address}, {donation.city}
          </span>
        </div>

        {/* Actions Footer */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <Link
            to={`/donations/${donation.id}`}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, textAlign: 'center' }}
          >
            Details
          </Link>

          {showClaimButton && isAvailable && (
            <button
              onClick={() => onClaim?.(donation)}
              className="btn btn-primary btn-sm"
              style={{ flex: 1.2 }}
            >
              Claim Food
            </button>
          )}

          {showManageButton && (
            <Link
              to={`/donations/${donation.id}`}
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
            >
              Manage
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationCard;
