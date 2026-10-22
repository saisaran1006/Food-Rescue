import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  QrCode,
  Users,
  Utensils,
  Leaf,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { donationsAPI, usersAPI } from '../services/api';
import DonationCard from '../components/DonationCard';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const { isAuthenticated, role } = useAuth();
  const [recentDonations, setRecentDonations] = useState([]);
  const [impactStats, setImpactStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [donationsRes, impactRes] = await Promise.all([
          donationsAPI.list({ limit: 3, status: 'AVAILABLE' }),
          usersAPI.getImpact(),
        ]);

        if (donationsRes.success && donationsRes.data) {
          setRecentDonations(donationsRes.data.donations || []);
        }
        if (impactRes.success && impactRes.data) {
          setImpactStats(impactRes.data.global_impact);
        }
      } catch (err) {
        console.error('Home load error', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
      {/* 1. Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        color: '#ffffff',
        padding: '5rem 1.5rem 6rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background Decorative Rings */}
        <div style={{
          position: 'absolute',
          top: '-150px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(6, 78, 59, 0) 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-50px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(6, 78, 59, 0) 70%)',
          pointerEvents: 'none',
        }} />

        <div className="max-w-7xl" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '880px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <Sparkles size={16} color="#a7f3d0" />
            <span>Smart Surplus Food Redistribution & Impact Platform</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
            letterSpacing: '-0.03em',
          }}>
            Rescue Food. <br />
            <span style={{ color: '#a7f3d0' }}>Reduce Waste.</span> Feed Communities.
          </h1>

          <p style={{
            fontSize: '1.15rem',
            lineHeight: 1.6,
            color: '#e2e8f0',
            marginBottom: '2.5rem',
            maxWidth: '720px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            FoodRescue connects surplus food donors with verified NGOs and community organizations
            so edible food can reach people instead of becoming waste.
          </p>

          {/* Action CTA Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <Link
              to={isAuthenticated ? (role === 'DONOR' ? '/donor/post' : '/donor/dashboard') : '/register?role=DONOR'}
              className="btn btn-primary btn-lg"
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Utensils size={20} /> Donate Surplus Food
            </Link>

            <Link
              to={isAuthenticated ? (role === 'NGO' ? '/ngo/find' : '/ngo/dashboard') : '/register?role=NGO'}
              className="btn btn-secondary btn-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Users size={20} /> Find Food for NGO
            </Link>

            <Link
              to="/how-it-works"
              className="btn btn-secondary btn-lg"
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                borderColor: 'transparent',
              }}
            >
              How It Works <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Visual Workflow Section (DONATE -> MATCH -> CLAIM -> PICKUP -> RESCUE) */}
      <section className="max-w-7xl">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Seamless Lifecycle
          </span>
          <h2 style={{ fontSize: '2rem', color: 'var(--slate-900)', marginTop: '0.25rem' }}>
            How FoodRescue Works
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.975rem', marginTop: '0.5rem', maxWidth: '600px', margin: '0.5rem auto 0' }}>
            Every step is trackable, verified, and backed by automated urgency management.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          position: 'relative',
        }}>
          {[
            {
              step: '1. DONATE',
              title: 'Donor Posts Surplus',
              desc: 'Restaurants or caterers post fresh surplus food with category, servings, and expiry.',
              icon: Utensils,
              color: '#059669',
              bg: '#ecfdf5',
            },
            {
              step: '2. MATCH',
              title: 'Smart Matching',
              desc: 'Rule-based matching scores nearby NGOs by distance, serving capacity & category.',
              icon: Sparkles,
              color: '#d97706',
              bg: '#fffbeb',
            },
            {
              step: '3. CLAIM',
              title: 'NGO Claims Food',
              desc: 'Verified NGOs claim the donation with atomic database lock preventing race conditions.',
              icon: CheckCircle2,
              color: '#0284c7',
              bg: '#f0f9ff',
            },
            {
              step: '4. PICKUP',
              title: 'Schedule & Arrive',
              desc: 'NGO specifies vehicle pickup slot and contacts; arrival is marked live on timeline.',
              icon: Truck,
              color: '#7c3aed',
              bg: '#f5f3ff',
            },
            {
              step: '5. RESCUE',
              title: 'QR Handover & Feed',
              desc: 'One-time encrypted QR code verified at physical handover. Food rescues recorded!',
              icon: QrCode,
              color: '#10b981',
              bg: '#ecfdf5',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '1.75rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '1rem',
                  backgroundColor: item.bg,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <Icon size={26} strokeWidth={2.2} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: item.color, letterSpacing: '0.05em' }}>
                  {item.step}
                </span>
                <h3 style={{ fontSize: '1.1rem', margin: '0.35rem 0 0.5rem', color: 'var(--slate-900)' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--slate-600)', lineHeight: 1.45 }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Live Impact Statistics Banner */}
      <section className="max-w-7xl">
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '1.25rem',
          padding: '3rem 2rem',
          color: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Collective Community Impact
            </span>
            <h2 style={{ fontSize: '2rem', color: '#ffffff', marginTop: '0.25rem' }}>
              Real-World Food Waste Diversion
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              Measurable edible surplus food redirected to orphanages, shelters, and community kitchens.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem',
            textAlign: 'center',
          }}>
            <div style={{ padding: '1rem', borderRight: '1px solid #334155' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-heading)' }}>
                {impactStats?.meals_rescued?.toLocaleString() || '1,450'}+
              </div>
              <div style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 600, marginTop: '0.25rem' }}>
                Meals Rescued
              </div>
            </div>

            <div style={{ padding: '1rem', borderRight: '1px solid #334155' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-heading)' }}>
                {impactStats?.food_quantity_kg?.toLocaleString() || '450'}+ kg
              </div>
              <div style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 600, marginTop: '0.25rem' }}>
                Food Redistributed
              </div>
            </div>

            <div style={{ padding: '1rem', borderRight: '1px solid #334155' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>
                {impactStats?.completed_donations || '12'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 600, marginTop: '0.25rem' }}>
                Successful Pickups
              </div>
            </div>

            <div style={{ padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#a78bfa', fontFamily: 'var(--font-heading)' }}>
                {impactStats?.total_ngos || '5'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 600, marginTop: '0.25rem' }}>
                Verified Partner NGOs
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/impact" className="btn btn-secondary btn-sm" style={{ color: '#0f172a', fontWeight: 700 }}>
              Explore Detailed Impact Dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Active Available Surplus Food Near You */}
      <section className="max-w-7xl">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Live Donations
            </span>
            <h2 style={{ fontSize: '1.875rem', color: 'var(--slate-900)' }}>
              Currently Available for Rescue
            </h2>
          </div>
          <Link to="/ngo/find" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            View All On Map <ChevronRight size={16} />
          </Link>
        </div>

        {recentDonations.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--slate-500)' }}>No donations currently available. Donors will post soon.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}>
            {recentDonations.map((item) => (
              <DonationCard
                key={item.id}
                donation={item}
                showClaimButton={role === 'NGO'}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. Donor & NGO Callout Banners */}
      <section className="max-w-7xl">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
        }}>
          {/* Donor Callout */}
          <div className="card" style={{ padding: '2.5rem', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>For Businesses & Caterers</span>
            <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0 0.75rem', color: '#064e3b' }}>
              Are you a Restaurant, Hotel or Event Host?
            </h3>
            <p style={{ color: '#166534', fontSize: '0.925rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Instead of discarding edible prepared food or banquet leftovers, post them on FoodRescue in under 2 minutes. Verified NGOs collect directly from your location with verified digital handovers.
            </p>
            <Link to="/register?role=DONOR" className="btn btn-primary">
              Register as Food Donor →
            </Link>
          </div>

          {/* NGO Callout */}
          <div className="card" style={{ padding: '2.5rem', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>For Community Organizations</span>
            <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0 0.75rem', color: '#1e3a8a' }}>
              Are you an NGO or Food Bank?
            </h3>
            <p style={{ color: '#1e40af', fontSize: '0.925rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Discover nearby food donations matching your serving capacity and accepted food categories. Receive instant alerts for urgent donations with scheduled pickups and QR-based handover tracking.
            </p>
            <Link to="/register?role=NGO" className="btn btn-primary" style={{ backgroundColor: '#2563eb' }}>
              Register Your NGO →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
