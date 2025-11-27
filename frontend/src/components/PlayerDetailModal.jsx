import React, { useState, useEffect } from 'react';
import { User, Calendar, FileText, X, Eye, MapPin, Trophy, CreditCard, Stethoscope } from 'lucide-react';
import PDFLicenceService from './PDFLicenceService'; // Import du service PDF
import DeleteConfirmationModal from './DeleteConfirmationModal';

const API_BASE_URL = 'http://localhost:8082/api/v1';

const PlayerDetailModal = ({ playerId, onClose, onPlayerDeleted }) => {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fonction pour formater les dates au format JJ/MM/AAAA
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calcul de l'âge
  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} ans`;
  };

  // Génération du numéro de maillot (si pas fourni par l'API)
  const getJerseyNumber = (demandeId) => {
    if (playerData?.jerseyNumber) return playerData.jerseyNumber;
    return `#${(demandeId * 7) % 99 + 1}`; // Exemple : pour 1010825015 → #7
  };

  // Génération du FIFA ID
  const getFifaId = (demandeId) => {
    return `FIFA_${demandeId}`;
  };

  // Fonction pour charger les détails du joueur
  const fetchPlayerDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Appel API pour playerId:', playerId);
      const response = await fetch(`${API_BASE_URL}/demandes-players/${playerId}`);
      if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      const data = await response.json();
      console.log('Données reçues:', data);
      if (!data) throw new Error('Aucune donnée reçue pour ce joueur');

      // Enrichir les données avec FIFA ID, maillot et âge
      const enrichedData = {
        ...data,
        fifaId: getFifaId(data.demandeId),
        jerseyNumber: getJerseyNumber(data.demandeId),
        age: calculateAge(data.dateOfBirth)
      };
      setPlayerData(enrichedData);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      setError(error.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer l'édition
  const handleEdit = () => {
    setEditData({
      name: playerData.name,
      lastName: playerData.lastName,
      dateOfBirth: playerData.dateOfBirth,
      placeOfBirth: playerData.placeOfBirth,
      cinNumber: playerData.cinNumber,
      positionId: playerData.positionId,
      passportNum: playerData.passportNum,
      jerseyNumber: playerData.jerseyNumber // Ajout éditable
    });
    setIsEditing(true);
  };

  // Fonction pour sauvegarder les modifications
  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/demandes-players/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        alert('Joueur modifié avec succès !');
        setIsEditing(false);
        fetchPlayerDetails(); // Recharger les données
      } else {
        alert('Erreur lors de la modification');
      }
    } catch (error) {
      alert('Erreur de connexion');
    }
  };

  // Fonction pour supprimer un joueur
  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/demandes-players/${playerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowDeleteModal(false);
        onClose();
        if (onPlayerDeleted) onPlayerDeleted();
      } else {
        console.error('Erreur lors de la suppression');
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setShowDeleteModal(false);
    }
  };

  // Fonction de génération PDF
  const generatePDF = async () => {
    setGeneratingPdf(true);
    try {
      if (!playerData) {
        console.error('Erreur: playerData est null ou undefined');
        alert('Impossible de générer le PDF: données du joueur manquantes');
        setGeneratingPdf(false);
        return;
      }

      const fileName = await PDFLicenceService.generateLicencePDF(playerData);
      console.log(`PDF généré avec succès: ${fileName}`);
    } catch (error) {
      console.error('Erreur PDF:', error);
      const message = error.message.includes('Type of text must be string or Array')
        ? 'Erreur : Une valeur numérique a été détectée. Vérifiez les données du joueur.'
        : `Erreur lors de la génération du PDF : ${error.message}`;
      alert(message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  useEffect(() => {
    if (playerId) {
      fetchPlayerDetails();
    }
  }, [playerId]);

  const getStatusInfo = (statusId) => {
    const statusMap = {
      1: { text: 'Initial', color: '#6b7280' },
      2: { text: 'A imprimer', color: '#3b82f6' },
      3: { text: 'Vers Commission', color: '#8b5cf6' },
      4: { text: 'En anomalie', color: '#f59e0b' },
      5: { text: 'Rejetée', color: '#ef4444' },
      6: { text: 'En attente', color: '#f59e0b' },
      7: { text: 'Imprimée', color: '#10b981' },
      8: { text: 'Validée par club', color: '#059669' },
      9: { text: 'Validée Commission', color: '#16a34a' },
      10: { text: 'A imprimer (Ligue)', color: '#0891b2' },
      11: { text: 'A vérifier', color: '#eab308' }
    };
    return statusMap[statusId] || { text: 'Inconnu', color: '#6b7280' };
  };

  const getCategoryName = (categoryId) => {
    const categories = {
      1: 'BENJAMINS', 2: 'ECOLES', 3: 'MINIMES', 4: 'CADETS',
      5: 'JUNIORS', 6: 'ELITE', 7: 'SENIORS', 8: 'JEUNE', 9: 'CP'
    };
    return categories[categoryId] || 'Non définie';
  };

  const getRegimeType = (regimeId) => {
    const regimes = {
      1: 'AMATEUR',
      2: 'STAGIAIRE',
      3: 'SEMI-PROFESSIONNEL',
      4: 'PROFESSIONNEL',
      5: 'CP'
    };
    return regimes[regimeId] || 'Non défini';
  };

  const getTypeLicence = (typeLicenceId) => {
    const types = {
      1: 'NOUVELLE',
      2: 'RENOUVELLEMENT',
      3: 'RETOUR PRET',
      4: 'MUTATION',
      5: 'PRET',
      6: 'DEMISSION',
      7: 'Mutation Exceptionelle',
      8: 'TRANSFERT',
      9: 'RETOUR MUTATION',
      10: 'SURCLASSEMENT',
      11: 'LIBRE (AMATEUR)',
      12: 'TRANSFERT LIBRE',
      14: 'Transfert à l\'etranger',
      15: 'ANCIEN LICENCIÉ'
    };
    return types[typeLicenceId] || 'Non défini';
  };

  const getTypeCompetition = (typeCompetitionId) => {
    const types = {
      1: 'Football 11',
      2: 'Football 7',
      3: 'Football Féminin',
      4: 'Futsal'
    };
    return types[typeCompetitionId] || 'Non défini';
  };

  const getStatusBadge = (statusId) => {
    const status = getStatusInfo(statusId);
    return (
      <span style={{
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: 'white',
        backgroundColor: status.color,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.8)'
        }}></div>
        {status.text}
      </span>
    );
  };

  if (!playerId) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          color: 'white',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '0.5rem',
              borderRadius: '8px'
            }}>
              <Eye size={24} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
              Détails du Joueur
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {!isEditing ? (
              <>
                <button
                  onClick={handleEdit}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Supprimer
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ✅ Sauvegarder
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Annuler
                </button>
              </>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{
          padding: '2rem',
          maxHeight: 'calc(90vh - 140px)',
          overflowY: 'auto',
          backgroundColor: '#fafbfc'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '3rem',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid #f3f4f6',
                borderTop: '3px solid #dc2626',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{ color: '#6b7280', fontSize: '1.1rem' }}>Chargement des détails...</span>
            </div>
          ) : error ? (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              padding: '2rem',
              color: '#dc2626',
              textAlign: 'center',
              fontSize: '1.1rem'
            }}>
              Erreur: {error}
            </div>
          ) : playerData ? (
            <div>
              {/* En-tête joueur - MODIFIÉ pour Fifa Id, Maillot et Âge */}
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 1rem 0'
                }}>
                  {playerData.fullName || `${playerData.lastName || ''} ${playerData.name || ''}`}
                </h3>
                <div style={{ marginBottom: '1rem' }}>
                  {getStatusBadge(playerData.demandeStatuId)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={16} style={{ color: '#dc2626' }} />
                    <strong>Licence:</strong>
                    <span style={{ fontFamily: 'monospace', backgroundColor: '#f0f9ff', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      {playerData.licenceNum || 'En attente'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={16} style={{ color: '#dc2626' }} />
                    <strong>Fifa Id:</strong>
                    <span style={{ fontFamily: 'monospace', backgroundColor: '#f0f9ff', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      {playerData.fifaId || getFifaId(playerData.demandeId)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={16} style={{ color: '#dc2626' }} />
                    <strong>Numéro de maillot:</strong>
                    <span style={{ fontFamily: 'monospace', backgroundColor: '#f0f9ff', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      {getJerseyNumber(playerData.demandeId)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} style={{ color: '#dc2626' }} />
                    <strong>Âge:</strong>
                    <span style={{ fontFamily: 'monospace', backgroundColor: '#f0f9ff', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      {playerData.age || calculateAge(playerData.dateOfBirth)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Information Personnelle - Ajout du champ maillot éditable */}
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                marginBottom: '2rem',
                backgroundColor: 'white',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <User size={20} style={{ color: '#dc2626' }} />
                  <h4 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    Information Personnelle
                  </h4>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>Nom:</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.lastName || ''}
                          onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}
                        />
                      ) : (
                        <input
                          value={playerData.lastName || ''}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: '#f9fafb',
                            fontSize: '0.9rem'
                          }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>Prénom:</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}
                        />
                      ) : (
                        <input
                          value={playerData.name || ''}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: '#f9fafb',
                            fontSize: '0.9rem'
                          }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>Date de naissance:</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editData.dateOfBirth ? editData.dateOfBirth.split('T')[0] : ''}
                          onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                          }}
                        />
                      ) : (
                        <input
                          value={formatDate(playerData.dateOfBirth)}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: '#f9fafb',
                            fontSize: '0.9rem'
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>Lieu de naissance:</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} style={{ color: '#6b7280' }} />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.placeOfBirth || ''}
                            onChange={(e) => setEditData({ ...editData, placeOfBirth: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '1px solid #ccc',
                              borderRadius: '6px',
                              fontSize: '0.9rem'
                            }}
                          />
                        ) : (
                          <input
                            value={playerData.placeOfBirth || ''}
                            readOnly
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              backgroundColor: '#f9fafb',
                              fontSize: '0.9rem'
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>N° de CIN:</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.cinNumber || ''}
                          onChange={(e) => setEditData({ ...editData, cinNumber: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontFamily: 'monospace'
                          }}
                        />
                      ) : (
                        <input
                          value={playerData.cinNumber || ''}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: '#f9fafb',
                            fontSize: '0.9rem',
                            fontFamily: 'monospace'
                          }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>N° de passeport:</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.passportNum || ''}
                          onChange={(e) => setEditData({ ...editData, passportNum: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontFamily: 'monospace'
                          }}
                        />
                      ) : (
                        <input
                          value={playerData.passportNum || ''}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: '#f9fafb',
                            fontSize: '0.9rem',
                            fontFamily: 'monospace'
                          }}
                        />
                      )}
                    </div>
                  </div>
                  {/* Nouveau champ pour le numéro de maillot dans la section personnelle */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>Numéro de maillot:</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.jerseyNumber || ''}
                          onChange={(e) => setEditData({ ...editData, jerseyNumber: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontFamily: 'monospace'
                          }}
                        />
                      ) : (
                        <input
                          value={getJerseyNumber(playerData.demandeId)}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: '#f9fafb',
                            fontSize: '0.9rem',
                            fontFamily: 'monospace'
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Information Sportive - inchangée */}
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                marginBottom: '2rem',
                backgroundColor: 'white',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Trophy size={20} style={{ color: '#dc2626' }} />
                  <h4 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    Information Sportive
                  </h4>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>Catégorie:</label>
                      <input
                        value={getCategoryName(playerData.playerCategoryId)}
                        readOnly
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: '#f9fafb',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>Régime:</label>
                      <input
                        value={getRegimeType(playerData.regimeId)}
                        readOnly
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: '#f9fafb',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>Type Licence:</label>
                      <input
                        value={getTypeLicence(playerData.typeLicenceId)}
                        readOnly
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: '#f9fafb',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>Type Compétition:</label>
                      <input
                        value={getTypeCompetition(playerData.typeCompetitionId)}
                        readOnly
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: '#f9fafb',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>Saison:</label>
                      <input
                        value={playerData.seasonId ? `${String(playerData.seasonId)}/2026` : ''}
                        readOnly
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: '#f9fafb',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Informations Médicales - inchangée */}
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                marginBottom: '2rem',
                backgroundColor: 'white',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Stethoscope size={20} style={{ color: '#dc2626' }} />
                  <h4 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    Informations Médicales
                  </h4>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>Médecin (Nom complet):</label>
                      <input
                        value={`${playerData.nameDoctor || ''} ${playerData.lastNameDoctor || ''}`.trim() || '-'}
                        readOnly
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: '#f9fafb',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>Date de consultation:</label>
                      <input
                        value={formatDate(playerData.dateConsultationDoctor) || '-'}
                        readOnly
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: '#f9fafb',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280',
              fontSize: '1.1rem'
            }}>
              Aucune donnée trouvée pour ce joueur
            </div>
          )}
        </div>

        {/* Footer - inchangé */}
        {/* Footer */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          padding: '1rem 2rem',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* ✅ Bouton PDF visible uniquement si statut = Initial (1) ou Validé par club (8) */}
          {playerData && (playerData.demandeStatuId === 1 || playerData.demandeStatuId === 8) && (
            <button
              onClick={generatePDF}
              disabled={generatingPdf || !playerData}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: generatingPdf ? '#9ca3af' : '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: generatingPdf ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {generatingPdf ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff40',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Génération...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Aperçu PDF
                </>
              )}
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <X size={16} />
            Fermer
          </button>
        </div>
        {/* Modal de confirmation de suppression */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          playerName={playerData ? `${playerData.name} ${playerData.lastName}` : ''}
          playerId={playerId}
        />
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PlayerDetailModal;