import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Package,
  HeartHandshake,
  Users,
  MapPin,
  Utensils,
  Leaf
} from 'lucide-react';
import { adminAPI } from '../../services/api';

export const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminAPI.getAnalytics();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#0f172a',
          borderRadius: '50%',
          margin: '0 auto 1rem',
        }} className="animate-spin" />
        <p style={{ color: '#64748b' }}>Computing platform analytics...</p>
      </div>
    );
  }

  const categories = data?.categories || [];
  const statusBreakdown = data?.status_breakdown || [];
  const topDonors = data?.top_donors || [];
  const topNgos = data?.top_ngos || [];
  const cityDistribution = data?.city_distribution || [];
  const monthlyTrend = data?.monthly_trend || [];

  const maxMonthly = Math.max(...monthlyTrend.map((m) => m.donations), 50);

  return (
    <div className="max-w-7xl" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
          Intelligence & Reporting
        </span>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', marginTop: '0.2rem' }}>
          Food Rescue Analytics & Trends
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
          Real-time metrics on food redistribution volumes, partner engagement, and geographical reach.
        </p>
      </div>

      {/* Row 1: Monthly Donation Trends & Status Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.75rem',
      }}>
        {/* Monthly Trend Chart */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <TrendingUp size={20} color="#059669" />
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>Donation Growth Trend (Last 6 Months)</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', height: '220px', paddingTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
            {monthlyTrend.map((item, idx) => {
              const heightPercent = Math.round((item.donations / maxMonthly) * 100);
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', marginBottom: '0.35rem' }}>
                    {item.donations}
                  </span>
                  <div style={{
                    width: '100%',
                    maxWidth: '42px',
                    height: `${heightPercent}%`,
                    backgroundColor: idx === monthlyTrend.length - 1 ? '#059669' : '#a7f3d0',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.4s ease',
                  }} />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.75rem', textAlign: 'center' }}>
            Monthly batches registered and redirected to community kitchens.
          </span>
        </div>

        {/* Status Distribution */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <BarChart3 size={20} color="#0284c7" />
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>Lifecycle Status Breakdown</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {statusBreakdown.map((st) => {
              const color =
                st.status === 'COMPLETED' ? '#10b981' :
                st.status === 'AVAILABLE' ? '#059669' :
                st.status === 'CLAIMED' ? '#f59e0b' :
                st.status === 'PICKUP_SCHEDULED' ? '#0284c7' :
                st.status === 'PICKED_UP' ? '#8b5cf6' :
                st.status === 'CANCELLED' ? '#ef4444' : '#94a3b8';

              return (
                <div key={st.status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{st.status}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{st.count} batches</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, st.count * 10)}%`, height: '100%', backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Category Distribution & City Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.75rem',
      }}>
        {/* Category Breakdown */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '1.25rem' }}>
            Food Categories Rescued
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {categories.map((c) => (
              <div key={c.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f8fafc' }}>
                <div>
                  <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{c.category}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                    {c.total_servings || 0} Servings • {c.total_kg || 0} kg
                  </span>
                </div>
                <span style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}>
                  {c.count} Batches
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* City Distribution */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '1.25rem' }}>
            Geographical Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {cityDistribution.map((city) => (
              <div key={city.city} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="#059669" />
                  <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{city.city}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ color: '#0f172a', fontSize: '0.875rem' }}>{city.count} Batches</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{city.total_servings} meals</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Top Donors & NGOs Leaderboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.75rem',
      }}>
        {/* Top Donors */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '1rem' }}>
            Top Contributing Donors
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {topDonors.map((d, idx) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                    {idx + 1}
                  </span>
                  <div>
                    <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{d.name}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{d.donor_type} • {d.city}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.9rem' }}>{d.donation_count} Postings</span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>{d.meals_rescued} meals</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top NGOs */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '1rem' }}>
            Top Active Rescue NGOs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {topNgos.map((ngo, idx) => (
              <div key={ngo.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                    {idx + 1}
                  </span>
                  <div>
                    <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{ngo.name}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{ngo.city}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.9rem' }}>{ngo.claimed_count} Pickups</span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>{ngo.meals_distributed} meals</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
