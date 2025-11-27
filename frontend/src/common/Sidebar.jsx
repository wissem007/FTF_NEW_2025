import React from 'react';
import { Users, FileText, BarChart3 } from 'lucide-react';

export const Sidebar = ({ currentPage, onPageChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3, color: '#3b82f6' },
    { id: 'joueur', label: 'Joueur', icon: Users, color: '#10b981' },
    { id: 'entraineur', label: 'Entraîneur', icon: FileText, color: '#f59e0b' },
    { id: 'staff-medical', label: 'Staff Médical', icon: Users, color: '#8b5cf6' },
    { id: 'dirigeant', label: 'Dirigeant', icon: Users, color: '#ef4444' },
  ];

  return (
    <aside style={{ 
      width: '280px', 
      background: 'white', 
      borderRight: '1px solid #e2e8f0',
      height: 'calc(100vh - 140px)',
      overflowY: 'auto'
    }}>
      <div style={{ padding: '2rem' }}>
        <h2 style={{ 
          marginBottom: '1.5rem', 
          color: '#1e293b', 
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          Clubs
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1rem',
                  border: 'none',
                  borderRadius: '10px',
                  background: isActive ? `${item.color}15` : 'transparent',
                  color: isActive ? item.color : '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? '600' : '500',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};