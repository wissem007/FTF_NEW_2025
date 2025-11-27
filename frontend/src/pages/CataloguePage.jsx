// CataloguePage.jsx - Version mise à jour avec historique et nouvelles fonctionnalités
import React, { useState, useEffect } from 'react';
import { nationalities } from "../components/nationalities";
import {
  Users,
  UserCheck,
  Crown,
  Stethoscope,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Award,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Globe,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  History,
  TrendingUp,
  Info
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8082/api/v1';

// Fonction pour calculer l'âge (inchangée)
const calculateAge = (birthDate) => {
  if (!birthDate) return '-';
  try {
    let date;
    if (typeof birthDate === 'string' && birthDate.includes('/')) {
      const [day, month, year] = birthDate.split('/');
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(birthDate);
    }
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age;
  } catch (error) {
    return '-';
  }
};

// NOUVEAU : Composant pour afficher l'historique d'un joueur
const PlayerHistoryModal = ({ player, onClose, loading }) => {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (player) {
      loadPlayerHistory();
    }
  }, [player]);

  const loadPlayerHistory = async () => {
    if (!player?.intervenantid) return;
    
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/intervenants-valides/${player.intervenantid}/history`);
      if (response.ok) {
        const data = await response.json();
        const historyWithPhotos = data.map(season => ({
          ...season,
          photoid: season.photoid || player.photoid
        }));
        setHistory(historyWithPhotos);
        console.log('Données historiques:', historyWithPhotos); // Vérifie les photoid ici
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
    setHistoryLoading(false);
  };

  const getCategory = (categoryId) => ({
    1: 'BENJAMINS', 2: 'ECOLES', 3: 'MINIMES', 4: 'CADETS', 5: 'JUNIORS',
    6: 'ELITE', 7: 'SENIORS', 8: 'JEUNE', 9: 'CP'
  }[categoryId] || 'N/A');

  const getRegime = (regimeId) => ({
    1: 'AMATEUR', 2: 'STAGIAIRE', 3: 'SEMI-PROFESSIONNEL', 4: 'PROFESSIONNEL', 5: 'CP'
  }[regimeId] || 'N/A');

  if (!player) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '1000px',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        zIndex: 10000
      }}>
        {/* En-tête */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <History size={32} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                Historique de {player.name} {player.lastname}
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>
                FIFA ID: {player.fifaid || 'N/A'} • Licence: {player.licencenum}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => {
                if (player.photoid) {
                  window.open(`${API_BASE_URL}/photos/${player.photoid}`, '_blank');
                }
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Test Photo
            </button>
            <button onClick={onClose} style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer'
            }}>
              ✕
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          padding: '2rem'
        }}>
          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '1rem' }}>Chargement de l'historique...</p>
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <History size={48} style={{ opacity: 0.5 }} />
              <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
                Aucun historique disponible
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.map((season, index) => (
                <div key={season.seasonid || index} style={{
                  background: index === 0 ? '#f0f9ff' : '#f8fafc',
                  border: index === 0 ? '2px solid #3b82f6' : '1px solid #f1f5f9',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}>
                  {index === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '20px',
                      background: '#3b82f6',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      Saison Actuelle
                    </div>
                  )}

                  {/* Photo du joueur pour cette saison */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid #10b98130'
                  }}>
                    {season.photoid ? (
                      <img
                        src={`${API_BASE_URL}/photos/${season.photoid}`}
                        alt={`${player.name} ${player.lastname} - ${season.seasonname}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          console.log('Erreur chargement image pour photoid:', season.photoid); // Debug
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = `
                            <div style="width:100%; height:100%; background:#10b98115; display:flex; align-items:center; justify-content:center;">
                              <ImageIcon size={32} color="#10b981" />
                            </div>
                          `;
                        }}
                        onLoad={() => console.log('Image chargée avec succès:', `${API_BASE_URL}/photos/${season.photoid}`)} // Debug succès
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: '#10b98115',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ImageIcon size={32} color="#10b981" />
                      </div>
                    )}
                  </div>

                  {/* Infos de la saison */}
                  <div style={{ flexGrow: 1 }}>
                    <h3 style={{
                      margin: '0 0 0.5rem 0',
                      color: '#111827',
                      fontSize: '1.2rem',
                      fontWeight: '700'
                    }}>
                      {season.seasonname} - {season.teamname}
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      marginTop: '1rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.25rem' }}>Catégorie</div>
                        <div style={{
                          background: '#e0f2fe',
                          color: '#0891b2',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          {getCategory(season.playercategoryid)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.25rem' }}>Régime</div>
                        <div style={{
                          background: '#f0fdf4',
                          color: '#166534',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          {getRegime(season.regimeid)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.25rem' }}>Statut FIFA</div>
                        <div style={{
                          background: season.fifaregistered ? '#f0f9ff' : '#fef2f2',
                          color: season.fifaregistered ? '#1e40af' : '#dc2626',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {season.fifaregistered ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                          {season.fifaregistered ? 'Enregistré' : 'Non enregistré'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Numéro de maillot */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}>
                    #{season.jerseynumber || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// Composant SeasonSelector (inchangé)
const SeasonSelector = ({ selectedSeason, onSeasonChange, loading }) => {
  const [seasons, setSeasons] = useState([]);

  useEffect(() => {
    loadSeasons();
  }, []);

  const loadSeasons = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/seasons`);
      if (response.ok) {
        const data = await response.json();
        const seasonsFormatted = data.map(season => ({
          seasonId: season.seasonid,
          seasonName: season.seasonname || `Saison ${season.seasonid}`
        }));
        setSeasons(seasonsFormatted);
      }
    } catch (error) {
      console.error('Erreur chargement saisons:', error);
      setSeasons([
        { seasonId: 2025, seasonName: '2025/2026' },
        { seasonId: 2024, seasonName: '2024/2025' }
      ]);
    }
  };

  return (
    <div style={{
      background: 'white',
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      marginBottom: '2rem',
      border: '1px solid #f1f5f9'
    }}>
      <h3 style={{
        fontSize: '1.3rem',
        marginBottom: '1.5rem',
        color: '#111827',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Calendar size={24} color="#dc2626" />
        Sélectionner une saison
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <select
          value={selectedSeason || ''}
          onChange={(e) => onSeasonChange(e.target.value)}
          disabled={loading}
          style={{
            padding: '1rem',
            border: '2px solid #f1f5f9',
            borderRadius: '12px',
            fontSize: '1rem',
            minWidth: '200px',
            outline: 'none',
            cursor: 'pointer',
            background: 'white'
          }}
        >
          <option value="">-- Choisir une saison --</option>
          {seasons.map(season => (
            <option key={season.seasonId} value={season.seasonId}>
              {season.seasonName}
            </option>
          ))}
        </select>

        {selectedSeason && (
          <div style={{
            padding: '0.75rem 1.5rem',
            background: '#e0f2fe',
            color: '#0891b2',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            Saison sélectionnée: {selectedSeason}
          </div>
        )}
      </div>
    </div>
  );
};

// Composant ModernCard (inchangé)
const ModernCard = ({ title, count, icon: Icon, color, onClick, loading, disabled }) => (
  <div
    onClick={disabled ? null : onClick}
    style={{
      background: disabled ? '#f9fafb' : 'white',
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: '1px solid #f1f5f9',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s',
      position: 'relative',
      overflow: 'hidden',
      opacity: disabled ? 0.5 : 1
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.1)';
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
      }
    }}
  >
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: disabled ? '#e5e7eb' : `linear-gradient(90deg, ${color}, ${color}cc)`
    }}></div>

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{
          background: disabled ? '#f3f4f6' : `${color}15`,
          padding: '1rem',
          borderRadius: '12px',
          display: 'inline-block',
          marginBottom: '1rem'
        }}>
          <Icon size={32} color={disabled ? '#9ca3af' : color} />
        </div>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: disabled ? '#9ca3af' : '#111827',
          margin: '0 0 0.5rem 0'
        }}>
          {loading ? '...' : count}
        </h3>
        <p style={{
          fontSize: '1rem',
          color: disabled ? '#9ca3af' : '#6b7280',
          margin: 0,
          fontWeight: '500'
        }}>
          {title}
        </p>
      </div>
    </div>
  </div>
);

// MODIFIÉ : Composant DetailedList avec bouton historique
const DetailedList = ({
  data,
  type,
  onClose,
  loading,
  onRefresh,
  searchTerm,
  onSearchChange,
  user,
  selectedSeason
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  const getTypeConfig = (type) => {
    const configs = {
      1: { title: 'Joueurs', icon: Users, color: '#10b981' },
      2: { title: 'Dirigeants', icon: Crown, color: '#ef4444' },
      3: { title: 'Entraîneurs', icon: UserCheck, color: '#f59e0b' },
      4: { title: 'Staff Médical', icon: Stethoscope, color: '#8b5cf6' }
    };
    return configs[type] || configs[1];
  };

  const config = getTypeConfig(type);
  const Icon = config.icon;

  // Fonctions utilitaires
  const getPaysName = (paysId) => {
    if (!paysId) return 'Non spécifié';
    const nationality = nationalities.find(n => n.id === paysId);
    return nationality ? nationality.label : `Pays ${paysId}`;
  };

  const getLicenseType = (typeId) => {
    const types = {
      1: 'NOUVELLE', 2: 'RENOUVELLEMENT', 3: 'RETOUR PRET', 4: 'MUTATION', 5: 'PRET',
      6: 'DEMISSION', 7: 'MUTATION EXCEPT.', 8: 'TRANSFERT', 9: 'RETOUR MUTATION',
      10: 'SURCLASSEMENT', 11: 'LIBRE (AMATEUR)', 12: 'TRANSFERT LIBRE',
      14: 'TRANSFERT ETRANGER', 15: 'ANCIEN LICENCIÉ'
    };
    return types[typeId] || 'N/A';
  };

  const getCategory = (categoryId) => {
    const categories = {
      1: 'BENJAMINS', 2: 'ECOLES', 3: 'MINIMES', 4: 'CADETS', 5: 'JUNIORS',
      6: 'ELITE', 7: 'SENIORS', 8: 'JEUNE', 9: 'CP'
    };
    return categories[categoryId] || 'N/A';
  };

  const getRegime = (regimeId) => {
    const regimes = {
      1: 'AMATEUR', 2: 'STAGIAIRE', 3: 'SEMI-PROFESSIONNEL', 4: 'PROFESSIONNEL', 5: 'CP'
    };
    return regimes[regimeId] || 'N/A';
  };

  // Données enrichies
  const enrichedData = data.map(item => ({
    ...item,
    age: calculateAge(item.dateofbirth)
  }));

  // Filtrer les données selon le terme de recherche
  const filteredData = enrichedData.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.name || '').toLowerCase().includes(searchLower) ||
      (item.lastname || '').toLowerCase().includes(searchLower) ||
      (item.licencenum || '').toLowerCase().includes(searchLower) ||
      (item.cinnumber || '').toLowerCase().includes(searchLower) ||
      (item.passportnum || '').toLowerCase().includes(searchLower) ||
      (item.placeofbirth || '').toLowerCase().includes(searchLower) ||
      (item.alias || '').toLowerCase().includes(searchLower) ||
      (item.fifaid || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          width: '90%',
          maxWidth: '1400px',
          maxHeight: '85vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
        }}>
          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg, ${config.color}, ${config.color}dd)`,
            color: 'white',
            padding: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Icon size={32} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                  {config.title} - Saison {selectedSeason}
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>
                  {filteredData.length} intervenant(s) - {user?.clubName || 'Club Sportif Sfaxien'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={onRefresh}
                disabled={loading}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <RefreshCw size={18} style={{
                  animation: loading ? 'spin 1s linear infinite' : 'none'
                }} />
                Actualiser
              </button>
              <button onClick={onClose} style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer'
              }}>
                ✕
              </button>
            </div>
          </div>

          {/* Barre de recherche */}
          <div style={{ padding: '1.5rem 2rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }} />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, licence, CIN, passeport, FIFA ID..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  border: '2px solid #f1f5f9',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = config.color;
                  e.target.style.boxShadow = `0 0 0 3px ${config.color}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#f1f5f9';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Liste */}
          <div style={{
            maxHeight: '55vh',
            overflowY: 'auto',
            padding: '0 2rem 2rem'
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '1rem' }}>Chargement...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                <Users size={48} style={{ opacity: 0.5 }} />
                <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
                  {searchTerm ? 'Aucun résultat trouvé' : 'Aucun intervenant trouvé pour cette saison'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredData.map((item, index) => (
                  <div key={item.intervenantid || index} style={{
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    transition: 'all 0.2s'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: '1.5rem',
                      alignItems: 'start'
                    }}>
                      {/* Photo et badge maillot */}
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: `2px solid ${config.color}30`,
                          position: 'relative'
                        }}>
                          {item.photoid ? (
                            <img
                              src={`${API_BASE_URL}/photos/${item.photoid}`}
                              alt={`${item.name} ${item.lastname}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentNode.querySelector('.default-icon').style.display = 'flex';
                              }}
                            />
                          ) : (
                            <div
                              className="default-icon"
                              style={{
                                width: '100%',
                                height: '100%',
                                background: `${config.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <ImageIcon size={32} color={config.color} />
                            </div>
                          )}
                          <div
                            className="default-icon"
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              background: `${config.color}15`,
                              display: 'none',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <ImageIcon size={32} color={config.color} />
                          </div>
                        </div>

                        {/* Badge numéro de maillot */}
                        <div style={{
                          position: 'absolute',
                          bottom: '-8px',
                          right: '-8px',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#4CAF50',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          border: '2px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                          {item.jerseynumber || 'N/A'}
                        </div>
                      </div>

                      {/* Informations détaillées */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1.5rem'
                      }}>
                        {/* Identité avec âge */}
                        <div>
                          <h4 style={{
                            margin: '0 0 0.5rem 0',
                            color: '#111827',
                            fontSize: '1.2rem',
                            fontWeight: '700'
                          }}>
                            {item.name} {item.lastname}
                          </h4>

                          {/* Section âge et maillot */}
                          <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginBottom: '0.5rem'
                          }}>
                            <div style={{
                              background: '#f0f9ff',
                              color: '#1e40af',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <Calendar size={14} />
                              {item.age} ans
                            </div>
                            <div style={{
                              background: '#f0fdf4',
                              color: '#166534',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}>
                              Maillot #{item.jerseynumber || 'N/A'}
                            </div>
                            {item.fifaregistered && (
                              <div style={{
                                background: '#fef3c7',
                                color: '#92400e',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <Award size={12} />
                                FIFA
                              </div>
                            )}
                          </div>

                          {item.alias && (
                            <p style={{
                              margin: '0 0 0.5rem 0',
                              color: '#6b7280',
                              fontSize: '0.9rem',
                              fontStyle: 'italic'
                            }}>
                              Alias: {item.alias}
                            </p>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                              <FileText size={16} />
                              Licence: {item.licencenum || 'Non attribuée'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                              <User size={16} />
                              FIFA ID: {item.fifaid || 'N/A'}
                            </div>
                          </div>
                        </div>

                        {/* Documents avec FIFA ID */}
                        <div>
                          <h5 style={{ margin: '0 0 0.75rem 0', color: '#374151', fontSize: '1rem', fontWeight: '600' }}>
                            Documents
                          </h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.9rem',
                              marginBottom: '0.5rem'
                            }}>
                              <span style={{
                                background: '#e0f2fe',
                                color: '#0c4a6e',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: '500',
                                fontFamily: 'monospace'
                              }}>
                                {item.fifaid || 'N/A'}
                              </span>
                              <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>FIFA ID</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                              <FileText size={16} />
                              CIN: {item.cinnumber || 'N/A'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                              <FileText size={16} />
                              Passeport: {item.passportnum || 'N/A'}
                            </div>
                          </div>
                        </div>

                        {/* Naissance et lieu */}
                        <div>
                          <h5 style={{ margin: '0 0 0.75rem 0', color: '#374151', fontSize: '1rem', fontWeight: '600' }}>
                            Informations personnelles
                          </h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                              <Calendar size={16} />
                              Né le: {item.dateofbirth ? new Date(item.dateofbirth).toLocaleDateString('fr-FR') : 'N/A'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                              <MapPin size={16} />
                              Lieu: {item.placeofbirth || 'N/A'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                              <Globe size={16} />
                              {getPaysName(item.paysid)}
                            </div>
                            {(item.weight && item.weight > 0) && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                                <Info size={16} />
                                Poids: {item.weight} kg
                              </div>
                            )}
                            {(item.height && item.height > 0) && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                                <Info size={16} />
                                Taille: {item.height} cm
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Informations de la saison */}
                        <div>
                          <h5 style={{ margin: '0 0 0.75rem 0', color: '#374151', fontSize: '1rem', fontWeight: '600' }}>
                            Licence Saison {selectedSeason}
                          </h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{
                              padding: '0.5rem 1rem',
                              background: `${config.color}15`,
                              color: config.color,
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              textAlign: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              justifyContent: 'center'
                            }}>
                              <CheckCircle size={16} />
                              {config.title.slice(0, -1)} Validé
                            </div>
                            {item.typelicenceid && (
                              <div style={{
                                padding: '0.5rem 1rem',
                                background: '#e0f2fe',
                                color: '#0891b2',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                textAlign: 'center'
                              }}>
                                {getLicenseType(item.typelicenceid)}
                              </div>
                            )}
                            {item.regimeid && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                                <Award size={16} />
                                Régime: {getRegime(item.regimeid)}
                              </div>
                            )}
                            {item.playercategoryid && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
                                <Award size={16} />
                                Catégorie: {getCategory(item.playercategoryid)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* NOUVEAU : Bouton historique */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button
                          onClick={() => setSelectedPlayer(item)}
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
                          }}
                        >
                          <History size={16} />
                          Historique
                        </button>
                        
                        {item.fifaregistered && (
                          <div style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            textAlign: 'center'
                          }}>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              marginBottom: '0.25rem'
                            }}>
                              Statut FIFA
                            </div>
                            <div style={{
                              color: '#10b981',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem'
                            }}>
                              <CheckCircle size={14} />
                              Enregistré
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal d'historique */}
      {selectedPlayer && (
        <PlayerHistoryModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </>
  );
};

const CataloguePage = ({ user }) => {
  const [selectedSeason, setSelectedSeason] = useState(user?.seasonId?.toString() || '');

  // État séparé pour les compteurs et les données détaillées
  const [resumeData, setResumeData] = useState({
    joueurs: 0,
    dirigeants: 0,
    entraineurs: 0,
    staffMedical: 0,
    total: 0,
    loading: false
  });

  const [detailedData, setDetailedData] = useState({
    currentType: null,
    data: [],
    loading: false
  });

  const [selectedType, setSelectedType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Charger le résumé quand une saison est sélectionnée
  useEffect(() => {
    if (selectedSeason) {
      loadResume();
    } else {
      setResumeData({
        joueurs: 0,
        dirigeants: 0,
        entraineurs: 0,
        staffMedical: 0,
        total: 0,
        loading: false
      });
    }
  }, [selectedSeason, user?.teamId]);

  // Charger le résumé (compteurs seulement)
  const loadResume = async () => {
    if (!selectedSeason) return;

    setResumeData(prev => ({ ...prev, loading: true }));

    try {
      const params = new URLSearchParams({
        seasonId: selectedSeason
      });

      if (user?.teamId) {
        params.append('teamId', user.teamId.toString());
      }

      const response = await fetch(`${API_BASE_URL}/intervenants-valides/resume?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setResumeData({
        joueurs: data.joueurs || 0,
        dirigeants: data.dirigeants || 0,
        entraineurs: data.entraineurs || 0,
        staffMedical: data.staffMedical || 0,
        total: data.total || 0,
        loading: false
      });

    } catch (error) {
      console.error('Erreur lors du chargement du résumé:', error);
      setResumeData(prev => ({ ...prev, loading: false }));
    }
  };

  // Charger les données détaillées d'un type spécifique
  const loadDetailedData = async (intervenantTypeId) => {
    if (!selectedSeason) return [];

    try {
      const params = new URLSearchParams({
        intervenantTypeId: intervenantTypeId.toString(),
        seasonId: selectedSeason
      });

      if (user?.teamId) {
        params.append('teamId', user.teamId.toString());
      }

      const response = await fetch(`${API_BASE_URL}/intervenants-valides?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error(`Erreur chargement type ${intervenantTypeId}:`, error);
      return [];
    }
  };

  const handleSeasonChange = (seasonId) => {
    setSelectedSeason(seasonId);
    setSelectedType(null);
    setSearchTerm('');
    setDetailedData({ currentType: null, data: [], loading: false });
  };

  const handleTypeClick = async (type) => {
    if (!selectedSeason) return;

    setSelectedType(type);
    setSearchTerm('');
    setDetailedData({ currentType: type, data: [], loading: true });

    // Charger les données détaillées
    const data = await loadDetailedData(type);
    setDetailedData({ currentType: type, data, loading: false });
  };

  const handleRefresh = async () => {
    if (selectedType && selectedSeason) {
      setDetailedData(prev => ({ ...prev, loading: true }));
      const data = await loadDetailedData(selectedType);
      setDetailedData({ currentType: selectedType, data, loading: false });
    }
  };

  const getCurrentData = () => {
    return detailedData.data || [];
  };

  return (
    <div style={{ padding: '2rem', background: '#fafbfc', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          marginBottom: '0.5rem',
          color: '#111827',
          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Catalogue des Intervenants
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', fontWeight: '500' }}>
          {user?.clubName || 'Club Africain'} • Recherche par saison avec FIFA ID et historique
        </p>
      </div>

      {/* Sélection de saison */}
      <SeasonSelector
        selectedSeason={selectedSeason}
        onSeasonChange={handleSeasonChange}
        loading={resumeData.loading}
      />

      {/* Cards de navigation */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <ModernCard
          title="Joueurs"
          count={resumeData.joueurs}
          icon={Users}
          color="#10b981"
          onClick={() => handleTypeClick(1)}
          loading={resumeData.loading}
          disabled={!selectedSeason}
        />
        <ModernCard
          title="Dirigeants"
          count={resumeData.dirigeants}
          icon={Crown}
          color="#ef4444"
          onClick={() => handleTypeClick(2)}
          loading={resumeData.loading}
          disabled={!selectedSeason}
        />
        <ModernCard
          title="Entraîneurs"
          count={resumeData.entraineurs}
          icon={UserCheck}
          color="#f59e0b"
          onClick={() => handleTypeClick(3)}
          loading={resumeData.loading}
          disabled={!selectedSeason}
        />
        <ModernCard
          title="Staff Médical"
          count={resumeData.staffMedical}
          icon={Stethoscope}
          color="#8b5cf6"
          onClick={() => handleTypeClick(4)}
          loading={resumeData.loading}
          disabled={!selectedSeason}
        />
      </div>

      {/* Résumé global */}
      {selectedSeason && (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            marginBottom: '1rem',
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Award size={24} color="#dc2626" />
            Effectif Saison {selectedSeason} - {user?.clubName || 'Club Africain'}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                {resumeData.total}
              </div>
              <div style={{ color: '#6b7280', fontWeight: '500' }}>Total Intervenants</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
                {resumeData.joueurs}
              </div>
              <div style={{ color: '#6b7280', fontWeight: '500' }}>Joueurs</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6' }}>
                {resumeData.dirigeants + resumeData.entraineurs + resumeData.staffMedical}
              </div>
              <div style={{ color: '#6b7280', fontWeight: '500' }}>Staff & Encadrement</div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedSeason ? (
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
          padding: '3rem',
          borderRadius: '16px',
          textAlign: 'center',
          border: '2px dashed #e2e8f0'
        }}>
          <Calendar size={64} color="#9ca3af" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.3rem', color: '#374151', marginBottom: '0.5rem' }}>
            Sélectionnez d'abord une saison
          </h3>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Choisissez une saison dans le menu déroulant ci-dessus pour afficher les intervenants
          </p>
        </div>
      ) : !selectedType ? (
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
          padding: '3rem',
          borderRadius: '16px',
          textAlign: 'center',
          border: '2px dashed #e2e8f0'
        }}>
          <Users size={64} color="#9ca3af" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.3rem', color: '#374151', marginBottom: '0.5rem' }}>
            Sélectionnez une catégorie d'intervenants
          </h3>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Cliquez sur l'une des cartes ci-dessus pour afficher tous les intervenants de la saison {selectedSeason}
          </p>
        </div>
      ) : null}

      {/* Modal de liste détaillée */}
      {selectedType && selectedSeason && (
        <DetailedList
          data={getCurrentData()}
          type={selectedType}
          onClose={() => setSelectedType(null)}
          loading={detailedData.loading}
          onRefresh={handleRefresh}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          user={user}
          selectedSeason={selectedSeason}
        />
      )}

      {/* Styles pour l'animation de rotation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CataloguePage;