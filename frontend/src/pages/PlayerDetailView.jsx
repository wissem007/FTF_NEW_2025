// src/pages/PlayerDetailView.jsx
import React, { useState, useEffect } from 'react';

const PlayerDetailView = ({ playerId, onClose }) => {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8082/api/v1/demandes-players/${playerId}`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des détails');
        }
        const data = await response.json();
        setPlayerData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchPlayerDetails();
    }
  }, [playerId]);

  const getStatusBadge = (statusId) => {
    const statusMap = {
      1: { label: 'En attente', color: '#f59e0b' },
      8: { label: 'Validée par club', color: '#10b981' },
      9: { label: 'Imprimée', color: '#3b82f6' },
      10: { label: 'Rejetée', color: '#ef4444' }
    };
    const status = statusMap[statusId] || { label: 'Inconnu', color: '#6b7280' };
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
        color: 'white',
        backgroundColor: status.color
      }}>
        {status.label}
      </span>
    );
  };

  const getTypeLicence = (typeId) => {
    const typeMap = {
      1: 'Nouvelle',
      2: 'Renouvellement', 
      3: 'Transfert National',
      4: 'Transfert International',
      5: 'Prêt'
    };
    return typeMap[typeId] || 'Non défini';
  };

  const getRegime = (regimeId) => {
    return regimeId === 1 ? 'Amateur' : regimeId === 2 ? 'Professionnel' : 'Non défini';
  };

  const getIntervenantType = (typeId) => {
    const typeMap = {
      1: 'Joueur',
      2: 'Dirigeant', 
      3: 'Entraîneur',
      4: 'Staff Médical'
    };
    return typeMap[typeId] || 'Non défini';
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #dc2626',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p style={{ margin: 0, color: '#6b7280' }}>Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>Erreur</h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{error}</p>
          <button 
            onClick={onClose}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  if (!playerData) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          color: 'white',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              margin: '0 0 0.5rem 0'
            }}>
              {playerData.fullName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {getStatusBadge(playerData.demandeStatuId)}
              <span style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {getIntervenantType(playerData.ctIntervenantTypeId)}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '2rem',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Informations Personnelles */}
          <div style={{
            background: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              👤 Informations Personnelles
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Nom:</label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                  {playerData.lastName}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Prénom:</label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                  {playerData.name}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Date de naissance:</label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                  {playerData.dateOfBirth || 'Non renseignée'}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Lieu de naissance:</label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                  {playerData.placeOfBirth || 'Non renseigné'}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>N° CIN:</label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                  {playerData.cinNumber || 'Non renseigné'}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>N° Passeport:</label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                  {playerData.passportNum || 'Non renseigné'}
                </p>
              </div>
            </div>
          </div>

          {/* Informations Sportives */}
          <div style={{
            background: '#f0f9ff',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🏆 Informations Sportives
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>N° de licence:</label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                  {playerData.licenceNum || 'Non attribué'}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Type de licence:</label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                  {getTypeLicence(playerData.typeLicenceId)}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Régime:</label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                  {getRegime(playerData.regimeId)}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Équipe:</label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                  ID {playerData.teamId}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Saison:</label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                  {playerData.seasonId}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Catégorie:</label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                  ID {playerData.playerCategoryId}
                </p>
              </div>
            </div>
          </div>

          {/* Caractéristiques Physiques (si c'est un joueur) */}
          {playerData.ctIntervenantTypeId === 1 && (
            <div style={{
              background: '#f0fdf4',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                💪 Caractéristiques Physiques
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                <div>
                  <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Poids:</label>
                  <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                    {playerData.weight ? `${playerData.weight} kg` : 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Taille:</label>
                  <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                    {playerData.height ? `${playerData.height} cm` : 'Non renseignée'}
                  </p>
                </div>
                <div>
                  <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Position:</label>
                  <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                    {playerData.positionId ? `ID ${playerData.positionId}` : 'Non définie'}
                  </p>
                </div>
                <div>
                  <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Pied fort:</label>
                  <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                    {playerData.feetId ? `ID ${playerData.feetId}` : 'Non renseigné'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Informations Administratives */}
          <div style={{
            background: '#fef7ff',
            padding: '1.5rem',
            borderRadius: '12px'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📋 Informations Administratives
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Date d'enregistrement:</label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                  {playerData.dateEnregistrement}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Type de compétition:</label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                  ID {playerData.typeCompetitionId}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Statut contrat:</label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                  {playerData.contratStatus || 'Non défini'}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.9rem' }}>Mineur:</label>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: '#1f2937' }}>
                  {playerData.isChild ? 'Oui' : 'Non'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid #f1f5f9',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'end'
        }}>
          <button 
            onClick={onClose}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Animation CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PlayerDetailView;