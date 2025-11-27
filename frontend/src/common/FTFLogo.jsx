import React from 'react';

const FTFLogo = ({ size = 40 }) => (
  <div style={{
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }}>
    <img 
      src="/ftf-logo.png" 
      alt="Logo FTF" 
      style={{
        width: size,
        height: size,
        objectFit: 'contain'
      }}
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'block';
      }}
    />
    <span style={{ display: 'none', color: '#ff0000' }} className="fallback-text">
      Logo FTF non disponible
    </span>
  </div>
);

export default FTFLogo;