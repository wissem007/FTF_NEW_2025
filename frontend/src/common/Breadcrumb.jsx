import React from 'react';

export const Breadcrumb = ({ currentPage }) => (
  <nav style={{ 
    background: '#f8fafc', 
    padding: '0.75rem 2rem', 
    fontSize: '0.85rem', 
    color: '#64748b',
    borderBottom: '1px solid #e2e8f0'
  }}>
    <span>Catalogue</span>
    <span style={{ margin: '0 0.5rem', color: '#cbd5e1' }}>•</span>
    <span>Gestion des demandes</span>
    <span style={{ margin: '0 0.5rem', color: '#cbd5e1' }}>•</span>
    <span style={{ color: '#dc2626', fontWeight: '500' }}>
      {currentPage === 'dashboard' ? 'Tableau de bord' : 
       currentPage === 'joueur' ? 'Joueur' : 
       currentPage === 'entraineur' ? 'Entraîneur' : 
       currentPage}
    </span>
  </nav>
);