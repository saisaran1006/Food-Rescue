import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { ShieldCheck, X, QrCode, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { pickupsAPI } from '../services/api';

export const QRHandoverModal = ({
  isOpen,
  onClose,
  donation,
  userRole = 'DONOR',
  onVerified,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !donation) return null;

  const verificationCode = donation.verification_code || `FR-RES-${donation.id}`;
  const isDonorOrAdmin = userRole === 'DONOR' || userRole === 'ADMIN';

  const handleCopy = () => {
    navigator.clipboard?.writeText(verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!inputCode.trim()) {
      setError('Please enter or scan the verification code');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await pickupsAPI.verify(inputCode.trim(), donation.id);
      if (res.success) {
        setSuccessMsg(res.message || 'Pickup verified successfully!');
        setTimeout(() => {
          onVerified?.();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.75rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
            }}>
              <QrCode size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>QR Code Handover Verification</h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>Donation #{donation.id} – {donation.food_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: '#94a3b8', padding: '0.25rem' }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '1rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}>
            <CheckCircle2 size={20} color="#059669" />
            <span style={{ fontWeight: 600 }}>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}>
            <AlertCircle size={18} color="#ef4444" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab / View Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* QR Code Presentation Box */}
          <div style={{
            padding: '1.25rem',
            backgroundColor: '#f8fafc',
            border: '2px dashed #cbd5e1',
            borderRadius: '0.75rem',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <QRCodeCanvas
              value={verificationCode}
              size={180}
              level="H"
              includeMargin={true}
              style={{ borderRadius: '0.5rem' }}
            />

            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '1.125rem',
                fontWeight: 700,
                letterSpacing: '0.075em',
                color: '#0f172a',
                backgroundColor: '#ffffff',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #e2e8f0',
              }}>
                {verificationCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  padding: '0.35rem 0.5rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.375rem',
                  backgroundColor: '#ffffff',
                  color: copied ? '#059669' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.5rem', maxWidth: '280px' }}>
              Show this QR code or 6-digit code to the rescue volunteer upon vehicle arrival.
            </p>
          </div>

          {/* Handover Verification Form (for NGO or Admin) */}
          <form onSubmit={handleVerify} style={{ width: '100%', textAlign: 'left' }}>
            <label className="form-label">
              Enter Verification Code at Handover
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. FR-DAD-8841"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.05em' }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setInputCode(verificationCode)}
                title="Fill with code for demo testing"
              >
                Fill Code
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem' }}
            >
              <ShieldCheck size={18} />
              {submitting ? 'Verifying...' : 'Verify Pickup Handover'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QRHandoverModal;
