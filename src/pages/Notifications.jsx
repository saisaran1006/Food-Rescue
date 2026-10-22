import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  Check,
  CheckCheck,
  ArrowRight
} from 'lucide-react';
import { notificationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Notifications = () => {
  const { setUnreadNotifications } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.list();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadNotifications(res.data.unread_count || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAll = async () => {
    try {
      await notificationsAPI.markRead(null, true);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadNotifications(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSingle = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotifs =
    filter === 'UNREAD'
      ? notifications.filter((n) => n.is_read == 0)
      : notifications;

  return (
    <div className="max-w-5xl" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
            Alerts & Activity
          </span>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginTop: '0.2rem' }}>
            Notifications Center
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setFilter('ALL')}
            className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`btn btn-sm ${filter === 'UNREAD' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Unread ({notifications.filter((n) => n.is_read == 0).length})
          </button>
          <button
            onClick={handleMarkAll}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            margin: '0 auto 1rem',
          }} className="animate-spin" />
          <p style={{ color: '#64748b' }}>Loading notifications...</p>
        </div>
      ) : filteredNotifs.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <Bell size={36} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748b' }}>No notifications to display.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: n.is_read ? '#ffffff' : '#f0fdf4',
                borderColor: n.is_read ? '#e2e8f0' : '#bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: n.is_read ? '#f1f5f9' : '#dcfce7',
                  color: n.is_read ? '#64748b' : '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}>
                  <Bell size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '0.2rem' }}>
                    {n.title}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem', display: 'block' }}>
                    {new Date(n.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {n.related_id && (
                  <Link
                    to={`/donations/${n.related_id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    View <ArrowRight size={14} />
                  </Link>
                )}

                {n.is_read == 0 && (
                  <button
                    onClick={() => handleMarkSingle(n.id)}
                    className="btn btn-secondary btn-sm"
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
