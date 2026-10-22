import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Utensils,
  MapPin,
  Clock,
  Package,
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Truck,
  QrCode,
  AlertTriangle,
  XCircle,
  Phone,
  Mail,
  Building,
  ArrowLeft
} from 'lucide-react';
import { donationsAPI, pickupsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import QRHandoverModal from '../components/QRHandoverModal';

export const DonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modals state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Schedule pickup form
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Cancel reason
  const [cancelReason, setCancelReason] = useState('');

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await donationsAPI.get(id);
      if (res.success && res.data) {
        setDonation(res.data.donation);
        // Pre-fill schedule form defaults
        setScheduledDate(new Date().toISOString().slice(0, 10));
        setScheduledTime(new Date(Date.now() + 60 * 60 * 1000).toTimeString().slice(0, 5));
        setContactPerson(user?.name || '');
        setContactPhone(user?.phone || '');
      } else {
        throw new Error(res.message || 'Donation not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load donation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleClaim = async () => {
    if (!window.confirm(`Are you sure your organization wants to claim this donation of "${donation.food_name}"?`)) {
      return;
    }
    setSubmittingAction(true);
    try {
      const res = await donationsAPI.claim(donation.id);
      if (res.success) {
        setActionSuccess('Donation claimed successfully! Please schedule your pickup slot.');
        await fetchDetails();
        setScheduleModalOpen(true);
      }
    } catch (err) {
      alert(err.message || 'Unable to claim donation');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      const res = await pickupsAPI.schedule({
        donation_id: donation.id,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        contact_person: contactPerson,
        contact_phone: contactPhone,
        pickup_notes: pickupNotes,
      });
      if (res.success) {
        setActionSuccess('Pickup schedule confirmed and donor notified!');
        setScheduleModalOpen(false);
        await fetchDetails();
      }
    } catch (err) {
      alert(err.message || 'Failed to schedule pickup');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleMarkArrived = async () => {
    setSubmittingAction(true);
    try {
      const res = await pickupsAPI.updateStatus(donation.id, 'ARRIVED');
      if (res.success) {
        setActionSuccess('Marked vehicle as ARRIVED. Donor has been notified.');
        await fetchDetails();
      }
    } catch (err) {
      alert(err.message || 'Failed to update arrival');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!window.confirm('Confirm that this surplus food was safely delivered and distributed to beneficiaries?')) {
      return;
    }
    setSubmittingAction(true);
    try {
      const res = await pickupsAPI.updateStatus(donation.id, 'COMPLETED');
      if (res.success) {
        setActionSuccess('Donation marked as COMPLETED! Impact statistics updated.');
        await fetchDetails();
      }
    } catch (err) {
      alert(err.message || 'Failed to complete donation');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      const res = await donationsAPI.cancel(donation.id, cancelReason);
      if (res.success) {
        setActionSuccess('Donation cancelled successfully.');
        setCancelModalOpen(false);
        await fetchDetails();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel donation');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          margin: '0 auto 1rem',
        }} className="animate-spin" />
        <p style={{ color: '#64748b' }}>Loading donation lifecycle details...</p>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="max-w-5xl" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <AlertTriangle size={36} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#0f172a' }}>Donation Not Found</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error || 'Unable to load donation details'}</p>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const isDonorOwner = user && (donation.donor_id == user.id || role === 'ADMIN');
  const isClaimingNgo = user && (donation.claimed_by == user.id || (role === 'NGO' && donation.status === 'AVAILABLE') || role === 'ADMIN');
  const isVeg = donation.is_veg == 1;

  return (
    <div className="max-w-7xl" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--slate-600)',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Listings
        </button>
      </div>

      {/* Success notification banner */}
      {actionSuccess && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '1rem 1.25rem',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 600,
        }}>
          <CheckCircle2 size={20} color="#059669" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Top Banner: Status + Title */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <StatusBadge status={donation.status} />
            <UrgencyBadge urgency={donation.urgency} />
            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Reference ID: <strong>#{donation.id}</strong>
            </span>
          </div>

          {/* Action Triggers Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {/* 1. Claim button for NGO */}
            {role === 'NGO' && donation.status === 'AVAILABLE' && (
              <button
                onClick={handleClaim}
                disabled={submittingAction}
                className="btn btn-primary"
                style={{ backgroundColor: '#059669' }}
              >
                <CheckCircle2 size={18} />
                {submittingAction ? 'Claiming...' : 'Claim This Donation'}
              </button>
            )}

            {/* 2. Schedule Pickup button for claiming NGO */}
            {isClaimingNgo && donation.status === 'CLAIMED' && (
              <button
                onClick={() => setScheduleModalOpen(true)}
                className="btn btn-primary"
              >
                <Truck size={18} /> Schedule Pickup Time
              </button>
            )}

            {/* 3. Mark Arrived button */}
            {isClaimingNgo && donation.status === 'PICKUP_SCHEDULED' && donation.pickup_status !== 'ARRIVED' && (
              <button
                onClick={handleMarkArrived}
                disabled={submittingAction}
                className="btn btn-secondary"
                style={{ borderColor: '#0284c7', color: '#0284c7' }}
              >
                <MapPin size={18} /> Mark Vehicle Arrived
              </button>
            )}

            {/* 4. QR Code Handover Verification */}
            {['CLAIMED', 'PICKUP_SCHEDULED', 'PICKED_UP'].includes(donation.status) && (
              <button
                onClick={() => setQrModalOpen(true)}
                className="btn btn-secondary"
                style={{ borderColor: '#10b981', color: '#047857' }}
              >
                <QrCode size={18} /> QR Handover Code
              </button>
            )}

            {/* 5. Complete Donation button */}
            {isClaimingNgo && donation.status === 'PICKED_UP' && (
              <button
                onClick={handleMarkCompleted}
                disabled={submittingAction}
                className="btn btn-success"
              >
                <CheckCircle2 size={18} /> Mark Delivery Completed
              </button>
            )}

            {/* 6. Cancel Donation for Donor/Admin */}
            {isDonorOwner && ['AVAILABLE', 'CLAIMED', 'PICKUP_SCHEDULED'].includes(donation.status) && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="btn btn-danger btn-sm"
              >
                <XCircle size={16} /> Cancel Batch
              </button>
            )}
          </div>
        </div>

        <h1 style={{ fontSize: '2.2rem', color: '#0f172a', marginBottom: '0.5rem' }}>
          {donation.food_name}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#64748b', flexWrap: 'wrap' }}>
          <span>Category: <strong style={{ color: '#059669' }}>{donation.category}</strong></span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isVeg ? '#16a34a' : '#dc2626'
            }} />
            <strong>{isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</strong>
          </span>
          <span>•</span>
          <span>Posted on {new Date(donation.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* 5-Step Visual Timeline */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.04em' }}>
            Redistribution Timeline
          </h3>
          <Timeline timeline={donation.timeline} currentStatus={donation.status} />
        </div>
      </div>

      {/* Main Grid: Details & Media */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
      }}>
        {/* Left Column: Photo & Food Specifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <img
              src={donation.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'}
              alt={donation.food_name}
              style={{ width: '100%', height: '320px', objectFit: 'cover' }}
            />
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a' }}>
              Food Description & Safety Notes
            </h3>
            <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {donation.description || 'Prepared fresh and stored in hygienic food-grade containers.'}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              backgroundColor: '#f8fafc',
              padding: '1.25rem',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
            }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>QUANTITY</span>
                <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{donation.quantity} {donation.quantity_unit}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>PORTIONS</span>
                <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{donation.servings} Servings</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>ALLERGENS</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{donation.allergens || 'None'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>PACKAGING</span>
                <span style={{ fontWeight: 600, color: '#334155' }}>{donation.packaging_type}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timings, Pickup Location & Organization Profiles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Critical Deadlines Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="#d97706" />
              Timing & Consumption Deadlines
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Prepared At</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>
                  {new Date(donation.prep_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Best Before (Deadline)</span>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>
                  {new Date(donation.expiry_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Urgency Level</span>
                <UrgencyBadge urgency={donation.urgency} />
              </div>
            </div>
          </div>

          {/* Location & Instructions Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} color="var(--primary-600)" />
              Pickup Location
            </h3>

            <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
              {donation.pickup_address}
            </p>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              City: {donation.city} {donation.distance_km ? `• Approx. ${donation.distance_km} km away` : ''}
            </p>

            <div style={{
              backgroundColor: '#ecfdf5',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #a7f3d0',
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                Special Pickup Instructions
              </span>
              <p style={{ fontSize: '0.875rem', color: '#064e3b' }}>
                {donation.pickup_instructions || 'Please call the donor upon vehicle arrival.'}
              </p>
            </div>
          </div>

          {/* Donor & Assigned NGO Cards */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a' }}>
              Participating Organizations
            </h3>

            {/* Donor info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Utensils size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <strong style={{ color: '#0f172a' }}>{donation.organization_name || donation.donor_name}</strong>
                  {donation.donor_verification_status === 'VERIFIED' && (
                    <span title="Verified Donor" style={{ color: '#10b981' }}>
                      <CheckCircle2 size={15} fill="#10b981" color="#ffffff" />
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.775rem', color: '#64748b' }}>
                  {donation.donor_type} • Contact: {donation.donor_phone}
                </p>
              </div>
            </div>

            {/* NGO info if claimed */}
            {donation.claimed_by ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Building size={20} />
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>{donation.ngo_name || donation.claimed_by_ngo_name}</strong>
                  <p style={{ fontSize: '0.775rem', color: '#64748b' }}>
                    Assigned NGO • Reg: {donation.ngo_reg_number || 'Verified Partner'}
                  </p>
                  {donation.pickup_contact_person && (
                    <p style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '0.15rem' }}>
                      Pickup Driver: {donation.pickup_contact_person} ({donation.pickup_contact_phone})
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div style={{
                paddingTop: '0.75rem',
                borderTop: '1px solid #f1f5f9',
                fontSize: '0.85rem',
                color: '#64748b',
                fontStyle: 'italic',
              }}>
                Awaiting claim from an eligible verified NGO in {donation.city}.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Pickup Modal */}
      {scheduleModalOpen && (
        <div className="modal-overlay" onClick={() => setScheduleModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>Schedule Pickup Details</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Notify the donor of your vehicle arrival time and driver contact.
            </p>

            <form onSubmit={handleScheduleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Pickup Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pickup Time *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Contact Person / Driver *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Vehicle Notes / Vessel Information</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="e.g. Bringing 4 food grade thermal transport vessels in White Maruti Eeco (MH-02-CP-8812)"
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="btn btn-primary"
                >
                  {submittingAction ? 'Confirming...' : 'Confirm Pickup Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Donation Modal */}
      {cancelModalOpen && (
        <div className="modal-overlay" onClick={() => setCancelModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#991b1b' }}>Cancel Food Donation</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Are you sure you want to withdraw this donation batch? Any claimed NGO will be notified.
            </p>

            <form onSubmit={handleCancelSubmit}>
              <div className="form-group">
                <label className="form-label">Reason for Cancellation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Self-consumed by staff, unexpected delay..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Keep Active
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="btn btn-danger"
                >
                  {submittingAction ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Handover Modal */}
      {qrModalOpen && (
        <QRHandoverModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          donation={donation}
          userRole={role}
          onVerified={() => {
            setActionSuccess('Pickup handover verified! Status updated to Picked Up.');
            fetchDetails();
          }}
        />
      )}
    </div>
  );
};

export default DonationDetails;
