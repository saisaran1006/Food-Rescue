import React from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  Sparkles,
  CheckCircle2,
  Truck,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Clock,
  HeartHandshake
} from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      title: 'Donor Registers & Verification',
      subtitle: 'Building a Trusted Surplus Food Ecosystem',
      desc: 'Restaurants, hotels, cafeterias, and hostels sign up on FoodRescue. Accounts undergo admin compliance checks, confirming physical location and FSSAI hygiene standards before public verified status is conferred.',
      icon: ShieldCheck,
      color: '#059669',
      bg: '#ecfdf5',
    },
    {
      num: '02',
      title: 'Surplus Food Batch is Posted',
      subtitle: 'Real-time Entry with Urgency Deadlines',
      desc: 'When edible surplus meals or bakery items remain after service, donors post the quantity, servings count, preparation time, and best-before consumption deadline. Expired food is automatically rejected.',
      icon: Utensils,
      color: '#d97706',
      bg: '#fffbeb',
    },
    {
      num: '03',
      title: 'Smart Matching & Discovery',
      subtitle: 'Rule-Based Compatibility Algorithm',
      desc: 'The system scores nearby NGOs according to transit distance, verified daily serving capacity, and accepted food categories. Higher compatibility listings are highlighted with human-readable rationale.',
      icon: Sparkles,
      color: '#0284c7',
      bg: '#f0f9ff',
    },
    {
      num: '04',
      title: 'NGO Claims & Schedules Pickup',
      subtitle: 'Atomic Reservation & Driver Dispatch',
      desc: 'An authorized NGO claims the batch with database transactional lock protection, preventing race conditions. The NGO coordinates vehicle details, expected arrival time, and designated driver contact.',
      icon: Truck,
      color: '#7c3aed',
      bg: '#f5f3ff',
    },
    {
      num: '05',
      title: 'Digital QR Handover Verification',
      subtitle: 'Cryptographic Chain of Custody',
      desc: 'At the donor premise, the NGO volunteer scans the donor unique QR code or enters the single-use verification code. Once verified, food transfers to the rescue vehicle and live impact counters update immediately.',
      icon: QrCode,
      color: '#10b981',
      bg: '#ecfdf5',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '4rem' }}>
      {/* Header Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        color: '#ffffff',
        padding: '4rem 1.5rem',
        textAlign: 'center',
      }}>
        <div className="max-w-5xl" style={{ margin: '0 auto' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Transparent Protocol
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginTop: '0.5rem', marginBottom: '1rem' }}>
            How FoodRescue Works
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#e2e8f0', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            A reliable 5-step closed-loop workflow ensuring edible surplus food safely reaches vulnerable communities before spoilage.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="max-w-5xl" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {steps.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={st.num}
              className="card"
              style={{
                padding: '2.25rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '2rem',
              }}
            >
              {/* Left icon circle */}
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '1.25rem',
                backgroundColor: st.bg,
                color: st.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={36} strokeWidth={2.2} />
              </div>

              {/* Middle details */}
              <div style={{ flex: 1, minWidth: '260px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: st.color, letterSpacing: '0.05em' }}>
                  STEP {st.num}
                </span>
                <h3 style={{ fontSize: '1.4rem', color: '#0f172a', margin: '0.2rem 0' }}>
                  {st.title}
                </h3>
                <h4 style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {st.subtitle}
                </h4>
                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {st.desc}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* CTA Box */}
      <section className="max-w-5xl">
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '1.25rem',
          padding: '3rem 2rem',
          color: '#ffffff',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '1.875rem', marginBottom: '0.75rem' }}>Ready to eliminate food waste?</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '540px', margin: '0 auto 2rem' }}>
            Join hundreds of donors and grassroots NGOs across the city creating hunger-free communities.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register?role=DONOR" className="btn btn-primary btn-lg">
              Register as Donor
            </Link>
            <Link to="/register?role=NGO" className="btn btn-secondary btn-lg" style={{ color: '#0f172a' }}>
              Register as NGO
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
