import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Eye,
  Calendar,
  Building,
  User
} from 'lucide-react';
import { donationsAPI } from '../../services/api';
import { StatusBadge, UrgencyBadge } from '../../components/StatusBadge';

export const DonationMonitoring = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchAllDonations = async () => {
    setLoading(true);
    try {
      const res = await donationsAPI.list({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        city: cityFilter !== 'ALL' ? cityFilter : undefined,
        search: search.trim() || undefined,
        limit: 100,
      });
      if (res.success && res.data) {
        setDonations(res.data.donations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDonations();
  }, [statusFilter, categoryFilter, cityFilter]);

  const categories = [
    'ALL',
    'Cooked Meals',
    'Rice',
    'Bread',
    'Fruits',
    'Vegetables',
    'Bakery',
    'Packaged Food',
    'Dairy',
  ];

  const statuses = [
    { key: 'ALL', label: 'All Statuses' },
    { key: 'AVAILABLE', label: 'Available' },
    { key: 'CLAIMED', label: 'Claimed' },
    { key: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
    { key: 'EXPIRED', label: 'Expired' },
  ];

  return (
    <div className="max-w-7xl" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
          Platform Audit & Oversight
        </span>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', marginTop: '0.2rem' }}>
          Donation Monitoring & Timelines
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
          Complete lifecycle visibility of every surplus food batch across all donors and partner NGOs.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem',
        }}>
          {/* Search */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search food, donor, NGO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAllDonations()}
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          {/* Status */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              {statuses.map((st) => (
                <option key={st.key} value={st.key}>{st.label}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Food Category</label>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>City / Region</label>
            <select
              className="form-select"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            >
              <option value="ALL">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Thane">Thane</option>
              <option value="Pune">Pune</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#0f172a',
            borderRadius: '50%',
            margin: '0 auto 1rem',
          }} className="animate-spin" />
          <p style={{ color: '#64748b' }}>Querying donation registry...</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b' }}>No donations match current filter selections.</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', backgroundColor: '#f8fafc', color: '#475569' }}>
                <th style={{ padding: '0.85rem 1rem' }}>ID & Dish</th>
                <th style={{ padding: '0.85rem 1rem' }}>Donor</th>
                <th style={{ padding: '0.85rem 1rem' }}>Claimed NGO</th>
                <th style={{ padding: '0.85rem 1rem' }}>Quantity / Servings</th>
                <th style={{ padding: '0.85rem 1rem' }}>Urgency</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Audit</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      <Link to={`/donations/${d.id}`} style={{ color: 'inherit' }}>
                        {d.food_name}
                      </Link>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      #{d.id} • {d.category} • {d.city}
                    </span>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                    <div style={{ fontWeight: 600 }}>{d.organization_name || d.donor_name}</div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{d.donor_type}</span>
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                    {d.claimed_by ? (
                      <div>
                        <span style={{ fontWeight: 600, color: '#0284c7' }}>{d.ngo_name || d.claimed_by_ngo_name}</span>
                        {d.scheduled_date && (
                          <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>
                            {d.scheduled_date} {d.scheduled_time}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>Unclaimed</span>
                    )}
                  </td>

                  <td style={{ padding: '0.85rem 1rem', color: '#1e293b' }}>
                    <strong>{d.quantity} {d.quantity_unit}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                      {d.servings} Servings
                    </span>
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <UrgencyBadge urgency={d.urgency} />
                  </td>

                  <td style={{ padding: '0.85rem 1rem' }}>
                    <StatusBadge status={d.status} />
                  </td>

                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <Link to={`/donations/${d.id}`} className="btn btn-secondary btn-sm">
                      <Eye size={14} /> Timeline
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DonationMonitoring;
