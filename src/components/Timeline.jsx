import React from 'react';
import { Check, Clock, Truck, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Timeline = ({ timeline = [], currentStatus = 'AVAILABLE' }) => {
  const steps = [
    { key: 'POSTED', label: 'Food Posted', icon: Clock },
    { key: 'CLAIMED', label: 'Claimed by NGO', icon: Check },
    { key: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled', icon: Truck },
    { key: 'PICKED_UP', label: 'Handover Verified', icon: ShieldCheck },
    { key: 'COMPLETED', label: 'Completed', icon: HeartHandshake },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'AVAILABLE': return 0;
      case 'CLAIMED': return 1;
      case 'PICKUP_SCHEDULED': return 2;
      case 'PICKED_UP': return 3;
      case 'COMPLETED': return 4;
      default: return -1;
    }
  };

  const currentIndex = getStepIndex(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';
  const isExpired = currentStatus === 'EXPIRED';

  if (isCancelled || isExpired) {
    return (
      <div style={{
        padding: '1.25rem',
        borderRadius: '0.75rem',
        backgroundColor: isCancelled ? '#fee2e2' : '#f1f5f9',
        border: `1px solid ${isCancelled ? '#fecaca' : '#e2e8f0'}`,
        color: isCancelled ? '#991b1b' : '#475569',
        textAlign: 'center',
        fontWeight: 600
      }}>
        {isCancelled ? '❌ This donation was cancelled.' : '⚠️ This donation has passed its consumption deadline (Expired).'}
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
      }}>
        {/* Progress connecting line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '5%',
          right: '5%',
          height: '3px',
          backgroundColor: '#e2e8f0',
          zIndex: 1,
        }}>
          <div style={{
            height: '100%',
            backgroundColor: '#10b981',
            width: `${Math.min(100, Math.max(0, (currentIndex / (steps.length - 1)) * 100))}%`,
            transition: 'width 0.4s ease-in-out',
          }} />
        </div>

        {/* Steps */}
        {steps.map((st, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = st.icon;
          const detail = timeline?.find?.(t => t.step === st.key);

          return (
            <div
              key={st.key}
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                flex: 1,
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDone ? '#10b981' : '#ffffff',
                  color: isDone ? '#ffffff' : '#94a3b8',
                  border: `2px solid ${isDone ? '#10b981' : '#cbd5e1'}`,
                  boxShadow: isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'var(--shadow-sm)',
                  transition: 'all 0.3s ease',
                }}
              >
                <Icon size={18} strokeWidth={2.5} />
              </div>
              <span
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8125rem',
                  fontWeight: isCurrent ? 700 : isDone ? 600 : 500,
                  color: isCurrent ? '#065f46' : isDone ? '#1e293b' : '#64748b',
                }}
              >
                {st.label}
              </span>
              {detail?.timestamp && (
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                  {new Date(detail.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
