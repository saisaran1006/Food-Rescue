import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, Heart, Leaf, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: '#cbd5e1',
      paddingTop: '3.5rem',
      paddingBottom: '2rem',
      borderTop: '1px solid #1e293b',
      marginTop: 'auto',
    }}>
      <div className="max-w-7xl">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}>
          {/* Col 1: Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}>
                <HeartHandshake size={20} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Food<span style={{ color: '#10b981' }}>Rescue</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1.25rem' }}>
              A technology-driven surplus food redistribution platform empowering restaurants, hotels, hostels, and citizens to eliminate edible waste and nourish local communities through verified NGOs.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#10b981', fontWeight: 600 }}>
              <Leaf size={16} /> Certified Green Food Recovery Initiative
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Explore Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li><Link to="/" style={{ color: '#94a3b8' }}>Home</Link></li>
              <li><Link to="/how-it-works" style={{ color: '#94a3b8' }}>How Food Rescue Works</Link></li>
              <li><Link to="/impact" style={{ color: '#94a3b8' }}>Live Impact Statistics</Link></li>
              <li><Link to="/ngo/find" style={{ color: '#94a3b8' }}>Donation Discovery Map</Link></li>
              <li><Link to="/register" style={{ color: '#94a3b8' }}>Join as Food Donor / NGO</Link></li>
            </ul>
          </div>

          {/* Col 3: Safe Handover Protocol */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Food Safety & Trust</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Strict verification of all participating NGOs and food donors.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                <Heart size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Automated urgency tracking with FSSAI hygiene guidelines.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                <HeartHandshake size={18} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>QR-code verified handover to guarantee transparent chain of custody.</span>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Emergency */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Helpline & Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="#10b981" />
                <span>Surplus Hotline: +91 98200 11000</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="#10b981" />
                <span>help@foodrescue.org</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="#10b981" />
                <span>Mumbai • Thane • Pune • Bangalore</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8125rem',
          color: '#64748b',
          gap: '1rem',
        }}>
          <div>
            © {new Date().getFullYear()} FoodRescue Platform. Built for zero edible food waste and zero hunger.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Food Safety Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
