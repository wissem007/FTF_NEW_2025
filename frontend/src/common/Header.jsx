import React from 'react';
import { User, LogOut } from 'lucide-react';
import { FTFLogo } from './FTFLogo';

export const Header = ({ user, onLogout }) => (
  <header style={{ 
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', 
    padding: '1rem 2rem', 
    color: 'white',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <FTFLogo size={50} />
        <div>
          <h1 style={{ 
            fontSize: '1.6rem', 
            fontWeight: 'bold', 
            margin: 0,
            letterSpacing: '0.5px'
          }}>
            Fédération Tunisienne de Football
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '0.9rem', 
            opacity: 0.9,
            fontWeight: '300'
          }}>
            Système de Gestion des Demandes
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '0.5rem 1rem',
          borderRadius: '8px'
        }}>
          <User size={20} />
          <div>
            <div style={{ fontWeight: '500' }}>{user?.clubName || 'Club'}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Connecté</div>
          </div>
          <button onClick={onLogout} style={{ 
            background: 'rgba(255, 255, 255, 0.2)', 
            border: 'none', 
            padding: '0.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'white'
          }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  </header>
);