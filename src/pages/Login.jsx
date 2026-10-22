import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartHandshake, LogIn, Lock, Mail, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      // Redirect based on role
      const redirectPath =
        location.state?.from?.pathname ||
        (user.role === 'ADMIN'
          ? '/admin/dashboard'
          : user.role === 'NGO'
          ? '/ngo/dashboard'
          : '/donor/dashboard');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      backgroundColor: '#f8fafc',
    }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--primary-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 1rem',
            boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.4)'
          }}>
            <HeartHandshake size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Welcome Back</h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem', marginTop: '0.25rem' }}>
            Sign in to access your FoodRescue account
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#065f46', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            <Sparkles size={14} color="#059669" />
            <span>ONE-CLICK DEMO ACCOUNTS</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <button
              type="button"
              onClick={() => fillDemoAccount('annapoorna@gmail.com', 'Password@123')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.75rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                fontSize: '0.8125rem',
                color: '#1e293b',
                fontWeight: 600,
                textAlign: 'left',
              }}
            >
              <span>🍽️ Chef Rajesh (Donor - Restaurant)</span>
              <span style={{ color: '#059669', fontSize: '0.75rem' }}>Use Demo →</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('rha.mumbai@robinhoodarmy.com', 'Password@123')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.75rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                fontSize: '0.8125rem',
                color: '#1e293b',
                fontWeight: 600,
                textAlign: 'left',
              }}
            >
              <span>🤝 Robin Hood Army (NGO)</span>
              <span style={{ color: '#059669', fontSize: '0.75rem' }}>Use Demo →</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('admin@foodrescue.org', 'Password@123')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.75rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                fontSize: '0.8125rem',
                color: '#1e293b',
                fontWeight: 600,
                textAlign: 'left',
              }}
            >
              <span>🛡️ System Administrator</span>
              <span style={{ color: '#059669', fontSize: '0.75rem' }}>Use Demo →</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}>
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <LogIn size={18} />
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
