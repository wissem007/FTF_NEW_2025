import React from 'react';

export const StatsCard = ({ title, value, icon: Icon, color, change, trend }) => (
  <div style={{
    background: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s'
  }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
    }}
  >
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${color}, ${color}cc)`
    }}></div>

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div style={{
        background: `${color}15`,
        padding: '1rem',
        borderRadius: '12px'
      }}>
        <Icon size={28} color={color} />
      </div>

      {change && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          color: trend === 'up' ? '#10b981' : '#ef4444',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          {trend === 'up' ? '↑' : '↓'} {change}
        </div>
      )}
    </div>

    <div>
      <p style={{
        fontSize: '0.9rem',
        color: '#6b7280',
        margin: '0 0 0.5rem 0',
        fontWeight: '500'
      }}>
        {title}
      </p>
      <p style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#111827',
        margin: 0,
        lineHeight: 1
      }}>
        {value}
      </p>
    </div>
  </div>
);