import React from 'react';

export const StatsCard = ({ title, value, color, icon: Icon }) => (
  <div style={{ 
    background: 'white', 
    padding: '1rem', // Réduit de 1.5rem à 1rem
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f1f5f9',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '100px', // Hauteur minimale fixe
    maxHeight: '120px'  // Hauteur maximale pour limiter la taille
  }}>
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px', // Réduit de 4px à 3px
      background: color
    }}></div>
    
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      height: '100%' // Utilise toute la hauteur disponible
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ 
          fontSize: '0.8rem', // Réduit de 0.85rem à 0.8rem
          color: '#64748b', 
          margin: '0 0 0.25rem 0', // Réduit de 0.5rem à 0.25rem
          fontWeight: '500'
        }}>
          {title}
        </p>
        <p style={{ 
          fontSize: '1.75rem', // Réduit de 2.25rem à 1.75rem
          fontWeight: '700', 
          color: color, 
          margin: 0,
          lineHeight: 1
        }}>
          {value}
        </p>
      </div>
      <div style={{
        background: `${color}15`,
        padding: '0.75rem', // Réduit de 1rem à 0.75rem
        borderRadius: '10px' // Légèrement réduit de 12px à 10px
      }}>
        <Icon size={20} color={color} /> {/* Réduit de 24 à 20 */}
      </div>
    </div>
  </div>
);