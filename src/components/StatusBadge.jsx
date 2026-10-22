import React from 'react';
import { CheckCircle2, Clock, Truck, PackageCheck, AlertCircle, XCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const getBadgeConfig = (st) => {
    switch (st) {
      case 'AVAILABLE':
        return { label: 'Available', className: 'badge-available', icon: CheckCircle2 };
      case 'CLAIMED':
        return { label: 'Claimed', className: 'badge-claimed', icon: Clock };
      case 'PICKUP_SCHEDULED':
        return { label: 'Pickup Scheduled', className: 'badge-scheduled', icon: Truck };
      case 'PICKED_UP':
        return { label: 'Picked Up', className: 'badge-picked_up', icon: PackageCheck };
      case 'COMPLETED':
        return { label: 'Completed', className: 'badge-completed', icon: CheckCircle2 };
      case 'CANCELLED':
        return { label: 'Cancelled', className: 'badge-cancelled', icon: XCircle };
      case 'EXPIRED':
        return { label: 'Expired', className: 'badge-expired', icon: AlertCircle };
      default:
        return { label: st || 'Unknown', className: 'badge-expired', icon: AlertCircle };
    }
  };

  const { label, className, icon: Icon } = getBadgeConfig(status);

  return (
    <span className={`badge ${className}`}>
      <Icon size={12} strokeWidth={2.5} />
      {label}
    </span>
  );
};

export const UrgencyBadge = ({ urgency, hoursRemaining }) => {
  const getUrgencyConfig = (urg) => {
    switch (urg) {
      case 'CRITICAL':
        return {
          label: 'Critical (< 2h)',
          className: 'urgency-CRITICAL',
          icon: '⚡',
        };
      case 'URGENT':
        return {
          label: 'Urgent (2-6h)',
          className: 'urgency-URGENT',
          icon: '🔥',
        };
      case 'SOON':
        return {
          label: 'Consume Soon (6-12h)',
          className: 'urgency-SOON',
          icon: '⏳',
        };
      case 'NORMAL':
        return {
          label: 'Fresh (> 12h)',
          className: 'urgency-NORMAL',
          icon: '🌿',
        };
      case 'EXPIRED':
        return {
          label: 'Expired',
          className: 'urgency-EXPIRED',
          icon: '⚠️',
        };
      default:
        return {
          label: urg || 'Normal',
          className: 'urgency-NORMAL',
          icon: '🌿',
        };
    }
  };

  const { label, className, icon } = getUrgencyConfig(urgency);

  return (
    <span className={`urgency-badge ${className}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
