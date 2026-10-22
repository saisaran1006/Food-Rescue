import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HeartHandshake,
  Bell,
  User,
  PlusCircle,
  Search,
  Sparkles,
  LayoutDashboard,
  CheckCircle,
  Menu,
  X,
  LogOut,
  KeyRound,
  ShieldCheck,
  Check,
  MapPin,
  BarChart3,
  Users as UsersIcon,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';

export const Navbar = () => {
  const { user, isAuthenticated, role, logout, unreadNotifications, setUnreadNotifications } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    setLoadingNotifs(true);
    try {
      const res = await notificationsAPI.list();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadNotifications(res.data.unread_count || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleOpenNotifs = () => {
    setNotifDropdownOpen(!notifDropdownOpen);
    if (!notifDropdownOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markRead(null, true);
      setUnreadNotifications(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isVerified = user?.status === 'VERIFIED';

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="max-w-7xl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.4)'
          }}>
            <HeartHandshake size={24} />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
              Food<span style={{ color: 'var(--primary-600)' }}>Rescue</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--slate-500)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Surplus Food Network
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          <Link to="/" style={{ fontSize: '0.925rem', fontWeight: 600, color: location.pathname === '/' ? 'var(--primary-600)' : 'var(--slate-600)' }}>
            Home
          </Link>
          <Link to="/how-it-works" style={{ fontSize: '0.925rem', fontWeight: 600, color: location.pathname === '/how-it-works' ? 'var(--primary-600)' : 'var(--slate-600)' }}>
            How It Works
          </Link>
          <Link to="/impact" style={{ fontSize: '0.925rem', fontWeight: 600, color: location.pathname === '/impact' ? 'var(--primary-600)' : 'var(--slate-600)' }}>
            Impact Dashboard
          </Link>

          {/* Role specific links */}
          {isAuthenticated && role === 'DONOR' && (
            <>
              <Link to="/donor/dashboard" style={{ fontSize: '0.925rem', fontWeight: 600, color: location.pathname.startsWith('/donor/dashboard') ? 'var(--primary-600)' : 'var(--slate-700)' }}>
                Dashboard
              </Link>
              <Link to="/donor/post" className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
                <PlusCircle size={16} /> Post Surplus Food
              </Link>
              <Link to="/donor/my-donations" style={{ fontSize: '0.925rem', fontWeight: 600, color: location.pathname === '/donor/my-donations' ? 'var(--primary-600)' : 'var(--slate-700)' }}>
                My Donations
              </Link>
            </>
          )}

          {isAuthenticated && role === 'NGO' && (
            <>
              <Link to="/ngo/dashboard" style={{ fontSize: '0.925rem', fontWeight: 600, color: location.pathname.startsWith('/ngo/dashboard') ? 'var(--primary-600)' : 'var(--slate-700)' }}>
                Dashboard
              </Link>
              <Link to="/ngo/find" style={{ fontSize: '0.925rem', fontWeight: 600, color: location.pathname === '/ngo/find' ? 'var(--primary-600)' : 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Search size={16} /> Find Donations
              </Link>
              <Link to="/ngo/recommended" style={{ fontSize: '0.925rem', fontWeight: 600, color: location.pathname === '/ngo/recommended' ? 'var(--primary-600)' : 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={16} color="var(--primary-600)" /> Smart Matches
              </Link>
              <Link to="/ngo/claims" style={{ fontSize: '0.925rem', fontWeight: 600, color: location.pathname === '/ngo/claims' ? 'var(--primary-600)' : 'var(--slate-700)' }}>
                My Claims
              </Link>
            </>
          )}

          {isAuthenticated && role === 'ADMIN' && (
            <>
              <Link to="/admin/dashboard" style={{ fontSize: '0.925rem', fontWeight: 600, color: location.pathname === '/admin/dashboard' ? 'var(--primary-600)' : 'var(--slate-700)' }}>
                Admin Portal
              </Link>
              <Link to="/admin/users" style={{ fontSize: '0.925rem', fontWeight: 600, color: location.pathname === '/admin/users' ? 'var(--primary-600)' : 'var(--slate-700)' }}>
                User Verification
              </Link>
              <Link to="/admin/donations" style={{ fontSize: '0.925rem', fontWeight: 600, color: location.pathname === '/admin/donations' ? 'var(--primary-600)' : 'var(--slate-700)' }}>
                All Donations
              </Link>
            </>
          )}
        </div>

        {/* Right side Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {isAuthenticated ? (
            <>
              {/* Notifications Bell */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  onClick={handleOpenNotifs}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--slate-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--slate-700)',
                    position: 'relative',
                  }}
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadNotifications > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #ffffff',
                    }}>
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '320px',
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--border-color)',
                    zIndex: 50,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--slate-50)',
                    }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Notifications</span>
                      {unreadNotifications > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 600 }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.875rem' }}>
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <div
                            key={n.id}
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid var(--slate-100)',
                              backgroundColor: n.is_read ? '#ffffff' : '#f0fdf4',
                              fontSize: '0.8125rem',
                            }}
                          >
                            <p style={{ fontWeight: 600, color: 'var(--slate-900)', marginBottom: '0.2rem' }}>
                              {n.title}
                            </p>
                            <p style={{ color: 'var(--slate-600)', lineHeight: 1.35 }}>
                              {n.message}
                            </p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)', marginTop: '0.3rem', display: 'block' }}>
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    <Link
                      to="/notifications"
                      style={{
                        display: 'block',
                        padding: '0.6rem',
                        textAlign: 'center',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: 'var(--primary-600)',
                        backgroundColor: 'var(--slate-50)',
                        borderTop: '1px solid var(--border-color)',
                      }}
                    >
                      View All Notifications →
                    </Link>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div ref={userRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '9999px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                  }}>
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div style={{ textAlign: 'left', display: 'none' }} className="desktop-user-info">
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)', display: 'block', lineHeight: 1.2 }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                      {role}
                    </span>
                  </div>
                  {isVerified && (
                    <span title="Verified Account" style={{ color: 'var(--primary-600)', display: 'flex' }}>
                      <CheckCircle size={16} fill="var(--primary-500)" color="#ffffff" />
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '230px',
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--border-color)',
                    zIndex: 50,
                    padding: '0.5rem',
                  }}>
                    <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--slate-100)', marginBottom: '0.35rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--slate-900)' }}>{user?.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                      <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.35rem' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--primary-50)',
                          color: 'var(--primary-700)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          border: '1px solid var(--primary-200)',
                        }}>
                          {role}
                        </span>
                        {isVerified ? (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            backgroundColor: '#ecfdf5',
                            color: '#065f46',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                          }}>
                            ✓ Verified
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                          }}>
                            Pending Verification
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--slate-700)',
                        borderRadius: '0.375rem',
                      }}
                      className="dropdown-item"
                    >
                      <User size={16} /> My Profile & Impact
                    </Link>

                    <Link
                      to="/change-password"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--slate-700)',
                        borderRadius: '0.375rem',
                      }}
                      className="dropdown-item"
                    >
                      <KeyRound size={16} /> Change Password
                    </Link>

                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#dc2626',
                        width: '100%',
                        textAlign: 'left',
                        borderRadius: '0.375rem',
                      }}
                      className="dropdown-item"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              padding: '0.5rem',
              color: 'var(--slate-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          padding: '1.25rem',
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <Link to="/" style={{ fontWeight: 600 }}>Home</Link>
          <Link to="/how-it-works" style={{ fontWeight: 600 }}>How It Works</Link>
          <Link to="/impact" style={{ fontWeight: 600 }}>Impact Dashboard</Link>

          {isAuthenticated && role === 'DONOR' && (
            <>
              <hr style={{ borderColor: 'var(--slate-200)' }} />
              <Link to="/donor/dashboard" style={{ fontWeight: 600 }}>Donor Dashboard</Link>
              <Link to="/donor/post" style={{ fontWeight: 600, color: 'var(--primary-600)' }}>+ Post Surplus Food</Link>
              <Link to="/donor/my-donations" style={{ fontWeight: 600 }}>My Donations</Link>
            </>
          )}

          {isAuthenticated && role === 'NGO' && (
            <>
              <hr style={{ borderColor: 'var(--slate-200)' }} />
              <Link to="/ngo/dashboard" style={{ fontWeight: 600 }}>NGO Dashboard</Link>
              <Link to="/ngo/find" style={{ fontWeight: 600 }}>Find Donations</Link>
              <Link to="/ngo/recommended" style={{ fontWeight: 600, color: 'var(--primary-600)' }}>Smart Matches</Link>
              <Link to="/ngo/claims" style={{ fontWeight: 600 }}>My Claims</Link>
            </>
          )}

          {isAuthenticated && role === 'ADMIN' && (
            <>
              <hr style={{ borderColor: 'var(--slate-200)' }} />
              <Link to="/admin/dashboard" style={{ fontWeight: 600 }}>Admin Portal</Link>
              <Link to="/admin/users" style={{ fontWeight: 600 }}>User Verification</Link>
              <Link to="/admin/donations" style={{ fontWeight: 600 }}>All Donations</Link>
            </>
          )}
        </div>
      )}

      {/* Inline styles for responsive media queries */}
      <style>{`
        @media (min-width: 868px) {
          .desktop-nav { display: flex !important; }
          .desktop-user-info { display: block !important; }
          .mobile-toggle { display: none !important; }
        }
        .dropdown-item:hover {
          background-color: var(--slate-100);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
