import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  playerName,
  playerId 
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        animation: 'fadeIn 0.3s ease'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.4s ease',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon Container */}
        <div
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'pulse 2s infinite'
          }}
        >
          <Trash2 size={36} color="white" />
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#2d3748',
              margin: '0 0 8px 0'
            }}
          >
            Supprimer ce joueur ?
          </h2>
        </div>

        {/* Player Info */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
            borderRadius: '12px',
            padding: '16px',
            margin: '20px 0',
            borderLeft: '4px solid #667eea'
          }}
        >
          <p
            style={{
              fontSize: '15px',
              color: '#4a5568',
              fontWeight: '500',
              margin: 0
            }}
          >
            Joueur : <span style={{ color: '#667eea', fontWeight: '700' }}>
              {playerName || `ID: ${playerId}`}
            </span>
          </p>
        </div>

        {/* Body */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p
            style={{
              fontSize: '16px',
              color: '#718096',
              lineHeight: '1.6',
              margin: 0
            }}
          >
            Cette action est irréversible. Toutes les données associées à ce joueur seront définitivement supprimées.
          </p>

          {/* Warning */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fff5f5',
              borderRadius: '8px',
              border: '1px solid #fed7d7'
            }}
          >
            <AlertTriangle size={20} color="#f56565" />
            <span
              style={{
                fontSize: '14px',
                color: '#c53030',
                fontWeight: '500'
              }}
            >
              Cette action ne peut pas être annulée
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px 24px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: '#e2e8f0',
              color: '#4a5568',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#cbd5e0';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Annuler
          </button>

          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '14px 24px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ee5a6f 0%, #e63946 100%)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(238, 90, 111, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Supprimer
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @media (max-width: 480px) {
          .modal {
            padding: 30px 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default DeleteConfirmationModal;