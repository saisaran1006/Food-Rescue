import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

export const DonationMap = ({
  donations = [],
  center = [19.0760, 72.8777],
  zoom = 12,
  userLocation = null,
  height = '500px',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(center, zoom);

      // OpenStreetMap Tiles (Open and reliable, no API key needed)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    // Clear previous markers
    markersLayer.clearLayers();

    // Add user marker if available
    if (userLocation?.lat && userLocation?.lng) {
      const userIcon = L.divIcon({
        className: 'user-marker-icon',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background-color: #2563eb;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(37, 99, 235, 0.6);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(markersLayer)
        .bindPopup('<strong>📍 Your Registered Organization Location</strong>');
    }

    // Add donation markers
    const bounds = L.latLngBounds();
    let validMarkers = 0;

    donations.forEach((item) => {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      bounds.extend([lat, lng]);
      validMarkers++;

      const urgencyColor =
        item.urgency === 'CRITICAL'
          ? '#ef4444'
          : item.urgency === 'URGENT'
          ? '#f97316'
          : item.urgency === 'SOON'
          ? '#eab308'
          : '#10b981';

      const customIcon = L.divIcon({
        className: 'custom-food-marker',
        html: `
          <div style="
            background-color: ${urgencyColor};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
            cursor: pointer;
          ">
            <span style="transform: rotate(45deg); font-size: 14px;">🍲</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -28],
      });

      const popupHtml = `
        <div style="font-family: inherit; width: 220px; padding: 4px;">
          <div style="position: relative; height: 90px; border-radius: 6px; overflow: hidden; margin-bottom: 8px;">
            <img src="${item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}" style="width: 100%; height: 100%; object-fit: cover;" />
            <span style="position: absolute; top: 4px; right: 4px; background: ${urgencyColor}; color: white; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">
              ${item.urgency || 'AVAILABLE'}
            </span>
          </div>
          <h4 style="font-size: 14px; margin: 0 0 4px 0; font-weight: 700; color: #0f172a;">${item.food_name}</h4>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 4px 0;">
            ${item.quantity} ${item.quantity_unit} • <strong>${item.servings} Servings</strong>
          </p>
          ${item.distance_km ? `<p style="font-size: 11px; color: #059669; font-weight: 600; margin: 0 0 8px 0;">📍 ${item.distance_km} km away</p>` : ''}
          <a href="/donations/${item.id}" style="
            display: block;
            text-align: center;
            background-color: #059669;
            color: #ffffff;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-decoration: none;
          ">
            View & Claim Food →
          </a>
        </div>
      `;

      L.marker([lat, lng], { icon: customIcon })
        .addTo(markersLayer)
        .bindPopup(popupHtml);
    });

    // Fit map bounds if markers exist
    if (validMarkers > 0 && map) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    return () => {
      // Clean up layer on unmount
    };
  }, [donations, center, zoom, userLocation]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '0.875rem', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Map Legend Floating Widget */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '0.6rem 0.85rem',
        borderRadius: '0.5rem',
        boxShadow: 'var(--shadow-md)',
        fontSize: '0.75rem',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        border: '1px solid #cbd5e1'
      }}>
        <strong style={{ color: '#0f172a', marginBottom: '0.15rem' }}>Food Urgency Legend</strong>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
          <span>Critical (&lt; 2h)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f97316' }}></span>
          <span>Urgent (2-6h)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#eab308' }}></span>
          <span>Consume Soon (6-12h)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
          <span>Fresh (&gt; 12h)</span>
        </div>
      </div>
    </div>
  );
};

export default DonationMap;
